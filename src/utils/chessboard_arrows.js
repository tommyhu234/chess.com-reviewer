/*

Personal modifications to the original library:

A library that extends any chessboard library to allow users to draw arrows and circles.
Right-click to draw arrows and circles, left-click to clear the drawings.

Author: Brendon McBain
Date: 07/04/2020
https://github.com/mcba1n/chessboard-arrows

*/

var ChessboardArrows = function (id, canvasSize, resFactor = 2, color = 'rgb(150, 190, 70)') {

  const NUM_SQUARES = 8
  let drawCanvas, drawContext, primaryCanvas, primaryContext

  // drawing canvas
  drawCanvas = document.getElementById('drawing_canvas')
  drawContext = changeResolution(drawCanvas, resFactor)
  setContextStyle(drawContext)

  // primary canvas
  primaryCanvas = document.getElementById('primary_canvas')
  primaryContext = changeResolution(primaryCanvas, resFactor)
  setContextStyle(primaryContext)

  // setup mouse event callbacks
  const board = document.getElementById(id)
  board.addEventListener("mousedown", function (event) { onMouseDown(event) })
  board.addEventListener("mouseup", function (event) { onMouseUp(event) })
  board.addEventListener('contextmenu', function (e) { e.preventDefault() }, false)

  // initialise vars
  let initialPoint = { x: null, y: null }
  let finalPoint = { x: null, y: null }
  const arrowWidth = 56
  const lineWidth = 44

  let mouseDown = false

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

  function getMousePos(canvas, evt) {
    var rect = canvas.getBoundingClientRect()
    return {
      x: Q((evt.clientX - rect.left) * resFactor),
      y: Q((evt.clientY - rect.top) * resFactor)
    }
  }

  function setContextStyle(context) {
    context.strokeStyle = context.fillStyle = color
    context.lineJoin = 'butt'
    context.translate(0.5, 0.5)
  }

  function onMouseDown(event) {
    if (event.which == 3) { // right click
      mouseDown = true
      initialPoint = finalPoint = getMousePos(drawCanvas, event)
    }
  }

  function onMouseUp(event) {
    if (event.which == 3) { // right click
      mouseDown = false
      finalPoint = getMousePos(drawCanvas, event)
      // draw an arrow 
      const xDiff = Math.abs(S(finalPoint.x) - S(initialPoint.x))
      const yDiff = Math.abs(S(finalPoint.y) - S(initialPoint.y))
      if (xDiff === 0 && yDiff === 0) {
        drawContext.clearRect(0, 0, drawCanvas.width, drawCanvas.height)
        return
      }
      if ((xDiff === 1 && yDiff == 2)) drawKnightArrowToCanvas(primaryContext, false)
      else if (xDiff === 2 && yDiff == 1) drawKnightArrowToCanvas(primaryContext, true)
      else drawArrowToCanvas(primaryContext)
      drawContext.clearRect(0, 0, drawCanvas.width, drawCanvas.height)
    } else if (event.which == 1) { // left click
      // clear canvases
      drawContext.clearRect(0, 0, drawCanvas.width, drawCanvas.height)
      primaryContext.clearRect(0, 0, primaryCanvas.width, primaryCanvas.height)
    }
  }

  function drawArrowToCanvas(context) {
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

  function drawKnightArrowToCanvas(context, xLong) {
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

  function Q(x, d) {  // mid-tread quantiser
    d = (primaryCanvas.width) / (resFactor * NUM_SQUARES)
    return (d * (Math.floor(x / d) + 0.5))
  }

  function S(x) {  // square number
    return Math.floor(x / ((primaryCanvas.width) / (resFactor * NUM_SQUARES)))
  }

  // source: https://stackoverflow.com/questions/14488849/higher-dpi-graphics-with-html5-canvas
  function changeResolution(canvas, scaleFactor) {
    // Set up CSS size.
    canvas.style.width = canvasSize / window.devicePixelRatio + "px"
    canvas.style.height = canvasSize / window.devicePixelRatio + "px"

    // Resize canvas and scale future draws.
    canvas.width = Math.ceil(canvasSize * scaleFactor)
    canvas.height = Math.ceil(canvasSize * scaleFactor)
    var ctx = canvas.getContext('2d')
    ctx.scale(scaleFactor, scaleFactor)
    return ctx
  }

}

export default ChessboardArrows