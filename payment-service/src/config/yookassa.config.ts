import { ConfigService } from '@nestjs/config'
import type { YookassaModuleOptions } from 'nestjs-yookassa'

export function getYookassaConfig(
	configService: ConfigService
): YookassaModuleOptions {
	return {
		shopId: configService.getOrThrow('YOOCASSA_SHOP_ID'),
		apiKey: configService.getOrThrow('YOOKASSA_API_KEY')
	}
}
