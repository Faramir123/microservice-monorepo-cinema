import { applyDecorators, UseGuards } from '@nestjs/common'

import { AuthGuard } from '../guards/auth.guard.js'
import { type Role, RolesGuard } from '../guards/roles.guard.js'

import { Roles } from './roles.decorators.js'

export const Protected = (...roles: Role[]) => {
	if (roles.length === 0) return applyDecorators(UseGuards(AuthGuard))

	return applyDecorators(Roles(...roles), UseGuards(AuthGuard, RolesGuard))
}
