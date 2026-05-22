import type { TimeSlot } from '@/shared/types/schedule'
import { minutesToTimeString } from '@/utils/time'

function buildTimeSlots(openMin: number, closeMin: number, pxPerMinute: number): TimeSlot[] {
	const slots: TimeSlot[] = []

	for (let minutes = openMin; minutes <= closeMin; minutes += 30) {
		slots.push({
			label: minutesToTimeString(minutes),
			topPx: (minutes - openMin) * pxPerMinute,
		})
	}

	return slots
}

export { buildTimeSlots }