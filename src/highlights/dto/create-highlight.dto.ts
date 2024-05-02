import { IsNumber, IsString, IsUrl, Validate } from 'class-validator';

import { IsColor } from '@/common/dto-validation-rules/is-color';
import { IsNode } from '@/common/dto-validation-rules/is-node';
import { INode } from '@/nodes/node.entity.interface';

export class CreateHighlightDto {
	@IsUrl({}, { message: 'The pageUrl field must contain a valid link to the page' })
	pageUrl: string;

	@Validate(IsNode, {
		message:
			'This field must contain an object containing one string property text and two number properties indexNumber and sameElementsAmount',
	})
	startContainer: INode;
	@Validate(IsNode, {
		message:
			'This field must contain an object containing one string property text and two number properties indexNumber and sameElementsAmount',
	})
	endContainer: INode;

	@IsNumber({}, { message: 'This field must be a number' })
	startOffset: number;
	@IsNumber({}, { message: 'This field must be a number' })
	endOffset: number;

	@IsString({ message: 'The text field is required' })
	text: string;

	note?: string;

	@Validate(IsColor, { message: 'The color field must contain a valid RGB or HEX color' })
	color: string;
}
