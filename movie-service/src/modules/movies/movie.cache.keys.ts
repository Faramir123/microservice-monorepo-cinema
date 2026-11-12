import type { FiltersParam } from './interfaces/filter-params.interface.js'

export const MoviECacheKeys = {
	all: (params: FiltersParam) =>
		[
			'movies',
			'list',
			params.category ?? 'all',
			params.random ? 'random' : 'oedered',
			params.limit ?? 'nolimit'
		].join(':'),

	bySlug: (slug: string) => `movies:slug:${slug}`,
	byId: (id: string) => `movies:id:${id}`
}
