import { Badge } from "@mantine/core"

function Decision({
  decision,
}: {
  decision: "Guilty" | "Innocent" | null | undefined
}) {
  let color = "grey"
  let displayed = "Undecided"
  if (decision === "Guilty") {
    color = "red"
    displayed = "Plagiarism"
  } else if (decision === "Innocent") {
    color = "#087F5B"
    displayed = "No Plagiarism"
  }
  return (
    <Badge variant="dot" color={color}>
      {displayed}
    </Badge>
  )
}

export default Decision
