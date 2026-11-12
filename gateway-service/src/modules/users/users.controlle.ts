import {
	BadRequestException,
	Body,
	Controller,
	FileTypeValidator,
	Get,
	HttpCode,
	HttpStatus,
	MaxFileSizeValidator,
	ParseFilePipe,
	Patch,
	UploadedFile,
	UseInterceptors
} from '@nestjs/common'
import {
	ApiBearerAuth,
	ApiBody,
	ApiConsumes,
	ApiOkResponse,
	ApiOperation
} from '@nestjs/swagger'
import { FileInterceptor } from '@nestjs/platform-express'

import { GetMeResponse, PatchUserRequest } from './dto/index.js'
import { Protected } from '../../shared/decorators/protected.decorators.js'
import { CurrentUser } from '../../shared/decorators/current-user.decorator.js'
import { UsersClientGrpc } from './users.grpc.js'
import { MediaClientGrpc } from '../media/media.grpc.js'
import { randomBytes } from 'crypto'

@Controller('users')
export class UsersController {
	public constructor(
		private readonly users: UsersClientGrpc,
		private readonly media: MediaClientGrpc
	) {}

	@ApiOperation({
		summary: 'Get current user profile',
		description: 'Returns authenticated user profile data'
	})
	@ApiOkResponse({ type: GetMeResponse })
	@ApiBearerAuth()
	@Protected()
	@Get('@me')
	@HttpCode(HttpStatus.OK)
	public async getMe(@CurrentUser() userId: string) {
		const { user } = await this.users.call('getMe', { id: userId })
		return user
	}

	@ApiBearerAuth()
	@Protected()
	@Patch('@me')
	@HttpCode(HttpStatus.OK)
	public async patchUser(
		@CurrentUser() userId: string,
		@Body() dto: PatchUserRequest
	) {
		return await this.users.call('patchUser', { userId, ...dto })
	}

	@ApiOperation({
		summary: 'Update user avatar',
		description: 'Uploads a new avatar for the authenticated user'
	})
	@ApiConsumes('multipart/form-data')
	@ApiBody({
		description: 'Image file to upload',
		schema: {
			type: 'object',
			properties: {
				file: { type: 'string', format: 'binary' }
			}
		}
	})
	@ApiBearerAuth()
	@UseInterceptors(FileInterceptor('file'))
	@Protected()
	@Patch('@me/avatar')
	@HttpCode(HttpStatus.OK)
	public async changeAvatar(
		@CurrentUser() userId: string,
		@UploadedFile(
			new ParseFilePipe({
				validators: [
					new MaxFileSizeValidator({
						maxSize: 10 * 1024 * 1024,
						message: 'Размер файла не должен превышать 10MB' // 👈 Исправлена опечатка
					}),
					new FileTypeValidator({
						fileType: /^image\/(jpeg|png|webp|gif)$/i // 👈 Более строгая регулярка
					})
				],
				exceptionFactory: error => {
					if (error.includes('File is too large')) {
						throw new BadRequestException(
							'Размер файла не должен превышать 10MB'
						)
					}
					if (error.includes('Invalid file type')) {
						throw new BadRequestException(
							'Разрешены только изображения форматов: JPG, PNG, WEBP, GIF'
						)
					}
					throw new BadRequestException('Некорректный файл')
				}
			})
		)
		file: Express.Multer.File
	) {
		const response = await this.media.call('upload', {
			fileName: randomBytes(16).toString('hex'),
			folder: 'users',
			contentType: file.mimetype,
			data: new Uint8Array(file.buffer),
			resizeWidth: 512,
			resizeHeight: 512
		})

		return this.users.call('patchUser', { userId, avatar: response.key })
	}
}
