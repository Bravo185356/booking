import type { BookingResponse, TableZone } from '@/shared/types/entities'
import type { FilterDateLabel, RestaurantTime, ScheduleColumn } from '@/shared/types/schedule'
import { computed, onScopeDispose, ref } from 'vue'
import { fetchBookingData } from '@/api/api'
import { PX_PER_MINUTE } from '@/constants/schedule'
import { TABLE_ZONES } from '@/constants/zones'
import { layoutColumnEvents } from '@/utils/scheduleLayout'
import { getDayLabel } from '@/utils/getDayLabel'
import { collectTableEvents } from '@/utils/scheduleEvents'
import { buildTimeSlots } from '@/utils/timeSlots'
import { getRestaurantTime, parseTimeToMinutes } from '@/utils/time'

const RESTAURANT_CLOCK_INTERVAL_MS = 30_000

export function useBookingSchedule() {
	const data = ref<BookingResponse | null>(null)
	const selectedDate = ref('')
	const selectedZones = ref<TableZone[]>([...TABLE_ZONES])
	const restaurantTime = ref<RestaurantTime | null>(null)
	const isLoading = ref(false)
	const error = ref<string | null>(null)

	let restaurantClockTimer: ReturnType<typeof setInterval> | null = null

	const openMin = computed(() =>
		parseTimeToMinutes(data.value?.restaurant.opening_time ?? ''),
	)

	const closeMin = computed(() =>
		parseTimeToMinutes(data.value?.restaurant.closing_time ?? ''),
	)

	const gridHeight = computed(() => (closeMin.value - openMin.value) * PX_PER_MINUTE)

	const timeSlots = computed(() =>
		buildTimeSlots(openMin.value, closeMin.value, PX_PER_MINUTE),
	)

	const currentTimeTop = computed(() => {
		if (selectedDate.value !== restaurantTime.value?.date) {
			return null
		}

		const now = restaurantTime.value?.minutes ?? 0

		if (now < openMin.value || now > closeMin.value) {
			return null
		}

		return (now - openMin.value) * PX_PER_MINUTE
	})

	const filteredTables = computed(() =>
		data.value?.tables.filter((table) => selectedZones.value.includes(table.zone)) ?? [],
	)

	const scheduleColumns = computed((): ScheduleColumn[] =>
		filteredTables.value.map((table) => {
			const rawEvents = collectTableEvents(table, selectedDate.value)
			const rawById = new Map(rawEvents.map((event) => [event.id, event]))
			const calendarEvents = rawEvents.map(({ id, type, startMinutes, endMinutes, startDate, endDate }) => ({
				id,
				type,
				startMinutes,
				endMinutes,
				startDate,
				endDate,
			}))
			
			const layoutEvents = layoutColumnEvents(calendarEvents, openMin.value, closeMin.value)

			return {
				table,
				positionedEvents: layoutEvents.flatMap((positioned) => {
					const raw = rawById.get(positioned.id)

					return raw ? [{ positioned, raw }] : []
				}),
			}
		}),
	)

	const filterDayLabels = computed((): FilterDateLabel[] => {
		const availableDays = data.value?.available_days ?? []
		const currentDay = data.value?.current_day ?? ''

		return availableDays.map((date) => ({
			date,
			...getDayLabel(date, availableDays, currentDay),
		}))
	})

	function toggleZone(zone: TableZone): void {
		const index = selectedZones.value.indexOf(zone)

		if (index >= 0) {
			if (selectedZones.value.length > 1) {
				selectedZones.value = selectedZones.value.filter((item) => item !== zone)
			}

			return
		}

		selectedZones.value = [...selectedZones.value, zone]
	}

	function isZoneActive(zone: TableZone): boolean {
		return selectedZones.value.includes(zone)
	}

	function updateRestaurantTime(): void {
		const timezone = data.value?.restaurant.timezone

		if (!timezone) {
			return
		}

		restaurantTime.value = getRestaurantTime(timezone)
	}

	function startRestaurantClock(): void {
		stopRestaurantClock()
		updateRestaurantTime()
		restaurantClockTimer = setInterval(updateRestaurantTime, RESTAURANT_CLOCK_INTERVAL_MS)
	}

	function stopRestaurantClock(): void {
		if (restaurantClockTimer) {
			clearInterval(restaurantClockTimer)
			restaurantClockTimer = null
		}
	}

	onScopeDispose(stopRestaurantClock)

	async function loadBookingData(): Promise<void> {
		isLoading.value = true
		error.value = null
		stopRestaurantClock()

		try {
			const responseData = await fetchBookingData()

			data.value = responseData
			selectedDate.value = responseData.current_day

			startRestaurantClock()
		} catch (err) {
			data.value = null
			error.value = err instanceof Error ? err.message : 'Не удалось загрузить данные'
		} finally {
			isLoading.value = false
		}
	}

	return {
		data,
		selectedDate,
		isLoading,
		error,
		timeSlots,
		gridHeight,
		currentTimeTop,
		filteredTables,
		scheduleColumns,
		filterDayLabels,
		toggleZone,
		isZoneActive,
		loadBookingData,
	}
}
