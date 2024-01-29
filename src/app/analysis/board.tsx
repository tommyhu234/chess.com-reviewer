'use client'

import dynamic from 'next/dynamic';

const Chessboard = dynamic(() => import('chessboardjsx'), {
  ssr: false  // <- this do the magic ;)
});

export default function Board() {
  return (
    <Chessboard position="start" width={825} />
  )
}