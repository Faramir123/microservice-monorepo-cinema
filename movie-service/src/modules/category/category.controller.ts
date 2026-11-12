import type { GetAllCategoryResponse } from '@faramircinema/contracts/gen/ts/category'
import { Controller } from '@nestjs/common'
import { GrpcMethod } from '@nestjs/microservices'

import { CategoryService } from './category.service.js'

@Controller()
export class CategoryController {
	constructor(private readonly categoryService: CategoryService) {}

	@GrpcMethod('CategoryService', 'GetAllCategory')
	public async list(): Promise<GetAllCategoryResponse> {
		return await this.categoryService.getAll()
	}
}
