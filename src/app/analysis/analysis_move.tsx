'use client'

import { Move } from "chess.js"

export default function AnalysisMove({ position, setPosition, move, index }: { position: any, setPosition: any, move: Move[], index: number }) {
  const handleMoveClick = (move: Move) => {
    setPosition({
      fen: move.after,
      move: move.lan,
      key: `${index}-${move.san}`
    })
  }

  return (
    <div
      key={`${index}-${move[0].san}-${move[1].san}`}
      className={`flex px-3 h-[30px] items-center cursor-pointer ${position.key.split("-")[0] == index ? "bg-main" : index % 2 === 0 ? "bg-secondary" : "bg-[#454441]"}`}>
      <div className="text-gray font-semibold w-[3rem]">{index}.</div>
      <div className="text-gray-light hover:text-white font-semibold w-[5rem]" onClick={() => handleMoveClick(move[0])}>
        <div className={`w-[49px] rounded-[3px] p-1 ${position.key === `${index}-${move[0].san}` ? "bg-[#5A5956]" : ""}`}>
          {move[0].san}
        </div>
      </div>
      <div className="text-gray-light hover:text-white font-semibold w-[5rem]" onClick={() => handleMoveClick(move[1])}>
        <div className={`w-[49px] rounded-[3px] p-1 ${position.key === `${index}-${move[1].san}` ? "bg-[#5A5956]" : ""}`}>
          {move[1].san || "0"}
        </div>
      </div>
    </div>
  )
}