import { PROTO_PATHS } from '@faramircinema/contracts'
import { Module } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { ClientsModule, Transport } from '@nestjs/microservices'

import { BookingClientGrpc } from '../../clients/booking.client'

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
	providers: [BookingClientGrpc],
	exports: [BookingClientGrpc]
})
export class BookingModule {}
