import type { ConfigService } from '@nestjs/config'
import type { Options } from 'postgres'

export function getDatabaseConfig(configService: ConfigService): Options<any> {
	return {
		host: configService.getOrThrow<string>('DATABASE_HOST'),
		port: configService.getOrThrow<number>('DATABASE_PORT'),
		password: configService.getOrThrow<string>('DATABASE_PASSWORD'),
		database: configService.getOrThrow<string>('DATABASE_NAME'),
		username: configService.getOrThrow<string>('DATABASE_USER'),
		max: 10,
		idle_timeout: 20
	}
}
