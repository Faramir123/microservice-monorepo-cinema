import {
	Body,
	Controller,
	Delete,
	Get,
	HttpCode,
	HttpStatus,
	Param,
	Post,
	Query
} from '@nestjs/common'

import { ApiBearerAuth } from '@nestjs/swagger'
import { InitPaymentRequest } from './dto/index.js'
import { Protected } from '../../shared/decorators/protected.decorators.js'
import { CurrentUser } from '../../shared/decorators/current-user.decorator.js'
import { PaymentClientGrpc } from './payment.grpc.js'

@Controller('payment')
export class PaymentController {
	public constructor(private readonly payment: PaymentClientGrpc) {}

	@ApiBearerAuth()
	@Protected()
	@Post('payment/init')
	@HttpCode(HttpStatus.OK)
	public async initPayment(
		@Body() dto: InitPaymentRequest,
		@CurrentUser() userId: string
	) {
		return await this.payment.call('createPayment', { ...dto, userId })
	}

	@ApiBearerAuth()
	@Protected()
	@Get('methods')
	@HttpCode(HttpStatus.OK)
	public async getPaymentMethods(@CurrentUser('id') userId: string) {
		const response = await this.payment.call('getUserPaymentMethod', {
			userId
		})

		return Array.isArray(response.methods) ? response.methods : []
	}

	@ApiBearerAuth()
	@Protected()
	@Post('methods')
	@HttpCode(HttpStatus.OK)
	public async createPaymentMethod(@CurrentUser('id') userId: string) {
		return await this.payment.call('createPaymentMethod', { userId })
	}

	@ApiBearerAuth()
	@Protected()
	@Post('methods/verify')
	@HttpCode(HttpStatus.OK)
	public async verifyPaymentMethod(
		@CurrentUser('id') userId: string,
		@Query('payment_method_id') methodId: string
	) {
		return await this.payment.call('verifyPaymentMethod', {
			methodId,
			userId
		})
	}

	@ApiBearerAuth()
	@Protected()
	@Delete('methods/:id')
	@HttpCode(HttpStatus.OK)
	public async deletePaymentMethod(
		@CurrentUser() userId: string,
		@Param('id') methodId: string
	) {
		return await this.payment.call('deletePaymentMethod', {
			methodId,
			userId
		})
	}
}
