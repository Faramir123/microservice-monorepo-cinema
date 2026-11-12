import 'dotenv/config'
import { drizzle } from 'drizzle-orm/node-postgres'
import { Client } from 'pg'

import { categories } from '../schema/categories.schema.js'
import { movies } from '../schema/movies.schema.js'

async function seedMovies() {
	console.log('🌱 Наполнение таблицы фильмов...')

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
		// 1. Получаем существующие категории
		const existingCategories = await db.select().from(categories)

		if (existingCategories.length === 0) {
			throw new Error(
				'База данных пуста. Сначала запустите seed-categories.ts!'
			)
		}

		// Создаем удобный словарь для быстрого поиска ID по slug
		const categoryMap = existingCategories.reduce(
			(acc, cat) => {
				if (cat.slug) acc[cat.slug] = cat.id
				return acc
			},
			{} as Record<string, string>
		)

		// 2. Очищаем таблицу фильмов
		console.log('🧹 Очистка таблицы фильмов...')
		await db.delete(movies)

		// 3. Добавляем фильмы
		console.log('🎬 Добавление фильмов...')
		await db
			.insert(movies)
			.values([
				// ================= ФАНТАСТИКА (SCI-FI) =================
				{
					title: 'Интерстеллар',
					slug: 'interstellar',
					description:
						'Группа исследователей отправляется в космос, чтобы найти новый дом для человечества.',
					poster: '/posters/interstellar.jpg',
					banner: '/banners/interstellar.jpg',
					duration: 169,
					releaseYear: 2014,
					ratingAge: 12,
					country: 'США, Великобритания',
					categoryId: categoryMap['sci-fi']
				},
				{
					title: 'Оппенгеймер',
					slug: 'oppenheimer',
					description:
						'История американского физика Роберта Оппенгеймера, который руководил разработкой атомной бомбы.',
					poster: '/posters/oppenheimer.jpg',
					banner: '/banners/oppenheimer.jpg',
					duration: 180,
					releaseYear: 2023,
					ratingAge: 18,
					country: 'США, Великобритания',
					categoryId: categoryMap['sci-fi']
				},
				{
					title: 'Человек-паук: Через вселенные',
					slug: 'spiderverse',
					description:
						'Майлз Моралес объединяется с другими Людьми-пауками из параллельных вселенных, чтобы спасти мультивселенную.',
					poster: '/posters/spiderverse.jpg',
					banner: '/banners/spiderverse.jpg',
					duration: 117,
					releaseYear: 2018,
					ratingAge: 6,
					country: 'США',
					categoryId: categoryMap['sci-fi']
				},
				{
					title: 'Шоу Трумана',
					slug: 'truman-show',
					description:
						'Страховой агент обнаруживает, что вся его жизнь — это реалити-шоу, а окружающие его люди — актеры.',
					poster: '/posters/truman-show.jpg',
					banner: '/banners/truman-show.jpg',
					duration: 103,
					releaseYear: 1998,
					ratingAge: 12,
					country: 'США',
					categoryId: categoryMap['sci-fi']
				},

				// ================= БОЕВИК (ACTION) =================
				{
					title: 'Топ Ган: Мэверик',
					slug: 'top-gun-maverick',
					description:
						'Пит "Мэверик" Митчелл обучает выпускников элитной школы военных летчиков для выполнения опасной миссии.',
					poster: '/posters/top-gun-maverick.jpg',
					banner: '/banners/top-gun-maverick.jpg',
					duration: 130,
					releaseYear: 2022,
					ratingAge: 12,
					country: 'США, Китай',
					categoryId: categoryMap['action']
				},
				{
					title: 'Апокалипсис сегодня',
					slug: 'apocalypse-now',
					description:
						'Во время войны во Вьетнаме капитан отправляется в джунгли, чтобы найти и убить безумного полковника.',
					poster: '/posters/apocalypse-now.jpg',
					banner: '/banners/apocalypse-now.jpg',
					duration: 147,
					releaseYear: 1979,
					ratingAge: 18,
					country: 'США',
					categoryId: categoryMap['action']
				},
				{
					title: 'Гонка',
					slug: 'rush',
					description:
						'История соперничества двух великих гонщиков Формулы-1 — Джеймса Ханта и Ники Лауды.',
					poster: '/posters/rush.jpg',
					banner: '/banners/rush.jpg',
					duration: 123,
					releaseYear: 2013,
					ratingAge: 16,
					country: 'Великобритания, США',
					categoryId: categoryMap['action']
				},
				{
					title: 'Форд против Феррари',
					slug: 'ford-v-ferrari',
					description:
						'Американский конструктор и британский гонщик бросают вызов доминированию Ferrari на гонках в Ле-Мане.',
					poster: '/posters/ford-v-ferrari.jpg',
					banner: '/banners/ford-v-ferrari.jpg',
					duration: 152,
					releaseYear: 2019,
					ratingAge: 16,
					country: 'США, Франция',
					categoryId: categoryMap['action']
				},
				{
					title: 'Тройной форсаж: Токийский дрифт',
					slug: 'tokyo-drift',
					description:
						'Американский подросток переезжает в Токио и погружается в мир подпольных уличных гонок и дрифта.',
					poster: '/posters/tokyo-drift.jpg',
					banner: '/banners/tokyo-drift.jpg',
					duration: 104,
					releaseYear: 2006,
					ratingAge: 16,
					country: 'США, Германия',
					categoryId: categoryMap['action']
				},
				{
					title: 'F1',
					slug: 'f1',
					description:
						'Бывший пилот возвращается в Формулу-1, чтобы наставничать молодого гонщика и бросить вызов скорости.',
					poster: '/posters/f1.jpg',
					banner: '/banners/f1.jpg',
					duration: 130,
					releaseYear: 2025,
					ratingAge: 12,
					country: 'США',
					categoryId: categoryMap['action']
				},

				// ================= КОМЕДИЯ (COMEDY) =================
				{
					title: 'Ирония судьбы, или С легким паром!',
					slug: 'irony-of-fate',
					description:
						'Москвич случайно улетает в Ленинград и попадает в квартиру, которая является точной копией его собственной.',
					poster: '/posters/irony-of-fate.jpg',
					banner: '/banners/irony-of-fate.jpg',
					duration: 184,
					releaseYear: 1975,
					ratingAge: 6,
					country: 'СССР',
					categoryId: categoryMap['comedy']
				},
				{
					title: 'Форрест Гамп',
					slug: 'forrest-gump',
					description:
						'История человека с добрым сердцем, который невольно становится свидетелем ключевых событий XX века.',
					poster: '/posters/forrest-gump.jpg',
					banner: '/banners/forrest-gump.jpg',
					duration: 142,
					releaseYear: 1994,
					ratingAge: 12,
					country: 'США',
					categoryId: categoryMap['comedy']
				},

				// ================= ДРАМА (DRAMA) =================
				{
					title: 'Крестный отец',
					slug: 'the-godfather',
					description:
						'Глава мафиозного клана пытается передать контроль над своей империей младшему сыну.',
					poster: '/posters/the-godfather.jpg',
					banner: '/banners/the-godfather.jpg',
					duration: 175,
					releaseYear: 1972,
					ratingAge: 18,
					country: 'США',
					categoryId: categoryMap['drama']
				},
				{
					title: 'Крестный отец 2',
					slug: 'the-godfather-2',
					description:
						'Майкл Корлеоне расширяет семейный бизнес, параллельно показана история молодого Вито Корлеоне.',
					poster: '/posters/the-godfather-2.jpg',
					banner: '/banners/the-godfather-2.jpg',
					duration: 202,
					releaseYear: 1974,
					ratingAge: 18,
					country: 'США',
					categoryId: categoryMap['drama']
				},
				{
					title: 'Славные парни',
					slug: 'goodfellas',
					description:
						'История Генри Хилла, который с детства мечтал стать гангстером и добился этого.',
					poster: '/posters/goodfellas.jpg',
					banner: '/banners/goodfellas.jpg',
					duration: 145,
					releaseYear: 1990,
					ratingAge: 18,
					country: 'США',
					categoryId: categoryMap['drama']
				},
				{
					title: 'Однажды в Америке',
					slug: 'once-upon-a-time-in-america',
					description:
						'История дружбы и предательства нескольких гангстеров на протяжении десятилетий в Нью-Йорке.',
					poster: '/posters/once-upon-a-time-in-america.jpg',
					banner: '/banners/once-upon-a-time-in-america.jpg',
					duration: 229,
					releaseYear: 1984,
					ratingAge: 18,
					country: 'Италия, США',
					categoryId: categoryMap['drama']
				},
				{
					title: 'Побег из Шоушенка',
					slug: 'shawshank',
					description:
						'Банкир, несправедливо осужденный за убийство, находит надежду и дружбу в тюрьме.',
					poster: '/posters/shawshank.jpg',
					banner: '/banners/shawshank.jpg',
					duration: 142,
					releaseYear: 1994,
					ratingAge: 16,
					country: 'США',
					categoryId: categoryMap['drama']
				},
				{
					title: 'Зеленая миля',
					slug: 'the-green-mile',
					description:
						'Надзиратель в тюрьме строгого режима сталкивается с заключенным, обладающим даром исцеления.',
					poster: '/posters/the-green-mile.jpg',
					banner: '/banners/the-green-mile.jpg',
					duration: 189,
					releaseYear: 1999,
					ratingAge: 16,
					country: 'США',
					categoryId: categoryMap['drama']
				},
				{
					title: 'Солнцестояние',
					slug: 'midsommar',
					description:
						'Пара отправляется в шведскую деревню на фестиваль, который оказывается жутким языческим ритуалом.',
					poster: '/posters/midsommar.jpg',
					banner: '/banners/midsommar.jpg',
					duration: 148,
					releaseYear: 2019,
					ratingAge: 18,
					country: 'США, Швеция',
					categoryId: categoryMap['drama']
				},
				{
					title: 'Самый быстрый Индиан',
					slug: 'worlds-fastest-indian',
					description:
						'История новозеландского мотогонщика Берта Монро, который всю жизнь мечтал установить рекорд скорости.',
					poster: '/posters/worlds-fastest-indian.jpg',
					banner: '/banners/worlds-fastest-indian.jpg',
					duration: 127,
					releaseYear: 2005,
					ratingAge: 12,
					country: 'Новая Зеландия, Япония',
					categoryId: categoryMap['drama']
				},
				{
					title: 'Груз 200',
					slug: 'cargo-200',
					description:
						'Мрачная история о похищении дочери партийного работника в провинциальном советском городке.',
					poster: '/posters/cargo-200.jpg',
					banner: '/banners/cargo-200.jpg',
					duration: 89,
					releaseYear: 2007,
					ratingAge: 18,
					country: 'Россия',
					categoryId: categoryMap['drama']
				}
			])
			.onConflictDoNothing()

		console.log('✅ Фильмы успешно добавлены!')
	} catch (error) {
		console.error('❌ Ошибка при добавлении фильмов:', error)
	} finally {
		await client.end()
	}
}

seedMovies().catch(err => {
	console.error('Критическая ошибка:', err)
	process.exit(1)
})
