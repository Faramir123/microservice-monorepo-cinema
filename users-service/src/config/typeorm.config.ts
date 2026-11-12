import type { ConfigService } from '@nestjs/config'
import type { TypeOrmModuleOptions } from '@nestjs/typeorm'

import { UserEntity } from '../modules/users/entities/user.entity.js'

export const getTypeOrmConfig = (
	configService: ConfigService
): TypeOrmModuleOptions => {
	return {
		type: 'postgres',
		host: configService.getOrThrow<string>('DATABASE_HOST'),
		port: configService.getOrThrow<number>('DATABASE_PORT'),
		username: configService.getOrThrow<string>('DATABASE_USERNAME'),
		password: configService.getOrThrow<string>('DATABASE_PASSWORD'),
		database: configService.getOrThrow<string>('DATABASE_NAME'),
		entities: [UserEntity],
		synchronize:
			configService.getOrThrow<string>('NODE_ENV') === 'development'
				? configService.getOrThrow<string>('DATABASE_SYNC') === 'true'
				: false,
		logging:
			configService.getOrThrow<string>('NODE_ENV') === 'development'
				? configService.getOrThrow<string>('DATABASE_LOGGING') ===
					'true'
				: true
	}
}
