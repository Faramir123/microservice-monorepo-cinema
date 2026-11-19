import { Injectable } from '@nestjs/common'
import type {
	Account,
	PendingContractChange
} from '@prisma/generated/client.js'

import { PrismaService } from './../../infrastructure/prisma/prisma.service.js'

/** Результат применения pending-изменения. */
export type ApplyPendingChangeResult =
	{ status: 'applied' } | { status: 'pending_missing' }

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
	}): Promise<PendingContractChange> {
		const { accountId, type, value, codeHash, expiresAt } = data
		return this.prismaService.pendingContractChange.upsert({
			where: {
				accountId_type: { accountId, type }
			},
			create: { accountId, type, value, codeHash, expiresAt },
			update: { value, codeHash, expiresAt }
		})
	}

	public async applyPendingChangeAndDelete(
		params:
			| {
					accountId: string
					type: 'email'
					expectedValue: string
					userUpdate: { email: string; isEmailVerified: true }
			  }
			| {
					accountId: string
					type: 'phone'
					expectedValue: string
					userUpdate: { phone: string; isPhoneVerified: true }
			  }
	): Promise<ApplyPendingChangeResult> {
		return this.prismaService.$transaction(async tx => {
			const { count } = await tx.pendingContractChange.deleteMany({
				where: {
					accountId: params.accountId,
					type: params.type,
					value: params.expectedValue
				}
			})

			if (count === 0) {
				// Pending уже удалён или заменён другим init*Change.
				// Account не трогаем — транзакция коммитится пустой.
				return { status: 'pending_missing' }
			}

			// P2025 — если аккаунт исчез; P2002 — если email/phone заняли в гонке.
			await tx.account.update({
				where: { id: params.accountId },
				data: params.userUpdate
			})

			return { status: 'applied' }
		})
	}
}
