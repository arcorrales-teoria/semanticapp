import { NextResponse } from 'next/server'

// Classic scopes — work out of the box with any Jira OAuth 2.0 (3LO) app
// without needing extra "Permissions" configuration in the Atlassian console.
const SCOPES = 'read:jira-work write:jira-work read:jira-user offline_access'

export function GET() {
  const redirectUri = process.env.NEXT_PUBLIC_JIRA_REDIRECT_URI!
  const clientId = process.env.JIRA_CLIENT_ID!

  const url = new URL('https://auth.atlassian.com/authorize')
  url.searchParams.set('audience', 'api.atlassian.com')
  url.searchParams.set('client_id', clientId)
  url.searchParams.set('scope', SCOPES)
  url.searchParams.set('redirect_uri', redirectUri)
  url.searchParams.set('response_type', 'code')
  url.searchParams.set('prompt', 'consent')

  console.log('[/api/auth] Redirecting to Atlassian OAuth...')
  return NextResponse.redirect(url.toString())
}
