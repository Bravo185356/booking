export type OrderStatus = 'New' | 'Bill' | 'Closed' | 'Banquet'
export type ReservationStatus = 'Живая очередь' | 'Новая' | 'Заявка' | 'Открыт' | 'Закрыт'
export type TableZone = '1 Этаж' | '2 Этаж' | 'Банкетный зал'

interface Order {
	id: string
	status: OrderStatus
	start_time: string
	end_time: string
}

interface Reservation {
	id: number
	name_for_reservation: string
	num_people: number
	phone_number: string
	status: ReservationStatus
	seating_time: string
	end_time: string
}

interface BookingResponse {
	available_days: string[]
	current_day: string
	restaurant: Restaurant
	tables: Table[]
}

interface Table {
	id: string
	capacity: number
	number: string
	zone: TableZone
	orders: Order[]
	reservations: Reservation[]
}

interface Restaurant {
	id: number
	timezone: string
	restaurant_name: string
	opening_time: string
	closing_time: string
}

export type { Order, Reservation, Table, Restaurant, BookingResponse }