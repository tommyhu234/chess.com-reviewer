'use client'

import { KeyboardEvent, useEffect } from "react"

export default function Home({ searchParams }: { searchParams: { [key: string]: string | string[] | undefined } }) {
  const searchError = searchParams.searchError

  const keyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      window.location.href = `/profile?username=${event.currentTarget.value}`
    }
  }

  useEffect(() => {
    if (searchError) history.replaceState(null, '', '/')
  })

  return (
    <main className="flex h-screen flex-col items-center p-24">
      <div className="text-white space-y-6 mt-12 mb-10">
        <h1 className="flex justify-center font-bold text-6xl">Chess.com Game Reviewer</h1>
        <p className="flex justify-center text-xl"> This website retrieves your chess games from Chess.com and conducts a game review using the Stockfish chess engine. </p>
      </div>
      <div className="flex items-end text-sm text-red-500 mb-2 h-2">
        {searchError}
      </div>
      <div className="flex items-center justify-center">
        <input className={`p-2 rounded-lg border-2 ${searchError ? 'border-red-500 outline-red-500' : 'border-gray outline-gray'}`} placeholder="Username" onKeyDown={keyDown}></input>
      </div>
    </main>
  );
}
