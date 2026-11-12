export function cellUnary<T>(method, request) {
	return new Promise<T>((resolve, reject) => {
		method(request, (err, res) => {
			if (err) reject(err)
			else resolve(res)
		})
	})
}
