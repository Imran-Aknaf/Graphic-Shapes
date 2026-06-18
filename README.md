## Run webpage

python3 -m http.server 8000


# Two spaces : NDC vs Screen

We can't work directly with pixels => because pixels depend on screen size/resolution => and if it works on 1920×1080, it breaks in 4K using pixels math

So we need a universal coordinate space :
- Normalized Device Coordinates (NDC)
- "Device Coordinates" = coordinates relative to the screen system => no more compatibility issue

What is it ?

it's a fake screen => and every screen (whatever the size), temporarly becomes this fake NDC screen defined as : 

- x ∈ [-1, +1]
- y ∈ [-1, +1]
- center = (0,0)
 

So now we can do math in this universal screen, and then convert it to be correct on the screen in use. Our math will never be wrong whatever the screen because : 

1. we do it in the universal coordinate system
2. we translate the result to the final screen width and height

Conclusion : NDC does not care about absolute pixels => only relative position to the center 

## NDC coordinate to Screen coordinate

how to go from x ∈ [-1,+1] to x' ∈ [0,w] ?
- x' = (x+1)*(w/2)
- y' = (y+1)*(h/2)

## point({x,y})

- need to put a square/vertex with center x,y. 
- but fillrect takes upper left corner, so let's give it (x-size/2, y-size/2)


# 3D to 2D : Projection

3D point : (x,y,z) = where is the point relative to the eye/camera 

first let our eye/camera be at (0,0,0)


so this makes :

x = left/right from camera center
y = up/down from camera center
z = forward distance from camera

what is the screen ?
- it's a flat plane at some +z distance from the camera 

Now how does it all work out ?

- take a point : P = (x, y, z)
- the point is assumed behind the screen
- the camera is assumed in front of the screen
- imagine a infinite line from camera to point (camera -> P)
- this line crosses the screen at a specific (x,y) = the 2D projection


Special case : z=0 

- then the point P is exactly on the plane where our eye is (maybe under or above our eye directly)
- But that the ray is not possible, it can't move (distance 0)

Normal case : 
- let the screen be at z=1
- then if your 3D point has z>0, it can be projected 
- #1 : z > 1 => then 3D point is behind the screen, by doing a ray from camera to P , you cross screen at (x,y)
- #2 : 0 < z < 1 => then 3D point is between camera & screen, but the ray is infinite, so it don't stop at Point , and continue toward screen to cross it at (x,y)


Insight : 
- camera is at x=0, y=0
- so if point is also at x=0, y=0 but z > 0
- it's projection to the screen will be exactly at x=0, y=0 as the ray is just horizontal line
- and thus the point projection is the same for any z, when x=0, y=0


## How to project 3D point onto 2D screen ?

1. Intuition/Idea :

- the farther something is (big z), the smaller it becomes 
- x' = x/z; y' = y/z

2. Math : 


# Animation

- Animation = recompute positions over time + redraw repeatedly : 
- Loop = render loop

loop:
  update positions
  draw scene

- Frame t = image of your scene at a specific moment t

So showing many frames 1,2,... quickly makes your brain see motion, thus : 

- FPS = Frames Per Second = the frequency
- 60 FPS = smooth animation

So basically we need time, and thus are variable depends on time : x(t), y(t), z(t)

- setTimeout(fctRef, delay) : call the function right after the delay (in ms)
- so for 60 frames per second = 60 frames per 1000 ms = 1 frame per (1000/60)
- setTimeout(frame, 1000/FPS)

So like this we will just grow the offset of z (z=1 for screen) , with a variable dz, to move the point further from the screen

Ok but if at each frame we just do :
- dz += 1 => there is an issue 
- Indeed, you need to look at FPS
- if you have 30 FPS instead of 60 FPS, then you have less frame per seconds, and thus dz will become 30 in 1 sec, while the other will get 60 in 1 sec
- but this is not okay, having more FPS should not make the animation go more far, it should just make it more smooth/less skewed

So that means we need to have : 
- for whatever FPS x we have, we should always in 1 second get a fixed increase dz, for example in 1 second, dz should increase of 1
- To achieve this, we need to look at how many frames we have in 1 second = FPS
- and we need each frame to increase dz by only a fraction of 1 so that the sum after all frames makes 1 
- so : dz += 1*dt where dt = 1/FPS = the fraction of 1 this frame will contribute . If this happens for each frame we get : 
FPS * 1/FPS = 1 sec.

Now it's normalised, whatever your fps, you will always in 1 second , achieve the same distance z. But still, more FPS = more draw = more motion = more smooth

## Insight 
the further the point is (big z), the closer the x and y tend to 0. This is called vanishing point and it's logical from the formula as we divide by z. But also intuitively : 

![vanishing point](./illustrations/vanishing-point.png)