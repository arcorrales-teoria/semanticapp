import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/tokenStore'

export async function GET(req: NextRequest) {
  const sessionId = req.cookies.get('jira_session')?.value
  if (!sessionId) return NextResponse.json({ connected: false })

  const session = getSession(sessionId)
  if (!session) return NextResponse.json({ connected: false })

  return NextResponse.json({
    connected: true,
    user: session.user,
  })
}
