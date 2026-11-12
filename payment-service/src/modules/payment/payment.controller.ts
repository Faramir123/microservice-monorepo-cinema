import type {
	CreatePaymentRequest,
	CreatePaymentResponse,
	DeletePaymentMethodRequest,
	GetUserPaymentMethodRequest,
	ProcessPaymentEventRequest,
	ProcessPaymentEventResponse,
	VerifyPaymentMethodRequest
} from '@faramircinema/contracts/gen/ts/payment'
import { Controller } from '@nestjs/common'
import { GrpcMethod } from '@nestjs/microservices'

import { PaymentsService } from './payment.service'

@Controller()
export class PaymentController {
	public constructor(private readonly paymentService: PaymentsService) {}

	@GrpcMethod('PaymentService', 'CreatePayment')
	public async createPayment(
		data: CreatePaymentRequest
	): Promise<CreatePaymentResponse> {
		return await this.paymentService.createPayment(data)
	}

	@GrpcMethod('PaymentService', 'ProcessPaymentEvent')
	public async processEvent(
		data: ProcessPaymentEventRequest
	): Promise<ProcessPaymentEventResponse> {
		return await this.paymentService.processEvent(data)
	}

	@GrpcMethod('PaymentService', 'GetUserPaymentMethod')
	public async getUserPaymentMethod(data: GetUserPaymentMethodRequest) {
		return await this.paymentService.getUserPaymentMethods(data)
	}

	@GrpcMethod('PaymentService', 'VerifyPaymentMethod')
	public async verifyPaymentMethod(data: VerifyPaymentMethodRequest) {
		return await this.paymentService.verifyPaymentMethod(data)
	}

	@GrpcMethod('PaymentService', 'DeletePaymentMethod')
	public async deletePaymentMethod(data: DeletePaymentMethodRequest) {
		return await this.paymentService.deletePaymentMethod(data)
	}
}
