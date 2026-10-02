"use client"

import {
  AppShell,
  Avatar,
  Burger,
  Code,
  Flex,
  Group,
  NavLink,
  Stack,
  Switch,
  Title,
  useMantineColorScheme,
} from "@mantine/core"
import { useDisclosure } from "@mantine/hooks"
import {
  IconAdjustmentsHorizontal,
  IconCopyOff,
  IconPennant2,
} from "@tabler/icons-react"
import Link from "next/link"
import { useSettings } from "../contexts/settingsProvider"

function Navbar({ children }: any) {
  const { setColorScheme, colorScheme } = useMantineColorScheme()
  const [mobileOpened, { toggle: toggleMobile }] = useDisclosure()
  const [desktopOpened, { toggle: toggleDesktop }] = useDisclosure(true)

  const {
    settings: { username, engine },
    settingsLoading,
  } = useSettings()

  const navLinks = [
    { label: "Challenges", href: "/", icon: IconPennant2 },
    { label: "Settings", href: "/settings", icon: IconAdjustmentsHorizontal },
  ]

  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{
        width: 300,
        breakpoint: "sm",
        collapsed: { mobile: !mobileOpened, desktop: !desktopOpened },
      }}
      padding="md"
    >
      <AppShell.Header>
        <Group h="100%" justify="space-between" px="md">
          <Group>
            <Burger
              opened={mobileOpened}
              onClick={toggleMobile}
              hiddenFrom="sm"
              size="md"
            />
            <Burger
              opened={desktopOpened}
              onClick={toggleDesktop}
              visibleFrom="sm"
              size="md"
            />
            <IconCopyOff size={40} />
            <Title>Anti-Plagiarism-Project</Title>
          </Group>
          <Group>
            <Code>Engine: {!settingsLoading ? engine : ""}</Code>
            <Avatar
              alt={!settingsLoading ? username : ""}
              radius="xl"
              size="md"
              color="#087F5B"
            >
              {!settingsLoading
                ? `${username?.charAt(0)}${username?.split(" ")[1]?.charAt(0)}`
                : ""}
            </Avatar>
          </Group>
        </Group>
      </AppShell.Header>
      <AppShell.Navbar p="md">
        <Stack>
          <Stack w={"100%"} gap={0}>
            {navLinks.map((link) => (
              <NavLink
                key={link.href}
                leftSection={<link.icon />}
                styles={{
                  label: {
                    fontSize: "15pt",
                  },
                }}
                component={Link}
                label={link.label}
                href={link.href}
              />
            ))}
          </Stack>
          <Switch
            style={{
              position: "absolute",
              bottom: 10,
            }}
            color="gray"
            size="md"
            label="Dark Mode"
            checked={colorScheme === "dark"}
            onChange={(event) => {
              if (colorScheme === "dark") {
                setColorScheme("light")
              } else {
                setColorScheme("dark")
              }
            }}
          />
        </Stack>
      </AppShell.Navbar>

      <AppShell.Main>{children}</AppShell.Main>
    </AppShell>
  )
}

export default Navbar
