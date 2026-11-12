import { RpcStatus } from '@faramircinema/common'
import { Injectable } from '@nestjs/common'
import { RpcException } from '@nestjs/microservices'

import { HallRepositoryPort } from '../../domain/ports/hall.repository.port'

@Injectable()
export class GetHallUseCase {
	public constructor(private readonly repository: HallRepositoryPort) {}

	public async execute(id: string) {
		const hall = await this.repository.findById(id)

		if (!hall)
			throw new RpcException({
				code: RpcStatus.NOT_FOUND,
				details: 'Hall not found'
			})

		return hall
	}
}
