import type { CalendarEvent, PositionedEvent } from '@/shared/types/schedule'

const INTERSECTION_MINUTES = 30
const OVERLAP_OFFSET_PX = 4

function compareByStartTime(first: CalendarEvent, second: CalendarEvent): number {
	if (first.startMinutes !== second.startMinutes) {
		return first.startMinutes - second.startMinutes
	}

	return first.id.localeCompare(second.id)
}

function compareByStartAndLaneEventIndex(first: PositionedEvent, second: PositionedEvent): number {
	return first.startMinutes - second.startMinutes || first.laneEventIndex - second.laneEventIndex
}

function areStartTimesClose(first: CalendarEvent, second: CalendarEvent): boolean {
	return Math.abs(first.startMinutes - second.startMinutes) <= INTERSECTION_MINUTES
}

function groupEventsForLaneLayout(events: CalendarEvent[]): CalendarEvent[][] {
	if (events.length === 0) {
		return []
	}

	const parent = events.map((_, index) => index)

	// Находит корневой индекс группы в union-find структуре.
	function findRoot(index: number): number {
		if (parent[index] !== index) {
			parent[index] = findRoot(parent[index])
		}

		return parent[index]
	}

	function mergeGroups(leftIndex: number, rightIndex: number): void {
		const leftRoot = findRoot(leftIndex)
		const rightRoot = findRoot(rightIndex)

		if (leftRoot !== rightRoot) {
			parent[leftRoot] = rightRoot
		}
	}

	for (let leftIndex = 0; leftIndex < events.length; leftIndex++) {
		for (let rightIndex = leftIndex + 1; rightIndex < events.length; rightIndex++) {
			if (areStartTimesClose(events[leftIndex], events[rightIndex])) {
				mergeGroups(leftIndex, rightIndex)
			}
		}
	}

	const groupsByRoot = new Map<number, CalendarEvent[]>()

	for (let index = 0; index < events.length; index++) {
		const root = findRoot(index)
		const group = groupsByRoot.get(root) ?? []

		group.push(events[index])
		groupsByRoot.set(root, group)
	}

	return Array.from(groupsByRoot.values())
}

function canPlaceEventInLane(lane: CalendarEvent[], event: CalendarEvent): boolean {
	const lastEvent = lane[lane.length - 1]

	return lastEvent.endMinutes <= event.startMinutes
}

function mapEventsToLaneEventIndex(group: CalendarEvent[]): Map<string, number> {
	const sortedEvents = [...group].sort(compareByStartTime)
	const laneColumns: CalendarEvent[][] = []
	const laneByEventId = new Map<string, number>()

	for (const event of sortedEvents) {
		const availableLaneEventIndex  = laneColumns.findIndex((laneColumn) => canPlaceEventInLane(laneColumn, event))

		if (availableLaneEventIndex >= 0) {
			laneColumns[availableLaneEventIndex].push(event)
			laneByEventId.set(event.id, availableLaneEventIndex)
			continue
		}

		laneByEventId.set(event.id, laneColumns.length)
		laneColumns.push([event])
	}

	return laneByEventId
}

function setEventZIndexes(events: PositionedEvent[]): void {
	const sortedEvents = [...events].sort(compareByStartTime)

	for (const [index, event] of sortedEvents.entries()) {
		event.zIndex = index + 1
	}
}

function positionLaneEvents(
	events: CalendarEvent[],
	groupIndex: number,
	openMinutes: number,
	totalMinutes: number,
): PositionedEvent[] {
	const laneByEventId = mapEventsToLaneEventIndex(events)
	const laneCount = Math.max(...laneByEventId.values()) + 1
	const widthPercent = 100 / laneCount

	return events.map((event) => {
		const laneEventIndex = laneByEventId.get(event.id) ?? 0

		return {
			...event,
			groupIndex,
			topPercent: ((event.startMinutes - openMinutes) / totalMinutes) * 100,
			heightPercent: ((event.endMinutes - event.startMinutes) / totalMinutes) * 100,
			laneEventIndex,
			leftPercent: laneEventIndex * widthPercent,
			widthPercent,
			offsetPx: 0,
			zIndex: 1,
		}
	})
}

function isInSameOverlapRow(event: PositionedEvent, row: PositionedEvent[]): boolean {
	const rowStart = Math.min(...row.map((rowEvent) => rowEvent.startMinutes))

	return event.startMinutes - rowStart <= INTERSECTION_MINUTES
}

function eventsIntoRowsForOverlap(events: PositionedEvent[]): PositionedEvent[][] {
	const sortedEvents = [...events].sort(compareByStartAndLaneEventIndex)
	const rows: PositionedEvent[][] = []

	for (const event of sortedEvents) {
		const currentRow = rows.at(-1)

		if (!currentRow || !isInSameOverlapRow(event, currentRow)) {
			rows.push([event])
			continue
		}

		currentRow.push(event)
	}

	return rows
}

function isStillRunningAtStart(other: PositionedEvent, event: PositionedEvent): boolean {
	return other.startMinutes < event.startMinutes && other.endMinutes > event.startMinutes
}

function isOffsetForOverlap(other: PositionedEvent, event: PositionedEvent): boolean {
	const sameColumn = other.leftPercent === event.leftPercent
	const leftNeighborStillRunning =
		event.groupIndex === other.groupIndex
		&& event.laneEventIndex > 0
		&& other.laneEventIndex === event.laneEventIndex - 1

	return sameColumn || leftNeighborStillRunning
}

function calculateOverlapOffset(event: PositionedEvent, allEvents: PositionedEvent[]): number {
	let offset = 0

	for (const other of allEvents) {
		if (other.id === event.id) {
			continue
		}

		if (!isStillRunningAtStart(other, event)) {
			continue
		}

		if (isOffsetForOverlap(other, event)) {
			offset += OVERLAP_OFFSET_PX
		}
	}

	return offset
}

function keepOffsetOnlyOnLeftInRow(row: PositionedEvent[]): void {
	if (row.length <= 1) {
		return
	}

	const leftLaneEventIndex = Math.min(...row.map((event) => event.laneEventIndex))

	for (const event of row) {
		if (event.laneEventIndex !== leftLaneEventIndex) {
			event.offsetPx = 0
		}
	}
}

function applyOverlapOffsets(events: PositionedEvent[]): void {
	for (const event of events) {
		event.offsetPx = calculateOverlapOffset(event, events)
	}

	for (const row of eventsIntoRowsForOverlap(events)) {
		keepOffsetOnlyOnLeftInRow(row)
	}
}

function layoutColumnEvents(events: CalendarEvent[], openMin: number, closeMin: number): PositionedEvent[] {
	if (events.length === 0) {
		return []
	}

	const totalMinutes = closeMin - openMin
	const intersectionGroups = groupEventsForLaneLayout(events)

	const positionedEvents = intersectionGroups.flatMap((intersectionGroup, groupIndex) =>
		positionLaneEvents(intersectionGroup, groupIndex, openMin, totalMinutes),
	)

	setEventZIndexes(positionedEvents)
	applyOverlapOffsets(positionedEvents)

	return positionedEvents.sort(compareByStartTime)
}

export { layoutColumnEvents }
