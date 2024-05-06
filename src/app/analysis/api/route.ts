import { Chess } from "chess.js"
import { spawn } from "child_process"

export const dynamic = 'force-dynamic' // defaults to auto

enum MoveType {
  Best = "Best",
  Excellent = "Excellent",
  Good = "Good",
  Inaccuracy = "Inaccuracy",
  Mistake = "Mistake",
  Blunder = "Blunder"
}

type Evaluation = {
  bestMove: string | null
  bestScore: string | null
  score: string | null
  moveType: MoveType | null
  bestWinChance: number | null
  winChance: number | null
}

const getMoveType = (diff: number) => {
  if (diff === 0) return MoveType.Best
  if (diff < 0.02) return MoveType.Excellent
  if (diff < 0.05) return MoveType.Good
  if (diff < 0.1) return MoveType.Inaccuracy
  if (diff < 0.2) return MoveType.Mistake
  else return MoveType.Blunder
}

const getWinChance = (score: string | null) => {
  if (!score) return 0
  if (score.includes("M")) return score.startsWith("-") ? 0 : 1
  return 0.5 + 0.5 * ((2 / (1 + Math.pow(Math.E, -0.32 * parseFloat(score)))) - 1)
}

export async function POST(request: Request) {
  const body = await request.json()

  const chess = new Chess()
  chess.loadPgn(body)
  const moves = chess.history({ verbose: true })
  const depth = 15

  const getEvaluations: Promise<Evaluation[][]> = new Promise((resolve) => {
    const evaluations: Evaluation[] = []
    const stockfishPath = "stockfish-windows-x86-64-avx2/stockfish/stockfish-windows-x86-64-avx2.exe"
    const now = Date.now()
    const stockfish = spawn(stockfishPath)
    let moveIndex = 0

    stockfish.stdout.on("data", (data) => {
      if (data.includes('bestmove') && moveIndex < moves.length + 1) {
        const dataArray = data.toString().split(" ")
        const bestMove = dataArray[dataArray.findIndex((x: string) => x.includes("bestmove")) + 1].substring(0, 4)
        const isWhite = moveIndex % 2 !== 1
        if (dataArray.includes("score")) {
          let bestScore
          if (dataArray.includes("mate")) {
            const value = dataArray[dataArray.findIndex((x: string) => x.includes("mate")) + 1]
            if (value.startsWith("-")) {
              if (isWhite) bestScore = `-M${value.substring(1, value.length)}`
              else bestScore = `M${value.substring(1, value.length)}`
            }
            else {
              if (isWhite) bestScore = `M${value}`
              else bestScore = `-M${value}`
            }
          } else bestScore = (parseInt(dataArray[dataArray.findIndex((x: string) => x.includes("cp")) + 1]) / (isWhite ? 100 : -100)).toString()
          evaluations[moveIndex] = {
            bestMove: bestMove,
            bestScore: bestScore,
            score: null,
            moveType: null,
            bestWinChance: getWinChance(bestScore),
            winChance: null
          }
        } else console.log("no score")
        moveIndex++
        if (evaluations.length === moves.length + 1) {
          console.log(`Time taken: ${Date.now() - now}ms`)
          for (let i = 0; i < evaluations.length - 1; i++) {
            evaluations[i].score = evaluations[i + 1].bestScore
          }
          evaluations.pop()
          const ret: Evaluation[][] = []
          for (let i = 0; i < evaluations.length / 2; i++) {
            const whiteIndex = i * 2
            const blackIndex = i * 2 + 1
            evaluations[whiteIndex].winChance = getWinChance(evaluations[whiteIndex].score)
            evaluations[whiteIndex].moveType = getMoveType(Math.abs(getWinChance(evaluations[whiteIndex].bestScore) - getWinChance(evaluations[whiteIndex].score)))
            if (evaluations[blackIndex]) {
              evaluations[blackIndex].winChance = getWinChance(evaluations[blackIndex].score)
              evaluations[blackIndex].moveType = getMoveType(Math.abs(getWinChance(evaluations[blackIndex].bestScore) - getWinChance(evaluations[blackIndex].score)))
            }
            ret.push([evaluations[whiteIndex], evaluations[blackIndex]])
          }
          resolve(ret)
        } else if (evaluations.length === moves.length) {
          stockfish.stdin.write(`position fen ${moves[moves.length - 1].after}\n`)
          stockfish.stdin.write(`go depth ${depth}\n`)
        } else {
          stockfish.stdin.write(`position fen ${moves[moveIndex].before}\n`)
          stockfish.stdin.write(`go depth ${depth}\n`)
        }
      }
    })

    stockfish.stderr.on("data", (data) => {
      console.error(`stderr: ${data}`)
    })

    stockfish.on("close", (code) => {
      console.log(`child process exited with code ${code}`)
    })

    // Function to send commands to Stockfish
    const sendCommandToStockfish = (command: string) => {
      stockfish.stdin.write(command + '\n');
    }

    sendCommandToStockfish(`position fen ${moves[0].before}\n`)
    sendCommandToStockfish(`go depth ${depth}\n`)
  })

  const evaluations = await getEvaluations
  return Response.json(evaluations)
}