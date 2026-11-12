import type {
	GetSeatRequest,
	GetSeatResponse,
	ListSeatsRequest,
	ListSeatsResponse
} from '@faramircinema/contracts/gen/ts/seat'
import { Controller } from '@nestjs/common'
import { GrpcMethod } from '@nestjs/microservices'

import { GetSeatUseCase } from '../../application/queries/get-seat.usecae'
import { ListSeatsUseCase } from '../../application/queries/list-seats.usecase'

@Controller()
export class SeatGrpcController {
	public constructor(
		private readonly listUC: ListSeatsUseCase,
		private readonly getUC: GetSeatUseCase
	) {}

	@GrpcMethod('SeatService', 'GetSeat')
	public async getById(data: GetSeatRequest): Promise<GetSeatResponse> {
		const seat = await this.getUC.execute(data.id)

		return { seat }
	}

	@GrpcMethod('SeatService', 'ListSeats')
	public async list(data: ListSeatsRequest): Promise<ListSeatsResponse> {
		const seats = await this.listUC.execute(data.hallId, data.screeningId)

		return { seats }
	}
}
