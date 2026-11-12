import { Module } from '@nestjs/common'

import { CreateTheaterUseCase } from '../application/commands/create-theater.usecase'
import { GetTheaterUseCase } from '../application/queries/get-theater.usecase'
import { ListTheatersUseCase } from '../application/queries/list-theaters.usecase'
import { TheaterRepositoryPort } from '../domain/ports/theater.repository.port'
import { TheaterGrpcController } from '../interfaces/grpc/theater.grpc.controller'

import { TheaterPrismaRepository } from './prisma/theater.prisma.rapository'

@Module({
	controllers: [TheaterGrpcController],
	providers: [
		{
			provide: TheaterRepositoryPort,
			useClass: TheaterPrismaRepository
		},
		ListTheatersUseCase,
		GetTheaterUseCase,
		CreateTheaterUseCase
	]
})
export class TheaterModule {}
