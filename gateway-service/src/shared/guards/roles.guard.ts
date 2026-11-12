import {
	ForbiddenException,
	Injectable,
	NotFoundException,
	type CanActivate,
	type ExecutionContext
} from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { AccountClientGrpc } from '../../modules/account/account.grpc.js'
import { ROLES_KEY } from '../decorators/roles.decorators.js'

export enum Role {
	USER = 0,
	ADMIN = 1,
	UNRECOGNIZED = -1
}

@Injectable()
export class RolesGuard implements CanActivate {
	public constructor(
		private readonly reflector: Reflector,
		private readonly accountClient: AccountClientGrpc
	) {}

	public async canActivate(context: ExecutionContext): Promise<boolean> {
		const required = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
			context.getHandler(),
			context.getClass()
		])

		if (!required || required.length === 0) return true

		const request = context.switchToHttp().getRequest()

		const user = request.user

		if (!user) throw new ForbiddenException('User context missing')

		const account = await this.accountClient.call('getAccount', {
			id: user.id
		})

		if (!account) throw new NotFoundException('Account not found')

		if (!required.includes(account.role))
			throw new ForbiddenException(
				' "Ypu do not have permissions to access this resource'
			)

		return true
	}
}
