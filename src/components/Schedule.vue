<template>
	<section class="schedule">
		<div
			ref="scheduleScrollRef"
			class="scroll"
			:class="{ 'is-dragging': isScrollDragging }"
			@pointerdown="onScrollPointerDown"
			@wheel.prevent="onScrollWheel"
			@click.capture="onScrollClickCapture"
		>
			<div class="inner" :style="{ minWidth: `${TIME_COL_WIDTH + filteredTables.length * COLUMN_WIDTH}px` }">
				<div class="header-row">
					<div class="corner" :style="{ width: `${TIME_COL_WIDTH}px` }" />
					<div
						v-for="table in filteredTables"
						:key="table.id"
						class="column-header"
						:style="{ width: `${COLUMN_WIDTH}px` }"
					>
						<div class="table-info">
							<span class="table-num">
								<span class="hash">#</span>
								<span class="num">{{ table.number }}</span>
							</span>
							<span class="capacity">{{ table.capacity }} чел</span>
						</div>
						<span class="zone">{{ table.zone }}</span>
					</div>
				</div>

				<div class="body">
					<div class="time-col" :style="{ width: `${TIME_COL_WIDTH}px`, height: `${gridHeight}px` }">
						<div
							v-for="slot in timeSlots"
							:key="slot.label"
							class="time-label"
							:style="{ top: `${slot.topPx}px` }"
						>
							{{ slot.label }}
						</div>
					</div>

					<div class="columns" :style="{ height: `${gridHeight}px` }">
						<div
							v-for="{ table, positionedEvents } in scheduleColumns"
							class="column"
							:key="table.id"
							:style="{ width: `${COLUMN_WIDTH}px` }"
						>
							<div
								v-for="slot in timeSlots"
								class="grid-line"
								:key="`line-${table.id}-${slot.label}`"
								:style="{ top: `${slot.topPx}px` }"
							/>

							<EventCard
								v-for="{ positioned, raw } in positionedEvents"
								:key="positioned.id"
								:type="raw.type"
								:order="raw.order"
								:reservation="raw.reservation"
								:table="table"
								:start-date="positioned.startDate"
								:end-date="positioned.endDate"
								:is-hovered="hoveredEventId === positioned.id"
								:style="getEventCardStyle(positioned, hoveredEventId === positioned.id)"
								@mouseenter="hoveredEventId = positioned.id"
								@mouseleave="hoveredEventId = null"
							/>
						</div>

						<div
							v-if="currentTimeTop !== null"
							class="now-line"
							:style="{ top: `${currentTimeTop}px` }"
						/>
					</div>
				</div>
			</div>
		</div>
	</section>
</template>

<script setup lang="ts">
import { ref, useTemplateRef } from 'vue'
import type { Table } from '@/shared/types/entities'
import type { PositionedEvent, ScheduleColumn, TimeSlot } from '@/shared/types/schedule'
import { useDragScroll } from '@/composables/useDragScroll'
import { COLUMN_WIDTH, TIME_COL_WIDTH } from '@/constants/schedule'
import EventCard from '@/components/EventCard.vue'

defineProps<{
	filteredTables: Table[]
	scheduleColumns: ScheduleColumn[]
	timeSlots: TimeSlot[]
	gridHeight: number
	currentTimeTop: number | null
}>()

const hoveredEventId = ref<string | null>(null)

function getEventCardStyle(positioned: PositionedEvent, isHovered: boolean) {
	const slotWidth = `calc(${positioned.widthPercent}% - ${positioned.offsetPx}px)`

	if (isHovered) {
		return {
			top: `${positioned.topPercent}%`,
			left: `calc(${positioned.leftPercent}% + ${positioned.offsetPx}px)`,
			width: 'max-content',
			minWidth: slotWidth,
			height: 'auto',
			minHeight: `${positioned.heightPercent}%`,
			zIndex: 29,
		}
	}

	return {
		top: `${positioned.topPercent}%`,
		height: `${positioned.heightPercent}%`,
		left: `calc(${positioned.leftPercent}% + ${positioned.offsetPx}px)`,
		width: slotWidth,
		zIndex: positioned.zIndex,
	}
}

const scheduleScrollRef = useTemplateRef<HTMLElement>('scheduleScrollRef')
const {
	isDragging: isScrollDragging,
	onPointerDown: onScrollPointerDown,
	onClickCapture: onScrollClickCapture,
	onWheel: onScrollWheel,
} = useDragScroll(scheduleScrollRef)
</script>

<style scoped lang="scss">
.schedule {
	padding: 0 0 24px 0;
	overflow: hidden;
	flex: 1;
	min-height: 0;
	display: flex;
	flex-direction: column;

	.scroll {
		overflow: auto;
		flex: 1;
		min-height: 0;
		cursor: grab;
		overscroll-behavior: contain;
		scrollbar-width: none;
		-ms-overflow-style: none;

		&::-webkit-scrollbar {
			display: none;
		}

		&.is-dragging {
			cursor: grabbing;
			user-select: none;
		}
	}

	.inner {
		position: relative;
	}

	.header-row {
		display: flex;
		position: sticky;
		top: 0;
		z-index: 30;
		background: var(--color-bg-surface);
	}

	.corner {
		flex-shrink: 0;
		position: sticky;
		top: 0;
		left: 0;
		z-index: 30;
		background: var(--color-bg-surface);
	}

	.column-header {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
		padding: 7px 0;
	}

	.table-info {
		display: flex;
		gap: 4px;
		justify-content: center;
		align-items: center;
	}

	.num {
		display: inline-block;
		font-size: 13px;
		font-weight: 700;
		line-height: 20px;
	}

	.hash {
		font-size: 11px;
		color: var(--color-text-primary);
		line-height: 14px;
		opacity: 0.64;
	}

	.capacity {
		font-size: 11px;
		color: var(--color-text-primary);
		opacity: 0.64;
		line-height: 14px;
	}

	.zone {
		font-size: 11px;
		color: var(--color-text-primary);
		opacity: 0.64;
		line-height: 14px;
	}

	.body {
		display: flex;
		position: relative;
	}

	.time-col {
		flex-shrink: 0;
		position: sticky;
		left: 0;
		z-index: 30;
		background: var(--color-bg-surface);
	}

	.time-label {
		position: absolute;
		right: 8px;
		font-size: 11px;
		line-height: 14px;
		color: var(--color-time-label);
		white-space: nowrap;
	}

	.columns {
		display: flex;
		position: relative;
		flex: 1;
	}

	.column {
		flex-shrink: 0;
		position: relative;
		overflow: visible;

		&:not(:first-child) {
			border-left: 1px solid var(--color-border);
		}
	}

	.grid-line {
		position: absolute;
		left: 0;
		right: 0;
		height: 1px;
		background: var(--color-grid-line);
		pointer-events: none;
	}

	.now-line {
		position: absolute;
		left: 0;
		right: 0;
		height: 1px;
		background: var(--color-now-line);
		z-index: 30;
		pointer-events: none;
	}
}
</style>
