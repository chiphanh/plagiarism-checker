"use client"

import {
  ActionIcon,
  Center,
  Group,
  Loader,
  Stack,
  Title,
  Badge,
} from "@mantine/core"
import { IconPlayerPlay, IconRefresh, IconSearch } from "@tabler/icons-react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import sortBy from "lodash.sortby"
import { DataTable, type DataTableSortStatus } from "mantine-datatable"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { GetChallengesOutput } from "../api/types"
import { getChallenges, initiatePlagiarismCheck } from "../api/wrappers"
import { useSettings } from "./contexts/settingsProvider"

type Challenge = GetChallengesOutput[number]

export default function Challenges() {
  const queryClient = useQueryClient()

  const router = useRouter()

  const [sortStatus, setSortStatus] = useState<DataTableSortStatus<Challenge>>({
    columnAccessor: "endDate",
    direction: "desc",
  })

  const {
    settings: { userId, engineId },
    settingsLoading,
  } = useSettings()

  const { isLoading, error, data } = useQuery({
    queryKey: [`getChallenges`, { userId }],
    queryFn: function () {
      return getChallenges({ userId: userId! })
    },
    enabled: userId !== undefined,
  })

  const initiatePlagiarismCheckQuery = useMutation({
    mutationFn: initiatePlagiarismCheck,
    mutationKey: ["initiatePlagiarismCheck"],
  })

  const [records, setRecords] = useState<GetChallengesOutput | undefined>(
    undefined
  )

  useEffect(() => {
    const sorted = sortBy(data, sortStatus.columnAccessor) as Challenge[]
    setRecords(sortStatus.direction === "asc" ? sorted.reverse() : sorted)
  }, [sortStatus, data])

  return (
    <Stack p={10}>
      <Title>Challenges</Title>
      <Stack style={{ minHeight: "100px" }}>
        {isLoading || settingsLoading ? (
          <Center style={{ height: "100vh" }}>
            <Loader size="xl" />
          </Center>
        ) : error ? (
          <div>Error: {error.message}</div>
        ) : (
          <DataTable
            highlightOnHover
            withTableBorder
            textSelectionDisabled
            borderRadius="lg"
            shadow="sm"
            striped
            horizontalSpacing="xs"
            verticalSpacing="xs"
            verticalAlign="center"
            columns={[
              { accessor: "id", title: "#", sortable: true },
              { accessor: "name", title: "Name", sortable: true },
              { accessor: "branchName", title: "Branch", sortable: true },
              {
                accessor: "endDate",
                title: "End Date",
                sortable: true,
                render: (value) => new Date(value.endDate).toLocaleString(),
              },
              {
                accessor: "plagiarismCheckStatus",
                title: "Check Status",
                sortable: true,
                render: (challenge) => {
                  return challenge.plagiarismCheckStatus ? (
                    <Badge variant="dot" color="#087F5B">
                      {challenge.plagiarismCheckStatus}
                    </Badge>
                  ) : (
                    <Badge variant="dot" color="grey">
                      Pending
                    </Badge>
                  )
                },
              },
              {
                accessor: "actions",
                title: "Actions",
                render: (challenge) =>
                  challenge.plagiarismCheckStatus === null ? (
                    <ActionIcon
                      disabled={new Date(challenge.endDate) > new Date()}
                      color="#087F5B"
                      onClick={async (e: React.MouseEvent) => {
                        e.stopPropagation()
                        if (engineId !== undefined && userId !== undefined) {
                          await initiatePlagiarismCheckQuery.mutateAsync({
                            challengeId: challenge.id,
                            engineId,
                            userId,
                            rerun: false,
                          })
                          queryClient.invalidateQueries({
                            queryKey: [`getChallenges`],
                          })
                        } else {
                          throw new Error("Settings must be set.")
                        }
                      }}
                    >
                      <IconPlayerPlay size={16} />
                    </ActionIcon>
                  ) : challenge.plagiarismCheckStatus == "Running" ? (
                    <ActionIcon
                      color="gray"
                      disabled
                      onClick={async (e: React.MouseEvent) => {
                        e.stopPropagation()
                      }}
                    >
                      <IconPlayerPlay size={16} />
                    </ActionIcon>
                  ) : (
                    <Group gap={4} justify="left" wrap="nowrap">
                      <ActionIcon
                        color="#087F5B"
                        onClick={async (e: React.MouseEvent) => {
                          e.stopPropagation()
                          if (engineId !== undefined && userId !== undefined) {
                            await initiatePlagiarismCheckQuery.mutateAsync({
                              challengeId: challenge.id,
                              engineId,
                              userId,
                              rerun: true,
                            })
                            queryClient.invalidateQueries({
                              queryKey: [`getChallenges`],
                            })
                          } else {
                            throw new Error("Settings must be set.")
                          }
                        }}
                      >
                        <IconRefresh size={16} />
                      </ActionIcon>
                      <ActionIcon
                        color="#087F5B"
                        onClick={async (e: React.MouseEvent) => {
                          e.stopPropagation()
                          router.push(`/challenge/${challenge.id}`)
                        }}
                      >
                        <IconSearch size={16} />
                      </ActionIcon>
                    </Group>
                  ),
              },
            ]}
            records={records}
            sortStatus={sortStatus}
            onSortStatusChange={setSortStatus}
          />
        )}
      </Stack>
    </Stack>
  )
}
