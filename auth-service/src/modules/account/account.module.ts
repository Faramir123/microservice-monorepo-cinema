import { Module } from '@nestjs/common'

import { UserRepository } from '../../shared/repositories/user.repository.js'
import { OtpService } from '../otp/otp.service.js'

import { AccountController } from './account.controller.js'
import { AccountRepository } from './account.repository.js'
import { AccountService } from './account.service.js'

@Module({
	controllers: [AccountController],
	providers: [AccountService, AccountRepository, UserRepository, OtpService]
})
export class AccountModule {}
