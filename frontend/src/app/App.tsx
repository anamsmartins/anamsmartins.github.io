import ThemeToggle from './ThemeToggle'
import { ThemeProvider, useTheme } from './ThemeContext'
import FantasyApp from '../themes/fantasy/FantasyApp'
import ProfessionalApp from '../themes/professional/ProfessionalApp'

function ThemedApp() {
  const { theme } = useTheme()

  return (
    <>
      <ThemeToggle />
      {theme === 'fantasy' ? <FantasyApp /> : <ProfessionalApp />}
    </>
  )
}

function App() {
  return (
    <ThemeProvider>
      <ThemedApp />
    </ThemeProvider>
  )
}

export default App
