// GET /challenges?user_id=1234
export type GetChallengesInput = {
  userId: number
  //sort: "endDate" | "branchName"
  //page: number
  //limit: number
}

export type GetChallengesOutput = {
  id: number
  name: string
  startDate: string //"2024-06-01 00:00:00"
  endDate: string //"2024-06-01 00:00:00"
  branchName: string
  plagiarismCheckStatus: "Running" | "Finished" | "Archived"
}[]

// GET /plagiarism-check?challengeId=1234
export type GetPlagiarismCheckInput = {
  challengeId: number
}

export type Team = {
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
}

export type GetPlagiarismCheckOutput = {
  challengeId: number
  id: number // id of the plagiarism check

  // n^2 entries
  codeComparisons: {
    id: number
    teamA: {
      id: number
    }
    teamB: {
      id: number
    }
    similarity: number
  }[]

  // n entries
  teams: Team[]
}

// PATCH /decision/{challengeId}/{teamId}
export type PatchDecisionInput = {
  teamId: number
  challengeId: number
  supervisorId: number
  decision: "Guilty" | "Innocent" | null
}

export type PatchDecisionOutput = null

// PATCH /decision/{challengeId}
export type BatchPatchDecisionInput = {
  challengeId: number
  supervisorId: number
}

export type BatchPatchDecisionOutput = null

// POST /plagiarism-check/initiate/challenge
export type InitiatePlagiarismCheckInput = {
  userId: number
  challengeId: number
  engineId: number
  rerun: boolean
}

export type InitiatePlagiarismCheckOutput = null

// GET /available-engines
export type GetAvailableEnginesInput = null

export type GetAvailableEnginesOutput = {
  id: number
  name: string
  version: string
}[]

// GET /users
export type GetUsersInput = null

export type GetUsersOutput = {
  id: number
  firstName: string
  lastName: string
}[]

// GET /code
export type GetCodeInput = {
  challengeId: number
  teamId: number
}

export type GetCodeOutput = string
