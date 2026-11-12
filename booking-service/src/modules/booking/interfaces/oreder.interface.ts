import { OrderStatus } from '../enums'

import type { Ticket } from './ticket.interface'

export interface Order {
	id: string
	amount: number
	currency: string
	status: OrderStatus
	qr_code: string | null
	user_id: string
	tickets: Ticket[]

	created_at: Date
	updated_at: Date
}

export interface CreateOrder extends Pick<Order, 'user_id' | 'amount'> {}
