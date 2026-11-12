import { IsInt, IsString, Max, Min } from 'class-validator'

export class RedisValidator {
	@IsString()
	public DATABASE_USER: string

	@IsString()
	public DATABASE_PASSWORD: string

	@IsString()
	public DATABASE_HOST: string

	@IsInt()
	@Min(1)
	@Max(65535)
	public DATABASE_PORT: number

	@IsInt()
	public DATABASE_DB: number
}
