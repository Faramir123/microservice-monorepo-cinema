import { PROTO_PATHS } from '@faramircinema/contracts'
import { Module } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { ClientsModule, Transport } from '@nestjs/microservices'
import { YookassaModule } from 'nestjs-yookassa'

import { BookingClientGrpc } from '../../clients/booking.client'
import { BookingModule } from '../../infrastructure/booking/booking.module'

import { PaymentController } from './payment.controller'
import { PaymentRepository } from './payment.repository'
import { PaymentsService } from './payment.service'

@Module({
	imports: [YookassaModule, BookingModule],
	controllers: [PaymentController],
	providers: [PaymentsService, PaymentRepository]
})
export class PaymentModule {}
