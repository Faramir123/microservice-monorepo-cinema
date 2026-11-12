import { Controller, Get } from '@nestjs/common'
import { AppService } from './app.service.js'
import { ApiOkResponse, ApiOperation } from '@nestjs/swagger'
import { HeathResponse } from './dto/index.js'

@Controller()
export class AppController {
	public constructor(private readonly appService: AppService) {}

	@ApiOperation({
		summary: 'Welcome endpoint',
		description: 'Returns a simple API welcome messages'
	})
	@Get()
	public getHello() {
		return this.appService.getHello()
	}

	@ApiOperation({
		summary: 'Health check',
		description: 'Check with the Gateway running'
	})
	@ApiOkResponse({
		type: HeathResponse
	})
	@Get('health')
	public health() {
		return this.appService.health()
	}
}
