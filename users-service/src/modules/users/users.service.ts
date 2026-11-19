import { RpcStatus } from '@faramircinema/common'
import type {
	CreateUserRequest,
	GetMeRequest,
	PatchUserRequest
} from '@faramircinema/contracts/gen/ts/users.js'
import { Injectable } from '@nestjs/common'
import { RpcException } from '@nestjs/microservices'
import { lastValueFrom } from 'rxjs'

import { AccountClientGrpc } from '../../infrastructure/grpc/clients/account.client.js'

import { UsersRepository } from './users.repository.js'

@Injectable()
export class UsersService {
	public constructor(
		private readonly usersRepository: UsersRepository,
		private readonly accountClient: AccountClientGrpc
	) {}

	public async getMe(data: GetMeRequest) {
		const { id } = data

		const profile = await this.usersRepository.findById(id)

		if (!profile)
			throw new RpcException({
				code: RpcStatus.NOT_FOUND,
				detail: 'User not found'
			})

		const account = await lastValueFrom(
			this.accountClient.getAccount({ id })
		)

		return {
			user: {
				id: profile.id,
				name: profile.name ?? undefined,
				avatar: profile.avatar ?? undefined,
				phone: account.phone,
				email: account.email
			}
		}
	}

	public async create(data: CreateUserRequest) {
		const { id } = data

		const user = await this.usersRepository.create({ id })

		if (!user) {
			throw new RpcException({
				code: RpcStatus.INTERNAL,
				details: 'Failed to create user'
			})
		}

		return user
	}

	public async patchUser(data: PatchUserRequest) {
		const { userId, name, avatar } = data

		const user = await this.usersRepository.findById(userId)

		if (!user)
			throw new RpcException({
				code: RpcStatus.NOT_FOUND,
				details: 'User not found'
			})

		await this.usersRepository.update(user.id, {
			...(name !== undefined && { name }),
			...(avatar !== undefined && { avatar })
		})

		return { ok: true }
	}
}
