import { useQuery } from "@tanstack/react-query"
import { getCodeByTeamId } from "../../api/wrappers"

export function useTeamCode(teamId: string | null, challengeId: string) {
  const { data } = useQuery({
    queryKey: ["getCode", { challengeId, teamId }],
    queryFn: () => {
      if (!teamId) {
        return Promise.resolve("")
      }
      return getCodeByTeamId({
        challengeId: parseInt(challengeId),
        teamId: parseInt(teamId),
      })
    },
  })

  return data ?? ""
}
