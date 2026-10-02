"use client"
import { BarChart } from "@mantine/charts"
import { Paper, Text } from "@mantine/core"

function Chart({
  data,
}: {
  data:
    | {
        id: number
        leaderNickname: string
        submissionTime: string
        students: {
          id: number
          firstName: string
          lastName: string
        }[]
        maxSimilarity: number
        decision: "Guilty" | "Innocent" | null
      }[]

  threshold: number
}) {
  const chartData = getSimilarityDistribution(data)
  return (
    <BarChart
      h={300}
      data={chartData}
      dataKey="range"
      series={[{ name: "count", color: "#087F5B" }]}
      xAxisLabel="Max Similarity"
      yAxisLabel="Amount of Submissions"
      gridAxis="x"
      xAxisProps={{ tick: CustomXAxisTick, interval: 1 }}
      tooltipProps={{
        content: ({ label, payload }) => (
          <ChartTooltip label={label} payload={payload} />
        ),
        cursor: false,
        coordinate: { x: 100, y: 200 },
      }}
    ></BarChart>
  )
}

export default Chart

function getSimilarityDistribution(
  data: {
    id: number
    leaderNickname: string
    submissionTime: string
    students: {
      id: number
      firstName: string
      lastName: string
    }[]
    maxSimilarity: number
    decision: "Guilty" | "Innocent" | null
  }[]
) {
  const distribution: number[] = new Array(20).fill(0)

  data.forEach((item) => {
    distribution[getRangeIndex(item.maxSimilarity)]++
  })

  return distribution.map((count, index) => ({
    range: `${index * 5}% - ${(index + 1) * 5}%`,
    count,
  }))
}

function getRangeIndex(similarity: number) {
  const similarityPercentage = similarity * 100

  return similarityPercentage === 100
    ? 19
    : Math.floor(similarityPercentage / 5)
}

const CustomXAxisTick = ({
  x,
  y,
  payload,
}: {
  x: number
  y: number
  payload: any
}) => {
  return (
    <g transform={`translate(${x},${y})`}>
      <text
        x={0}
        y={0}
        dy={10}
        dx={-30}
        textAnchor="start"
        fill="#666"
        transform="rotate(-35)"
      >
        {payload.value.split(" ")[0]}
      </text>
    </g>
  )
}

interface ChartTooltipProps {
  label: string
  payload: Record<string, any>[] | undefined
}

function ChartTooltip({ label, payload }: ChartTooltipProps) {
  if (!payload) return null

  return (
    <Paper px="md" py="sm" withBorder shadow="sm" radius="md">
      <Text fw={500} mb={5}>
        There are{" "}
        {payload.map((item: any) => (
          <Text span key={item.name} fw={700}>
            {item.value}
          </Text>
        ))}{" "}
        submissions that have a highest similarity in the range of{" "}
        {
          <Text span fw={700}>
            {label}
          </Text>
        }
        .
      </Text>
    </Paper>
  )
}
