import { ApiProperty } from '@nestjs/swagger'
import { IsEmail, IsNotEmpty, Matches } from 'class-validator'

export class InitPhoneChangeRequest {
	@ApiProperty({
		example: 'vito.corlione@raramircinema.ru'
	})
	@IsNotEmpty()
	@Matches(/^(\+7|8)[\s\-]?\(?\d{3}\)?[\s\-]?\d{3}[\s\-]?\d{2}[\s\-]?\d{2}$/)
	public phone: string
}
