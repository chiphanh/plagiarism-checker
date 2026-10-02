import { Accordion, AccordionControl, Button, Group, Text } from "@mantine/core"
import { DataTable } from "mantine-datatable"
import { useRouter } from "next/navigation"
import React from "react"
import { GetPlagiarismCheckOutput } from "../../api/types"

function Clusters({
  data,
  threshold,
}: {
  data: GetPlagiarismCheckOutput
  threshold: number
}) {
  const filteredTuples = data.codeComparisons.filter(
    ({ similarity }) => similarity >= threshold
  )
  const router = useRouter()
  const graph = new Map()

  const goToCluster = (
    event: React.MouseEvent,
    subset: {
      id: number
      teamA: {
        id: number
      }
      teamB: {
        id: number
      }
      similarity: number
    }[]
  ) => {
    event.stopPropagation()
    const teamIds = Array.from(
      new Set(
        subset.flatMap((record) => [
          record.teamA.id.toString(),
          record.teamB.id.toString(),
        ])
      )
    )

    const searchParams = new URLSearchParams()
    searchParams.append("challengeId", data.challengeId.toString())
    teamIds.forEach((teamId) => searchParams.append("teamId", teamId))
    console.log(searchParams)
    router.push(`/compare?${searchParams.toString()}`)
  }

  filteredTuples.forEach((record1, i) => {
    filteredTuples.forEach((record2, j) => {
      if (
        i !== j &&
        (record1.teamA.id === record2.teamB.id ||
          record1.teamA.id === record2.teamA.id ||
          record1.teamB.id === record2.teamB.id ||
          record1.teamB.id === record2.teamA.id)
      ) {
        if (!graph.has(i)) graph.set(i, [])
        if (!graph.has(j)) graph.set(j, [])
        graph.get(i).push(j)
        graph.get(j).push(i)
      }
    })
  })

  const dfs = (node: number, visited: Set<number>, component: number[]) => {
    visited.add(node)
    component.push(node)
    for (const neighbor of graph.get(node) || []) {
      if (!visited.has(neighbor)) {
        dfs(neighbor, visited, component)
      }
    }
  }

  const visited: Set<number> = new Set()
  const subsets = []

  for (let i = 0; i < filteredTuples.length; i++) {
    if (!visited.has(i)) {
      const component: number[] = []
      dfs(i, visited, component)
      subsets.push(component.map((index) => filteredTuples[index]))
    }
  }
  const sortedSubsets = subsets.sort(
    (a, b) => b[0].similarity - a[0].similarity
  )
  const renderClusters = () => {
    return sortedSubsets.map((subset, index) => (
      <div key={index}>
        <Accordion.Item value={`Cluster ${index + 1}`}>
          <AccordionControl>
            <Group justify="space-between">
              <Text>Cluster {index + 1}</Text>
              <Button
                variant="filled"
                size="xs"
                color="#087F5B"
                style={{ marginLeft: "10px" }}
                onClick={(event) => goToCluster(event, subset)}
              >
                Inspect
              </Button>
            </Group>
          </AccordionControl>
          <Accordion.Panel>
            <DataTable
              withTableBorder
              borderRadius="lg"
              shadow="sm"
              striped
              horizontalSpacing="xs"
              verticalSpacing="xs"
              verticalAlign="center"
              textSelectionDisabled
              columns={[
                {
                  accessor: "teamA.leader",
                  title: "Team A",
                  render: (value) => {
                    const team = data.teams.find(
                      (team) => team.id === value.teamA.id
                    )
                    return team?.leaderNickname
                  },
                },
                {
                  accessor: "teamB.leader",
                  title: "Team B",
                  render: (value) => {
                    const team = data.teams.find(
                      (team) => team.id === value.teamB.id
                    )
                    return team?.leaderNickname
                  },
                },
                {
                  accessor: "similarity",
                  title: "Similarity",
                  render: (value) => `${Math.floor(value.similarity * 100)}%`,
                },
              ]}
              records={subset}
            />
          </Accordion.Panel>
        </Accordion.Item>
      </div>
    ))
  }

  return (
    <Accordion
      variant="separated"
      radius="xs"
      chevronPosition="left"
      defaultValue="Cluster 1"
    >
      {renderClusters()}
    </Accordion>
  )
}

export default Clusters
