'use client'

import { Chess, Move } from "chess.js"
import dynamic from "next/dynamic"
import Image from 'next/image'
import localFont from "next/font/local"
import AnalysisMove from "./analysis_move"
import { useEffect, useState } from "react"
import ChessboardArrows from "../../utils/chessboard_arrows"

const Chessboard = dynamic(() => import("chessboardjsx"), {
  ssr: false  // <- this do the magic ;)
});

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
  const [evaluations, setEvaluations] = useState([])
  const [isLoading, setLoading] = useState(true)
  const [whitePlayer, setWhitePlayer] = useState({ avatar: "" })
  const [blackPlayer, setBlackPlayer] = useState({ avatar: "" })
  const [whiteAccuracy, setWhiteAccuracy] = useState(0.0)
  const [blackAccuracy, setBlackAccuracy] = useState(0.0)
  const [boardOrientation, setBoardOrientation] = useState("white" as "white" | "black")

  function Moves({ moves, evaluations }: { moves: Move[][], evaluations: any[] }) {
    if (!isLoading) {
      return <>
        {
          moves.map((move, index) =>
            <AnalysisMove
              key={`${index}-${move}`}
              position={position}
              setPosition={setPosition}
              move={move}
              index={index + 1}
              evaluation={evaluations[index]} />
          )
        }
      </>
    } else {
      return <div>Loading...</div>
    }
  }

  function Accuracies() {
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
              {whiteAccuracy.toFixed(1)}
            </div>
            <div className="text-xs text-gray font-semibold">Accuracy</div>
          </div>
          <img src={whitePlayer.avatar} className="w-[50px] h-[50px] object-cover rounded-r-sm" />
        </div>
        <div className="flex w-[65px] h-full items-center justify-center text-gray-light font-semibold text-xs">
          {result}
        </div>
        <div className={`flex border-2 ${result === "0-1" ? "border-move-best" : "border-move-blunder"} rounded`}>
          <img src={blackPlayer.avatar} className="w-[50px] h-[50px] object-cover rounded-l-sm" />
          <div className="flex flex-col w-[100px] h-[50px] rounded-r-sm items-center justify-center">
            <div className="text-white text-xl font-bold h-[24px]">
              {blackAccuracy.toFixed(1)}
            </div>
            <div className="text-xs text-gray font-semibold">Accuracy</div>
          </div>
        </div>
      </div>
    </>
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

  useEffect(() => {
    fetch("/analysis/api", {
      method: "POST",
      body: JSON.stringify(game),
    }).then(async (response: Response) => {
      const data = await response.json()
      setEvaluations(data.evaluations)
      setWhiteAccuracy(data.whiteAccuracy)
      setBlackAccuracy(data.blackAccuracy)
      setLoading(false)
    })
    const whiteUsername = getValue("White", game)
    const blackUsername = getValue("Black", game)
    fetch(`/profile/api?username=${whiteUsername}`).then(async (response: Response) => {
      const data = await response.json()
      if (data.avatar) setWhitePlayer(data)
      else setWhitePlayer({ ...data, avatar: "/noavatar.gif" })
    })
    fetch(`/profile/api?username=${blackUsername}`).then(async (response: Response) => {
      const data = await response.json()
      if (data.avatar) setBlackPlayer(data)
      else setBlackPlayer({ ...data, avatar: "/noavatar.gif" })
    })
    ChessboardArrows('board_wrapper', 1648)
  }, [game])

  return (
    <>
      <div className="w-[21%]"></div>
      <div className="w-[54rem] mr-8">
        <div id="board_wrapper" className="relative">
          <canvas id="primary_canvas" className="absolute -top-0 -left-0 opacity-80" width="824" height="824" ></canvas>
          <canvas id="drawing_canvas" className="absolute -top-0 -left-0 opacity-80" width="824" height="824" ></canvas>
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
            <Moves moves={moves} evaluations={evaluations} />
          </div>
          <div className="flex bg-secondary-dark h-[51px] rounded-b justify-end items-center">
            <button
              className={`${chessFont.className} mx-3 text-2xl text-gray hover:text-gray-light`}
              onClick={() => setBoardOrientation(boardOrientation === "white" ? "black" : "white")}>
              f</button>
          </div>
        </div>
      </div>
    </>
  )
}