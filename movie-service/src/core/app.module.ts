import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { createObserveModule } from '@nestjs/observe'

import { DatabaseModule } from '../infrastructure/database/database.module.js'
import { RedisModule } from '../infrastructure/redis/redis.module.js'
import { CategoryModule } from '../modules/category/category.module.js'
import { MoviesModule } from '../modules/movies/movies.module.js'

export const { ObserveModule, ObserveInstrument } = createObserveModule()

@Module({
	imports: [
		ObserveModule.forRoot({
			appKey: 'YOUR_APP_KEY',
			appSecret: 'YOUR_APP_SECRET',
			serviceId: 'movie-service'
		}),
		ConfigModule.forRoot({ isGlobal: true }),
		DatabaseModule,
		RedisModule,
		MoviesModule,
		CategoryModule
	]
})
export class AppModule {}
