/**
 * In-memory session store for Jira OAuth tokens.
 *
 * NOTE: This works for local development and single-instance deploys.
 * For production multi-instance Vercel deploy, replace with Redis/Upstash.
 */

export interface SessionData {
  accessToken: string
  refreshToken: string
  cloudId: string
  jiraBaseUrl: string   // https://api.atlassian.com/ex/jira/{cloudId}/rest/api/3
  cloudUrl: string      // https://xxx.atlassian.net
  expiresAt: number     // unix ms
  user: {
    name: string
    email: string
    avatarUrl?: string
  }
}

// Use a global var so the Map survives Next.js hot-reloads in dev
declare global {
  // eslint-disable-next-line no-var
  var __jiraSessionStore: Map<string, SessionData> | undefined
}

const store: Map<string, SessionData> =
  globalThis.__jiraSessionStore ?? (globalThis.__jiraSessionStore = new Map())

export function setSession(id: string, data: SessionData): void {
  store.set(id, data)
}

export function getSession(id: string): SessionData | undefined {
  return store.get(id)
}

export function deleteSession(id: string): void {
  store.delete(id)
}

/**
 * Returns the session, refreshing the access token if it's about to expire.
 * Returns null if the session doesn't exist or refresh fails.
 */
export async function refreshIfNeeded(sessionId: string): Promise<SessionData | null> {
  const session = store.get(sessionId)
  if (!session) return null

  // Still valid — more than 5 min left
  if (Date.now() < session.expiresAt - 5 * 60 * 1000) return session

  console.log('[tokenStore] Access token expiring — refreshing...')

  try {
    const res = await fetch('https://auth.atlassian.com/oauth/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        grant_type: 'refresh_token',
        client_id: process.env.JIRA_CLIENT_ID,
        client_secret: process.env.JIRA_CLIENT_SECRET,
        refresh_token: session.refreshToken,
      }),
    })

    const data = await res.json()
    if (!data.access_token) {
      console.error('[tokenStore] Refresh failed:', data)
      store.delete(sessionId)
      return null
    }

    const updated: SessionData = {
      ...session,
      accessToken: data.access_token,
      refreshToken: data.refresh_token ?? session.refreshToken,
      expiresAt: Date.now() + data.expires_in * 1000,
    }
    store.set(sessionId, updated)
    console.log('[tokenStore] Token refreshed successfully')
    return updated
  } catch (err) {
    console.error('[tokenStore] Refresh error:', err)
    store.delete(sessionId)
    return null
  }
}
