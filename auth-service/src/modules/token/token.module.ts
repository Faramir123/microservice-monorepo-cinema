import { PassportModule } from '@faramircinema/passport'
import { Module } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'

import { getPassportConfig } from '../../config/index.js'

import { TokenService } from './token.service.js'

@Module({
	imports: [
		PassportModule.registerAsync({
			useFactory: getPassportConfig,
			inject: [ConfigService]
		})
	],
	providers: [TokenService],
	exports: [TokenService]
})
export class TokenModule {}
