import { Seeder, SeederFactoryManager } from 'typeorm-extension';
import { DataSource } from 'typeorm';

import { Example } from '~/freq-words/resources/word-forms/entities/example.entity';
import {
	EXAMPLES_ENGLISH_LEMMA_ENTITIES,
	EXAMPLES_ENGLISH_WORD_FORM_ENTITIES,
	EXAMPLES_URKAINIAN_LEMMA_ENTITIES,
	EXAMPLES_URKAINIAN_WORD_FORM_ENTITIES,
} from '~/freq-words/resources/word-forms/stubs/examples';

export default class ExampleSeeder implements Seeder {
	public async run(dataSource: DataSource, factoryManager: SeederFactoryManager): Promise<void> {
		await dataSource.query('TRUNCATE "example" RESTART IDENTITY CASCADE;');

		const repository = dataSource.getRepository(Example);
		await repository.insert([
			...EXAMPLES_URKAINIAN_LEMMA_ENTITIES,
			...EXAMPLES_URKAINIAN_WORD_FORM_ENTITIES,
			...EXAMPLES_ENGLISH_LEMMA_ENTITIES,
			...EXAMPLES_ENGLISH_WORD_FORM_ENTITIES,
		]);
	}
}
