import type { OrderStatus, ReservationStatus } from '@/shared/types/entities'

const ORDER_TAG: Record<OrderStatus, string | null> = {
	New: 'Новый',
	Bill: 'Пречек',
	Closed: 'Закрытый',
	Banquet: null,
}
  
const RESERVATION_TAG: Record<ReservationStatus, string | null> = {
	'Живая очередь': 'Живая очередь',
	'Новая': 'Ожидает подтверждения',
	'Заявка': 'Ожидаем',
	'Открыт': 'В зале',
	'Закрыт': 'Отменен',
}

const RES_STATUS_CLASS: Record<ReservationStatus, string> = {
	'Живая очередь': 'live-queue',
	'Новая': 'new',
	'Заявка': 'request',
	'Открыт': 'open',
	'Закрыт': 'closed',
  }

export { ORDER_TAG, RESERVATION_TAG, RES_STATUS_CLASS }