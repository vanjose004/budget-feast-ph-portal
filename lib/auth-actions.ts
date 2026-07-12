'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { isValidCredentials, SESSION_COOKIE_NAME, SESSION_COOKIE_VALUE, SESSION_MAX_AGE } from '@/lib/auth'

export async function login(username: string, password: string) {
  if (!isValidCredentials(username, password)) {
    return { error: 'Invalid username or password.' }
  }

  const cookieStore = await cookies()
  cookieStore.set(SESSION_COOKIE_NAME, SESSION_COOKIE_VALUE, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_MAX_AGE,
  })

  return { error: null }
}

export async function logout() {
  const cookieStore = await cookies()
  cookieStore.delete(SESSION_COOKIE_NAME)
  redirect('/login')
}
