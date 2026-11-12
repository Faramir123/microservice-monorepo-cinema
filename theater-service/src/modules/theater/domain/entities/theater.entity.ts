export class TheaterEntity {
	public constructor(
		public readonly id: string,
		public readonly name: string,
		public readonly address: string,
		public readonly createdAd: Date,
		public readonly updatedAt: Date
	) {}
}
