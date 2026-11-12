import type {
	CreateTheaterRequest,
	CreateTheaterResponse,
	GetTheaterRequest,
	GetTheaterResponse,
	ListTheaterResponse
} from '@faramircinema/contracts/gen/ts/theater'
import { Controller } from '@nestjs/common'
import { GrpcMethod } from '@nestjs/microservices'

import { CreateTheaterUseCase } from '../../application/commands/create-theater.usecase'
import { GetTheaterUseCase } from '../../application/queries/get-theater.usecase'
import { ListTheatersUseCase } from '../../application/queries/list-theaters.usecase'

@Controller()
export class TheaterGrpcController {
	public constructor(
		private readonly listUC: ListTheatersUseCase,
		private readonly getUC: GetTheaterUseCase,
		private readonly createUC: CreateTheaterUseCase
	) {}

	@GrpcMethod('TheaterService', 'ListTheater')
	public async getAll(): Promise<ListTheaterResponse> {
		const theaters = await this.listUC.execute()

		return { theaters }
	}

	@GrpcMethod('TheaterService', 'GetTheater')
	public async getById(data: GetTheaterRequest): Promise<GetTheaterResponse> {
		const theater = await this.getUC.execute(data.id)

		return { theater }
	}

	@GrpcMethod('TheaterService', 'CreateTheater')
	public async create(
		data: CreateTheaterRequest
	): Promise<CreateTheaterResponse> {
		const theater = await this.createUC.execute(data)

		return { theater }
	}
}
