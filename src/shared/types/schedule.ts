import type { Order, Reservation, Table } from '@/shared/types/entities'

interface RawEvent {
	id: string
	type: 'order' | 'reservation'
	order?: Order
	reservation?: Reservation
	startDate: string
	endDate: string
	startMinutes: number
	endMinutes: number
}

interface PositionedEventView {
	positioned: PositionedEvent
	raw: RawEvent
}

interface ScheduleColumn {
	table: Table
	positionedEvents: PositionedEventView[]
}

interface FilterDateLabel {
	date: string
	dayMonth: string
	subLine: string
}

interface TimeSlot {
	label: string
	topPx: number
}

interface RestaurantTime {
	date: string
	minutes: number
	label: string
}

interface CalendarEvent {
	id: string
	type: 'order' | 'reservation'
	startMinutes: number
	endMinutes: number
	startDate: string
	endDate: string
}

interface PositionedEvent extends CalendarEvent {
	topPercent: number
	heightPercent: number
	groupIndex: number
	laneEventIndex: number
	leftPercent: number
	widthPercent: number
	offsetPx: number
	zIndex: number
}

export type { 
	RawEvent, 
	PositionedEventView, 
	ScheduleColumn, 
	FilterDateLabel, 
	TimeSlot, 
	RestaurantTime, 
	CalendarEvent, 
	PositionedEvent 
}