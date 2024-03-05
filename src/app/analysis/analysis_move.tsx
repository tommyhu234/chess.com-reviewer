'use client'

import { Move } from "chess.js"

const getMoveColor = (moveType: string) => {
  if (moveType === "Blunder") return "text-red-500"
  if (moveType === "Mistake") return "text-yellow-500"
  else return "text-gray-light"
}

export default function AnalysisMove({ position, setPosition, move, index, evaluation }: { position: any, setPosition: any, move: Move[], index: number, evaluation: any }) {
  const handleMoveClick = (move: Move) => {
    setPosition({
      fen: move.after,
      move: move.lan,
      key: `${index}-${move.san}`
    })
  }

  return (
    <div
      key={`${index}-${move[0].san}-${move[1] ? move[1].san : ""}`}
      className={`flex px-3 h-[30px] items-center cursor-pointer ${position.key.split("-")[0] == index ? "bg-main" : index % 2 === 0 ? "bg-secondary" : "bg-[#454441]"}`}>
      <div className="text-gray font-semibold w-[3rem]">{index}.</div>
      <div className={`${getMoveColor(evaluation[0].moveType)} hover:text-white font-semibold w-[5rem]`}>
        <div className={`w-[49px] rounded-[3px] p-1 ${position.key === `${index}-${move[0].san}` ? "bg-[#5A5956]" : ""}`} onClick={() => handleMoveClick(move[0])}>
          {move[0].san}
        </div>
      </div>
      {
        move[1] ? (
          <div className={`${getMoveColor(evaluation[1].moveType)} text-gray-light hover:text-white font-semibold w-[5rem]`}>
            <div className={`w-[49px] rounded-[3px] p-1 ${position.key === `${index}-${move[1].san}` ? "bg-[#5A5956]" : ""}`} onClick={() => handleMoveClick(move[1])}>
              {move[1].san}
            </div>
          </div>
        ) : (
          <div className="w-[5rem]" />
        )
      }
    </div>
  )
}