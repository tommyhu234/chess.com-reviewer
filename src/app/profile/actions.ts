'use server'

export async function getLichessUrl(pgn: string) {
  const encodedKey = encodeURIComponent("pgn")
  const encodedValue = encodeURIComponent(pgn);

  const formBody = `${encodedKey}=${encodedValue}`

  const response = await fetch("https://lichess.org/api/import", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: formBody
  })

  if (!response.ok) {
    throw new Error(`Failed to import game to lichess ${response.status}`)
  }

  return response.url
}