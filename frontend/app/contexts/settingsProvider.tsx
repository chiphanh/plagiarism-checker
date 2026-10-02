"use client"

import {
  Dispatch,
  ReactNode,
  SetStateAction,
  createContext,
  useContext,
  useEffect,
  useState,
} from "react"

type Settings = {
  userId: number | undefined
  username: string | undefined
  engineId: number | undefined
  engine: string | undefined
}

const SettingsContext = createContext<{
  settings: Settings
  setSettings: Dispatch<SetStateAction<Settings>> | undefined
  settingsLoading: boolean
}>({
  settings: {
    userId: undefined,
    username: undefined,
    engineId: undefined,
    engine: undefined,
  },
  setSettings: undefined,
  settingsLoading: true,
})

export const useSettings = () => useContext(SettingsContext)

export const SettingsProvider = ({ children }: { children: ReactNode }) => {
  const [settings, setSettings] = useState<Settings>({
    userId: undefined,
    username: undefined,
    engineId: undefined,
    engine: undefined,
  })
  const [settingsLoading, setLoading] = useState(true)

  useEffect(() => {
    const storedSettings = localStorage.getItem("settings")
    if (storedSettings) {
      setSettings(JSON.parse(storedSettings))
    }
    setLoading(false)
  }, [])

  return (
    <SettingsContext.Provider
      value={{ settings, setSettings, settingsLoading }}
    >
      {children}
    </SettingsContext.Provider>
  )
}
