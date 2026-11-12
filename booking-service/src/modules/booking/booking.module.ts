import { PROTO_PATHS } from '@faramircinema/contracts'
import { Module } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { ClientsModule, Transport } from '@nestjs/microservices'

import {
	HallClientGrpc,
	MovieClientGrpc,
	ScreeningClientGrpc,
	SeatClientGrpc,
	TheaterClientGrpc
} from '../../clients'

import { BookingController } from './booking.controller'
import { BookingRepository } from './booking.repository'
import { BookingService } from './booking.service'

@Module({
	imports: [
		ClientsModule.registerAsync([
			{
				name: 'THEATER_PACKAGE',
				useFactory: (configService: ConfigService) => ({
					transport: Transport.GRPC,
					options: {
						package: 'theater.v1',
						protoPath: PROTO_PATHS.THEATER,
						url: configService.getOrThrow<string>(
							'THEATER_GRPC_URL'
						)
					}
				}),
				inject: [ConfigService]
			},
			{
				name: 'HALL_PACKAGE',
				useFactory: (configService: ConfigService) => ({
					transport: Transport.GRPC,
					options: {
						package: 'hall.v1',
						protoPath: PROTO_PATHS.HALL,
						url: configService.getOrThrow<string>(
							'THEATER_GRPC_URL'
						)
					}
				}),
				inject: [ConfigService]
			},
			{
				name: 'SEAT_PACKAGE',
				useFactory: (configService: ConfigService) => ({
					transport: Transport.GRPC,
					options: {
						package: 'seat.v1',
						protoPath: PROTO_PATHS.SEAT,
						url: configService.getOrThrow<string>(
							'THEATER_GRPC_URL'
						)
					}
				}),
				inject: [ConfigService]
			},
			{
				name: 'MOVIE_PACKAGE',
				useFactory: (configService: ConfigService) => ({
					transport: Transport.GRPC,
					options: {
						package: 'movie.v1',
						protoPath: PROTO_PATHS.MOVIE,
						url: configService.getOrThrow<string>('MOVIE_GRPC_URL')
					}
				}),
				inject: [ConfigService]
			},
			{
				name: 'SCREENING_PACKAGE',
				useFactory: (configService: ConfigService) => ({
					transport: Transport.GRPC,
					options: {
						package: 'screening.v1',
						protoPath: PROTO_PATHS.SCREENING,
						url: configService.getOrThrow<string>(
							'SCREENING_GRPC_URL'
						)
					}
				}),
				inject: [ConfigService]
			}
		])
	],
	controllers: [BookingController],
	providers: [
		BookingService,
		BookingRepository,
		HallClientGrpc,
		TheaterClientGrpc,
		MovieClientGrpc,
		SeatClientGrpc,
		ScreeningClientGrpc
	]
})
export class BookingModule {}
