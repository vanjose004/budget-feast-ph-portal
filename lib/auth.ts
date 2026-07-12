export const SESSION_COOKIE_NAME = 'bf_session'
export const SESSION_COOKIE_VALUE = 'authenticated'
export const SESSION_MAX_AGE = 60 * 60 * 24 * 7 // 7 days

export const CREDENTIALS = {
  username: 'vanjose004',
  password: 'Godprovides010496!',
}

export function isValidCredentials(username: string, password: string) {
  return username === CREDENTIALS.username && password === CREDENTIALS.password
}
