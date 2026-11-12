import { injectGrpcClient } from '@faramircinema/common'
import { UserServiceClient } from '@faramircinema/contracts/gen/ts/users'
import { Injectable } from '@nestjs/common'
import type { ClientGrpc } from '@nestjs/microservices'
import { AbstractGrpcClient } from '../../shared/grpc/abstract-grpc.client.js'

@Injectable()
export class UsersClientGrpc extends AbstractGrpcClient<UserServiceClient> {
	constructor(@injectGrpcClient('USERS_PACKAGE') client: ClientGrpc) {
		super(client, 'UserService')
	}
}
