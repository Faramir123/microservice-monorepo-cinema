import { Global, Module } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { YookassaModule } from 'nestjs-yookassa'

import { getYookassaConfig } from '../../config/yookassa.config'

@Global()
@Module({
	imports: [
		YookassaModule.forRootAsync({
			useFactory: getYookassaConfig,
			inject: [ConfigService]
		})
	],
	exports: [YookassaModule]
})
export class YookassaGlobalModule {}
