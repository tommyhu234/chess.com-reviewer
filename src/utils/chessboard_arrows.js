/*

Personal modifications to the original library:

A library that extends any chessboard library to allow users to draw arrows and circles.
Right-click to draw arrows and circles, left-click to clear the drawings.

Author: Brendon McBain
Date: 07/04/2020
https://github.com/mcba1n/chessboard-arrows

*/

const arrowWidth = 56
const lineWidth = 44
const color = 'rgb(250, 170, 0)'
const moveColor = 'rgb(150, 190, 70)'

const ChessboardArrows = function (id, primaryCanvas, primaryContext, moveContext) {
  setContextStyle(primaryContext, color)
  setContextStyle(moveContext, moveColor)

  // setup mouse event callbacks
  const board = document.getElementById(id)
  board.addEventListener("mousedown", function (event) { onMouseDown(event) })
  board.addEventListener("mouseup", function (event) { onMouseUp(event) })
  board.addEventListener('contextmenu', function (e) { e.preventDefault() }, false)

  // initialise vars
  let initialPoint = { x: null, y: null }
  let finalPoint = { x: null, y: null }

  let mouseDown = false

  function getMousePos(canvas, evt) {
    const rect = canvas.getBoundingClientRect()
    return {
      x: Q((evt.clientX - rect.left) * 2),
      y: Q((evt.clientY - rect.top) * 2)
    }
  }

  function setContextStyle(context, color) {
    context.strokeStyle = context.fillStyle = color
    context.lineJoin = 'butt'
    context.translate(0.5, 0.5)
  }

  function onMouseDown(event) {
    if (event.which == 3) { // right click
      mouseDown = true
      initialPoint = finalPoint = getMousePos(primaryCanvas, event)
    }
  }

  function onMouseUp(event) {
    if (event.which == 3) { // right click
      mouseDown = false
      finalPoint = getMousePos(primaryCanvas, event)
      // draw an arrow 
      const xDiff = Math.abs(S(finalPoint.x) - S(initialPoint.x))
      const yDiff = Math.abs(S(finalPoint.y) - S(initialPoint.y))
      if (xDiff === 0 && yDiff === 0) return
      if ((xDiff === 1 && yDiff == 2)) drawKnightArrowToCanvas(primaryContext, initialPoint, finalPoint, false)
      else if (xDiff === 2 && yDiff == 1) drawKnightArrowToCanvas(primaryContext, initialPoint, finalPoint, true)
      else drawArrowToCanvas(primaryContext, initialPoint, finalPoint)
    } else if (event.which == 1) { // left click
      // clear canvas
      primaryContext.clearRect(0, 0, primaryCanvas.width, primaryCanvas.height)
    }
  }

  function Q(x, d) {  // mid-tread quantiser
    d = primaryCanvas.width / 8
    return (d * (Math.floor(x / d) + 0.5))
  }

  function S(x) {  // square number
    return Math.floor(x / (primaryCanvas.width / 8))
  }

}

const letters = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h']

function P(canvas, point) {  // square position
  const d = canvas.width / 8
  return { x: d * (point.x + 0.5), y: d * (point.y + 0.5) }
}

const drawMoveArrow = function (moveCanvas, moveContext, move, orientation) {
  moveContext.clearRect(0, 0, moveCanvas.width, moveCanvas.height)
  const initialPoint = { x: letters.indexOf(move[0]), y: 8 - parseInt(move[1]) }
  const finalPoint = { x: letters.indexOf(move[2]), y: 8 - parseInt(move[3]) }
  if (orientation === 'black') {
    initialPoint.x = 7 - initialPoint.x
    initialPoint.y = 7 - initialPoint.y
    finalPoint.x = 7 - finalPoint.x
    finalPoint.y = 7 - finalPoint.y
  }
  // draw an arrow 
  const xDiff = Math.abs(finalPoint.x - initialPoint.x)
  const yDiff = Math.abs(finalPoint.y - initialPoint.y)
  if (xDiff === 0 && yDiff === 0) return
  if ((xDiff === 1 && yDiff == 2)) drawKnightArrowToCanvas(moveContext, P(moveCanvas, initialPoint), P(moveCanvas, finalPoint), false)
  else if (xDiff === 2 && yDiff == 1) drawKnightArrowToCanvas(moveContext, P(moveCanvas, initialPoint), P(moveCanvas, finalPoint), true)
  else drawArrowToCanvas(moveContext, P(moveCanvas, initialPoint), P(moveCanvas, finalPoint))
}

const clearMoves = function (moveCanvas, moveContext) {
  moveContext.clearRect(0, 0, moveCanvas.width, moveCanvas.height)
}

// source: https://stackoverflow.com/questions/808826/draw-arrow-on-canvas-tag
function drawArrow(context, fromx, fromy, tox, toy) {
  const x_center = tox
  const y_center = toy
  let angle, x, y

  context.beginPath()

  angle = Math.atan2(toy - fromy, tox - fromx)
  x = arrowWidth * Math.cos(angle) + x_center
  y = arrowWidth * Math.sin(angle) + y_center

  context.moveTo(x, y)

  angle += 54.16 * (Math.PI / 180) * 2
  x = arrowWidth * Math.cos(angle) + x_center
  y = arrowWidth * Math.sin(angle) + y_center

  context.lineTo(x, y)

  angle += 71.68 * (Math.PI / 180) * 2
  x = arrowWidth * Math.cos(angle) + x_center
  y = arrowWidth * Math.sin(angle) + y_center

  context.lineTo(x, y)

  context.closePath()
  context.fill()
}

function drawArrowToCanvas(context, initialPoint, finalPoint) {
  // offset finalPoint so the arrow head hits the center of the square
  let xFactor, yFactor
  if (finalPoint.x == initialPoint.x) {
    yFactor = Math.sign(finalPoint.y - initialPoint.y) * arrowWidth
    xFactor = 0
  } else if (finalPoint.y == initialPoint.y) {
    xFactor = Math.sign(finalPoint.x - initialPoint.x) * arrowWidth
    yFactor = 0
  } else {
    // find delta x and delta y to achieve hypotenuse of arrowWidth
    const slope_mag = Math.abs((finalPoint.y - initialPoint.y) / (finalPoint.x - initialPoint.x))
    xFactor = Math.sign(finalPoint.x - initialPoint.x) * arrowWidth / Math.sqrt(1 + Math.pow(slope_mag, 2))
    yFactor = Math.sign(finalPoint.y - initialPoint.y) * Math.abs(xFactor) * slope_mag
  }

  // draw line
  context.beginPath()
  context.lineWidth = lineWidth
  context.moveTo(initialPoint.x + xFactor * 1.3, initialPoint.y + yFactor * 1.3)
  context.lineTo(finalPoint.x - xFactor, finalPoint.y - yFactor)
  context.stroke()

  // draw arrow head
  drawArrow(context, initialPoint.x, initialPoint.y, finalPoint.x - xFactor, finalPoint.y - yFactor, arrowWidth)
}

function drawKnightArrowToCanvas(context, initialPoint, finalPoint, xLong) {
  let turnPoint
  if (xLong) turnPoint = { x: finalPoint.x, y: initialPoint.y }
  else turnPoint = { x: initialPoint.x, y: finalPoint.y }
  // find delta x and delta y to achieve hypotenuse of arrowWidth
  let xFactor = Math.sign(turnPoint.x - initialPoint.x) * arrowWidth
  let yFactor = Math.sign(turnPoint.y - initialPoint.y) * arrowWidth

  // draw line
  context.beginPath()
  context.lineWidth = lineWidth
  context.moveTo(initialPoint.x + xFactor * 1.3, initialPoint.y + yFactor * 1.3)
  context.lineTo(turnPoint.x, turnPoint.y)

  xFactor = Math.sign(finalPoint.x - turnPoint.x) * arrowWidth
  yFactor = Math.sign(finalPoint.y - turnPoint.y) * arrowWidth

  context.lineTo(finalPoint.x - xFactor, finalPoint.y - yFactor)
  context.stroke()

  // draw arrow head
  drawArrow(context, turnPoint.x, turnPoint.y, finalPoint.x - xFactor, finalPoint.y - yFactor)
}

export { ChessboardArrows, drawMoveArrow, clearMoves }