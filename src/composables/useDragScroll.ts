import { onUnmounted, ref, type Ref } from 'vue'

const DRAG_THRESHOLD_PX = 5

interface DragState {
	pending: boolean
	pointerId: number
	startX: number
	startY: number
	scrollLeft: number
	scrollTop: number
}

export function useDragScroll(scrollRef: Ref<HTMLElement | null>) {
	const isDragging = ref(false)

	let dragState: DragState | null = null
	let suppressClick = false

	function cleanupListeners(): void {
		document.removeEventListener('pointermove', handlePointerMove)
		document.removeEventListener('pointerup', handlePointerUp)
		document.removeEventListener('pointercancel', handlePointerUp)
	}

	function handlePointerMove(event: PointerEvent): void {
		if (!dragState || dragState.pointerId !== event.pointerId) {
			return
		}

		const element = scrollRef.value

		if (!element) {
			return
		}

		const deltaX = event.clientX - dragState.startX
		const deltaY = event.clientY - dragState.startY

		if (dragState.pending) {
			if (Math.hypot(deltaX, deltaY) < DRAG_THRESHOLD_PX) {
				return
			}

			dragState.pending = false
			isDragging.value = true
		}

		event.preventDefault()
		element.scrollLeft = dragState.scrollLeft - deltaX
		element.scrollTop = dragState.scrollTop - deltaY
	}

	function handlePointerUp(event: PointerEvent): void {
		if (!dragState || dragState.pointerId !== event.pointerId) {
			return
		}

		if (isDragging.value) {
			suppressClick = true
		}

		dragState = null
		isDragging.value = false
		cleanupListeners()
	}

	function onPointerDown(event: PointerEvent): void {
		if (event.button !== 0) {
			return
		}

		const element = scrollRef.value

		if (!element) {
			return
		}

		dragState = {
			pending: true,
			pointerId: event.pointerId,
			startX: event.clientX,
			startY: event.clientY,
			scrollLeft: element.scrollLeft,
			scrollTop: element.scrollTop,
		}

		document.addEventListener('pointermove', handlePointerMove)
		document.addEventListener('pointerup', handlePointerUp)
		document.addEventListener('pointercancel', handlePointerUp)
	}

	function onClickCapture(event: MouseEvent): void {
		if (!suppressClick) {
			return
		}

		event.preventDefault()
		event.stopPropagation()
		suppressClick = false
	}

	function onWheel(event: WheelEvent): void {
		const element = scrollRef.value

		if (!element || isDragging.value) {
			return
		}

		const maxScrollTop = element.scrollHeight - element.clientHeight
		const maxScrollLeft = element.scrollWidth - element.clientWidth

		if (maxScrollTop <= 0 && maxScrollLeft <= 0) {
			return
		}

		const nextScrollTop = element.scrollTop + event.deltaY
		const nextScrollLeft = element.scrollLeft + event.deltaX

		const canScrollVertically =
			(event.deltaY < 0 && element.scrollTop > 0)
			|| (event.deltaY > 0 && element.scrollTop < maxScrollTop)

		const canScrollHorizontally =
			(event.deltaX < 0 && element.scrollLeft > 0)
			|| (event.deltaX > 0 && element.scrollLeft < maxScrollLeft)

		if (canScrollVertically) {
			element.scrollTop = Math.max(0, Math.min(maxScrollTop, nextScrollTop))
		}

		if (canScrollHorizontally) {
			element.scrollLeft = Math.max(0, Math.min(maxScrollLeft, nextScrollLeft))
		}

		if (canScrollVertically || canScrollHorizontally) {
			event.preventDefault()
		}
	}

	onUnmounted(cleanupListeners)

	return {
		isDragging,
		onPointerDown,
		onClickCapture,
		onWheel,
	}
}
