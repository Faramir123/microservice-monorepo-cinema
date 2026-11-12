import { Module } from '@nestjs/common'
import { WebhookController } from './webhook.controller.js'
import { GrpcModule } from '@faramircinema/common'
import { PaymentClientGrpc } from '../payment/payment.grpc.js'
import { RefoundClientGrpc } from '../refound/refound.grpc.js'

@Module({
	imports: [GrpcModule.register(['PAYMENT_PACKAGE', 'REFOUND_PACKAGE'])],
	controllers: [WebhookController],
	providers: [PaymentClientGrpc, RefoundClientGrpc]
})
export class WebhookModule {}
