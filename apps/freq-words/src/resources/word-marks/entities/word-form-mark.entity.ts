import { Column, Entity, JoinTable, ManyToMany, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

import { Source } from '../../sources/entities/source.entity';
import { WordForm } from '../../word-forms/entities/word-form.entity';

import { WordMark } from './word-mark.entity';

@Entity()
export class WordFormMark {
	@PrimaryGeneratedColumn()
	id: number;

	@Column({ default: 0 })
	count: number;

	@Column({ default: false })
	isLemma: boolean;

	@ManyToOne(() => WordMark, (wordMark) => wordMark.wordFormMarks)
	wordMark: WordMark;

	@ManyToOne(() => WordForm, (wordForm) => wordForm.wordFormMarks, { eager: true })
	wordForm: WordForm;

	@ManyToMany(() => Source, (source) => source.wordFormMarks, { eager: true })
	@JoinTable()
	sources: Source[];
}
