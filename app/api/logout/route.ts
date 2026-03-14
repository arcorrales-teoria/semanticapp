import { NextRequest, NextResponse } from 'next/server'
import { deleteSession } from '@/lib/tokenStore'

export async function POST(req: NextRequest) {
  const sessionId = req.cookies.get('jira_session')?.value

  if (sessionId) {
    deleteSession(sessionId)
    console.log(`[/api/logout] Session ${sessionId} deleted`)
  }

  const res = NextResponse.json({ ok: true })
  res.cookies.delete('jira_session')
  return res
}
