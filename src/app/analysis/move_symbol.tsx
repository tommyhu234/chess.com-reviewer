'use client'

import Image from 'next/image'

export default function MoveSymbol({ moveType, size }: { moveType: string, size: number }) {
  return <Image src={`/moveTypes/${moveType.toLowerCase()}.png`} width={size} height={size} style={{ maxWidth: 'none' }} alt="" />
}