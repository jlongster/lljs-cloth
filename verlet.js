(function() {

if(!Math.imul) {
    Math.imul = function(x, y) { return x * y; };
}

var MB = 1024 * 1024;
var SIZE = 256 * MB;
var STACK_SIZE = 2 * MB;
var HEAP_SIZE = SIZE - STACK_SIZE;
var buffer = new ArrayBuffer(SIZE);

if(typeof window !== 'undefined') {
    window.asmBuffer = buffer;
}

var asm = (function (global, env, buffer) {
    "use asm";

    var stackSize = env.STACK_SIZE|0;
    var heapSize = env.HEAP_SIZE|0;
    var totalSize = env.TOTAL_SIZE|0;

    var print = env.print;
var currentTime = env.currentTime;

    var U1 = new global.Uint8Array(buffer);
    var I1 = new global.Int8Array(buffer);
    var U2 = new global.Uint16Array(buffer);
    var I2 = new global.Int16Array(buffer);
    var U4 = new global.Uint32Array(buffer);
    var I4 = new global.Int32Array(buffer);
    var F4 = new global.Float32Array(buffer);
    var F8 = new global.Float64Array(buffer);

    var acos = global.Math.acos;
    var asin = global.Math.asin;
    var atan = global.Math.atan;
    var cos = global.Math.cos;
    var sin = global.Math.sin;
    var tan = global.Math.tan;
    var ceil = global.Math.ceil;
    var floor = global.Math.floor;
    var exp = global.Math.exp;
    var log = global.Math.log;
    var sqrt = global.Math.sqrt;
    var abs = global.Math.abs;
    var atan2 = global.Math.atan2;
    var pow = global.Math.pow;
    var imul = global.Math.imul;

var globalSP = 38000072;
var clothW = 0;
var clothH = 0;
var numPoints = 0;
var numLinks = 0;
var canvasWidth = 0;
var mouseInfluenceSize = 15;
var mouseInfluenceScalar = 25;
var tearSensitivity = 65;
var gravity = 0;
var windEnabled = 0;
var leftOverTime = 0;
var startTime = 0;
  function Vec2d$Vec2d(thisPtr, x, y) {
    thisPtr = thisPtr | 0;
    x = +x;
    y = +y;
    var $SP = 0;
    F4[(thisPtr) >> 2] = x;
    F4[((thisPtr) + 4 | 0) >> 2] = y;
  }
  function Point$Point(thisPtr, x, y, mass, pinned) {
    thisPtr = thisPtr | 0;
    x = +x;
    y = +y;
    mass = +mass;
    pinned = pinned | 0;
    var $SP = 0;
    F4[((thisPtr)) >> 2] = x;
    F4[(((thisPtr)) + 4 | 0) >> 2] = y;
    memcpy((thisPtr) + 8 | 0, (thisPtr) | 0, 8);
    F4[((thisPtr) + 24 | 0) >> 2] = mass;
    F4[((thisPtr) + 32 | 0) >> 2] = +0;
    F4[(((thisPtr) + 32 | 0) + 4 | 0) >> 2] = +0;
    I4[((thisPtr) + 40 | 0) >> 2] = pinned;
    I4[((thisPtr) + 44 | 0) >> 2] = 0;
    I4[((thisPtr) + 48 | 0) >> 2] = 0;
  }
  function Link$Link(thisPtr, p1, p2, distRest, stiffness, tearness) {
    thisPtr = thisPtr | 0;
    p1 = p1 | 0;
    p2 = p2 | 0;
    distRest = +distRest;
    stiffness = +stiffness;
    tearness = +tearness;
    var $SP = 0;
    U4[(thisPtr) >> 2] = p1 | 0;
    U4[((thisPtr) + 4 | 0) >> 2] = p2 | 0;
    F4[((thisPtr) + 8 | 0) >> 2] = distRest;
    F4[((thisPtr) + 12 | 0) >> 2] = stiffness;
    F4[((thisPtr) + 16 | 0) >> 2] = tearness;
    I4[((thisPtr) + 20 | 0) >> 2] = 0;
  }
function min(a, b) {
  a = a | 0;
  b = b | 0;
  var $SP = 0;
  if ((a | 0) < (b | 0)) {
    return a | 0;
  }
  return b | 0;
}
function distPointToLine(x, y, p1, p2) {
  x = +x;
  y = +y;
  p1 = p1 | 0;
  p2 = p2 | 0;
  var _ = 0.0, _$1 = 0.0, _$2 = 0.0, A = 0, B = 0, lenA = 0.0, lenB = 0.0, det = 0.0, bool = 0, C = 0, $SP = 0;
  U4[1] = (U4[1] | 0) - 24;
  $SP = U4[1] | 0;
  (Vec2d$Vec2d(($SP) | 0 | 0, +(+(+F4[(p1) >> 2]) - +x), +(+(+F4[((p1) + 4 | 0) >> 2]) - +y)), F4[($SP) >> 2]);
  (Vec2d$Vec2d(($SP) + 8 | 0 | 0, +(+(+F4[(p2) >> 2]) - +(+F4[(p1) >> 2])), +(+(+F4[((p2) + 4 | 0) >> 2]) - +(+F4[((p1) + 4 | 0) >> 2]))), F4[(($SP) + 8 | 0) >> 2]);
  lenA = +(+(+F4[(($SP)) >> 2]) * +(+F4[(($SP)) >> 2]) + +(+F4[((($SP)) + 4 | 0) >> 2]) * +(+F4[((($SP)) + 4 | 0) >> 2]));
  lenB = +(+(+F4[(($SP) + 8 | 0) >> 2]) * +(+F4[(($SP) + 8 | 0) >> 2]) + +(+F4[((($SP) + 8 | 0) + 4 | 0) >> 2]) * +(+F4[((($SP) + 8 | 0) + 4 | 0) >> 2]));
  // It can't intersect if it's too far away
  if (+lenA > +lenB) {
    return +(_ = +1000, U4[1] = (U4[1] | 0) + 24 | 0, _);
  }
  det = +(+-+F4[(($SP)) >> 2] * +(+F4[(($SP) + 8 | 0) >> 2]) + +-+F4[((($SP)) + 4 | 0) >> 2] * +(+F4[((($SP)) + 4 | 0) >> 2]));
  bool = +(+det) < +(+(+0));
  if (+det > +lenB) {
    bool = 1;
  }
  if (bool) {
    (Vec2d$Vec2d(($SP) + 16 | 0 | 0, +(+(+F4[(p2) >> 2]) - +x), +(+(+F4[((p2) + 4 | 0) >> 2]) - +y)), F4[(($SP) + 16 | 0) >> 2]);
    return +(_$1 = +(min(~~lenA, ~~(+(+F4[(($SP) + 16 | 0) >> 2]) * +(+F4[(($SP) + 16 | 0) >> 2]) + +(+F4[((($SP) + 16 | 0) + 4 | 0) >> 2]) * +(+F4[((($SP) + 16 | 0) + 4 | 0) >> 2]))) | 0), U4[1] = (U4[1] | 0) + 24 | 0, _$1);
  }
  det = +(+(+F4[(($SP) + 8 | 0) >> 2]) * +(+F4[((($SP)) + 4 | 0) >> 2]) - +(+F4[((($SP) + 8 | 0) + 4 | 0) >> 2]) * +(+F4[(($SP)) >> 2]));
  return +(_$2 = +(+det * +det / +lenB), U4[1] = (U4[1] | 0) + 24 | 0, _$2);
  U4[1] = (U4[1] | 0) + 24;
  return 0.0;
}
function update(dt) {
  dt = dt | 0;
  var _ = 0, steps = 0, i = 0, $SP = 0;
  steps = min(((dt | 0 | 0) + (leftOverTime | 0 | 0) | 0 | 0 | 0 | 0) / 16 | 0 | 0, 5);
  leftOverTime = (dt | 0) - (imul(steps, 16) | 0) | 0;
  for (i = 0; (i | 0) < (steps | 0); _ = i, i = (i | 0) + 1 | 0, _) {
    updateStep(+(+(+16) / +(+1000)), +((currentTime() | 0 | 0) - (startTime | 0) | 0 | 0));
  }
}
function updateStep(dt, totalTime) {
  dt = +dt;
  totalTime = +totalTime;
  var _ = 0, _$1 = 0, _$2 = 0, z = 0, i = 0, i$1 = 0, $SP = 0;
  for (z = 0; (z | 0) < 5; _ = z, z = (z | 0) + 1 | 0, _) {
    for (i = 0; (i | 0) < (numLinks | 0); _$1 = i, i = (i | 0) + 1 | 0, _$1) {
      if (!(I4[(((((totalSize - globalSP | 0) + 26000064 | 0) + i * 24)) + 20 | 0) >> 2] | 0)) {
        solveLink((((totalSize - globalSP | 0) + 26000064 | 0) + i * 24) | 0);
      }
    }
  }
  for (i$1 = 0; (i$1 | 0) < (numPoints | 0); _$2 = i$1, i$1 = (i$1 | 0) + 1 | 0, _$2) {
    if (windEnabled) {
      applyForce((((totalSize - globalSP | 0) + 64 | 0) + i$1 * 52) | 0, +(((+cos(+(+(+F4[(((((totalSize - globalSP | 0) + 64 | 0) + i$1 * 52))) >> 2]) / +30)) + +1) * +200 + +(+F4[((((((totalSize - globalSP | 0) + 64 | 0) + i$1 * 52))) + 4 | 0) >> 2]) / +700 * +600) * (+sin(+(+totalTime / +1000)) * 0.5 + +1)), +0);
    }
    updatePoint((((totalSize - globalSP | 0) + 64 | 0) + i$1 * 52) | 0, dt);
  }
}
function render() {
  var _ = 0, _$1 = 0, lines = 0, idx = 0, i = 0, $SP = 0;
  U4[1] = (U4[1] | 0) - 8000000;
  $SP = U4[1] | 0;
  idx = 1;
  for (i = 0; (i | 0) < (numLinks | 0); _ = i, i = (i | 0) + 1 | 0, _) {
    if (!(I4[(((((totalSize - globalSP | 0) + 26000064 | 0) + i * 24)) + 20 | 0) >> 2] | 0)) {
      F4[(($SP) + idx * 4) >> 2] = +F4[((U4[((((totalSize - globalSP | 0) + 26000064 | 0) + i * 24)) >> 2] | 0)) >> 2];
      F4[(($SP) + ((idx | 0 | 0) + 1 | 0 | 0) * 4) >> 2] = +F4[(((U4[((((totalSize - globalSP | 0) + 26000064 | 0) + i * 24)) >> 2] | 0)) + 4 | 0) >> 2];
      F4[(($SP) + ((idx | 0 | 0) + 2 | 0 | 0) * 4) >> 2] = +F4[((U4[(((((totalSize - globalSP | 0) + 26000064 | 0) + i * 24)) + 4 | 0) >> 2] | 0)) >> 2];
      F4[(($SP) + ((idx | 0 | 0) + 3 | 0 | 0) * 4) >> 2] = +F4[(((U4[(((((totalSize - globalSP | 0) + 26000064 | 0) + i * 24)) + 4 | 0) >> 2] | 0)) + 4 | 0) >> 2];
      idx = (idx | 0) + 4 | 0;
    }
  }
  F4[(($SP) + 0 * 4) >> 2] = +((idx | 0) - 1 | 0 | 0);
  return (_$1 = ~~($SP) | 0, U4[1] = (U4[1] | 0) + 8000000 | 0, _$1) | 0;
  U4[1] = (U4[1] | 0) + 8000000;
  return 0;
}
function mousemove(x, y, leftClick, rightClick) {
  x = +x;
  y = +y;
  leftClick = leftClick | 0;
  rightClick = rightClick | 0;
  var _ = 0, _$1 = 0, i = 0, p1 = 0, p2 = 0, d = 0.0, i$1 = 0, pos = 0, line = 0, dist = 0.0, $SP = 0;
  U4[1] = (U4[1] | 0) - 16;
  $SP = U4[1] | 0;
  if (rightClick) {
    for (i = 0; (i | 0) < (numLinks | 0); _ = i, i = (i | 0) + 1 | 0, _) {
      p1 = U4[((((totalSize - globalSP | 0) + 26000064 | 0) + i * 24)) >> 2] | 0 | 0;
      p2 = U4[(((((totalSize - globalSP | 0) + 26000064 | 0) + i * 24)) + 4 | 0) >> 2] | 0 | 0;
      d = distPointToLine(x, y, (p1) | 0 | 0, (p2) | 0 | 0);
      if (+d < +(+12)) {
        I4[(((((totalSize - globalSP | 0) + 26000064 | 0) + i * 24)) + 20 | 0) >> 2] = 1;
      }
    }
  } else if (leftClick) {
    for (i$1 = 0; (i$1 | 0) < (numPoints | 0); _$1 = i$1, i$1 = (i$1 | 0) + 1 | 0, _$1) {
      memcpy(($SP) | 0, ((((totalSize - globalSP | 0) + 64 | 0) + i$1 * 52)) | 0, 8);
      (Vec2d$Vec2d(($SP) + 8 | 0 | 0, +(+(+F4[(($SP)) >> 2]) - +x), +(+(+F4[((($SP)) + 4 | 0) >> 2]) - +y)), F4[(($SP) + 8 | 0) >> 2]);
      dist = sqrt(+(+(+F4[(($SP) + 8 | 0) >> 2]) * +(+F4[(($SP) + 8 | 0) >> 2]) + +(+F4[((($SP) + 8 | 0) + 4 | 0) >> 2]) * +(+F4[((($SP) + 8 | 0) + 4 | 0) >> 2])));
      if (+dist < +(+(mouseInfluenceSize | 0))) {
        F4[(((((totalSize - globalSP | 0) + 64 | 0) + i$1 * 52)) + 8 | 0) >> 2] = +(+(+F4[(((((totalSize - globalSP | 0) + 64 | 0) + i$1 * 52))) >> 2]) - (+x - +(+F4[((totalSize - globalSP | 0) + 38000064 | 0) >> 2])) * +(mouseInfluenceScalar | 0));
        F4[((((((totalSize - globalSP | 0) + 64 | 0) + i$1 * 52)) + 8 | 0) + 4 | 0) >> 2] = +(+(+F4[((((((totalSize - globalSP | 0) + 64 | 0) + i$1 * 52))) + 4 | 0) >> 2]) - (+y - +(+F4[(((totalSize - globalSP | 0) + 38000064 | 0) + 4 | 0) >> 2])) * +(mouseInfluenceScalar | 0));
      }
    }
  }
  F4[((totalSize - globalSP | 0) + 38000064 | 0) >> 2] = x;
  F4[(((totalSize - globalSP | 0) + 38000064 | 0) + 4 | 0) >> 2] = y;
  U4[1] = (U4[1] | 0) + 16;
  return 0.0;
}
// Point implementation
function updatePoint(p, dt) {
  p = p | 0;
  dt = +dt;
  var dtSeq = 0.0, x = 0.0, y = 0.0, lx = 0.0, ly = 0.0, vel = 0, $SP = 0;
  U4[1] = (U4[1] | 0) - 8;
  $SP = U4[1] | 0;
  dtSeq = +(+dt * +dt);
  if (!(I4[((p) + 48 | 0) >> 2] | 0)) {
    applyForce(p | 0, +0, +(+(+F4[((p) + 24 | 0) >> 2]) * +(gravity | 0)));
  }
  x = +F4[((p)) >> 2];
  y = +F4[(((p)) + 4 | 0) >> 2];
  lx = +F4[((p) + 8 | 0) >> 2];
  ly = +F4[(((p) + 8 | 0) + 4 | 0) >> 2];
  if (!(I4[((p) + 40 | 0) >> 2] | 0)) {
    memcpy((p) + 8 | 0, (p) | 0, 8);
    (Vec2d$Vec2d(($SP) | 0 | 0, +((+x - +lx) * 0.9), +((+y - +ly) * 0.9)), F4[($SP) >> 2]);
    F4[((p)) >> 2] = +(+x + +(+F4[(($SP)) >> 2]) + +(+F4[((p) + 32 | 0) >> 2]) * +dtSeq);
    F4[(((p)) + 4 | 0) >> 2] = +(+y + +(+F4[((($SP)) + 4 | 0) >> 2]) + +(+F4[(((p) + 32 | 0) + 4 | 0) >> 2]) * +dtSeq);
  }
  F4[((p) + 32 | 0) >> 2] = +0;
  F4[(((p) + 32 | 0) + 4 | 0) >> 2] = +0;
  U4[1] = (U4[1] | 0) + 8;
  return 0.0;
}
function applyForce(p, x, y) {
  p = p | 0;
  x = +x;
  y = +y;
  var $SP = 0;
  F4[((p) + 32 | 0) >> 2] = +(+(+F4[((p) + 32 | 0) >> 2]) + +x / +(+F4[((p) + 24 | 0) >> 2]));
  F4[(((p) + 32 | 0) + 4 | 0) >> 2] = +(+(+F4[(((p) + 32 | 0) + 4 | 0) >> 2]) + +y / +(+F4[((p) + 24 | 0) >> 2]));
}
// Link implementation
function solveLink(link) {
  link = link | 0;
  var p1 = 0, p2 = 0, diff = 0, d = 0.0, scalar = 0.0, $SP = 0;
  U4[1] = (U4[1] | 0) - 8;
  $SP = U4[1] | 0;
  p1 = U4[(link) >> 2] | 0 | 0;
  p2 = U4[((link) + 4 | 0) >> 2] | 0 | 0;
  F4[(($SP)) >> 2] = +(+(+F4[((p1)) >> 2]) - +(+F4[((p2)) >> 2]));
  F4[((($SP)) + 4 | 0) >> 2] = +(+(+F4[(((p1)) + 4 | 0) >> 2]) - +(+F4[(((p2)) + 4 | 0) >> 2]));
  d = sqrt(+(+(+F4[(($SP)) >> 2]) * +(+F4[(($SP)) >> 2]) + +(+F4[((($SP)) + 4 | 0) >> 2]) * +(+F4[((($SP)) + 4 | 0) >> 2])));
  if (+d > +(+F4[((link) + 16 | 0) >> 2])) {
    removeLink(link | 0);
  }
  scalar = +((+(+F4[((link) + 8 | 0) >> 2]) - +d) / +d);
  /* let float im1 = 1.0 / p1->mass; */
  /* let float im2 = 1.0 / p2->mass; */
  /* let float scalarP1 = (im1 / (im1 + im2)) * link->stiffness; */
  /* let float scalarP2 = link->stiffness - scalarP1; */
  if (!(I4[((p1) + 40 | 0) >> 2] | 0)) {
    F4[((p1)) >> 2] = +(+(+F4[((p1)) >> 2]) + +(+F4[(($SP)) >> 2]) * +scalar * 0.5);
    F4[(((p1)) + 4 | 0) >> 2] = +(+(+F4[(((p1)) + 4 | 0) >> 2]) + +(+F4[((($SP)) + 4 | 0) >> 2]) * +scalar * 0.5);
  }
  if (!(I4[((p2) + 40 | 0) >> 2] | 0)) {
    F4[((p2)) >> 2] = +(+(+F4[((p2)) >> 2]) - +(+F4[(($SP)) >> 2]) * +scalar * 0.5);
    F4[(((p2)) + 4 | 0) >> 2] = +(+(+F4[(((p2)) + 4 | 0) >> 2]) - +(+F4[((($SP)) + 4 | 0) >> 2]) * +scalar * 0.5);
  }
  U4[1] = (U4[1] | 0) + 8;
  return 0.0;
}
function removeLink(link) {
  link = link | 0;
  var $SP = 0;
  I4[((link) + 20 | 0) >> 2] = 1;
}
// Init
function constructMesh(level) {
  level = level | 0;
  var _ = 0, _$1 = 0, linkPtr = 0, pointPtr = 0, restingDistance = 0.0, startX = 0, startY = 0, y = 0, x = 0, p = 0, index = 0, tearness = 0.0, l = 0, l$1 = 0, $SP = 0;
  U4[1] = (U4[1] | 0) - 104;
  $SP = U4[1] | 0;
  clothW = (level | 0) + 8 | 0;
  clothH = (level | 0) / 2 | 0;
  linkPtr = 0;
  pointPtr = 0;
  restingDistance = +(+700 / +(+((clothW | 0 | 0) - 1 | 0 | 0 | 0)));
  startX = ((canvasWidth | 0 | 0) / 2 | 0 | 0 | 0 | 0) - (~~(+(clothW | 0) * +restingDistance / +2) | 0 | 0) | 0 | 0;
  startY = 0;
  if ((clothH | 0) > 100) {
    mouseInfluenceScalar = 3;
  } else {
    mouseInfluenceScalar = 6;
  }
  for (y = 0; (y | 0) < (clothH | 0); _ = y, y = (y | 0) + 1 | 0, _) {
    for (x = 0; (x | 0) < (clothW | 0); _$1 = x, x = (x | 0) + 1 | 0, _$1) {
      (Point$Point(($SP) | 0 | 0, +(+(startX | 0) + +(x | 0) * +restingDistance), +(+(startY | 0) + +(y | 0) * +restingDistance), +1, (y | 0 | 0) == 0), F4[($SP) >> 2]);
      index = (imul(y | 0, clothW | 0) | 0 | 0) + (x | 0 | 0) | 0 | 0;
      memcpy((((totalSize - globalSP | 0) + 64 | 0) + index * 52) | 0, ($SP) | 0, 52);
      tearness = +(tearSensitivity | 0);
      if ((clothH | 0) > 70) {
        if ((y | 0) % 2 | 0) {
          if ((x | 0) % 2 | 0) {
            I4[(((((totalSize - globalSP | 0) + 64 | 0) + index * 52)) + 48 | 0) >> 2] = 1;
          }
        }
        if ((y | 0) < 10) {
          tearness = +80;
        }
      }
      if ((x | 0) > 0) {
        (Link$Link(($SP) + 56 | 0 | 0, (((totalSize - globalSP | 0) + 64 | 0) + ((index | 0 | 0 | 0) - 1 | 0 | 0 | 0) * 52) | 0 | 0, (((totalSize - globalSP | 0) + 64 | 0) + index * 52) | 0 | 0, restingDistance, +1, tearness), U4[(($SP) + 56 | 0) >> 2]);
        memcpy((((totalSize - globalSP | 0) + 26000064 | 0) + linkPtr * 24) | 0, ($SP) + 56 | 0, 24);
        linkPtr = (linkPtr | 0) + 1 | 0;
      }
      if ((y | 0) > 0) {
        (Link$Link(($SP) + 80 | 0 | 0, (((totalSize - globalSP | 0) + 64 | 0) + ((imul((y | 0 | 0 | 0) - 1 | 0 | 0 | 0, clothW | 0) | 0 | 0 | 0) + (x | 0 | 0 | 0) | 0 | 0 | 0) * 52) | 0 | 0, (((totalSize - globalSP | 0) + 64 | 0) + index * 52) | 0 | 0, restingDistance, +1, tearness), U4[(($SP) + 80 | 0) >> 2]);
        memcpy((((totalSize - globalSP | 0) + 26000064 | 0) + linkPtr * 24) | 0, ($SP) + 80 | 0, 24);
        linkPtr = (linkPtr | 0) + 1 | 0;
      }
    }
  }
  numLinks = linkPtr;
  numPoints = imul(clothW, clothH);
  U4[1] = (U4[1] | 0) + 104;
  return 0.0;
}
function getClothW() {
  var $SP = 0;
  return clothW | 0;
}
function getClothH() {
  var $SP = 0;
  return clothH | 0;
}
function setGravity(value) {
  value = value | 0;
  var $SP = 0;
  gravity = value;
}
function setWind(flag) {
  flag = flag | 0;
  var $SP = 0;
  windEnabled = flag;
}
function setMouse(x, y) {
  x = x | 0;
  y = y | 0;
  var $SP = 0;
  F4[((totalSize - globalSP | 0) + 38000064 | 0) >> 2] = +(x | 0);
  F4[(((totalSize - globalSP | 0) + 38000064 | 0) + 4 | 0) >> 2] = +(y | 0);
}
function main(width) {
  width = width | 0;
  var $SP = 0;
  U4[1] = totalSize - 38000072;
  U4[0] = 4;
  canvasWidth = width;
  startTime = currentTime() | 0;
}
    function memcpy(dest, src, num) {
        dest = dest|0; src = src|0; num = num|0;
        var ret = 0;
        ret = dest|0;
        if ((dest&3) == (src&3)) {
            while (dest & 3) {
                if ((num|0) == 0) return ret|0;
                U1[(dest)]=U1[(src)];
                dest = (dest+1)|0;
                src = (src+1)|0;
                num = (num-1)|0;
            }
            while ((num|0) >= 4) {
                U4[((dest)>>2)]=U4[((src)>>2)];
                dest = (dest+4)|0;
                src = (src+4)|0;
                num = (num-4)|0;
            }
        }
        while ((num|0) > 0) {
            U1[(dest)]=U1[(src)];
            dest = (dest+1)|0;
            src = (src+1)|0;
            num = (num-1)|0;
        }
        return ret|0;
    }

    function memset(ptr, value, num) {
        ptr = ptr|0; value = value|0; num = num|0;
        var stop = 0, value4 = 0, stop4 = 0, unaligned = 0;
        stop = (ptr + num)|0;
        if ((num|0) >= 20) {
            // This is unaligned, but quite large, so work hard to get to aligned settings
            value = value & 0xff;
            unaligned = ptr & 3;
            value4 = value | (value << 8) | (value << 16) | (value << 24);
            stop4 = stop & ~3;
            if (unaligned) {
                unaligned = (ptr + 4 - unaligned)|0;
                while ((ptr|0) < (unaligned|0)) { // no need to check for stop, since we have large num
                    U1[(ptr)]=value;
                    ptr = (ptr+1)|0;
                }
            }
            while ((ptr|0) < (stop4|0)) {
                U4[((ptr)>>2)]=value4;
                ptr = (ptr+4)|0;
            }
        }
        while ((ptr|0) < (stop|0)) {
            U1[(ptr)]=value;
            ptr = (ptr+1)|0;
        }
    }

    return { update: update,
render: render,
main: main,
mousemove: mousemove,
constructMesh: constructMesh,
getClothW: getClothW,
getClothH: getClothH,
setGravity: setGravity,
setWind: setWind,
setMouse: setMouse };

})({ Uint8Array: Uint8Array,
     Int8Array: Int8Array,
     Uint16Array: Uint16Array,
     Int16Array: Int16Array,
     Uint32Array: Uint32Array,
     Int32Array: Int32Array,
     Float32Array: Float32Array,
     Float64Array: Float64Array,
     Math: Math },
   { print: print,
currentTime: currentTime,
     HEAP_SIZE: HEAP_SIZE,
     STACK_SIZE: STACK_SIZE,
     TOTAL_SIZE: SIZE },
   buffer);

function assertEqual(val1, val2) {
  var err = true;
  var msg;
  if(val1 | 0 !== val1) {
    if(Math.abs(val1 - val2) < .00000001) {
      err = false;
    }
    else {
      msg = 'eps';
    }
  }
  else if(val1 === val2) {
    err = false;
  }

  if(err) {
    throw new Error(val1 + ' does not equal ' + val2);
  }
}

function _print(/* arg1, arg2, ..., argN */) {
    var func = ((typeof console !== 'undefined' && console.log) || print);
    func.apply(null, arguments);
}

var _time;
function start() {
  _time = Date.now();
}

function end() {
  return Date.now() - _time;
}

window.verlet = asm;
})();

