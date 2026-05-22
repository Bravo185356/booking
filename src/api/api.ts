import type { BookingResponse } from '@/shared/types/entities'

export const BOOKING_API_URL = import.meta.env.VITE_API_URL

export class BookingFetchError extends Error {
	readonly status?: number

	constructor(message: string, status?: number) {
		super(message)
		this.name = 'BookingFetchError'
		this.status = status
	}
}

export async function fetchBookingData(): Promise<BookingResponse> {
	if (!BOOKING_API_URL) {
		throw new BookingFetchError('VITE_API_URL не задан в переменных окружения')
	}

	let response: Response

	try {
		response = await fetch(BOOKING_API_URL)
	} catch {
		throw new BookingFetchError('Не удалось подключиться к серверу')
	}

	if (!response.ok) {
		throw new BookingFetchError(`Ошибка сервера: ${response.status}`, response.status)
	}

	const data = await response.json()
	return data as BookingResponse
}
