'use client'

import { KeyboardEvent } from "react"
import { navigate } from "./navigate"

export default function Home() {

  const keyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      navigate(`/profile?username=${event.currentTarget.value}`)
    }
  }

  return (
    <main className="flex h-screen flex-col items-center p-24">
      <div className="flex h-1/3 items-center justify-center">
        <input className="p-2 rounded-lg" placeholder="Username" onKeyDown={keyDown}></input>
      </div>
    </main>
  );
}
