import { AccountServiceClient } from '@faramircinema/contracts/gen/ts/account'
import { Injectable } from '@nestjs/common'
import type { ClientGrpc } from '@nestjs/microservices'
import { AbstractGrpcClient } from '../../shared/grpc/abstract-grpc.client.js'
import { injectGrpcClient } from '@faramircinema/common'

@Injectable()
export class AccountClientGrpc extends AbstractGrpcClient<AccountServiceClient> {
	constructor(@injectGrpcClient('ACCOUNT_PACKAGE') client: ClientGrpc) {
		super(client, 'AccountService')
	}
}
