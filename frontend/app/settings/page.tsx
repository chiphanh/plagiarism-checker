"use client"

import { Center, Loader, Select, Stack, Text, Title } from "@mantine/core"
import { useQuery } from "@tanstack/react-query"
import { getUsers, getAvailableEngines } from "../../api/wrappers"
import { useSettings } from "../contexts/settingsProvider"

export default function Settings() {
  const { settings, setSettings, settingsLoading } = useSettings()

 const {
    isLoading: isLoadingUsers,
    error: usersError,
    data: usersData,
  } = useQuery({
    queryKey: ['getUsers'],
    queryFn: getUsers,
  });

  const {
    isLoading: isLoadingAvailableEngines,
    error: availableEnginesError,
    data: availableEnginesData,
  } = useQuery({
    queryKey: ['getAvailableEngines'],
    queryFn: getAvailableEngines,
  });


  if (usersError || availableEnginesError) {
    return <div>Error: {usersError?.message || availableEnginesError?.message} , {availableEnginesError?.name}</div>;
  }
  
  if (!settings || !setSettings) return null

  return (
    <Stack p={10}>
      <Title>Settings</Title>
      <Stack p={20} w={"80%"}>
        {isLoadingUsers || isLoadingAvailableEngines || settingsLoading? (
          <Center style={{ height: "100vh" }}>
            <Loader size="xl" />
          </Center>
        ) : (
          <>
            <Select
              label={
                <Text size="xl" fw={700}>
                  User
                </Text>
              }
              data={usersData?.map((user) => ({
                value: user.id.toString(),
                label: `${user.firstName} ${user.lastName}`,
              }))}
              value={settings.userId?.toString()}
              onChange={(value,label) => { 
                if (!value) return
                setSettings((prev) => {
                  const newSettings = { ...prev, userId: Number(value), username: `${usersData?.find(user => user.id.toString() === value)?.firstName} ${usersData?.find(user => user.id.toString() === value)?.lastName}` }
                  localStorage.setItem("settings", JSON.stringify(newSettings))
                  return newSettings
                })
              }}
            />
            <Select
              label={
                <Text size="xl" fw={700}>
                  Engine
                </Text>
              }
              data={
                availableEnginesData?.map((engine) => ({
                  value: engine.id.toString(),
                  label: `${engine.name} ${engine.version}`,
                }))}
              value={settings.engineId?.toString()}
              onChange={(value, label) => {
                if (!value) return
                setSettings((prev) => {
                  const newSettings = { ...prev, engineId: Number(value), engine: `${availableEnginesData?.find(engine => engine.id.toString() === value)?.name} ${availableEnginesData?.find(engine => engine.id.toString() === value)?.version}` }
                  localStorage.setItem("settings", JSON.stringify(newSettings))
                  return newSettings
                })
              }}
            />
          </>
        )}
      </Stack>
    </Stack>
  )
}
