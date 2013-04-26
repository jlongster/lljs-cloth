
all:
	ljc -m verlet \
	 -e update,render,main,constructMesh,getClothW,getClothH,setGravity,setWind,setMouse,setMouseButton,mouseMove,getMouseButton \
	 verlet.ljs > verlet.js
