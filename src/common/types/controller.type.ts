import { Request, Response, NextFunction } from 'express';

import { IObject } from './object.interface';

export type TController<
	Params extends IObject<string> = any,
	ResBody extends IObject<any> = any,
	ReqBody extends IObject<any> = any,
	ReqQuery extends IObject<string> = any,
> = (
	req: Request<Params, ResBody, ReqBody, ReqQuery>,
	res: Response<ResBody>,
	next: NextFunction,
) => Promise<void>;
