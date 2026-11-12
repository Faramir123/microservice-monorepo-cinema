import { HttpModule } from '@nestjs/axios'
import { type DynamicModule, Module } from '@nestjs/common'

import { SMS_OPTIONS } from './constants/sms.constants.js'
import type { SmsAsyncOptions } from './interfaces/sms-async-options.interface.js'
import type { SmsOptions } from './interfaces/sms-options.interface.js'
import { SmsService } from './sms.service.js'

@Module({})
export class SmsModule {
	public static register(options: SmsOptions): DynamicModule {
		return {
			module: SmsModule,
			imports: [HttpModule],
			providers: [
				SmsService,
				{
					provide: SMS_OPTIONS,
					useValue: options
				}
			],
			exports: [SmsService]
		}
	}
	public static registerAsync(options: SmsAsyncOptions): DynamicModule {
		return {
			module: SmsModule,
			imports: [HttpModule, ...(options.imports ?? [])],
			providers: [
				SmsService,
				{
					provide: SMS_OPTIONS,
					inject: options.inject ?? [],
					useFactory: options.useFactory
				}
			],
			exports: [SmsService]
		}
	}
}
