import type { Table } from '@/shared/types/entities'
import type { RawEvent } from '@/shared/types/schedule'
import { isoToDateString, isoToMinutes } from '@/utils/time'

function collectTableEvents(table: Table, selectedDate: string): RawEvent[] {
	const events: RawEvent[] = []

	for (const order of table.orders) {
		if (isoToDateString(order.start_time) !== selectedDate) {
			continue
		}

		events.push({
			id: `order-${order.id}`,
			type: 'order',
			order,
			startDate: order.start_time,
			endDate: order.end_time,
			startMinutes: isoToMinutes(order.start_time),
			endMinutes: isoToMinutes(order.end_time),
		})
	}

	for (const reservation of table.reservations) {
		if (isoToDateString(reservation.seating_time) !== selectedDate) {
			continue
		}

		events.push({
			id: `res-${reservation.id}`,
			type: 'reservation',
			reservation,
			startDate: reservation.seating_time,
			endDate: reservation.end_time,
			startMinutes: isoToMinutes(reservation.seating_time),
			endMinutes: isoToMinutes(reservation.end_time),
		})
	}

	return events
}

export { collectTableEvents }