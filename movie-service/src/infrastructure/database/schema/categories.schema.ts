import { pgTable, varchar } from 'drizzle-orm/pg-core'

import { baseColumns } from './common.schema.js'

export const categories = pgTable('categories', {
	...baseColumns,
	title: varchar('title', { length: 255 }).notNull(),
	slug: varchar('slug', { length: 255 }).unique()
})
