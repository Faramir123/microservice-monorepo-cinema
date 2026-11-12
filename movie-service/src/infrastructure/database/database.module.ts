import { Global, Module } from '@nestjs/common'

import { connectionProvider } from './drizzle/connection.provider.js'
import { drizzleProvider } from './drizzle/drizzle.provider.js'

@Global()
@Module({
	providers: [connectionProvider, drizzleProvider],
	exports: [drizzleProvider]
})
export class DatabaseModule {}
