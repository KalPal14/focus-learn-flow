import { Router } from 'express';

import { TController } from '@/common/types/controller.type';
import { CreateHighlightDto } from './dto/create-highlight.dto';

export interface IHighlightsController {
	router: Router;

	createHighlight: TController<{}, {}, CreateHighlightDto>;
}
