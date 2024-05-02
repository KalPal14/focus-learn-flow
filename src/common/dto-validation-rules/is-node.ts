import {
	ValidatorConstraint,
	ValidatorConstraintInterface,
	isNumber,
	isString,
} from 'class-validator';

import { INode } from '@/nodes/node.entity.interface';

@ValidatorConstraint({ async: false })
export class IsNode implements ValidatorConstraintInterface {
	validate(node: INode): boolean {
		if (!node) {
			return false;
		}
		if (isString(node.text) && isNumber(node.indexNumber) && isNumber(node.sameElementsAmount)) {
			return true;
		}
		return false;
	}
}
