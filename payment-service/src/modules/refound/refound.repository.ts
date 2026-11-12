import { Injectable } from '@nestjs/common'

import { PaymentStatus, RefoundStatus } from '../../../prisma/generated/enums'
import type {
	RefoundCreateInput,
	RefoundUpdateInput
} from '../../../prisma/generated/models'
import { PrismaService } from '../../infrastructure/prisma/prisma.service'

@Injectable()
export class RefoundRepository {
	public constructor(private readonly prismaService: PrismaService) {}

	public findRefoundByProviderId(providerId: string) {
		return this.prismaService.refound.findFirst({
			where: { providerId },
			include: { payment: true }
		})
	}

	public findPaymentByBookingId(bookingId: string) {
		return this.prismaService.payment.findFirst({ where: { bookingId } })
	}

	public createRefound(data: RefoundCreateInput) {
		return this.prismaService.refound.create({ data })
	}

	public updateRefound(id: string, data: RefoundUpdateInput) {
		return this.prismaService.refound.update({ where: { id }, data })
	}

	public markRefoundSuccess(id: string) {
		return this.prismaService.refound.update({
			where: { id },
			data: { status: RefoundStatus.SUCCESS }
		})
	}

	public markPaymentRefound(id: string) {
		return this.prismaService.payment.update({
			where: { id },
			data: { status: PaymentStatus.REFUNDED }
		})
	}
}
