function parseTimeToMinutes(time: string): number {
	const [hours, minutes] = time.split(':').map(Number)
	return hours * 60 + minutes
}

function minutesToTimeString(minutes: number): string {
	const h = Math.floor(minutes / 60)
	const m = minutes % 60
	return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

function isoToMinutes(iso: string): number {
	const match = iso.match(/T(\d{2}):(\d{2})/)

	if (!match) {
		return 0
	}

	return parseInt(match[1], 10) * 60 + parseInt(match[2], 10)
}

function isoToDateString(date: string): string {
	const match = date.match(/^(\d{4}-\d{2}-\d{2})/)

	if (!match) {
		return ''
	}

	return match[1]
}

function formatTimeRange(startDate: string, endDate: string): string {
	const start = isoToMinutes(startDate)
	const end = isoToMinutes(endDate)
	return `${minutesToTimeString(start)}-${minutesToTimeString(end)}`
}

function getRestaurantTime(timezone: string): {
	date: string
	minutes: number
	label: string
} {
	const now = new Date()
	const dateFormatter = new Intl.DateTimeFormat('en-CA', {
		timeZone: timezone,
		year: 'numeric',
		month: '2-digit',
		day: '2-digit',
	})
	const timeFormatter = new Intl.DateTimeFormat('ru-RU', {
		timeZone: timezone,
		hour: '2-digit',
		minute: '2-digit',
		hour12: false,
	})

	const date = dateFormatter.format(now)
	const timeParts = timeFormatter.formatToParts(now)
	const hour = parseInt(timeParts.find((p) => p.type === 'hour')?.value ?? '0', 10)
	const minute = parseInt(timeParts.find((p) => p.type === 'minute')?.value ?? '0', 10)

	return {
		date,
		minutes: hour * 60 + minute,
		label: `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`,
	}
}

function formatPhoneShort(phone: string): string {
	const digits = phone.replace(/\D/g, '')
	return digits.slice(-4)
}

export {
	parseTimeToMinutes,
	minutesToTimeString,
	isoToMinutes,
	isoToDateString,
	formatTimeRange,
	getRestaurantTime,
	formatPhoneShort,
}