'use client'

import { Chess, Move } from "chess.js"
import dynamic from "next/dynamic"
import Image from 'next/image'
import localFont from "next/font/local"
import useSWR from 'swr'
import { useEffect, useState } from "react"
import { ChessboardArrows } from "../../utils/chessboard_arrows"
import AnalysisMove from "./analysis_move"

const Chessboard = dynamic(() => import("chessboardjsx"), {
  ssr: false  // <- this do the magic ;)
})

const fetcher = (url: string, method?: string, body?: BodyInit) => fetch(url, { method: method, body: body }).then((res) => res.json())

const chessFont = localFont({ src: "../../../public/chessglyph-v3.ff9d64d4.woff2" })

const getValue = (key: string, pgn: string) => {
  const regex = new RegExp(`${key} ".+"]`)
  const match = pgn.match(regex)
  if (match !== null) return match[0].split('"')[1]
  else return ""
}

const getSquareColor = (moveType: string, light: boolean) => {
  if (moveType === "Blunder") return light ? "#F2977F" : "#B66B40"
  if (moveType === "Mistake") return light ? "#F5C895" : "#B99C56"
  if (moveType === "Miss") return light ? "#F5B29D" : "#B9865E"
  if (moveType === "Inaccuracy") return light ? "#F1D981" : "#B5AD42"
  if (moveType === "Good") return light ? "#C0D2A3" : "#84A664"
  if (moveType === "Excellent" || moveType === "Best") return light ? "#B6D18E" : "#7AA54F"
  else return light ? "#F5F682" : "#B9CA43"
}

const isLightSquare = (square: string) => {
  const file = square.charCodeAt(0) - "a".charCodeAt(0)
  const rank = parseInt(square[1]) - 1
  return (file + rank) % 2 !== 0
}

export default function AnalysisChess({ game }: { game: string }) {
  const chess = new Chess()
  chess.loadPgn(game)
  const history = chess.history({ verbose: true })
  const result = getValue("Result", game)

  const moves: Move[][] = []
  for (let i = 0; i < history.length / 2; i++) {
    moves.push([history[i * 2], history[i * 2 + 1]])
  }

  const [position, setPosition] = useState({
    fen: "start",
    move: "",
    moveType: "",
    key: "",
  })
  const [boardOrientation, setBoardOrientation] = useState("white" as "white" | "black")

  const review = useSWR(['/analysis/api', 'POST', JSON.stringify(game)], ([url, method, game]) => fetcher(url, method, game))
  const whitePlayer = useSWR(`/profile/api?username=${getValue("White", game)}`, fetcher)
  const blackPlayer = useSWR(`/profile/api?username=${getValue("Black", game)}`, fetcher)

  function Moves() {
    if (review.data) {
      return <>
        {
          moves.map((move, index) =>
            <AnalysisMove
              key={`${index}-${move}`}
              position={position}
              setPosition={setPosition}
              chessboard_arrows={chessboardArrows}
              move={move}
              boardOrientation={boardOrientation}
              index={index + 1}
              evaluation={review.data.evaluations[index]} />
          )
        }
      </>
    } else {
      return <div>Loading...</div>
    }
  }

  function Accuracies() {
    if (whitePlayer.data && blackPlayer.data) {
      return <>
        <div className="flex justify-center text-2xl font-semibold text-center space-x-3 text-white-light pt-[15px] bg-secondary">
          <Image src="/moveTypes/best.png" width={32} height={32} alt="" />
          <div>
            Game Review
          </div>
        </div>
        <div className="flex h-[84px] p-[15px] bg-secondary justify-center">
          <div className={`flex border-2 ${result === "1-0" ? "border-move-best" : "border-move-blunder"} rounded`}>
            <div className="flex flex-col bg-white w-[100px] h-[50px] rounded-l-sm items-center justify-center text-xl font-bold">
              <div className="text-xl font-bold h-[24px]">
                {review.data ? review.data.accuracies.white.toFixed(1) : '-'}
              </div>
              <div className="text-xs text-gray font-semibold">Accuracy</div>
            </div>
            <img src={whitePlayer.data.avatar || '/noavatar.gif'} className="w-[50px] h-[50px] object-cover rounded-r-sm" />
          </div>
          <div className="flex w-[65px] h-full items-center justify-center text-gray-light font-semibold text-xs">
            {result}
          </div>
          <div className={`flex border-2 ${result === "0-1" ? "border-move-best" : "border-move-blunder"} rounded`}>
            <img src={blackPlayer.data.avatar || '/noavatar.gif'} className="w-[50px] h-[50px] object-cover rounded-l-sm" />
            <div className="flex flex-col w-[100px] h-[50px] rounded-r-sm items-center justify-center">
              <div className="text-white text-xl font-bold h-[24px]">
                {review.data ? review.data.accuracies.black.toFixed(1) : '-'}
              </div>
              <div className="text-xs text-gray font-semibold">Accuracy</div>
            </div>
          </div>
        </div>
      </>
    } else return <div className="h-[131px] w-full"></div>
  }

  const getSquareStyles = () => {
    if (!position.move) return {}
    const from = position.move.slice(0, 2)
    const to = position.move.slice(2, 4)
    return {
      [from]: { backgroundColor: getSquareColor(position.moveType, isLightSquare(from)) },
      [to]: { backgroundColor: getSquareColor(position.moveType, isLightSquare(to)) }
    }
  }

  const onFlipClick = () => {
    const newBoardOrientation = boardOrientation === "white" ? "black" : "white"
    setBoardOrientation(newBoardOrientation)
    if (position.key) {
      const moveCanvas = document.getElementById('move_canvas') as HTMLCanvasElement
      const moveContext = moveCanvas?.getContext('2d')
      const key = position.key.split("-")
      chessboardArrows.drawMoveArrow(moveCanvas, moveContext, review.data.evaluations[parseInt(key[0]) - 1][parseInt(key[1])].bestMoveLan, newBoardOrientation)
    }
  }

  useEffect(() => {
    const primaryCanvas = document.getElementById('primary_canvas') as HTMLCanvasElement
    const primaryContext = changeResolution(primaryCanvas)

    const moveCanvas = document.getElementById('move_canvas') as HTMLCanvasElement
    const moveContext = changeResolution(moveCanvas)
    chessboardArrows.mouseArrows('board_wrapper', primaryCanvas, primaryContext, moveContext)
  }, [game])

  const canvasSize = 824
  const scaleFactor = 2
  const chessboardArrows = new ChessboardArrows(scaleFactor)

  function changeResolution(canvas: HTMLCanvasElement | null) {
    if (!canvas) return
    // Set up CSS size.
    canvas.style.width = canvasSize + "px"
    canvas.style.height = canvasSize + "px"

    // Resize canvas and scale future draws.
    canvas.width = canvasSize * scaleFactor
    canvas.height = canvasSize * scaleFactor
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    return ctx
  }

  return (
    <>
      <div className="w-[21%]"></div>
      <div className="w-[54rem] mr-8">
        <div id="board_wrapper" className="relative">
          <canvas id="primary_canvas" className="absolute -top-0 -left-0 opacity-[64%]" width={canvasSize} height={canvasSize} ></canvas>
          <canvas id="move_canvas" className="absolute -top-0 -left-0 opacity-80" width={canvasSize} height={canvasSize} ></canvas>
          <Chessboard
            position={position.fen}
            width={824}
            lightSquareStyle={{ backgroundColor: "#EBECD0", zIndex: -10 }}
            darkSquareStyle={{ backgroundColor: "#739552", zIndex: -10 }}
            pieces={{
              wP: ({ squareWidth }) => <img src="/pieces/wp.png" width={squareWidth} height={squareWidth} />,
              wN: ({ squareWidth }) => <img src="/pieces/wn.png" width={squareWidth} height={squareWidth} />,
              wB: ({ squareWidth }) => <img src="/pieces/wb.png" width={squareWidth} height={squareWidth} />,
              wR: ({ squareWidth }) => <img src="/pieces/wr.png" width={squareWidth} height={squareWidth} />,
              wQ: ({ squareWidth }) => <img src="/pieces/wq.png" width={squareWidth} height={squareWidth} />,
              wK: ({ squareWidth }) => <img src="/pieces/wk.png" width={squareWidth} height={squareWidth} />,
              bP: ({ squareWidth }) => <img src="/pieces/bp.png" width={squareWidth} height={squareWidth} />,
              bN: ({ squareWidth }) => <img src="/pieces/bn.png" width={squareWidth} height={squareWidth} />,
              bB: ({ squareWidth }) => <img src="/pieces/bb.png" width={squareWidth} height={squareWidth} />,
              bR: ({ squareWidth }) => <img src="/pieces/br.png" width={squareWidth} height={squareWidth} />,
              bQ: ({ squareWidth }) => <img src="/pieces/bq.png" width={squareWidth} height={squareWidth} />,
              bK: ({ squareWidth }) => <img src="/pieces/bk.png" width={squareWidth} height={squareWidth} />,
            }}
            squareStyles={getSquareStyles()}
            orientation={boardOrientation}
          />
        </div>
      </div>
      <div className="w-[40%] h-full">
        <div className="flex-col w-[75%] h-full">
          <div className="text-xl font-semibold text-center text-white-light py-2.5 mb-[1px] bg-secondary-dark rounded-t">Analysis</div>
          <div className="px-3 py-1 text-xs bg-secondary h-[824px] overflow-auto mb-[1px]">
            <Accuracies />
            <Moves />
          </div>
          <div className="flex bg-secondary-dark h-[51px] rounded-b justify-end items-center">
            <button
              className={`${chessFont.className} mx-3 text-2xl text-gray hover:text-gray-light`}
              onClick={onFlipClick}>
              f</button>
          </div>
        </div>
      </div>
    </>
  )
}