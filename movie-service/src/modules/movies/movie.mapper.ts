export class MovieMapper {
	public static toMovie(entity: any) {
		const ms = entity.releaseDate.getTime()

		if (!entity.releaseDate) return entity
		return {
			...entity,
			releaseDate: entity.releaseDate
				? {
						seconds: Math.floor(
							entity.releaseDate.getTime() / 1000
						),
						nanos: 0
					}
				: undefined
		}
	}
}
