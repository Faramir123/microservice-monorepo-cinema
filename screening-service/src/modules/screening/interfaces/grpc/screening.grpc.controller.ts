import type {
	CreateScreeningRequest,
	GetScreeningRequest,
	GetScreeningsByMovieRequest,
	GetScreeningsRequest
} from '@faramircinema/contracts/gen/ts/screening'
import { Controller } from '@nestjs/common'
import { GrpcMethod } from '@nestjs/microservices'

import { CreateScreeningUseCase } from '../../application/commands/create-screening.usecase'
import { GetScreeningUseCase } from '../../application/queries/get-screening.usecase'
import { GetScreeningsByMovieUseCase } from '../../application/queries/get-screenings-by-movie.usecase copy'
import { GetScreeningsUseCase } from '../../application/queries/get-screenings.usecase'

@Controller()
export class ScreeningGrpcController {
	public constructor(
		private readonly listUC: GetScreeningsUseCase,
		private readonly getUC: GetScreeningUseCase,
		private readonly createUC: CreateScreeningUseCase,
		private readonly getByMovieUC: GetScreeningsByMovieUseCase
	) {}

	@GrpcMethod('ScreeningService', 'CreateScreening')
	public async create(data: CreateScreeningRequest) {
		return await this.createUC.execute(data)
	}

	@GrpcMethod('ScreeningService', 'GetScreening')
	public async getById(data: GetScreeningRequest) {
		const screening = await this.getUC.execute(data.id)

		return { screening }
	}

	@GrpcMethod('ScreeningService', 'GetScreenings')
	public async getAll(data: GetScreeningsRequest) {
		const screenings = await this.listUC.execute(data)

		return { screenings }
	}

	@GrpcMethod('ScreeningService', 'GetScreeningsByMovie')
	public async getByMovie(data: GetScreeningsByMovieRequest) {
		const screenings = await this.getByMovieUC.execute(data)

		return { screenings }
	}
}
