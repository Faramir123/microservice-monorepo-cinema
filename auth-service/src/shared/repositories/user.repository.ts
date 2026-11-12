import { Injectable } from '@nestjs/common'
import type { Account } from '@prisma/generated/client'
import type {
	AccountCreateInput,
	AccountUpdateInput
} from '@prisma/generated/models'

import { PrismaService } from '../../infrastructure/prisma/prisma.service.js'

@Injectable()
export class UserRepository {
	public constructor(private readonly prismaService: PrismaService) {}

	public async findByPhone(phone: string): Promise<Account | null> {
		return await this.prismaService.account.findUnique({ where: { phone } })
	}

	public async findByEmail(email: string): Promise<Account | null> {
		return await this.prismaService.account.findUnique({ where: { email } })
	}

	public async update(
		id: string,
		data: AccountUpdateInput
	): Promise<Account> {
		return await this.prismaService.account.update({
			where: { id },
			data
		})
	}

	public async createAccount(data: AccountCreateInput): Promise<Account> {
		return await this.prismaService.account.create({ data })
	}
}
