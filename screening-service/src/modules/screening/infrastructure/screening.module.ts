import { PROTO_PATHS } from '@faramircinema/contracts'
import { Module } from '@nestjs/common'
import { ClientsModule, Transport } from '@nestjs/microservices'
import { MongooseModule } from '@nestjs/mongoose'

import { CreateScreeningUseCase } from '../application/commands/create-screening.usecase'
import { GetScreeningUseCase } from '../application/queries/get-screening.usecase'
import { GetScreeningsByMovieUseCase } from '../application/queries/get-screenings-by-movie.usecase copy'
import { GetScreeningsUseCase } from '../application/queries/get-screenings.usecase'
import { HallPort } from '../domain/ports/hall.port'
import { MoviePort } from '../domain/ports/movie.port'
import { ScreeningRepositoryPort } from '../domain/ports/screening.repository.port'
import { SeatPort } from '../domain/ports/seat.port'
import { TheaterPort } from '../domain/ports/theater.port'
import { HallGrpcAdapter } from '../interfaces/grpc/hall.grpc.adapter'
import { MovieGrpcAdapter } from '../interfaces/grpc/movie.grpc.adapter'
import { ScreeningGrpcController } from '../interfaces/grpc/screening.grpc.controller'
import { SeatGrpcAdapter } from '../interfaces/grpc/seat.grpc.adapter'
import { TheaterGrpcAdapter } from '../interfaces/grpc/theater.grpc.adapter'

import { ScreeningMongoRepository } from './database/repositories/screening.mongo.repository'
import {
	ScreeningModel,
	ScreeningSchema
} from './database/schemas/screening.schema'

@Module({
	imports: [
		MongooseModule.forFeature([
			{
				name: ScreeningModel.name,
				schema: ScreeningSchema
			}
		]),
		ClientsModule.register([
			{
				name: 'THEATER_PACKAGE',
				transport: Transport.GRPC,
				options: {
					package: 'theater.v1',
					protoPath: PROTO_PATHS.THEATER,
					url: 'localhost:50054'
				}
			},
			{
				name: 'SEAT_PACKAGE',
				transport: Transport.GRPC,
				options: {
					package: 'seat.v1',
					protoPath: PROTO_PATHS.SEAT,
					url: 'localhost:50054'
				}
			},
			{
				name: 'HALL_PACKAGE',
				transport: Transport.GRPC,
				options: {
					package: 'hall.v1',
					protoPath: PROTO_PATHS.HALL,
					url: 'localhost:50054'
				}
			},
			{
				name: 'MOVIE_PACKAGE',
				transport: Transport.GRPC,
				options: {
					package: 'movie.v1',
					protoPath: PROTO_PATHS.MOVIE,
					url: 'localhost:50053'
				}
			}
		])
	],
	controllers: [ScreeningGrpcController],
	providers: [
		{
			provide: ScreeningRepositoryPort,
			useClass: ScreeningMongoRepository
		},
		{
			provide: HallPort,
			useClass: HallGrpcAdapter
		},
		{
			provide: SeatPort,
			useClass: SeatGrpcAdapter
		},
		{
			provide: TheaterPort,
			useClass: TheaterGrpcAdapter
		},
		{
			provide: MoviePort,
			useClass: MovieGrpcAdapter
		},
		GetScreeningUseCase,
		GetScreeningsByMovieUseCase,
		GetScreeningsUseCase,
		CreateScreeningUseCase
	]
})
export class ScreeningModule {}
