/**
 * Solo try : 
 * 
 * it will be centered around (0,0,0)
 * 
 * there is one big radius R
 * there is one small radius r
 * 
 * the number of segments = number of circle we do
 * 
 * i will just compute for each number of segment the x = r*cos() & z = r*sin()
 * 
 * i will use this segment as the center of another circle of radius r , but a circle where we compute y & z (not x)
 * 
 */

export const vs_tor = []

const R = 0.5
const r = 0.1

const rings = 20
const sides = 20

for (let i = 0; i < rings; i++) {
  const u = 2 * Math.PI * i / rings

  for (let j = 0; j < sides; j++) {
    const v = 2 * Math.PI * j / sides

    const x = (R + r * Math.cos(v)) * Math.cos(u)
    const y = r * Math.sin(v)
    const z = (R + r * Math.cos(v)) * Math.sin(u)

    vs_tor.push({ x: x, y: y, z: z })
  }
}

export const fs_tor = []

for (let i = 0; i < rings; i++) {
  const nextRing = (i + 1) % rings

  for (let j = 0; j < sides; j++) {
    const nextSide = (j + 1) % sides

    const p1 = i * sides + j
    const p2 = i * sides + nextSide

    const p3 = nextRing * sides + nextSide
    const p4 = nextRing * sides + j

    fs_tor.push([p1, p4, p3, p2])
  }
}