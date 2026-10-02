import {
  Center,
  Group,
  Stack,
  Table,
  Text,
  TextInput,
  UnstyledButton,
  keys,
  rem,
} from "@mantine/core"
import {
  IconChevronDown,
  IconChevronUp,
  IconSearch,
  IconSelector,
} from "@tabler/icons-react"
import { useEffect, useState } from "react"
import { GetPlagiarismCheckOutput, Team } from "../../../api/types"
import Decision from "./../Decision"
import classes from "./SortedTable.module.css"

interface ThProps {
  children: React.ReactNode
  reversed: boolean
  sorted: boolean
  onSort(): void
}

interface RowData {
  id: number
  leaderNickname: string
  submissionTime: string
  maxSimilarity: number
  decision: "Guilty" | "Innocent" | null
}

const strOrNumCmp = (a: string | number, b: string | number) =>
  typeof a === "string"
    ? typeof b === "string"
      ? a.localeCompare(b)
      : -1
    : typeof b === "string"
    ? 1
    : a - b

function Th({ children, reversed, sorted, onSort }: ThProps) {
  const Icon = sorted
    ? reversed
      ? IconChevronUp
      : IconChevronDown
    : IconSelector
  return (
    <Table.Th className={classes.th}>
      <UnstyledButton onClick={onSort} className={classes.control}>
        <Group justify="space-between">
          <Text fw={500} fz="sm">
            {children}
          </Text>
          <Center className={classes.icon}>
            <Icon style={{ width: rem(16), height: rem(16) }} stroke={1.5} />
          </Center>
        </Group>
      </UnstyledButton>
    </Table.Th>
  )
}

function filterData(data: RowData[], search: string) {
  const query = search.toLowerCase().trim()
  return data.filter((item) =>
    keys(data[0]).some((key) =>
      item[key]?.toString().toLowerCase().includes(query)
    )
  )
}

function sortData(
  data: RowData[],
  payload: { sortBy: keyof RowData | null; reversed: boolean; search: string }
) {
  const { sortBy } = payload
  if (!sortBy) {
    return filterData(data, payload.search)
  }

  return filterData(
    [...data].sort((teamA: RowData, teamB: RowData) => {
      const a = teamA[sortBy]
      const b = teamB[sortBy]
      if (a === b) {
        return 0
      }

      if (a === null) {
        return 1
      }
      if (b === null) {
        return -1
      }
      if (!payload.reversed) {
        return strOrNumCmp(a, b)
      }
      return strOrNumCmp(b, a)
    }),
    payload.search
  )
}

function teamsToRowData(teams: Team[], threshold: number): RowData[] {
  return teams.map((team: Team) => {
    return {
      id: team.id,
      leaderNickname: team.leaderNickname,
      submissionTime: team.submissionTime,
      maxSimilarity: team.maxSimilarity,
      decision: team.decision,
      color: team.maxSimilarity >= threshold ? "#087F5B" : undefined,
    } as RowData
  })
}
function SortedTable({
  data,
  showSearchBar,
  threshold,
}: {
  data: GetPlagiarismCheckOutput
  showSearchBar: boolean
  threshold: number
}) {
  const [rowData, setRowData] = useState<RowData[]>(
    teamsToRowData(data.teams, threshold)
  )
  useEffect(() => {
    setRowData(teamsToRowData(data.teams, threshold))
  }, [data])

  const [search, setSearch] = useState("")
  const [sortBy, setSortBy] = useState<keyof RowData | null>("maxSimilarity")
  const [reverseSortDirection, setReverseSortDirection] = useState(true)
  const [sortedData, setSortedData] = useState(
    sortData(rowData, { sortBy: "maxSimilarity", reversed: true, search })
  )

  const setSorting = (field: keyof RowData) => {
    const reversed = field === sortBy ? !reverseSortDirection : false
    setReverseSortDirection(reversed)
    setSortBy(field)
    setSortedData(sortData(rowData, { sortBy: field, reversed, search }))
  }

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = event.currentTarget
    setSearch(value)
    setSortedData(
      sortData(teamsToRowData(data.teams, threshold), {
        sortBy,
        reversed: reverseSortDirection,
        search: value,
      })
    )
  }

  const rows = sortedData.map((team) => (
    <Table.Tr
      key={team.leaderNickname}
      bg={team.maxSimilarity >= threshold ? "#087F5B" : undefined}
    >
      <Table.Td>{team.leaderNickname}</Table.Td>
      <Table.Td>{Math.floor(team.maxSimilarity * 100) + "%"}</Table.Td>
      <Table.Td>{new Date(team.submissionTime).toLocaleString()}</Table.Td>
      <Table.Td>
        <Decision decision={team.decision}></Decision>
      </Table.Td>
    </Table.Tr>
  ))

  return (
    <Stack>
      {showSearchBar && (
        <TextInput
          placeholder="Search by any field"
          mb="md"
          leftSection={
            <IconSearch
              style={{ width: rem(16), height: rem(16) }}
              stroke={1.5}
            />
          }
          value={search}
          onChange={handleSearchChange}
        />
      )}

      <Table
        horizontalSpacing="md"
        verticalSpacing="xs"
        miw={700}
        layout="fixed"
      >
        <Table.Tbody>
          <Table.Tr>
            <Th
              sorted={sortBy === "leaderNickname"}
              reversed={reverseSortDirection}
              onSort={() => setSorting("leaderNickname")}
            >
              Leader's Nickname
            </Th>
            <Th
              sorted={sortBy === "maxSimilarity"}
              reversed={reverseSortDirection}
              onSort={() => setSorting("maxSimilarity")}
            >
              Maximum Similarity
            </Th>
            <Th
              sorted={sortBy === "submissionTime"}
              reversed={reverseSortDirection}
              onSort={() => setSorting("submissionTime")}
            >
              Submission Time
            </Th>
            <Th
              sorted={sortBy === "decision"}
              reversed={reverseSortDirection}
              onSort={() => setSorting("decision")}
            >
              Decision
            </Th>
          </Table.Tr>
        </Table.Tbody>
        <Table.Tbody>
          {rows.length > 0 ? (
            rows
          ) : (
            <Table.Tr>
              <Table.Td colSpan={Object.keys(data.teams[0]).length}>
                <Text fw={500} ta="center">
                  Nothing found
                </Text>
              </Table.Td>
            </Table.Tr>
          )}
        </Table.Tbody>
      </Table>
    </Stack>
  )
}

export default SortedTable
