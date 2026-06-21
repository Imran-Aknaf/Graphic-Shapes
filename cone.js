export const vs_con = []

const height = 1;
const apex = { x: 0, y: height / 2, z: 0 } // so in center but at height h

vs_con.push(apex)


const r = 0.25; //radius of base's circle
const n = 20; //number of vertices/points to approx the circle

/**need to evenly space vertices, so each should get an equal angle part of [0, 2PI] 
 * for n vertices, each should get an angle of "magnitude" 2PI/n
 * and angle should advance from 0 to 2PI
 * formula : i * (2PI/n)
 * 
 * 
*/


for (let i = 0; i < n; i++) {
  const angle = i * ((2 * Math.PI) / n)


  const x = r * Math.cos(angle)
  const y = -height / 2
  const z = r * Math.sin(angle)

  vs_con.push({ x: x, y: y, z: z })
}

export const fs_con = []

for (let i = 1; i < vs_con.length; i++) {
  const next = (i % n) + 1
  const face = [0, i, next]
  fs_con.push(face)
}

//need to also joint the base vertices , to get the base face too (not just the side faces)
const base_face = []
for (let i = 1; i < vs_con.length; i++) {
  base_face.push(i)
}
fs_con.push(base_face)
