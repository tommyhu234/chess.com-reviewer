import { Chess } from "chess.js"
import Board from "./board"
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
  const chess = new Chess()
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

  chess.loadPgn(game.pgn)
  const history = chess.history()

  const moves = []
  for (let i = 0; i < history.length / 2; i++) {
    moves.push([history[i * 2], history[i * 2 + 1]])
  }

  return (
    <main className="h-screen flex items-center justify-center py-4">
      <div className="w-[21%]"></div>
      <div className="w-[54rem] mr-8">
        <Board />
      </div>
      <div className="w-[40%] h-full">
        <div className="flex-col w-[75%] h-full bg-red-500">
          <div className="text-xl font-semibold text-center text-white py-2.5 bg-secondary-dark rounded-t">Analysis</div>
          <div className="px-3 py-1 text-xs text-white bg-secondary">
            {
              moves.map((move, index) => {
                return (
                  <div key={`${index}-${move}`} className={`flex px-3 py-[7px] ${index % 2 === 0 ? "bg-secondary" : "bg-[#454441]"}`}>
                    <div className="text-[#9E9E9C] font-semibold w-[3rem]">{index + 1}.</div>
                    <div className="text-white font-semibold w-[5rem]">{move[0]}</div>
                    <div className="text-white font-semibold w-[5rem]">{move[1] || '0'}</div>
                  </div>
                )
              })
            }
          </div>
        </div>
      </div>
    </main>
  )
}