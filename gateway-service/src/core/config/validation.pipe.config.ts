import type { ValidationPipeOptions } from '@nestjs/common'

export function getValidationPipeConfig(): ValidationPipeOptions {
	return {
		transform: true,
		forbidNonWhitelisted: true, // выбрасывает ошибку, если есть лишние поля
		whitelist: true
	}
}
