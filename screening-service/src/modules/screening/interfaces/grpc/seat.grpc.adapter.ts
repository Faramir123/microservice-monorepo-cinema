import type {
	Seat,
	SeatServiceClient
} from '@faramircinema/contracts/gen/ts/seat'
import { Inject, Injectable, type OnModuleInit } from '@nestjs/common'
import type { ClientGrpc } from '@nestjs/microservices'
import { lastValueFrom } from 'rxjs'

import type { SeatPort, SeatType } from '../../domain/ports/seat.port'

@Injectable()
export class SeatGrpcAdapter implements SeatPort, OnModuleInit {
	private service: SeatServiceClient

	public constructor(
		@Inject('SEAT_PACKAGE') private readonly client: ClientGrpc
	) {}

	public onModuleInit() {
		this.service = this.client.getService<SeatServiceClient>('SeatService')
	}

	public async listSeatTypes(
		hallId: string,
		screeningId: string
	): Promise<SeatType[]> {
		const response = await lastValueFrom(
			this.service.listSeats({ hallId, screeningId })
		)

		const map = new Map<string, SeatType>()

		for (const seat of response.seats ?? []) {
			const key = `${seat.type}-${seat.price}`

			if (!map.has(seat.type)) {
				map.set(key, {
					type: seat.type,
					price: seat.price
				})
			}
		}

		return Array.from(map.values())
	}
}
