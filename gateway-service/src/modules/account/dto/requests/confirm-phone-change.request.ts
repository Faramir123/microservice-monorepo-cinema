import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsNumberString, Length, Matches } from 'class-validator'

export class ConfirmPhoneChangeRequest {
	@ApiProperty({
		example: '+79504099988'
	})
	@IsNotEmpty()
	@Matches(/^(\+7|8)[\s\-]?\(?\d{3}\)?[\s\-]?\d{3}[\s\-]?\d{2}[\s\-]?\d{2}$/)
	public phone: string

	@ApiProperty({ example: '123456' })
	@IsNotEmpty()
	@IsNumberString()
	@Length(6, 6)
	public code: string
}
