import { Module } from '@nestjs/common'

import { BookingModule } from '../../infrastructure/booking/booking.module'

import { RefoundController } from './refound.controller'
import { RefoundRepository } from './refound.repository'
import { RefoundService } from './refound.service'

@Module({
	imports: [BookingModule],
	controllers: [RefoundController],
	providers: [RefoundService, RefoundRepository]
})
export class RefoundModule {}
