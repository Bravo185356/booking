<template>
	<section class="filters">
		<div class="day-filters">
			<span class="label">Дата</span>
			<div class="buttons">
				<Button 
					v-for="{ date, dayMonth, subLine } in filterDayLabels" 
					:key="date"
					class="day-button"
					:is-active="selectedDate === date"
					@click="selectedDate = date"
				>
					<span class="day">{{ dayMonth }}</span>
					<span class="sub">{{ subLine }}</span>
				</Button>
			</div>
		</div>

		<div>
			<span class="label">Отображаемые зоны</span>
			<div class="buttons">
				<Button 
					v-for="zone in TABLE_ZONES" 
					:key="zone" 
					:is-active="isZoneActive(zone)"
					class="zone-button" 
					:class="{ active: isZoneActive(zone) }" 
					@click="toggleZone(zone)"
				>
					{{ zone }}
				</Button>
			</div>
		</div>
	</section>
</template>

<script setup lang="ts">
import type { TableZone } from '@/shared/types/entities'
import { TABLE_ZONES } from '@/constants/zones'
import Button from '@/shared/ui/Button.vue'

const selectedDate = defineModel<string>('selectedDate', { required: true })

defineProps<{
	filterDayLabels: { date: string; dayMonth: string; subLine: string }[]
	toggleZone: (zone: TableZone) => void
	isZoneActive: (zone: TableZone) => boolean
}>()
</script>

<style scoped lang="scss">
.filters {
	margin-bottom: 32px;

	.label {
		display: block;
		font-size: 11px;
		color: var(--color-text-secondary);
		margin-bottom: 4px;
		line-height: 14px;
	}

	.buttons {
		display: flex;
		flex-wrap: wrap;
		gap: 8px;
	}

	.day-button {
		padding: 4px 8px;
	}

	.day-filters {
		margin-bottom: 16px;
	}

	.zone-button {
		padding: 4px 6px;
		border-radius: 4px;
	}

	.day,
	.sub,
	.day-button,
	.zone-button {
		font-size: 11px;
		line-height: 14px;
	}

	.day {
		font-weight: 700;
	}
}
</style>