import type {
	CreateRefoundRequest,
	CreateRefoundResponse,
	ProcessRefoundEventRequest
} from '@faramircinema/contracts/gen/ts/refound'
import { Controller } from '@nestjs/common'
import { GrpcMethod } from '@nestjs/microservices'

import { RefoundService } from './refound.service'

@Controller()
export class RefoundController {
	public constructor(private readonly refoundService: RefoundService) {}

	@GrpcMethod('RefoundService', 'CreateRefound')
	public async createRefound(
		data: CreateRefoundRequest
	): Promise<CreateRefoundResponse> {
		return await this.refoundService.createRefound(data)
	}

	@GrpcMethod('RefoundService', 'ProcessRefoundEvent')
	public async processEvent(data: ProcessRefoundEventRequest) {
		return await this.refoundService.processEvent(data)
	}
}
