import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsString } from 'class-validator'

export class TelegramVerifyRequest {
	@ApiProperty({
		example:
			'eyJpZCI6NjA3NDk0MDAyLCJmaXJzdF9uYW1lIjoiXHUwNDEyXHUwNDNiXHUwNDMwXHUwNDM0XHUwNDM4XHUwNDQ...'
	})
	@IsString()
	@IsNotEmpty()
	public tgAuthResult: string
}
