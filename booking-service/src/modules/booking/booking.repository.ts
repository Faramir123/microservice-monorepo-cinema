import { Injectable } from '@nestjs/common'
import { nanoid } from 'nanoid'

import { DatabaseService } from '../../infrastructure/database/database.service'
import { ORDER_COMMANDS } from '../../infrastructure/sql/order/commands/order.commands'
import { TICKET_COMMANDS } from '../../infrastructure/sql/order/commands/ticket.commands'
import { ORDER_QUERIES } from '../../infrastructure/sql/order/queries/order.queries'
import { TICKET_QUERIES } from '../../infrastructure/sql/order/queries/ticket.queries'

import type {
	CreateOrder,
	CreateTicket,
	Order,
	PaidParamTicket,
	Ticket
} from './interfaces'

@Injectable()
export class BookingRepository {
	public constructor(private readonly database: DatabaseService) {}

	public async findUserPaidOrders(userId: string) {
		return await this.database.raw<Order>(
			ORDER_QUERIES.FIND_PAID_ORDERS_FOR_USER,
			[userId]
		)
	}

	public async createOrder(input: CreateOrder) {
		const rows = await this.database.raw<Order>(
			ORDER_COMMANDS.CREATE_ORDER,
			[nanoid(), input.user_id, input.amount]
		)

		return rows[0]
	}

	public async markOrderPaid(orderId: string) {
		await this.database.raw<Order>(ORDER_COMMANDS.SET_ORDER_PAID, [orderId])
	}

	public async updateOrderQr(orderId: string, qrCode: string | null) {
		await this.database.raw<Order>(ORDER_COMMANDS.SAVE_QR, [
			qrCode,
			orderId
		])
	}

	public async findOrderById(orderId: string) {
		const rows = await this.database.raw<Order>(
			ORDER_QUERIES.FIND_ORDER_BY_ID,
			[orderId]
		)

		return rows[0] ?? null
	}

	public async cancelOrder(orderId: string) {
		await this.database.raw<Order>(ORDER_COMMANDS.CANCELED_ORDER, [orderId])
	}

	public async findExistingTicket(screeningId: string, seatId: string) {
		const rows = await this.database.raw<Ticket>(
			TICKET_QUERIES.FIND_EXISTING_TICKET,
			[screeningId, seatId]
		)

		return rows[0] ?? null
	}

	public async createTicket(input: CreateTicket) {
		const rows = await this.database.raw<Ticket>(
			TICKET_COMMANDS.CREATE_TICKET,
			[
				nanoid(),
				input.screening_id,
				input.hall_id,
				input.seat_id,
				input.price,
				input.order_id
			]
		)

		return rows[0]
	}

	public async markTicketsPaid(input: PaidParamTicket) {
		await this.database.raw(TICKET_COMMANDS.MARK_TICKET_PAID, [
			input.paid_at,
			input.order_id
		])
	}

	public async deleteTicketsByOrderId(orderId: string) {
		await this.database.raw(TICKET_COMMANDS.DELETE_TICKETS_FOR_ORDER, [
			orderId
		])
	}

	public async findReservedSeatIds(hallId: string, screeningId: string) {
		return this.database.raw<{ seat_id: string }>(
			TICKET_QUERIES.LIST_RESERVED_SEATS,
			[hallId, screeningId]
		)
	}
}
