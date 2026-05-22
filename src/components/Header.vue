<template>
	<header class="header">
		<div class="brand">AIRESTO | {{ restaurantName || '' }}</div>
		<button type="button" class="theme-btn" :aria-label="isDark ? 'Включить светлую тему' : 'Включить тёмную тему'" @click="toggleTheme">
			{{ isDark ? '☀' : '☾' }}
		</button>
	</header>
</template>

<script setup lang="ts">
import { useTheme } from '@/composables/useTheme'

defineProps<{
	restaurantName: string | undefined
}>()

const { isDark, toggleTheme } = useTheme()
</script>

<style scoped lang="scss">
.header {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 15px 20px;
	background: var(--color-bg-header);
	border-bottom: 1px solid var(--color-border);
}

.brand {
	font-size: 11px;
	font-weight: 700;
	line-height: 14px;
	color: var(--color-text-primary);
}

.theme-btn {
	display: flex;
	align-items: center;
	justify-content: center;
	width: 32px;
	height: 32px;
	border: none;
	border-radius: 8px;
	background: var(--color-icon-button-bg);
	color: var(--color-icon-button-text);
	font-size: 16px;
	cursor: pointer;
	transition: background 0.15s;

	&:hover {
		background: var(--color-button-hover-bg);
	}
}
</style>
