import { Chess } from "chess.js"
import { exec, spawn } from "child_process"

export const dynamic = 'force-dynamic' // defaults to auto

export async function POST(request: Request) {
  const body = await request.json()
  exec("find / -type d -name 'stockfish-ubuntu-x86-64'", (error, stdout, stderr) => {
    if (error) {
      console.error(`exec error: ${error}`)
      return
    }
    console.log(`stdout: ${stdout}`)
    console.error(`stderr: ${stderr}`)
  })
  // const chess = new Chess()
  // chess.loadPgn(body)
  // const moves = chess.history({ verbose: true })
  // type Evaluation = {
  //   bestMove: string | null
  //   bestScore: string | null
  //   score: string | null
  // }

  // const getEvaluations: Promise<Evaluation[][]> = new Promise((resolve) => {
  //   const evaluations: Evaluation[] = []
  //   let bestMovesCount = 0

  //   for (let i = 0; i < moves.length; i++) {
  //     let stockfishPath
  //     if (process.env.NODE_ENV === "development") {
  //       stockfishPath = "stockfish-windows-x86-64/stockfish/stockfish-windows-x86-64-avx2.exe"
  //     } else stockfishPath = ".vercel/output/static/stockfish-ubuntu-x86-64/stockfish/src/stockfish"
  //     const stockfish = spawn(stockfishPath)

  //     const now = Date.now()

  //     stockfish.stdout.on('data', (data) => {
  //       if (data.includes("bestmove")) {
  //         const dataArray = data.toString().split(" ")
  //         const bestMove = dataArray[dataArray.findIndex((x: string) => x.includes("bestmove")) + 1].substring(0, 4)
  //         const isWhite = i % 2 !== 1
  //         if (evaluations[i]) {
  //           evaluations[i].bestMove = bestMove
  //         } else {
  //           if (dataArray.includes("score")) {
  //             let bestScore
  //             if (dataArray.includes("mate")) {
  //               const value = dataArray[dataArray.findIndex((x: string) => x.includes("mate")) + 1]
  //               if (value.startsWith("-")) {
  //                 if (isWhite) bestScore = `-M${value.substring(1, value.length)}`
  //                 else bestScore = `M${value.substring(1, value.length)}`
  //               }
  //               else {
  //                 if (isWhite) bestScore = `M${value}`
  //                 else bestScore = `-M${value}`
  //               }
  //             } else bestScore = (parseInt(dataArray[dataArray.findIndex((x: string) => x.includes("cp")) + 1]) / (isWhite ? 100 : -100)).toString()
  //             evaluations[i] = {
  //               bestMove: bestMove,
  //               bestScore: bestScore,
  //               score: null
  //             }
  //           } else {
  //             console.log(dataArray)
  //             evaluations[i] = {
  //               bestMove: bestMove,
  //               bestScore: null,
  //               score: null
  //             }
  //           }
  //         }
  //         bestMovesCount++
  //         if (bestMovesCount === moves.length) {
  //           console.log(`Time taken: ${Date.now() - now}ms`)
  //           for (let i = 1; i < evaluations.length; i++) {
  //             evaluations[i - 1].score = evaluations[i].bestScore
  //           }
  //           const ret: Evaluation[][] = []
  //           for (let i = 0; i < evaluations.length / 2; i++) {
  //             ret.push([evaluations[i * 2], evaluations[i * 2 + 1]])
  //           }
  //           resolve(ret)
  //         }
  //         stockfish.kill()
  //       } else if (data.toString().includes("info depth 15")) {
  //         const dataArray = data.toString().split(" ")
  //         const isWhite = i % 2 !== 1
  //         let bestScore
  //         if (dataArray.includes("mate")) {
  //           const value = dataArray[dataArray.findIndex((x: string) => x.includes("mate")) + 1]
  //           if (value.startsWith("-")) {
  //             if (isWhite) bestScore = `-M${value.substring(1, value.length)}`
  //             else bestScore = `M${value.substring(1, value.length)}`
  //           }
  //           else {
  //             if (isWhite) bestScore = `M${value}`
  //             else bestScore = `-M${value}`
  //           }
  //         }
  //         else bestScore = (parseInt(dataArray[dataArray.findIndex((x: string) => x.includes("cp")) + 1]) / (isWhite ? 100 : -100)).toString()
  //         evaluations[i] = {
  //           bestMove: null,
  //           bestScore: bestScore,
  //           score: null
  //         }
  //       }
  //     })

  //     stockfish.stderr.on('data', (data) => {
  //       console.error(`stderr: ${data}`)
  //     })

  //     // Function to send commands to Stockfish
  //     const sendCommandToStockfish = (command: string) => {
  //       stockfish.stdin.write(command + '\n');
  //     }

  //     sendCommandToStockfish(`position fen ${moves[i].before}`)
  //     sendCommandToStockfish(`go depth 15`)
  //   }
  // })

  const evaluations = ["test"]
  return Response.json(evaluations)
}