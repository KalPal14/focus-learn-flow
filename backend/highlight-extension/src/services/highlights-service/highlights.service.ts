import { inject, injectable } from 'inversify';
import { HighlightModel, PageModel } from '@prisma/client';
import { intersectionBy } from 'lodash';

import { INodesService } from '../nodes-service/nodes.service.interface';
import { IPagesServise } from '../pages-service/pages.service.interface';

import { IHighlightsService } from './highlights.service.interface';

import TYPES from '@/common/constants/types.inversify';
import { Highlight } from '@/entities/highlight-entity/highlight.entity';
import { IJwtPayload } from '@/common/types/jwt-payload.interface';
import { CreateHighlightDto } from '@/dto/highlights/create-highlight.dto';
import { UpdateHighlightDto } from '@/dto/highlights/update-highlight.dto';
import { IHighlightsRepository } from '@/repositories/highlights-repository/highlights.repository.interface';
import { THighlightDeepModel } from '@/repositories/highlights-repository/types/highlight-deep-model.type';
import { IPagesRepository } from '@/repositories/pages-repository/pages.repository.interface';
import { IndividualUpdateHighlightsDto } from '@/dto/highlights/individual-update-highlights.dto';

@injectable()
export class HighlightsService implements IHighlightsService {
	constructor(
		@inject(TYPES.HighlightsRepository) private highlightsRepository: IHighlightsRepository,
		@inject(TYPES.PagesRepository) private pagesRepository: IPagesRepository,
		@inject(TYPES.PagesServise) private pagesServise: IPagesServise,
		@inject(TYPES.NodesService) private nodesService: INodesService
	) {}

	async getHighlights(ids: number[]): Promise<THighlightDeepModel[]> {
		return await this.highlightsRepository.findAllByIds(ids);
	}

	async createHighlight(
		createHighlightDto: CreateHighlightDto,
		user: IJwtPayload
	): Promise<THighlightDeepModel> {
		const { pageUrl, startContainer, endContainer, startOffset, endOffset, text, note, color } =
			createHighlightDto;

		let existingPage = await this.pagesRepository.findByUrl(pageUrl, user.id);
		if (!existingPage) {
			existingPage = (await this.pagesServise.createPage(
				createHighlightDto.pageUrl,
				user
			)) as PageModel;
		}
		const pageHighlights = await this.highlightsRepository.findAllByPageId(existingPage.id);

		const startNode = await this.nodesService.createNode(startContainer);
		const endNode = await this.nodesService.createNode(endContainer);

		const newHighlight = new Highlight(
			existingPage.id,
			startNode.id,
			endNode.id,
			startOffset,
			endOffset,
			text,
			color,
			{
				note,
				pageHighlightsCount: pageHighlights?.length,
			}
		).getData();

		return await this.highlightsRepository.create(newHighlight);
	}

	async updateHighlight(
		id: number,
		payload: UpdateHighlightDto
	): Promise<THighlightDeepModel | Error> {
		const existingHighlight = await this.highlightsRepository.findById(id);
		if (!existingHighlight) {
			return Error('There is no highlight with this ID');
		}

		const { startContainer, endContainer, ...rest } = payload;

		if (startContainer) {
			await this.nodesService.updateNode(existingHighlight.startContainerId, startContainer);
		}
		if (endContainer) {
			await this.nodesService.updateNode(existingHighlight.endContainerId, endContainer);
		}
		if (Object.keys(rest).length) {
			return await this.highlightsRepository.update(id, rest);
		}
		return existingHighlight;
	}

	async individualUpdateHighlights(
		data: IndividualUpdateHighlightsDto
	): Promise<THighlightDeepModel[]> {
		const ids = data.highlights.map(({ id }) => id);
		const existingHighlights = await this.highlightsRepository.findAllByIds(ids);
		const filteredHighlights = intersectionBy(data.highlights, existingHighlights, 'id');
		return await this.highlightsRepository.individualUpdateMany({
			highlights: filteredHighlights,
		});
	}

	async deleteHighlight(id: number): Promise<HighlightModel | Error> {
		const existingHighlight = await this.highlightsRepository.findById(id);
		if (!existingHighlight) {
			return Error('There is no highlight with this ID');
		}

		const highlight = await this.highlightsRepository.delete(id);
		await this.nodesService.deleteNode(existingHighlight.startContainerId);
		await this.nodesService.deleteNode(existingHighlight.endContainerId);
		return highlight;
	}
}
