import {
	Body,
	Controller,
	Get,
	HttpCode,
	HttpStatus,
	Param,
	Post
} from '@nestjs/common'

import { HallClientGrpc } from './hall.grpc.js'
import { CreateHallRequest } from './dto/create-hall.request.js'

@Controller('hall')
export class HallController {
	public constructor(private readonly hall: HallClientGrpc) {}

	@Get()
	@HttpCode(HttpStatus.OK)
	public async getById(@Param('id') id: string) {
		const { hall } = await this.hall.call('getHall', { id })

		return hall
	}

	// @Protected(Role.ADMIN)
	@Post()
	@HttpCode(HttpStatus.CREATED)
	public async create(@Body() dto: CreateHallRequest) {
		return this.hall.call('createHall', dto)
	}
}
