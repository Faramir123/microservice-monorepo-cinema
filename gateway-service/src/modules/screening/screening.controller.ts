import {
	Body,
	Controller,
	Get,
	HttpCode,
	HttpStatus,
	Param,
	Post,
	Query
} from '@nestjs/common'

import { ScreeningClientGrpc } from './screening.grpc.js'
import { CreateScreeningRequest } from './dto/create-screening.request.js'
import { GetScreeningsRequest } from './dto/get-screenings.request.js'
import { ApiParam, ApiQuery } from '@nestjs/swagger'

@Controller('screenings')
export class ScreeningController {
	public constructor(private readonly screening: ScreeningClientGrpc) {}

	// @Protected(Role.ADMIN)
	@Post()
	@HttpCode(HttpStatus.CREATED)
	public async create(@Body() dto: CreateScreeningRequest) {
		return this.screening.call('createScreening', dto)
	}

	@Get()
	@HttpCode(HttpStatus.OK)
	public async getAll(@Query() dto: GetScreeningsRequest) {
		const response = await this.screening.call('getScreenings', dto)

		return Array.isArray(response.screenings) ? response.screenings : []
	}

	@Get('movie/:id')
	@HttpCode(HttpStatus.OK)
	@ApiParam({ name: 'id', description: 'Movie ID', type: String })
	@ApiQuery({
		name: 'date',
		required: false,
		description: 'Filter by date (YYYY-MM-DD)',
		type: String
	})
	public async getByMovie(
		@Param('id') movieId: string,
		@Query('date') date?: string
	) {
		console.log('DATE', date)
		const response = await this.screening.call('getScreeningsByMovie', {
			movieId,
			date
		})

		return Array.isArray(response.screenings) ? response.screenings : []
	}

	@Get(':id')
	@HttpCode(HttpStatus.OK)
	public async getById(@Param('id') id: string) {
		const response = await this.screening.call('getScreening', { id })

		return response.screening
	}
}
