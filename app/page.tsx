'use client'

import { Suspense, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import HeroSection from '@/components/HeroSection'
import AppSection from '@/components/AppSection'
import LinkedInFooter from '@/components/LinkedInFooter'
import GitHubBadge from '@/components/GitHubBadge'
import type { UserInfo, JiraStatusResult } from '@/lib/types'

function PageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null)
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    const jiraParam = searchParams.get('jira')
    const errorParam = searchParams.get('error')

    if (errorParam) {
      console.error('[page] OAuth error:', errorParam)
      router.replace('/')
      setChecking(false)
      return
    }

    // After OAuth redirect back, or on every load — verify server session
    checkStatus().finally(() => {
      if (jiraParam === 'connected') router.replace('/')
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function checkStatus() {
    try {
      const res = await fetch('/api/jira/status')
      const data: JiraStatusResult = await res.json()
      if (data.connected && data.user) {
        setUserInfo(data.user)
        localStorage.setItem('userInfo', JSON.stringify(data.user))
      } else {
        // Server session gone — clear cached state
        localStorage.removeItem('userInfo')
        setUserInfo(null)
      }
    } catch (err) {
      console.error('[page] Status check failed:', err)
    } finally {
      setChecking(false)
    }
  }

  function initiateOAuth() {
    // Server-side route builds and initiates the Atlassian OAuth redirect
    window.location.href = '/api/auth'
  }

  async function logout() {
    try {
      await fetch('/api/logout', { method: 'POST' })
    } catch {
      // Ignore network errors on logout
    }
    localStorage.removeItem('userInfo')
    setUserInfo(null)
  }

  // Avoid flash of wrong state while checking session
  if (checking) return null

  return (
    <main>
      {userInfo ? (
        <AppSection userInfo={userInfo} onLogout={logout} />
      ) : (
        <HeroSection onLogin={initiateOAuth} />
      )}
      <GitHubBadge />
      <LinkedInFooter />
    </main>
  )
}

export default function Page() {
  return (
    <Suspense>
      <PageContent />
    </Suspense>
  )
}
