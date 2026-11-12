import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common'

import { ApiBearerAuth } from '@nestjs/swagger'

import { Protected } from '../../shared/decorators/protected.decorators.js'
import { CurrentUser } from '../../shared/decorators/current-user.decorator.js'
import { RefoundClientGrpc } from './refound.grpc.js'
import type { CreateRefoundRequest } from './dto/index.js'

@Controller('refounds')
export class RefoundController {
	public constructor(private readonly refound: RefoundClientGrpc) {}

	@ApiBearerAuth()
	@Protected()
	@Post()
	@HttpCode(HttpStatus.OK)
	public async initRefound(
		@Body() dto: CreateRefoundRequest,
		@CurrentUser() userId: string
	) {
		return await this.refound.call('createRefound', { userId, ...dto })
	}
}
