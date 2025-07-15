import { jwtVerify, SignJWT } from "jose"

const secretKey = process.env.JWT_SECRET || "your-secret-key"
const encodedKey = new TextEncoder().encode(secretKey)

export interface SessionPayload {
  fullName: string
  phoneNumber: string
  verified: boolean
  voterId: string
  iat?: number
  exp?: number
}

export async function encrypt(payload: SessionPayload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("24h")
    .sign(encodedKey)
}

export async function decrypt(session: string | undefined = "") {
  try {
    const { payload } = await jwtVerify(session, encodedKey, {
      algorithms: ["HS256"],
    })
    return payload as SessionPayload
  } catch (error) {
    console.log("Failed to verify session")
    return null
  }
}

export async function createSession(userId: string, userData: Omit<SessionPayload, "voterId">) {
  const session = await encrypt({
    ...userData,
    voterId: userId,
  })

  return session
}
