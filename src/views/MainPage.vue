<template>
	<div class="page">
		<Header :restaurant-name="data?.restaurant.restaurant_name" />
		<div v-if="isLoading" class="loading">Загрузка...</div>
		<div v-else-if="error" class="error">
			<p class="error-message">{{ error }}</p>
			<Button @click="loadBookingData">Повторить</Button>
		</div>
		<main v-else>
			<h1 class="title">Бронирования</h1>
			<Filter
				v-model:selected-date="selectedDate"
				:filter-day-labels="filterDayLabels"
				:toggle-zone="toggleZone"
				:is-zone-active="isZoneActive"
			/>
			<Schedule
				:filtered-tables="filteredTables"
				:schedule-columns="scheduleColumns"
				:time-slots="timeSlots"
				:grid-height="gridHeight"
				:current-time-top="currentTimeTop"
			/>
		</main>
	</div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useBookingSchedule } from '@/composables/useBookingSchedule'
import Filter from '@/components/Filter.vue'
import Header from '@/components/Header.vue'
import Schedule from '@/components/Schedule.vue'
import Button from '@/shared/ui/Button.vue'

const {
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
} = useBookingSchedule()

onMounted(loadBookingData)
</script>

<style scoped lang="scss">
.page {
	font-size: 14px;
	display: flex;
	flex-direction: column;
	height: 100%;
	overflow: hidden;
}

main {
	display: flex;
	flex-direction: column;
	flex: 1;
	min-height: 0;
	padding: 0 20px;
}

.title {
	font-size: 20px;
	font-weight: 800;
	margin: 32px 0 16px 0;
	line-height: 26px;
	color: var(--color-text-primary);
}

.loading {
	display: flex;
	justify-content: center;
	align-items: center;
	margin: 0 24px 24px;
	padding: 24px;
	border-radius: 8px;
	color: var(--color-text-muted);
	font-size: 28px;
}

.error {
	display: flex;
	flex-direction: column;
	align-items: flex-start;
	gap: 12px;
}

.error-message {
	margin: 0;
	font-size: 14px;
	color: var(--color-error);
}
</style>
