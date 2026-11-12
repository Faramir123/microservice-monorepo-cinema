import { PROTO_PATHS } from '@faramircinema/contracts/dist/src/index'
import { type AuthServiceClient } from '@faramircinema/contracts/gen/ts/auth'
import { credentials, loadPackageDefinition } from '@grpc/grpc-js'
import { loadSync } from '@grpc/proto-loader'

import { CONFIG } from '@/config'

const packageDef = loadSync(PROTO_PATHS.AUTH, {
	keepCase: false,
	longs: String,
	enums: String,
	defaults: true,
	oneofs: true
})

// Приводим к any, чтобы TypeScript не мешал нам обращаться к вложенным свойствам
const proto = loadPackageDefinition(packageDef) as any

// ✅ Правильный доступ: proto.auth.v1.AuthService
const AuthServiceConstructor = proto.auth.v1.AuthService

if (!AuthServiceConstructor) {
	throw new Error(
		'Не удалось найти AuthService в proto-файле. Проверьте package и service в auth.proto'
	)
}

export const authClient: AuthServiceClient = new AuthServiceConstructor(
	CONFIG.AUTH_GRPC_URL,
	credentials.createInsecure()
)
