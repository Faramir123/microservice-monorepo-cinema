export const ORDER_QUERIES = {
	FIND_PAID_ORDERS_FOR_USER: `
    SELECT o.*, COALESCE(json_agg(t.*) FILTER (WHERE t.id IS NOT NULL), '[]') AS tickets
    FROM orders o
    LEFT JOIN tickets t ON t.order_id = o.id
    WHERE o.user_id = $1 AND o.status = 'PAID'
    GROUP BY o.id
    ORDER BY o.created_at DESC`,

	FIND_ORDER_BY_ID: `
    SELECT id, user_id, status
    FROM orders
    WHERE id = $1`
} as const
