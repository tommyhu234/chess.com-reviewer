import AnalysisChess from "./analysis_chess"
const stockfish = require("stockfish")

const { signal } = new AbortController()

async function getAPIData(url: string) {
  const response = await fetch(url, {
    signal: signal,
    cache: "no-store",
    headers: {
      "User-Agent": "Chess.com Analyzer"
    }
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch data from ${url}`)
  }

  return response.json()
}

export default async function Analysis({ searchParams }: { searchParams: { [key: string]: string | string[] | undefined } }) {
  const params = atob(searchParams.game as string).split("-")
  const date = params[2].slice(0, 7).replace(".", "/")

  let game
  try {
    const monthlyGames = await getAPIData(`https://api.chess.com/pub/player/${params[0]}/games/${date}`)
    for (const gameData of monthlyGames.games) {
      if (gameData.url.split("/")[5] === params[1]) {
        game = gameData
        break
      }
    }
    if (!game) throw new Error("Game not found")
  } catch (error) {
    console.error(error)
  }

  return (
    <main className="h-screen flex items-center justify-center py-4">
      <AnalysisChess game={game.pgn} />
    </main>
  )
}