import { PROTO_PATHS } from '@faramircinema/contracts'
import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { ClientsModule, Transport } from '@nestjs/microservices'

import { PrismaModule } from './infrastructure/prisma/prisma.module'
import { YookassaGlobalModule } from './infrastructure/yookassa/yookassa-global.module'
import { PaymentModule } from './modules/payment/payment.module'
import { RefoundModule } from './modules/refound/refound.module'

@Module({
	imports: [
		ConfigModule.forRoot({ isGlobal: true }),
		YookassaGlobalModule,
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
		]),
		PrismaModule,
		PaymentModule,
		RefoundModule
	]
})
export class AppModule {}
