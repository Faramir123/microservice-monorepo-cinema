import { Module } from '@nestjs/common'
import { createObserveModule } from '@nestjs/observe'
import { AppController } from './app.controller.js'
import { AppService } from './app.service.js'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { AuthModule } from '../modules/auth/auth.module.js'
import { PassportModule } from '@faramircinema/passport/dist/index.js'
import { getPassportConfig } from './config/passport.config.js'
import { AccountModule } from '../modules/account/account.module.js'
import { UsersModule } from '../modules/users/users.module.js'
import { ObservAbilityModule } from '../observability/observability.module.js'
import { LoggerModule } from 'nestjs-pino'
import { MovieModule } from '../modules/movie/movie.module.js'
import { CategoryModule } from '../modules/category/category.module.js'
import { TheaterModule } from '../modules/theater/theater.module.js'
import { HallModule } from '../modules/hall/hall.module.js'
import { SeatModule } from '../modules/seat/seat.module.js'
import { ScreeningModule } from '../modules/screening/screening.module.js'
import { PaymentModule } from '../modules/payment/payment.module.js'
import { WebhookModule } from '../modules/webhook/webhook.module.js'
import { RefoundModule } from '../modules/refound/refound.module.js'
import { BookingModule } from '../modules/booking/booking.module.js'

export const { ObserveModule, ObserveInstrument } = createObserveModule()

@Module({
	imports: [
		ConfigModule.forRoot({
			isGlobal: true,
			envFilePath: [
				`.env.${process.env.NODE_ENV}.local`,
				`.env.${process.env.NODE_ENV}`,
				'.env'
			] //  путь к файлу (относительно корня проекта)
		}),
		ObserveModule.forRoot({
			appKey: 'YOUR_APP_KEY',
			appSecret: 'YOUR_APP_SECRET',
			serviceId: 'gateway-service'
		}),
		LoggerModule.forRoot({
			pinoHttp: {
				level: process.env.LOG_LEVEL || 'info',
				transport: {
					target: 'pino/file',
					options: {
						destination: '/var/log/services/gateway/gateway.log',
						mkdir: true
					}
				},
				messageKey: 'msg',
				customProps: () => ({ service: 'gateway-service' })
			}
		}),
		PassportModule.registerAsync({
			useFactory: getPassportConfig,
			inject: [ConfigService]
		}),
		ObservAbilityModule,
		AuthModule,
		AccountModule,
		UsersModule,
		MovieModule,
		CategoryModule,
		TheaterModule,
		HallModule,
		SeatModule,
		BookingModule,
		ScreeningModule,
		PaymentModule,
		RefoundModule,
		WebhookModule
	],
	controllers: [AppController],
	providers: [AppService]
})
export class AppModule {}
