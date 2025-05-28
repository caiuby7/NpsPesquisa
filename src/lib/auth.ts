import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret'

export function signToken(payload: object) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '24h' })
}

export function verifyToken(token: string) {
  try {
    return jwt.verify(token, JWT_SECRET)
  } catch {
    return null
  }
}
