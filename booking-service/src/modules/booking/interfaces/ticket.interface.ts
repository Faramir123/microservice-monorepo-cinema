import type { TicketStatus } from '../enums'

export interface Ticket {
	id: string
	price: number
	status: TicketStatus

	paid_at: Date | null
	screening_id: string
	hall_id: string
	seat_id: string
	order_id: string

	created_at: Date
	updated_at: Date
}

export interface CreateTicket {
	price: number
	screening_id: string
	hall_id: string
	seat_id: string
	order_id: string
}

export interface PaidParamTicket {
	order_id: string
	paid_at: Date | null
}
