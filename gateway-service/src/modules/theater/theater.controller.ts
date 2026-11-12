import {
	Body,
	Controller,
	Get,
	HttpCode,
	HttpStatus,
	Post
} from '@nestjs/common'

import { TheaterClientGrpc } from './theater.grpc.js'

import { CreateTheaterRequest } from './dto/create-theater.request.js'

@Controller('theater')
export class TheaterController {
	public constructor(private readonly theater: TheaterClientGrpc) {}

	@Get()
	@HttpCode(HttpStatus.OK)
	public async getAll() {
		const response = await this.theater.call('listTheater', {})

		return Array.isArray(response.theaters) ? response.theaters : []
	}

	// @Protected(Role.ADMIN)
	@Post()
	@HttpCode(HttpStatus.CREATED)
	public async create(@Body() dto: CreateTheaterRequest) {
		return this.theater.call('createTheater', dto)
	}
}
