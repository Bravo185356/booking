import { computed, ref } from 'vue'

type Theme = 'dark' | 'light'

const THEME_STORAGE_KEY = 'booking-theme'
const theme = ref<Theme>(readStoredTheme())

function readStoredTheme(): Theme {
	if (typeof window === 'undefined') {
		return 'dark'
	}

	const stored = localStorage.getItem(THEME_STORAGE_KEY)

	return stored === 'light' ? 'light' : 'dark'
}

function applyTheme(value: Theme): void {
	document.documentElement.dataset.theme = value
}

function initTheme(): void {
	applyTheme(theme.value)
}

function useTheme() {
	const isDark = computed(() => theme.value === 'dark')

	function setTheme(value: Theme): void {
		theme.value = value
		localStorage.setItem(THEME_STORAGE_KEY, value)
		applyTheme(value)
	}

	function toggleTheme(): void {
		setTheme(theme.value === 'dark' ? 'light' : 'dark')
	}

	return {
		theme,
		isDark,
		setTheme,
		toggleTheme,
	}
}

export { useTheme, initTheme }