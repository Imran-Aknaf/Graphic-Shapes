const BACKGROUND = "black"
const FOREGROUND = "green"

console.log("displaying thing...")
const canvas = document.getElementById("canvas");

canvas.width = 500
canvas.height = 500

const ctx = canvas.getContext("2d");

function clear() {
  ctx.fillStyle = BACKGROUND
  ctx.fillRect(0, 0, canvas.width, canvas.height)
}

function point({ x, y }) {
  const size = 10
  ctx.fillStyle = FOREGROUND
  ctx.fillRect(x - size / 2, y - size / 2, size, size)
}

function NdcToScreen({ x, y }) {
  //[-1,1] --> [0,2] --> [0,1] --> [0,w] : x' = (x+1)/2 * w
  //[1,-1] --> [0,2] -> [0,1] -> [0,h] : y' = (1-y)/2 * h  
  return {
    x: (x + 1) / 2 * canvas.width,
    y: (1 - y) / 2 * canvas.height
  }
}

function project({ x, y, z }) {
  return {
    x: x / z,
    y: y / z
  }
}

function translate_z({ x, y, z }, dz) {
  return {
    x: x,
    y: y,
    z: z + dz
  }
}




const FPS = 60
const frameDuration = 1000 / FPS

let dz = 1;
const dt = 1 / FPS //same as frameDuration but in seconds = delta-time between frames in one second

const vertices = [
  { x: 0.5, y: 0.5, z: 0.5 },
  { x: 0.5, y: -0.5, z: 0.5 },
  { x: -0.5, y: 0.5, z: 0.5 },
  { x: -0.5, y: -0.5, z: 0.5 },

  { x: 0.5, y: 0.5, z: -0.5 },
  { x: 0.5, y: -0.5, z: -0.5 },
  { x: -0.5, y: 0.5, z: -0.5 },
  { x: -0.5, y: -0.5, z: -0.5 },
]


//clear()
//point(NdcToScreen(project({ x: 0.5, y: 0.5, z: -0.5 })))



function frame() {
  dz += 1 * dt;
  clear();

  for (const v of vertices) {
    point(NdcToScreen(project(translate_z(v, dz))))
  }

  setTimeout(frame, frameDuration);
}

setTimeout(frame, frameDuration);



