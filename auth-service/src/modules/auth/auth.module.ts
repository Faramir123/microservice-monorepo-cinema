import { Module } from '@nestjs/common'

import { UserRepository } from '../../shared/repositories/user.repository.js'
import { OtpService } from '../otp/otp.service.js'
import { TokenService } from '../token/token.service.js'
import { UsersModule } from '../users/users.module.js'

import { AuthController } from './auth.controller.js'
import { AuthService } from './auth.service.js'

@Module({
	imports: [UsersModule],
	controllers: [AuthController],
	providers: [AuthService, UserRepository, OtpService, TokenService]
})
export class AuthModule {}
