'use client'

import { Move } from "chess.js"
import MoveSymbol from "./move_symbol"
import { evaluatePosition } from "./actions"

const getMoveColor = (moveType: string) => {
  if (moveType === "Blunder") return "text-move-blunder"
  if (moveType === "Mistake") return "text-[#FFA459]"
  if (moveType === "Miss") return "text-[#FF7769]"
  if (moveType === "Inaccuracy") return "text-[#F7C631]"
  if (moveType === "Good") return "text-[#77915F]"
  if (moveType === "Excellent") return "text-move-best"
  if (moveType === "Best") return "text-move-best"
  else return "text-gray-light"
}

type Params = {
  position: any,
  setPosition: any,
  chessboard_arrows: any,
  move: Move[],
  boardOrientation: 'white' | 'black',
  index: number,
  evaluation: any
}

export default function AnalysisMove({ position, setPosition, chessboard_arrows, move, boardOrientation, index, evaluation }: Params) {
  const handleMoveClick = (move: Move, white: boolean) => {
    setPosition({
      fen: move.after,
      move: move.lan,
      moveType: evaluation[white ? 0 : 1].moveType,
      key: `${index}-${white ? 0 : 1}-${move.san}`
    })
    const moveCanvas = document.getElementById('move_canvas') as HTMLCanvasElement
    const moveContext = moveCanvas?.getContext('2d')
    chessboard_arrows.drawMoveArrow(moveCanvas, moveContext, evaluation[white ? 0 : 1].bestMoveLan, boardOrientation)
  }

  let selectedMove = null
  if (position.key === `${index}-0-${move[0].san}`) selectedMove = 0
  if (move[1] && position.key === `${index}-1-${move[1].san}`) selectedMove = 1

  return (
    <>
      <div
        key={`${index}-${move[0].san}-${move[1] ? move[1].san : ""}`}
        className={`flex px-3 h-[30px] items-center cursor-pointer ${position.key.split("-")[0] == index ? "bg-main" : index % 2 === 0 ? "bg-secondary" : "bg-[#494845]"}`}>
        <div className="text-gray font-semibold w-[20px] mr-[10px]">{index}.</div>
        <div className={`${getMoveColor(evaluation[0].moveType)} flex items-center font-semibold w-[74px] mr-[10px]`} onClick={() => handleMoveClick(move[0], true)}>
          <div className="mr-[5px]">
            <MoveSymbol moveType={evaluation[0].moveType} size={16} />
          </div>
          <div className={`w-[49px] rounded-[3px] p-1 ${position.key === `${index}-0-${move[0].san}` ? "bg-[#5A5A57]" : ""}`}>
            {move[0].san}
          </div>
        </div>
        {
          move[1] ? (
            <div className={`${getMoveColor(evaluation[1].moveType)} flex items-center font-semibold w-[74px] mr-[20px]`} onClick={() => handleMoveClick(move[1], false)}>
              <div className="mr-[5px]">
                <MoveSymbol moveType={evaluation[1].moveType} size={16} />
              </div>
              <div className={`w-[49px] rounded-[3px] p-1 ${position.key === `${index}-1-${move[1].san}` ? "bg-[#5A5A57]" : ""}`}>
                {move[1].san}
              </div>
            </div>
          ) : (
            <div className="w-[74px] mr-[20px]" />
          )
        }
      </div>
      {selectedMove !== null &&
        <div className="flex w-full h-14 my-2 bg-[#5A5A57] rounded-lg py-3 px-5 items-center">
          <div className="mr-[5px]">
            <MoveSymbol moveType={evaluation[selectedMove].moveType} size={23} />
          </div>
          <div className={`flex items-center ml-0.5 h-7 font-semibold whitespace-nowrap ${getMoveColor(evaluation[selectedMove].moveType)}`}>
            {move[selectedMove].san} is {evaluation[selectedMove].moveType.toLowerCase()}
          </div>
          <div className="flex w-full justify-end">
            <div className={`flex justify-center items-center w-12 h-6 rounded-[3px] font-bold
              ${!evaluation[selectedMove].score.startsWith('-') ? 'bg-white text-secondary-dark' : 'bg-secondary-dark text-white'}`}>
              {!evaluation[selectedMove].score.startsWith('-') ? !evaluation[selectedMove].score.includes('-') ? '+' : '' : ''}{evaluation[selectedMove].score}
            </div>
          </div>
        </div>
      }
      {(selectedMove !== null && evaluation[selectedMove].moveType !== "Best") &&
        <div className="flex w-full h-14 my-2 bg-[#5A5A57] rounded-lg py-3 px-5 items-center">
          <div className="mr-[5px]">
            <MoveSymbol moveType="Best" size={23} />
          </div>
          <div className={`flex items-center ml-0.5 h-7 font-semibold whitespace-nowrap text-move-best`}>
            {evaluation[selectedMove].bestMove} is best
          </div>
          <div className="flex w-full justify-end">
            <div className={`flex justify-center items-center w-12 h-6 rounded-[3px] font-bold
              ${!evaluation[selectedMove].bestScore.startsWith('-') ? 'bg-white text-secondary-dark' : 'bg-secondary-dark text-white'}`}>
              {!evaluation[selectedMove].bestScore.startsWith('-') ? !evaluation[selectedMove].bestScore.includes('-') ? '+' : '' : ''}{evaluation[selectedMove].bestScore}
            </div>
          </div>
        </div>
      }
    </>
  )
}