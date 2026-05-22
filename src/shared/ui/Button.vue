<template>
	<button type="button" class="btn" :class="{ active: isActive }">
		<slot />
	</button>
</template>



<script setup lang="ts">
defineProps<{
	isActive?: boolean
}>()
</script>

<style scoped lang="scss">
.btn {
	display: flex;
	flex-direction: column;
	align-items: flex-start;
	background: var(--color-button-bg);
	border: none;
	border-radius: 8px;
	color: var(--color-button-text);
	cursor: pointer;
	transition: background 0.15s, color 0.15s;
	font: inherit;
	font-size: 11px;
	line-height: 14px;

	&:hover:not(.active) {
		background: var(--color-button-hover-bg);
	}

	&.active {
		background: var(--color-button-active-bg);
		color: var(--color-button-active-text);

		&:hover {
			background: var(--color-button-active-hover-bg);
		}
	}
}
</style>

