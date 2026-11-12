import {
	Catch,
	HttpException,
	HttpStatus,
	type ArgumentsHost,
	type ExceptionFilter
} from '@nestjs/common'
import { GRPC_TO_HTTP_STATUS } from '../utils/grpc-to-http.status.js'
import type { Response } from 'express'

@Catch()
export class GrpcExceptionFilter implements ExceptionFilter {
	public catch(exception: any, host: ArgumentsHost) {
		const ctx = host.switchToHttp()
		const response = ctx.getResponse<Response>()

		console.error('❌ Exception:', exception)

		if (this.isGrpcError(exception)) {
			const httpStatus = GRPC_TO_HTTP_STATUS[exception.code] || 500
			return response.status(httpStatus).json({
				statusCode: httpStatus,
				message:
					exception.details ||
					exception.message ||
					'Internal server error'
			})
		}

		if (exception instanceof HttpException) {
			const status = exception.getStatus()

			return response.status(status).json({
				statusCode: status,
				message: exception.message || 'Internal server error'
			})
		}

		return response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
			statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
			message: 'Internal server error'
		})
	}

	private isGrpcError(exception: any): boolean {
		return (
			exception &&
			typeof exception.code === 'object' &&
			'code' in exception &&
			'details' in exception
		)
	}
}
