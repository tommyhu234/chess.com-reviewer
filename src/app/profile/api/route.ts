import { type NextRequest } from 'next/server'

export const dynamic = 'force-dynamic' // defaults to auto

const { signal } = new AbortController()

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const username = searchParams.get('username')
  const response = await fetch(`https://api.chess.com/pub/player/${username?.toLowerCase()}`, {
    signal: signal,
    cache: "no-store",
    headers: {
      "User-Agent": "Chess.com Analyzer"
    }
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch profile data for user ${username}`)
  }

  const data = await response.json()
  return Response.json(data)
}