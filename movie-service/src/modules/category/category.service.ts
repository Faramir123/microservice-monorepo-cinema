import { Injectable } from '@nestjs/common'

import { CategoryRepository } from './category.repository.js'

@Injectable()
export class CategoryService {
	public constructor(
		private readonly categoryRepository: CategoryRepository
	) {}

	public async getAll() {
		const category = await this.categoryRepository.findAll()

		return { category }
	}
}
