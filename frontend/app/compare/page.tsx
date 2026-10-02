"use client"
import {
  Badge,
  Button,
  Center,
  Group,
  Loader,
  Paper,
  ScrollArea,
  Select,
  Stack,
  Table,
  Title,
} from "@mantine/core"
import { useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import dynamic from "next/dynamic"
import { GetPlagiarismCheckOutput } from "../../api/types"
import { getPlagiarismCheck, updateDecision } from "../../api/wrappers"
import { useTeamCode } from "./useTeamCode"

// Dynamically import the MonacoDiffEditor to prevent SSR issues
const MonacoDiffEditor = dynamic(() => import("../components/MonacoDiffView"), {
  ssr: false,
})

export default function Compare() {
  const searchParams = useSearchParams()

  const challengeId = searchParams.get("challengeId")
  if (!challengeId) {
    throw new Error("missing challengeId")
  }

  const { isPending: dataLoading, data } = useQuery({
    queryKey: [`getPlagiarismCheck`, { challengeId }],
    queryFn: function () {
      return getPlagiarismCheck({ challengeId: parseInt(challengeId) })
    },
  })

  const [cluster, setCluster] = useState<GetPlagiarismCheckOutput["teams"]>([])

  useEffect(() => {
    if (!data) return
    const paramsArray = searchParams.getAll("teamId")
    setCluster(
      data?.teams.filter((team) => paramsArray.includes(team.id.toString()))
    )
  }, [searchParams, data])

  const queryClient = useQueryClient()

  const updateDecisionMutation = useMutation({
    mutationFn: async ({
      decision,
      teamId,
    }: {
      decision: "Guilty" | "Innocent" | null
      teamId: string
    }) => {
      await updateDecision({
        decision,
        challengeId: parseInt(challengeId),
        teamId: parseInt(teamId),
        supervisorId: 0,
      })
      queryClient.invalidateQueries({
        queryKey: [`getPlagiarismCheck`],
      })
    },
    mutationKey: ["updateDecision"],
  })

  const [leftTeamId, setLeftTeamId] = useState<string | null>(null)
  const [rightTeamId, setRightTeamId] = useState<string | null>(null)

  const leftCode = useTeamCode(leftTeamId, challengeId)
  const rightCode = useTeamCode(rightTeamId, challengeId)

  function getTeam(teamId: string) {
    const team = data?.teams.find((team) => team.id.toString() === teamId)
    if (!team) {
      throw new Error(`team with id ${teamId} not found`)
    }
    return team
  }

  const rows = cluster.map((team) => {
    const { badgeColor, badgeText } =
      team?.decision === "Guilty"
        ? { badgeColor: "red", badgeText: "Plagiarism" }
        : team?.decision === "Innocent"
        ? { badgeColor: "#087F5B", badgeText: "No Plagiarism" }
        : { badgeColor: "grey", badgeText: "Undecided" }
    return (
      <Table.Tr
        key={team.leaderNickname}
        bg={
          team.id.toString() === leftTeamId ||
          team.id.toString() === rightTeamId
            ? "#087F5B"
            : undefined
        }
      >
        <Table.Td>{team.id}</Table.Td>
        <Table.Td>{team.leaderNickname}</Table.Td>
        <Table.Td>{Math.floor(team.maxSimilarity * 100) + "%"}</Table.Td>
        <Table.Td>{new Date(team.submissionTime).toLocaleString()}</Table.Td>
        <Table.Td>
          <Badge variant="dot" color={badgeColor}>
            {badgeText}
          </Badge>
        </Table.Td>
      </Table.Tr>
    )
  })

  const getSimilarityByTeamIds = (teamIds: string[]) => {
    const similarity = data?.codeComparisons.find(
      (comparison) =>
        (comparison.teamA.id === parseInt(teamIds[0]) &&
          comparison.teamB.id === parseInt(teamIds[1])) ||
        (comparison.teamA.id === parseInt(teamIds[1]) &&
          comparison.teamB.id === parseInt(teamIds[0]))
    )?.similarity

    return similarity
      ? `Computed Similarity: ${Math.floor(similarity * 100)}% `
      : ""
  }

  return dataLoading || !data ? (
    <Center style={{ height: "100vh" }}>
      <Loader size="xl" />
    </Center>
  ) : (
    <div>
      <Stack
        style={{ minHeight: "100px" }}
        p={20}
        w={"95%"}
        justify="flex-between"
      >
        <Title>Code Review</Title>

        <Paper shadow="sm" radius="lg" withBorder p="xl">
          <ScrollArea h={200}>
            <Table striped withTableBorder>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Team Id</Table.Th>
                  <Table.Th>Nickname</Table.Th>
                  <Table.Th>Similarity</Table.Th>
                  <Table.Th>Submission Time</Table.Th>
                  <Table.Th>Decision</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>{rows}</Table.Tbody>
            </Table>
          </ScrollArea>
        </Paper>
        <Group justify="space-between">
          <Select
            data={cluster
              .filter((team) => team.id.toString() !== rightTeamId)
              .map((team) => ({
                value: team.id.toString(),
                label: getTeam(team.id.toString()).leaderNickname,
              }))}
            onChange={(value) => {
              setLeftTeamId(value)
            }}
            unselectable="on"
            placeholder="Select a Team to Compare"
          ></Select>

          <Title order={3}>
            {leftTeamId && rightTeamId
              ? getSimilarityByTeamIds([leftTeamId, rightTeamId])
              : ""}
          </Title>
          <Select
            unselectable="on"
            data={cluster
              .filter((team) => team.id.toString() !== leftTeamId)
              .map((team) => ({
                value: team.id.toString(),
                label: getTeam(team.id.toString()).leaderNickname,
              }))}
            onChange={(value) => setRightTeamId(value)}
            placeholder="Select a Team to Compare"
          ></Select>
        </Group>

        <MonacoDiffEditor original={leftCode} modified={rightCode} />

        <Group justify="space-between">
          <Group>
            <Button
              color="red"
              variant="filled"
              onClick={() => {
                updateDecisionMutation.mutateAsync({
                  decision: "Guilty",
                  teamId: leftTeamId!,
                })
              }}
              disabled={!leftTeamId}
            >
              Plagiarism
            </Button>
            <Button
              color="gray"
              variant="outline"
              onClick={() => {
                updateDecisionMutation.mutateAsync({
                  decision: null,
                  teamId: leftTeamId!,
                })
              }}
              disabled={!leftTeamId}
            >
              Undecided
            </Button>
            <Button
              color="#087F5B"
              variant="filled"
              onClick={() => {
                updateDecisionMutation.mutateAsync({
                  decision: "Innocent",
                  teamId: leftTeamId!,
                })
              }}
              disabled={!leftTeamId}
            >
              No Plagiarism
            </Button>
          </Group>

          <Group>
            <Button
              color="red"
              variant="filled"
              onClick={() => {
                updateDecisionMutation.mutateAsync({
                  decision: "Guilty",
                  teamId: rightTeamId!,
                })
              }}
              disabled={!rightTeamId}
            >
              Plagiarism
            </Button>
            <Button
              color="gray"
              variant="outline"
              onClick={() => {
                updateDecisionMutation.mutateAsync({
                  decision: null,
                  teamId: rightTeamId!,
                })
              }}
              disabled={!rightTeamId}
            >
              Undecided
            </Button>
            <Button
              color="#087F5B"
              variant="filled"
              onClick={() => {
                updateDecisionMutation.mutateAsync({
                  decision: "Innocent",
                  teamId: rightTeamId!,
                })
              }}
              disabled={!rightTeamId}
            >
              No Plagiarism
            </Button>
          </Group>
        </Group>
      </Stack>
    </div>
  )
}
