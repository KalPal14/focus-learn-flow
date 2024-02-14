import 'reflect-metadata';
import { Request, Response, NextFunction } from 'express';
import { inject, injectable } from 'inversify';
import { sign } from 'jsonwebtoken';

import { BaseController } from '@/common/base.controller';
import TYPES from '@/types.inversify';
import { IUsersController } from './users.controller.interface';
import { IUsersService } from './users.service.interface';
import { USERS_PATH } from '@/common/constants/routes/users';
import { UsersRegisterDto } from './dto/users-register.dto';
import { ValidateMiddleware } from '@/common/middlewares/validate.middleware';
import { IConfigService } from '@/common/services/config.service.interface';
import { UserModel } from '@prisma/client';
import { UsersLoginDto } from './dto/users-login.dto';
import { RouteGuard } from '@/common/middlewares/route.guard';
import { HTTPError } from '@/errors/http-error.class';
import { UpdateUserDto } from './dto/update-user.dto';

@injectable()
export class UsersController extends BaseController implements IUsersController {
	private sessionTime: number = 2 * 60 * 60;

	constructor(
		@inject(TYPES.UsersService) private usersService: IUsersService,
		@inject(TYPES.ConfigService) private configService: IConfigService,
	) {
		super();
		this.bindRoutes([
			{
				path: USERS_PATH.login,
				method: 'post',
				func: this.login,
				middlewares: [new RouteGuard('guest'), new ValidateMiddleware(UsersLoginDto)],
			},
			{
				path: USERS_PATH.register,
				method: 'post',
				func: this.register,
				middlewares: [new RouteGuard('guest'), new ValidateMiddleware(UsersRegisterDto)],
			},
			{
				path: USERS_PATH.logout,
				method: 'post',
				func: this.logout,
				middlewares: [new RouteGuard('user')],
			},
			{
				path: USERS_PATH.updateUser,
				method: 'patch',
				func: this.updateUser,
				middlewares: [new RouteGuard('user'), new ValidateMiddleware(UpdateUserDto)],
			},
		]);
	}

	async updateUser(
		{ body, user }: Request<{}, {}, UpdateUserDto>,
		res: Response,
		next: NextFunction,
	): Promise<void> {
		if (!Object.keys(body).length) {
			return next(new HTTPError(422, 'User change data is empty'));
		}

		const result = await this.usersService.updateUser(Number(user.id), body);

		this.ok(res, result);
	}

	async login({ body }: Request, res: Response, next: NextFunction): Promise<void> {
		const result = await this.usersService.validateUser(body);

		if (result instanceof Error) {
			next(result);
			return;
		}

		this.signJwtAndSendUser(res, result, this.ok.bind(this));
	}

	async register(
		{ body }: Request<{}, {}, UsersRegisterDto>,
		res: Response,
		next: NextFunction,
	): Promise<void> {
		const result = await this.usersService.createUser(body);

		if (result instanceof Error) {
			next(result);
			return;
		}

		this.signJwtAndSendUser(res, result, this.created.bind(this));
	}

	async logout(req: Request, res: Response, next: NextFunction): Promise<void> {
		try {
			res.clearCookie('token');
			this.ok(res, {
				msg: 'You have successfully logged out',
			});
		} catch {
			next(new HTTPError(500, 'Failed to log out'));
		}
	}

	private signJwtAndSendUser(
		res: Response,
		result: UserModel,
		sendFunc: (res: Response, msg: any) => void,
	): void {
		this.generateJwt(result)
			.then((jwt) => {
				res.cookie('token', jwt, {
					secure: true,
					maxAge: this.sessionTime * 1000,
				});
				sendFunc(res, { ...result });
			})
			.catch((err) => this.send(res, 500, { err }));
	}

	private async generateJwt({ id, email, username }: UserModel): Promise<string> {
		return new Promise((resolve, reject) => {
			const jwtKey = this.configService.get('JWT_KEY');

			sign(
				{ id, email, username },
				jwtKey,
				{
					algorithm: 'HS256',
					expiresIn: this.sessionTime,
				},
				(err, token) => {
					if (err) {
						reject(err.message);
					} else {
						resolve(token as string);
					}
				},
			);
		});
	}
}
