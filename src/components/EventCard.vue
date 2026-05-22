
<template>
	<div class="card" :class="[
		type === 'order'
		? `order-${order?.status}`
		: `res-${reservation ? RES_STATUS_CLASS[reservation.status] : ''}`,
		{ 'hovered': isHovered },
	]">
		<div v-if="type === 'order' && order">
			<div class="order-label">{{ orderTitle(order.status) }}</div>
			<div v-if="ORDER_TAG[order.status]" class="tag">
				{{ ORDER_TAG[order.status] }}
			</div>
			<div class="time">{{ formatTimeRange(startDate, endDate) }}</div>
		</div>

		<div v-else-if="type === 'reservation' && reservation">
			<div class="reservation-label">№{{ table.number }}</div>
			<div class="name">
				{{ reservation.name_for_reservation }}; {{ reservation.num_people }} чел
			</div>
			<div v-if="RESERVATION_TAG[reservation.status]" class="tag">
				{{ RESERVATION_TAG[reservation.status] }}
			</div>
			<div class="phone">
				<PhoneIcon />
				<span class="phone-number">{{ formatPhoneShort(reservation.phone_number) }}</span>
			</div>
			<div class="time">{{ formatTimeRange(startDate, endDate) }}</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import type { Order, OrderStatus, Reservation, Table } from '@/shared/types/entities'
import { ORDER_TAG, RESERVATION_TAG, RES_STATUS_CLASS } from '@/constants/event'
import { formatPhoneShort, formatTimeRange } from '@/utils/time'
import PhoneIcon from '@/assets/icons/phone.vue'

defineProps<{
	type: 'order' | 'reservation'
	order?: Order
	reservation?: Reservation
	table: Table
	startDate: string
	endDate: string
	isHovered: boolean
}>()

function orderTitle(status: OrderStatus): string {
	if (status === 'Banquet') {
		return 'Банкет'
	}

	return 'Заказ'
}
</script>

<style scoped lang="scss">
.card {
	box-sizing: border-box;
	width: 100%;
	height: 100%;
	padding: 4px 6px;
	border-radius: 4px;
	overflow: hidden;
	font-size: 11px;
	line-height: 1.3;
	color: var(--color-event-card-text);
	cursor: pointer;

	&.hovered {
		position: absolute;
		left: 0;
		top: 0;
		z-index: 100;
		width: max-content;
		min-width: 100%;
		height: auto;
		min-height: 100%;
		overflow: visible;
		-webkit-backdrop-filter: blur(8px);
		backdrop-filter: blur(8px);

		.name {
			white-space: nowrap;
			overflow: visible;
		}
	}

	.order-label {
		line-height: 14px;
		font-size: 11px;
		font-weight: 700;
	}

	.reservation-label {
		font-size: 8px;
		line-height: 8px;
	}

	.name {
		font-weight: 600;
		white-space: nowrap;
		overflow: hidden;
	}

	.tag {
		display: inline-block;
		padding: 2px;
		border-radius: 4px;
		font-size: 8px;
		line-height: 8px;
		font-weight: 700;
		text-wrap: nowrap;
	}

	.phone {
		display: flex;
		gap: 2px;
		align-items: center;
		font-size: 11px;
		line-height: 14px;
	}

	.time {
		font-size: 11px;
		line-height: 14px;
		white-space: nowrap;
	}

	&.order-New,
	&.order-Bill,
	&.order-Closed {
		background: rgba(127, 215, 204, 0.16);
		border-left: 3px solid #7fd7cc;
	}

	&.order-New .tag,
	&.order-Closed .tag,
	&.res-live-queue .tag,
	&.res-closed .tag {
		background: var(--color-event-card-tag-muted-bg);
	}

	&.order-Bill .tag {
		background: rgba(74, 201, 155, 0.32);
	}

	&.order-Banquet {
		background: rgba(179, 72, 247, 0.16);
		border-left: 3px solid #7b439e;
	}

	&.res-live-queue {
		background: rgba(0, 151, 253, 0.16);
		border-left: 3px solid #007aff;
	}

	&[class*='res-']:not(.res-live-queue) {
		background: rgba(255, 112, 67, 0.16);
		border-left: 3px solid #ff7043;
	}

	&.res-new .tag {
		background: #2980B9;
		color: #ffffff;
	}

	&.res-request .tag {
		background: rgba(0, 151, 253, 0.1);
		color: #0097FD;
	}

	&.res-open .tag {
		background: rgba(74, 201, 155, 0.32);
	}
}
</style>
