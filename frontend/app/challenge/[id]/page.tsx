"use client"
import {
  Button,
  Center,
  Divider,
  Grid,
  Group,
  Loader,
  Paper,
  Slider,
  Stack,
  Text,
  ThemeIcon,
  Title,
  Tooltip,
} from "@mantine/core"
import { IconInfoCircleFilled } from "@tabler/icons-react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useState } from "react"
import { GetPlagiarismCheckOutput } from "../../../api/types"
import {
  batchUpdateDecision,
  getChallenges,
  getPlagiarismCheck,
} from "../../../api/wrappers"
import Chart from "../../components/Chart"
import Clusters from "../../components/Clusters"
import SortedTable from "../../components/SortedTable/SortedTable"
import { useSettings } from "../../contexts/settingsProvider"

export default function Challenge({ params }: { params: { id: string } }) {
  const {
    settings: { userId },
  } = useSettings()

  // this query should be cached by tanstack-query from the challenges page
  const { isPending: challengeLoading, data: challenge } = useQuery({
    queryKey: [`getChallenges`, { userId }],
    queryFn: function () {
      return getChallenges({ userId: userId! })
    },
    select: (data) => data.find((c) => c.id === parseInt(params.id)),
    enabled: userId !== undefined,
  })

  const { isPending: dataLoading, data } = useQuery({
    queryKey: [`getPlagiarismCheck`, { challengeId: parseInt(params.id) }],
    queryFn: function () {
      return getPlagiarismCheck({ challengeId: parseInt(params.id) })
    },
    select: (data) => {
      return {
        ...data,
        stats: getStats(data.teams),
      }
    },
    enabled: userId !== undefined,
  })

  const [threshold, setThreshold] = useState(0.95)

  const queryClient = useQueryClient()
  const batchUpdateDecisionMutation = useMutation({
    mutationFn: async () => {
      await batchUpdateDecision({
        challengeId: parseInt(params.id),
        supervisorId: 0,
      })
      queryClient.invalidateQueries({
        queryKey: [`getPlagiarismCheck`],
      })
    },
    mutationKey: ["batchUpdateDecision"],
  })

  return dataLoading || challengeLoading || !data ? (
    <Center style={{ height: "100vh" }}>
      <Loader size="xl" />
    </Center>
  ) : (
    <Stack
      style={{ minHeight: "100px" }}
      p={20}
      w={"95%"}
      justify="flex-between"
    >
      <Title>Results</Title>
      <Grid gutter="xs" justify="space-between" align="stretch">
        <Grid.Col span={{ base: 12, md: 6, lg: 3 }}>
          <Paper shadow="sm" radius="lg" withBorder p="md">
            <Title order={2}>Details</Title>
            <Text>Assignment: {challenge?.name}</Text>
            <Text style={{ marginBottom: "1rem" }}>
              Branch: {challenge?.branchName}
            </Text>
            <Text>
              Start: {new Date(challenge?.startDate!).toLocaleString()}
            </Text>
            <Text style={{ marginBottom: "1rem" }}>
              End: {new Date(challenge?.endDate!).toLocaleString()}
            </Text>
          </Paper>
        </Grid.Col>
        <Grid.Col span={{ base: 12, md: 6, lg: 3 }}>
          <Stack>
            <Paper shadow="sm" radius="lg" withBorder p="md">
              <Title order={2}>Progress</Title>
              <Text>
                Resolved cases:{" "}
                {data.teams.length -
                  data.teams.filter((team) => team.decision === null)
                    .length}{" "}
                / {data.teams.length}
              </Text>
              <Button
                variant="filled"
                size="xs"
                color="#087F5B"
                onClick={() => batchUpdateDecisionMutation.mutateAsync()}
              >
                Mark Unresolved Cases as 'No Plagiarism'
              </Button>
            </Paper>
            <Paper shadow="sm" radius="lg" withBorder p="md">
              <Title order={2}>Statistics</Title>
              <Tooltip
                multiline
                w={220}
                withArrow
                transitionProps={{ duration: 200 }}
                label="Highest Similarity between two submissions"
              >
                <Text>Maximum Similarity: {data.stats.max} %</Text>
              </Tooltip>
              <Tooltip
                multiline
                w={220}
                withArrow
                transitionProps={{ duration: 200 }}
                label="Median of the Maximum Similarity of each submission"
              >
                <Text>Median: {data.stats.median} %</Text>
              </Tooltip>
              <Tooltip
                multiline
                w={220}
                withArrow
                transitionProps={{ duration: 200 }}
                label="The value under which 75% of the highest Similarities are found when arranged in increasing order"
              >
                <Text>Upper Quartile: {data.stats.upperQuartile} %</Text>
              </Tooltip>
              <Tooltip
                multiline
                w={220}
                withArrow
                transitionProps={{ duration: 200 }}
                label="Average of the Maximum Similarity of each submission"
              >
                <Text>Average: {data.stats.avg} %</Text>
              </Tooltip>
            </Paper>
          </Stack>
        </Grid.Col>
        <Grid.Col span={{ base: 12, md: 12, lg: 6 }}>
          <Paper shadow="sm" radius="lg" withBorder p="md">
            <Chart data={data.teams} threshold={threshold} />
          </Paper>
        </Grid.Col>
      </Grid>

      <Divider my="sm" />
      <Group justify="space-between" align="start">
        <Stack w="65%">
          <Group align="end">
            <Title>Teams</Title>
            <Text>
              ( Above Threshold:{" "}
              <Text span fw={700}>
                {
                  data?.teams.filter((team) => team.maxSimilarity >= threshold)
                    .length
                }
                /{data?.teams.length}{" "}
              </Text>
              )
            </Text>
          </Group>
          <Paper shadow="sm" radius="lg" withBorder p="xl">
            <SortedTable
              data={data}
              showSearchBar={true}
              threshold={threshold}
            ></SortedTable>
          </Paper>
        </Stack>

        <Stack w={"30%"} gap={"xl"}>
          <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
            <Title>Clusters</Title>
            <Tooltip
              multiline
              w={220}
              withArrow
              transitionProps={{ transition: "rotate-left", duration: 200 }}
              label=" Submissions are grouped into clusters based on their similarity. If a submission pair has a similarity above the threshold, they will belong to the same cluster. "
            >
              <ThemeIcon variant="transparent" size="lg" color="#087F5B">
                <IconInfoCircleFilled
                  style={{ width: "80%", height: "80%" }}
                  stroke={1.5}
                  aria-label="Info"
                />
              </ThemeIcon>
            </Tooltip>
          </div>

          <Slider
            value={threshold}
            size="md"
            color="#087F5B"
            onChange={setThreshold}
            min={0}
            max={1}
            step={0.05}
            marks={[
              { value: 0.2, label: "20%" },
              { value: 0.5, label: "50%" },
              { value: 0.8, label: "80%" },
            ]}
            inverted
            w={"25rem"}
          />

          <Clusters data={data} threshold={threshold} />
        </Stack>
      </Group>
    </Stack>
  )
}

function getStats(teams: GetPlagiarismCheckOutput["teams"]) {
  teams.sort((a, b) => a.maxSimilarity - b.maxSimilarity || a.id - b.id)

  return {
    avg: Math.floor(
      (teams.reduce((acc, team) => acc + team.maxSimilarity, 0) /
        teams.length) *
        100
    ),
    median: Math.floor(teams[Math.floor(teams.length / 2)].maxSimilarity * 100),
    upperQuartile: Math.floor(
      teams[Math.floor((teams.length * 3) / 4)].maxSimilarity * 100
    ),
    max: Math.floor(teams[teams.length - 1].maxSimilarity * 100),
  }
}
