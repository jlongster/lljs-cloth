
all:
	ljc -m verlet \
	 -e update,render,main,mousemove,constructMesh,getClothW,getClothH,setGravity,setWind,setMouse \
	 verlet.ljs > verlet.js
