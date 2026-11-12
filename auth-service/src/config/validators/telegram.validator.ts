import { IsNumber, IsString } from 'class-validator'

export class TelegramValidator {
	@IsString()
	public TG_BOT_ID: string

	@IsString()
	public TG_BOT_TOKEN: string

	@IsString()
	public TG_BOT_USERNAME: string

	@IsString()
	public TG_REDIRECT_ORIGIN: string
}
