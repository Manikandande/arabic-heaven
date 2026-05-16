'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import type { User, Session } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/client'

interface AuthContextType {
  user: User | null
  session: Session | null
  loading: boolean
  avatarUrl: string | null
  refreshAvatar: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
  avatarUrl: null,
  refreshAvatar: async () => {},
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser]       = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)

  async function refreshAvatar(currentUser?: User | null) {
    const u = currentUser ?? user
    if (!u) { setAvatarUrl(null); return }

    // Google OAuth users have a direct avatar_url (no storage bucket needed)
    if (u.app_metadata?.provider === 'google' && u.user_metadata?.avatar_url) {
      setAvatarUrl(u.user_metadata.avatar_url)
      return
    }

    // For uploaded avatars, generate a fresh signed URL from private storage
    const path = u.user_metadata?.avatar_path
    if (!path) { setAvatarUrl(null); return }

    const supabase = createClient()
    const { data, error } = await supabase.storage
      .from('avatars')
      .createSignedUrl(path, 60 * 60 * 24 * 7) // 7-day signed URL

    setAvatarUrl(error ? null : (data?.signedUrl ?? null))
  }

  useEffect(() => {
    const supabase = createClient()

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
      refreshAvatar(session?.user ?? null)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
      refreshAvatar(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  return (
    <AuthContext.Provider value={{ user, session, loading, avatarUrl, refreshAvatar }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
