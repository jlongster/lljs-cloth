
all:
	ljc -a -m verlet \
	 -e update,renderLines,main,constructMesh,getClothW,getClothH,setGravity,setWind,setMouse,setMouseButton,mouseMove,getMouseButton \
	 verlet.ljs > verlet.js
