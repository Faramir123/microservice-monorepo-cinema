import { injectGrpcClient } from '@faramircinema/common/dist/index.js'
import type { AuthServiceClient } from '@faramircinema/contracts/gen/ts/auth'
import { Injectable } from '@nestjs/common'
import type { ClientGrpc } from '@nestjs/microservices'
import { AbstractGrpcClient } from '../../shared/grpc/index.js'

@Injectable()
export class AuthClientGrpc extends AbstractGrpcClient<AuthServiceClient> {
	constructor(@injectGrpcClient('AUTH_PACKAGE') client: ClientGrpc) {
		super(client, 'AuthService')
	}
}
