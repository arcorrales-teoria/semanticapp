export interface UserInfo {
  name: string
  email: string
  avatarUrl?: string
}

export interface JiraProject {
  id: string
  name: string
  key: string
}

// POST /api/analyze — request body
export interface AnalyzePayload {
  transcript: string
  department: string
  projectKey: string
}

// POST /api/analyze — response
export interface AnalyzeResult {
  ok: boolean
  analysis: Record<string, unknown>
  issue_keys: string[]
  created_issues_count: number
  failed_issues: string[]
  jira_browse_url: string   // e.g. https://xxx.atlassian.net/browse/
  error?: string
}

// GET /api/jira/status — response
export interface JiraStatusResult {
  connected: boolean
  user?: UserInfo
}

// GET /api/jira/projects — response
export interface JiraProjectsResult {
  projects: JiraProject[]
  error?: string
}
