'use client'

import { KeyboardEvent, useCallback } from "react"
import { navigate } from "./navigate"
import { useSearchParams } from "next/navigation"

export default function Home() {
  const searchParams = useSearchParams()

  // Get a new searchParams string by merging the current
  // searchParams with a provided key/value pair
  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString())
      params.set(name, value)

      return params.toString()
    },
    [searchParams]
  )

  const keyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      navigate('/profile' + '?' + createQueryString('username', event.currentTarget.value))
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
