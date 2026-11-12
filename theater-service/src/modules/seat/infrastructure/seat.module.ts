import { PROTO_PATHS } from '@faramircinema/contracts'
import { Module } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { ClientsModule, Transport } from '@nestjs/microservices'

import { GetSeatUseCase } from '../application/queries/get-seat.usecae'
import { ListSeatsUseCase } from '../application/queries/list-seats.usecase'
import { BookingPort } from '../domain/ports/booking.port'
import { SeatRepositoryPort } from '../domain/ports/seat.repository.port'
import { SeatGrpcController } from '../interfaces/grpc/seat.grpc.controller'

import { BookingGrpcAdapter } from './grpc/booking.grpc.adapter'
import { SeatPrismaRepository } from './prisma/seat.repository'

@Module({
	imports: [
		ClientsModule.registerAsync([
			{
				name: 'BOOKING_PACKAGE',
				useFactory: (configService: ConfigService) => ({
					transport: Transport.GRPC,
					options: {
						package: 'booking.v1',
						protoPath: PROTO_PATHS.BOOKING,
						url: configService.getOrThrow<string>(
							'BOOKING_GRPC_URL'
						)
					}
				}),
				inject: [ConfigService]
			}
		])
	],
	controllers: [SeatGrpcController],
	providers: [
		{
			provide: SeatRepositoryPort,
			useClass: SeatPrismaRepository
		},
		{
			provide: BookingPort,
			useClass: BookingGrpcAdapter
		},
		ListSeatsUseCase,
		GetSeatUseCase
	]
})
export class SeatModule {}
