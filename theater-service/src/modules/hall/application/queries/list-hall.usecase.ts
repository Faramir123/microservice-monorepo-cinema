import { Injectable } from '@nestjs/common'

import { HallRepositoryPort } from '../../domain/ports/hall.repository.port'

@Injectable()
export class ListHallUseCase {
	public constructor(private readonly repository: HallRepositoryPort) {}

	public async execute(theaterId: string) {
		return await this.repository.listByTheater(theaterId)
	}
}
