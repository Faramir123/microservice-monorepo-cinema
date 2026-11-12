import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common'
import { PaymentClientGrpc } from '../payment/payment.grpc.js'
import { RefoundClientGrpc } from '../refound/refound.grpc.js'

@Controller('webhook')
export class WebhookController {
	public constructor(
		private readonly paymentClient: PaymentClientGrpc,
		private readonly refoundClient: RefoundClientGrpc
	) {}

	@Post('yookassa')
	@HttpCode(HttpStatus.OK)
	public async handleYookassa(@Body() raw: any) {
		const event = raw.event
		const data = raw.JsonObject

		const card = data.payment_method?.card

		if (event.startsWith('payment.')) {
			await this.paymentClient.call('processPaymentEvent', {
				event,
				paymentId: data.metadata.payment_id,
				bookingId: data.metadata.booking_id,
				userId: data.metadata.user_id,
				savePaymentMethod: data.payment_method?.save,
				providerMethodId: data.payment_method?.id,
				cardFirst6: card?.first6,
				cartLast4: card?.last4,
				bank: card.card_product.name ?? 'Unknown',
				brand: card.card_type
			})
		}

		if (event.startsWith('refound.')) {
			await this.refoundClient.call('processRefoundEvent', {
				event,
				providerRefoundId: data.id,
				status: data.status
			})
		}
	}
}
