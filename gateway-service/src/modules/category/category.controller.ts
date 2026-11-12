import { Controller, Get, HttpCode, HttpStatus } from '@nestjs/common'

import { CategoryClientGrpc } from './category.grpc.js'

@Controller('category')
export class CategoryController {
	public constructor(private readonly category: CategoryClientGrpc) {}

	@Get()
	@HttpCode(HttpStatus.OK)
	public async getAll() {
		const response = await this.category.call('getAllCategory', {})

		return Array.isArray(response.category) ? response.category : []
	}
}
