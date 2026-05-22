import { MONTH_NAMES, WEEKDAY_NAMES } from '@/constants/dates'

function getDayLabel(dateStr: string, availableDays: string[], currentDay: string): { dayMonth: string; subLine: string } {
	const [year, month, day] = dateStr.split('-').map(Number)
	const date = new Date(year, month - 1, day)
	const dayMonth = `${day} ${MONTH_NAMES[month - 1]}`

	const currentIndex = availableDays.indexOf(currentDay)
	const dateIndex = availableDays.indexOf(dateStr)

	if (dateIndex === currentIndex) {
		return { dayMonth, subLine: 'сегодня' }
	}

	if (dateIndex === currentIndex + 1) {
		return { dayMonth, subLine: 'завтра' }
	}

	return { dayMonth, subLine: WEEKDAY_NAMES[date.getDay()] }
}

export { getDayLabel }