/**
 * = a cirlce but repeated along y axis
 * need circle in XZ plane : we know with unit circle that x = cos(θ), z = sin(θ)
 * So we just generate many points around [0, 2PI]
 * and basically we also have an outer loop to increase the y that is constant across the circle
 * 
 * But actually we need only 2 circle, one top and one bottom
 * 
 * and the faces are all the rectangle from these two circles
 */

const segments = 20
const height = 1 //y

const top_circle = []
const bottom_circle = []

for (let i = 0; i < segments; i++) {
  const angle = 2 * Math.PI * (i / segments)
  const r = 0.25
  const x = r * Math.cos(angle)
  const z = r * Math.sin(angle)

  top_circle.push({ x: x, y: height / 2, z: z })
  bottom_circle.push({ x: x, y: -height / 2, z: z })
}

export const vs_cyl = top_circle.concat(bottom_circle)

export const fs_cyl = []


const top_face = []
const bottom_face = []
for (let i = 0; i < top_circle.length; i++) {
  const next = (i + 1) % segments


  //const face = [i, next, next + segments, i + segments]
  const face = [i, i + segments, next + segments, next]
  fs_cyl.push(face)

  top_face.push(i)
  bottom_face.push(i + segments)
}
bottom_face.reverse()

fs_cyl.push(top_face)
fs_cyl.push(bottom_face)