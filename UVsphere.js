/**
 * need 2 angles : 
 * theta : horizontal across equator [0,2PI]
 * phi : vertically from the north to south pole [0, PI]
 * 
 * sphere => so need to define a radius r
 * it will be centered at (0,0,0)
 * 
 * x = r * sin(phi) * cos(theta)
 * y = r * cos(phi)
 * z = r * sin(phi) * sin(theta)
 *
 * 
 * We also need : 
 * - number of stacks = top -> bottom = number of straight lines joining both poles => affected by phi
 * - number of slices = lines around sphere => affected by theta
 */

export const vs_uv = []

const stacks = 20
const slices = 20
const r = 0.5

for (let i = 0; i <= stacks; i++) {
  const phi_angle = i * (Math.PI / stacks)
  for (let j = 0; j < slices; j++) {
    const theta_angle = j * (2 * Math.PI / slices)

    const x = r * Math.sin(phi_angle) * Math.cos(theta_angle)
    const y = r * Math.cos(phi_angle)
    const z = r * Math.sin(phi_angle) * Math.sin(theta_angle)

    vs_uv.push({ x: x, y: y, z: z })
  }
}



/**
 * Array is flat but we know that we basically have this : 
 * each 20 continus points are all of the same phi, but full circle theta
 * 
 * We want to do quad faces : so need to basically link [ (i,j), (i,j+1), (i+1, j+1), (i+1,j)]
 * 
 * wher i : current stack, j : current slice
 * 
 * so to access a vertex (i,j) : i * slices + j
 * 
 */


export const fs_uv = []


for (let i = 0; i < stacks; i++) {
  for (let j = 0; j < slices; j++) {
    const p1 = i * slices + j
    const p2 = i * slices + ((j + 1) % slices)

    const p3 = (i + 1) * slices + ((j + 1) % slices)
    const p4 = (i + 1) * slices + j

    //const face = [p1, p2, p3, p4]
    const face = [p1, p4, p3, p2]

    fs_uv.push(face)
  }
}

