import { useState } from 'react'
import LaunchScreen from './components/LaunchScreen'
import Layout from './components/Layout'
import CommandIQ from './components/CommandIQ'

export default function App() {
  const [launched, setLaunched] = useState(false)

  if (!launched) {
    return <LaunchScreen onLaunch={() => setLaunched(true)} />
  }

  return (
    <>
      <Layout onLogout={() => setLaunched(false)} />
      <CommandIQ />
    </>
  )
}
