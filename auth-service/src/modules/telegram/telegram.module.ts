import { Module } from '@nestjs/common'

import { UserRepository } from '../../shared/repositories/user.repository.js'
import { TokenService } from '../token/token.service.js'
import { UsersModule } from '../users/users.module.js'

import { TelegramController } from './telegram.controller.js'
import { TelegramRepository } from './telegram.repository.js'
import { TelegramService } from './telegram.service.js'

@Module({
	imports: [UsersModule],
	controllers: [TelegramController],
	providers: [
		TelegramService,
		TelegramRepository,
		TokenService,
		UserRepository
	]
})
export class TelegramModule {}
