import 'dotenv/config'
import { drizzle } from 'drizzle-orm/node-postgres'
import { Client } from 'pg'

import { categories } from '../schema/categories.schema.js'

// Укажите верный путь

async function seedCategories() {
	console.log('🌱 Наполнение таблицы категорий...')

	const client = new Client({
		host: process.env.DATABASE_HOST || '127.0.0.1',
		port: Number(process.env.DATABASE_PORT) || 5433,
		user: process.env.DATABASE_USERNAME,
		password: process.env.DATABASE_PASSWORD,
		database: process.env.DATABASE_NAME
	})

	await client.connect()
	const db = drizzle(client)

	try {
		// ВНИМАНИЕ: Из-за onDelete: 'cascade' в схеме movies,
		// удаление категорий удалит и все связанные с ними фильмы!
		console.log('🧹 Очистка таблицы категорий (и связанных фильмов)...')
		await db.delete(categories)

		console.log('📁 Добавление категорий...')
		await db
			.insert(categories)
			.values([
				{ title: 'Боевик', slug: 'action' },
				{ title: 'Фантастика', slug: 'sci-fi' },
				{ title: 'Комедия', slug: 'comedy' },
				{ title: 'Драма', slug: 'drama' }
			])
			.onConflictDoNothing()

		console.log('✅ Категории успешно добавлены!')
	} catch (error) {
		console.error('❌ Ошибка при добавлении категорий:', error)
	} finally {
		await client.end()
	}
}

seedCategories().catch(err => {
	console.error('Критическая ошибка:', err)
	process.exit(1)
})
