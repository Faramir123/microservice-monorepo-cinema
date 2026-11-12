import { Module } from '@nestjs/common'

import { GrpcModule } from '@faramircinema/common'
import { PaymentController } from './payment.controller.js'
import { PaymentClientGrpc } from './payment.grpc.js'

@Module({
	imports: [GrpcModule.register(['PAYMENT_PACKAGE'])],
	controllers: [PaymentController],
	providers: [PaymentClientGrpc],
	exports: [PaymentClientGrpc]
})
export class PaymentModule {}
