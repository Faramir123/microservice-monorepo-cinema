import type {
	CreateHallRequest,
	CreateHallResponse,
	GetHallRequest,
	GetHallResponse,
	ListHallsRequest,
	ListHallsResponse
} from '@faramircinema/contracts/gen/ts/hall'
import { Controller } from '@nestjs/common'
import { GrpcMethod } from '@nestjs/microservices'

import { CreateHallUseCase } from '../../application/commands/create-hall.usecase'
import { GetHallUseCase } from '../../application/queries/get-hall-usecase'
import { ListHallUseCase } from '../../application/queries/list-hall.usecase'

@Controller()
export class HallGrpcController {
	public constructor(
		private readonly listUC: ListHallUseCase,
		private readonly getUC: GetHallUseCase,
		private readonly createUC: CreateHallUseCase
	) {}

	@GrpcMethod('HallService', 'CreateHall')
	public async create(data: CreateHallRequest): Promise<CreateHallResponse> {
		const hall = await this.createUC.execute({
			name: data.name,
			theaterId: data.theaterId,
			layout: data.rows
		})

		return { hall }
	}

	@GrpcMethod('HallService', 'GetHall')
	public async getById(data: GetHallRequest): Promise<GetHallResponse> {
		const hall = await this.getUC.execute(data.id)

		return { hall }
	}

	@GrpcMethod('HallService', 'listHalls')
	public async list(data: ListHallsRequest): Promise<ListHallsResponse> {
		const halls = await this.listUC.execute(data.theaterId)

		return { halls }
	}
}
