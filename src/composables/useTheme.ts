import { ref, onMounted } from 'vue'

export function useTheme() {
  const currentTheme = ref('light')

  const setTheme = (theme: 'light' | 'dark' | 'theme-ocean') => {
    currentTheme.value = theme
    const html = document.documentElement

    html.classList.remove('dark', 'theme-ocean')
    if (theme !== 'light') {
      html.classList.add(theme)
    }
    localStorage.setItem('aorta-theme', theme)
  }

  onMounted(() => {
    const saved = localStorage.getItem('aorta-theme') as any
    if (saved) {
      setTheme(saved)
    } else {
      // Auto detect OS preference
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        setTheme('dark')
      }
    }
  })

  return { currentTheme, setTheme }
}