"use client"

import { ColorSchemeScript, MantineProvider } from "@mantine/core"
import "@mantine/core/styles.layer.css"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import "mantine-datatable/styles.layer.css"
import { theme } from "../theme"
import Navbar from "./components/Navbar"
import { SettingsProvider } from "./contexts/settingsProvider"

const queryClient = new QueryClient()

export default function RootLayout({ children }: { children: any }) {
  return (
    <html lang="en">
      <head>
        <ColorSchemeScript />
        <link rel="shortcut icon" href="/favicon.svg" />
        <meta
          name="viewport"
          content="minimum-scale=1, initial-scale=1, width=device-width, user-scalable=no"
        />
      </head>
      <body>
        <QueryClientProvider client={queryClient}>
          <MantineProvider theme={theme}>
            <SettingsProvider>
              <Navbar>{children}</Navbar>
            </SettingsProvider>
          </MantineProvider>
        </QueryClientProvider>
      </body>
    </html>
  )
}
