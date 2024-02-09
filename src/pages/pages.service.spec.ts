import 'reflect-metadata';
import { Container } from 'inversify';

import { IPagesRepository } from './pages.repository.interface';
import { IPagesServise } from './pages.service.interface';
import TYPES from '@/types.inversify';
import { PagesServise } from './pages.service';
import { Page } from './page.entity';
import { PageModel } from '@prisma/client';
import { RIGHT_PAGE } from '@/common/constants/spec/pages';
import { RIGHT_HIGHLIGHT } from '@/common/constants/spec/highlights';
import { RIGHT_USER, RIGHT_USER_JWT } from '@/common/constants/spec/users';

const pagesRepositoryMock: IPagesRepository = {
	create: jest.fn(),
	findByUrl: jest.fn(),
	findAll: jest.fn(),
};

const container = new Container();
let pagesRepository: IPagesRepository;
let pagesServise: IPagesServise;

beforeAll(() => {
	container.bind<IPagesRepository>(TYPES.PagesRepository).toConstantValue(pagesRepositoryMock);
	container.bind<IPagesServise>(TYPES.PagesServise).to(PagesServise);

	pagesRepository = container.get<IPagesRepository>(TYPES.PagesRepository);
	pagesServise = container.get<IPagesServise>(TYPES.PagesServise);
});

describe('Pages Servise', () => {
	it('create page - success', async () => {
		pagesRepository.findByUrl = jest.fn().mockReturnValue(null);
		pagesRepository.create = jest.fn().mockImplementation(
			(page: Page): PageModel => ({
				id: RIGHT_PAGE.id,
				userId: page.userId,
				url: page.url,
			}),
		);

		const result = await pagesServise.createPage(
			{
				pageUrl: RIGHT_PAGE.url,
				text: RIGHT_HIGHLIGHT.text,
				color: RIGHT_HIGHLIGHT.color,
			},
			RIGHT_USER_JWT,
		);

		expect(result).not.toBeInstanceOf(Error);
		if (result instanceof Error) return;
		expect(result.id).toBe(RIGHT_PAGE.id);
		expect(result.userId).toBe(RIGHT_PAGE.userId);
		expect(result.url).toBe(RIGHT_PAGE.url);
	});

	it('create page - wrong: this user already has a page with the same url', async () => {
		pagesRepository.findByUrl = jest.fn().mockReturnValue(RIGHT_PAGE);
		pagesRepository.create = jest.fn().mockImplementation(
			(page: Page): PageModel => ({
				id: RIGHT_PAGE.id,
				userId: page.userId,
				url: page.url,
			}),
		);

		const result = await pagesServise.createPage(
			{
				pageUrl: RIGHT_PAGE.url,
				text: RIGHT_HIGHLIGHT.text,
				color: RIGHT_HIGHLIGHT.color,
			},
			RIGHT_USER_JWT,
		);

		expect(result).toBeInstanceOf(Error);
	});

	it('get pages info - success: user without highlights', async () => {
		pagesRepository.findAll = jest.fn().mockReturnValue([]);

		const result = await pagesServise.getPagesInfo(RIGHT_USER.id);

		expect(result).toHaveLength(0);
	});

	it('get pages info - success: user with highlights', async () => {
		pagesRepository.findAll = jest.fn().mockReturnValue([
			{
				...RIGHT_PAGE,
				highlights: [
					RIGHT_HIGHLIGHT,
					{
						...RIGHT_HIGHLIGHT,
						note: null,
					},
				],
			},
			{
				...RIGHT_PAGE,
				highlights: [RIGHT_HIGHLIGHT],
			},
		]);

		const result = await pagesServise.getPagesInfo(RIGHT_USER.id);

		expect(result).toHaveLength(2);
		expect(result[0]).toEqual({
			id: RIGHT_PAGE.id,
			userId: RIGHT_PAGE.userId,
			url: RIGHT_PAGE.url,
			highlightsCount: 2,
			notesCount: 1,
		});
		expect(result[1]).toEqual({
			id: RIGHT_PAGE.id,
			userId: RIGHT_PAGE.userId,
			url: RIGHT_PAGE.url,
			highlightsCount: 1,
			notesCount: 1,
		});
	});
});
