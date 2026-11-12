import { Injectable } from '@nestjs/common'

@Injectable()
export class AppService {
	public getHello() {
		return { message: 'Welcome to Faramir Cinema API' }
	}
	public health() {
		return { status: 'ok', timestamp: new Date().toISOString() }
	}
}
