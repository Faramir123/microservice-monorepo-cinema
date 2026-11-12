import { Injectable } from '@nestjs/common'
import type { Account } from '@prisma/generated/client'

import { PrismaService } from '../../infrastructure/prisma/prisma.service.js'

@Injectable()
export class TelegramRepository {
	public constructor(private readonly prismaService: PrismaService) {}

	public async findByTelegramId(telegramId: string): Promise<Account | null> {
		return await this.prismaService.account.findUnique({
			where: { telegramId }
		})
	}

	public async update(
		id: string,
		data: { firstName: string; lastName: string }
	): Promise<Account | null> {
		return await this.prismaService.account.update({
			where: { id },
			data
		})
	}
}
