import { Injectable } from '@nestjs/common'
import type {
	Account,
	PendingContractChange
} from '@prisma/generated/client.js'

import { PrismaService } from './../../infrastructure/prisma/prisma.service.js'

@Injectable()
export class AccountRepository {
	public constructor(private readonly prismaService: PrismaService) {}

	public findById(id: string): Promise<Account | null> {
		return this.prismaService.account.findUnique({
			where: { id }
		})
	}

	public findPendingChange(
		accountId: string,
		type: 'email' | 'phone'
	): Promise<PendingContractChange | null> {
		return this.prismaService.pendingContractChange.findUnique({
			where: {
				accountId_type: { accountId, type }
			}
		})
	}

	public upsertPendingChange(data: {
		accountId: string
		type: 'email' | 'phone'
		value: string
		codeHash: string
		expiresAt: Date
	}): Promise<PendingContractChange | null> {
		const { accountId, type, value, codeHash, expiresAt } = data
		return this.prismaService.pendingContractChange.upsert({
			where: {
				accountId_type: {
					accountId: accountId,
					type: type
				}
			},
			create: {
				accountId,
				type,
				value,
				codeHash,
				expiresAt
			},
			update: {
				value,
				codeHash,
				expiresAt
			}
		})
	}

	public deletePendingChange(
		accountId: string,
		type: 'email' | 'phone'
	): Promise<PendingContractChange | null> {
		return this.prismaService.pendingContractChange.delete({
			where: { accountId_type: { accountId, type } }
		})
	}
}
