import axios from "axios"
import {
  BatchPatchDecisionInput,
  GetAvailableEnginesOutput,
  GetChallengesInput,
  GetChallengesOutput,
  GetCodeInput,
  GetCodeOutput,
  GetPlagiarismCheckInput,
  GetPlagiarismCheckOutput,
  GetUsersOutput,
  InitiatePlagiarismCheckInput,
  InitiatePlagiarismCheckOutput,
  PatchDecisionInput,
} from "./types"

export async function getChallenges(
  input: GetChallengesInput
): Promise<GetChallengesOutput> {
  const response = await axios.get(
    `${process.env.NEXT_PUBLIC_API_URL}/challenges`,
    {
      params: {
        userId: input.userId,
      },
    }
  )
  return response.data
}

export async function getUsers(): Promise<GetUsersOutput> {
  const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/users`)
  return response.data
}

export async function initiatePlagiarismCheck(
  input: InitiatePlagiarismCheckInput
): Promise<InitiatePlagiarismCheckOutput> {
  const response = await axios.post(
    `${process.env.NEXT_PUBLIC_API_URL}/initiate-check`,
    {
      userId: input.userId,
      challengeId: input.challengeId,
      engineId: input.engineId,
      rerun: input.rerun,
    }
  )
  return response.data
}

export async function getPlagiarismCheck(
  input: GetPlagiarismCheckInput
): Promise<GetPlagiarismCheckOutput> {
  const response = await axios.get(
    `${process.env.NEXT_PUBLIC_API_URL}/plagiarism-check`,
    {
      params: {
        challengeId: input.challengeId,
      },
    }
  )
  return response.data
}

export async function getAvailableEngines(): Promise<GetAvailableEnginesOutput> {
  const response = await axios.get(
    `${process.env.NEXT_PUBLIC_API_URL}/available-engines`
  )
  return response.data
}

export async function getCodeByTeamId(
  input: GetCodeInput
): Promise<GetCodeOutput> {
  const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/code`, {
    params: {
      challengeId: input.challengeId,
      teamId: input.teamId,
    },
  })
  return response.data
}

export async function updateDecision(input: PatchDecisionInput) {
  const response = await axios.patch(
    `${process.env.NEXT_PUBLIC_API_URL}/decision/${input.challengeId}/${input.teamId}`,
    {
      decision: input.decision,
      supervisorId: 0,
    }
  )
  return response.data
}

export async function batchUpdateDecision(input: BatchPatchDecisionInput) {
  const response = await axios.patch(
    `${process.env.NEXT_PUBLIC_API_URL}/decision/${input.challengeId}`,
    {
      supervisorId: 0,
    }
  )
  return response.data
}
