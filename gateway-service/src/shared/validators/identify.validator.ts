import {
	ValidatorConstraint,
	type ValidationArguments,
	type ValidatorConstraintInterface
} from 'class-validator'
import { SendOtpRequest } from '../../modules/auth/dto/requests/send-otp.request.js'

@ValidatorConstraint({ name: 'IdentifierValidator', async: false })
export class IdentifierValidator implements ValidatorConstraintInterface {
	public validate(value: string, args: ValidationArguments): boolean {
		const object = args?.object as SendOtpRequest

		if (object.type === 'email') {
			return (
				typeof value === 'string' &&
				/^[^\s@]+@[^\s@]+\.[^\s@]+$/!.test(value)
			)
		} else if (object.type === 'phone') {
			return (
				typeof value === 'string' &&
				/^(\+7|8)[\s\-]?\(?\d{3}\)?[\s\-]?\d{3}[\s\-]?\d{2}[\s\-]?\d{2}$/.test(
					value
				)
			)
		}
		return false
	}

	public defaultMessage(args: ValidationArguments): string {
		const object = args?.object as SendOtpRequest

		if (object.type === 'email') return 'identifier must be a valid email'
		if (object.type === 'phone')
			return 'identifier must be a valid phone number'

		return 'Invalid identifier'
	}
}
