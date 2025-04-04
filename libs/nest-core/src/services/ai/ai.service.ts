import { Injectable } from '@nestjs/common';

import { GroqService } from '~libs/common';

@Injectable()
export class AiService extends GroqService {
	constructor() {
		super({ originality: 0, maxTokens: 1620, jsonFormat: true });
	}
}
