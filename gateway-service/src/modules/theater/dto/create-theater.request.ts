import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsString } from 'class-validator'

export class CreateTheaterRequest {
	@ApiProperty({
		example: 'Эпицентр'
	})
	@IsString()
	@IsNotEmpty()
	public name: string

	@ApiProperty({
		example: 'Ул. Новая, д. 6'
	})
	@IsString()
	@IsNotEmpty()
	public address: string
}
