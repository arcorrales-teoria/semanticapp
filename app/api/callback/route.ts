import { NextRequest, NextResponse } from 'next/server'
import { randomUUID } from 'crypto'
import { setSession } from '@/lib/tokenStore'

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get('code')

  if (!code) {
    console.error('[/api/callback] Missing code param')
    return NextResponse.redirect(new URL('/?error=no_code', req.nextUrl))
  }

  // ── 1. Exchange code for tokens ──────────────────────────────────────────
  let tokenData: Record<string, unknown>
  try {
    const tokenRes = await fetch('https://auth.atlassian.com/oauth/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        grant_type: 'authorization_code',
        client_id: process.env.JIRA_CLIENT_ID,
        client_secret: process.env.JIRA_CLIENT_SECRET,
        code,
        redirect_uri: process.env.NEXT_PUBLIC_JIRA_REDIRECT_URI,
      }),
    })
    tokenData = await tokenRes.json()
  } catch (err) {
    console.error('[/api/callback] Token exchange error:', err)
    return NextResponse.redirect(new URL('/?error=token_exchange_failed', req.nextUrl))
  }

  if (!tokenData.access_token) {
    console.error('[/api/callback] No access_token in response:', tokenData)
    return NextResponse.redirect(new URL('/?error=token_failed', req.nextUrl))
  }

  const accessToken = tokenData.access_token as string
  const refreshToken = (tokenData.refresh_token as string) ?? ''
  const expiresIn = (tokenData.expires_in as number) ?? 3600

  // ── 2. Get accessible Jira resources (cloudId + cloudUrl) ────────────────
  let resources: Array<{ id: string; name: string; url: string }>
  try {
    const resourcesRes = await fetch(
      'https://api.atlassian.com/oauth/token/accessible-resources',
      { headers: { Authorization: `Bearer ${accessToken}`, Accept: 'application/json' } }
    )
    resources = await resourcesRes.json()
  } catch (err) {
    console.error('[/api/callback] Resources fetch error:', err)
    return NextResponse.redirect(new URL('/?error=resources_failed', req.nextUrl))
  }

  if (!resources?.[0]) {
    console.error('[/api/callback] No accessible resources found')
    return NextResponse.redirect(new URL('/?error=no_resources', req.nextUrl))
  }

  const { id: cloudId, url: cloudUrl } = resources[0]
  const jiraBaseUrl = `https://api.atlassian.com/ex/jira/${cloudId}/rest/api/3`

  // ── 3. Get user profile ───────────────────────────────────────────────────
  let user = { name: 'Usuario', email: '', avatarUrl: '' }
  try {
    const meRes = await fetch('https://api.atlassian.com/me', {
      headers: { Authorization: `Bearer ${accessToken}`, Accept: 'application/json' },
    })
    const me = await meRes.json()
    console.log('[/api/callback] /me response:', JSON.stringify(me))
    user = {
      name: me.name ?? me.display_name ?? me.displayName ?? me.nickname ?? 'Usuario',
      email: me.email ?? me.emailAddress ?? '',
      avatarUrl: me.picture ?? me.avatarUrls?.['48x48'] ?? '',
    }
  } catch {
    console.warn('[/api/callback] Could not fetch user profile — using defaults')
  }

  // ── 4. Store session ──────────────────────────────────────────────────────
  const sessionId = randomUUID()
  setSession(sessionId, {
    accessToken,
    refreshToken,
    cloudId,
    jiraBaseUrl,
    cloudUrl,
    expiresAt: Date.now() + expiresIn * 1000,
    user,
  })
  console.log(`[/api/callback] Session created for ${user.email} — cloudId: ${cloudId}`)

  // ── 5. Set httpOnly cookie and redirect ───────────────────────────────────
  const response = NextResponse.redirect(new URL('/?jira=connected', req.nextUrl))
  response.cookies.set('jira_session', sessionId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60, // 7 days
    path: '/',
  })

  return response
}
