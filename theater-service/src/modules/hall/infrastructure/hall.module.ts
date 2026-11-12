import { Module } from '@nestjs/common'

import { CreateHallUseCase } from '../application/commands/create-hall.usecase'
import { GetHallUseCase } from '../application/queries/get-hall-usecase'
import { ListHallUseCase } from '../application/queries/list-hall.usecase'
import { HallRepositoryPort } from '../domain/ports/hall.repository.port'
import { HallGrpcController } from '../interfaces/grpc/hall.grpc.controller'

import { HallPrismaRepository } from './prisma/hall.repository'

@Module({
	controllers: [HallGrpcController],
	providers: [
		{
			provide: HallRepositoryPort,
			useClass: HallPrismaRepository
		},
		ListHallUseCase,
		GetHallUseCase,
		CreateHallUseCase
	]
})
export class HallModule {}
