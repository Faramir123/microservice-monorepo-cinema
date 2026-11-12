import type { TheaterServiceClient } from '@faramircinema/contracts/gen/ts/theater'
import { Inject, Injectable, type OnModuleInit } from '@nestjs/common'
import type { ClientGrpc } from '@nestjs/microservices'
import { lastValueFrom } from 'rxjs'

import type { Theater, TheaterPort } from '../../domain/ports/theater.port'

@Injectable()
export class TheaterGrpcAdapter implements TheaterPort, OnModuleInit {
	private service: TheaterServiceClient

	public constructor(
		@Inject('THEATER_PACKAGE') private readonly client: ClientGrpc
	) {}

	public onModuleInit() {
		this.service =
			this.client.getService<TheaterServiceClient>('TheaterService')
	}

	public async findById(id: string): Promise<Theater | null> {
		const response = await lastValueFrom(this.service.getTheater({ id }))
		return response.theater ?? null
	}
}
