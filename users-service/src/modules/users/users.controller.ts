import type {
	CreateUserRequest,
	CreateUserResponse,
	GetMeRequest,
	GetMeResponse,
	PatchUserRequest,
	PatchUserResponse
} from '@faramircinema/contracts/gen/ts/users.js'
import { Controller } from '@nestjs/common'
import { GrpcMethod } from '@nestjs/microservices'

import { UsersService } from './users.service.js'

@Controller()
export class UsersController {
	public constructor(private readonly usersService: UsersService) {}

	@GrpcMethod('UserService', 'GetMe')
	public async getMe(data: GetMeRequest): Promise<GetMeResponse> {
		return await this.usersService.getMe(data)
	}

	@GrpcMethod('UserService', 'CreateUser')
	public async create(data: CreateUserRequest): Promise<CreateUserResponse> {
		await this.usersService.create(data)

		return { ok: true }
	}

	@GrpcMethod('UserService', 'PatchUser')
	public async patchUser(data: PatchUserRequest): Promise<PatchUserResponse> {
		await this.usersService.patchUser(data)

		return { ok: true }
	}
}
