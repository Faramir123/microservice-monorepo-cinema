import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

export class GetMeResponse {
	@ApiProperty({
		example: 'ufuRVFDwrnMD4dWoTCSzI'
	})
	public id: string

	@ApiPropertyOptional({
		example: 'Evgen Matveev'
	})
	public name: string

	@ApiProperty({
		example: 'evgen.matveev@faramircinema.ru'
	})
	public email: string

	@ApiProperty({
		example: '+79115558899'
	})
	public phone: string

	@ApiPropertyOptional({
		example:
			'https://cdn.faramircinema.ru/users/aeawdawdfefef232331r31f1f1f13'
	})
	public avatar: string
}
