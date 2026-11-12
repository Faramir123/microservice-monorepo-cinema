import {
	type CreateUserRequest,
	UserServiceClient
} from '@faramircinema/contracts/gen/ts/users.js'
import { Inject, Injectable, OnModuleInit } from '@nestjs/common'
import type { ClientGrpc } from '@nestjs/microservices'

@Injectable()
export class UsersClientGrpc implements OnModuleInit {
	private usersService: UserServiceClient

	public constructor(
		@Inject('USERS_PACKAGE') private readonly client: ClientGrpc
	) {}

	public onModuleInit() {
		this.usersService =
			this.client.getService<UserServiceClient>('UserService')
	}

	public create(request: CreateUserRequest) {
		return this.usersService.createUser(request)
	}
}
