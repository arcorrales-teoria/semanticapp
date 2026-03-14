import { NextRequest, NextResponse } from 'next/server'
import { refreshIfNeeded } from '@/lib/tokenStore'

export async function GET(req: NextRequest) {
  const sessionId = req.cookies.get('jira_session')?.value
  if (!sessionId) {
    return NextResponse.json({ error: 'No session' }, { status: 401 })
  }

  const session = await refreshIfNeeded(sessionId)
  if (!session) {
    return NextResponse.json({ error: 'Session expired — please reconnect Jira' }, { status: 401 })
  }

  try {
    const res = await fetch(
      `${session.jiraBaseUrl}/project/search?maxResults=50&orderBy=name&expand=`,
      {
        headers: {
          Authorization: `Bearer ${session.accessToken}`,
          Accept: 'application/json',
        },
      }
    )

    if (!res.ok) {
      const body = await res.text()
      console.error('[/api/jira/projects] Jira error:', res.status, body)
      return NextResponse.json({ error: `Jira error: ${res.status}` }, { status: res.status })
    }

    const data = await res.json()
    const projects = (data.values ?? []).map((p: { id: string; name: string; key: string }) => ({
      id: p.id,
      name: p.name,
      key: p.key,
    }))

    console.log(`[/api/jira/projects] Returned ${projects.length} projects`)
    return NextResponse.json({ projects })
  } catch (err) {
    console.error('[/api/jira/projects] Fetch error:', err)
    return NextResponse.json({ error: 'Failed to fetch projects' }, { status: 500 })
  }
}
