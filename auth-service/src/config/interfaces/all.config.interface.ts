import type { DatabaseConfig } from './database.interface.js'
import type { GrpcConfig } from './grpc.interface.js'
import type { PassportConfig } from './passport.interface.js'
import type { RedisConfig } from './redis.interface.js'
import type { RmqConfig } from './rmq.interface.js'
import type { TelegramConfig } from './telegram.interface.js'

export interface AllConfigs {
	grpc: GrpcConfig
	database: DatabaseConfig
	redis: RedisConfig
	passport: PassportConfig
	telegram: TelegramConfig
	rmq: RmqConfig
}
