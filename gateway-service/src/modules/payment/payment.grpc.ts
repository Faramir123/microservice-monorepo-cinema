import { AccountServiceClient } from '@faramircinema/contracts/gen/ts/account'
import { Injectable } from '@nestjs/common'
import type { ClientGrpc } from '@nestjs/microservices'
import { AbstractGrpcClient } from '../../shared/grpc/abstract-grpc.client.js'
import { injectGrpcClient } from '@faramircinema/common'
import type { PaymentServiceClient } from '@faramircinema/contracts/gen/ts/payment'

@Injectable()
export class PaymentClientGrpc extends AbstractGrpcClient<PaymentServiceClient> {
	constructor(@injectGrpcClient('PAYMENT_PACKAGE') client: ClientGrpc) {
		super(client, 'PaymentService')
	}
}
