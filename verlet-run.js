
var canvas, ctx;
var requestAnimFrame = (function(){
  return (window.requestAnimationFrame ||
          window.webkitRequestAnimationFrame ||
          window.mozRequestAnimationFrame ||
          function(callback){
            window.setTimeout(callback, 1000 / 60);
          });
})();

document.addEventListener('DOMContentLoaded', function() {
    canvas = document.createElement('canvas');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    document.body.appendChild(canvas);

    var renderer = new GLRenderer(canvas);
    if(renderer.unsupported) {
        alert('WebGL is required and not supported on your system.');
    }

    var cloth = window.verlet;
    var prevMouse = null;
    var running = false;
    var meshLevel = 5;
    var lastTime;

    function onInteract(x, y) {
        var rect = canvas.getBoundingClientRect();
        var scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
        var scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        var mouse = [x - rect.left - scrollLeft, y - rect.top - scrollTop];

        if(prevMouse) {
            cloth.mouseMove(mouse[0], mouse[1]);
        }
        else {
            cloth.setMouse(mouse[0], mouse[1]);
        }

        prevMouse = mouse;
    }

    canvas.onmousemove = function(e) {
        e.preventDefault();
        onInteract(e.pageX, e.pageY);
    };

    canvas.onmouseup = function(e) {
        e.preventDefault();
        cloth.setMouseButton(0);
    };

    canvas.onmouseleave = function(e) {
        prevMouse = null;
    };

    canvas.onmousedown = function(e) {
        e.preventDefault();
        cloth.setMouseButton(e.button == 0 ? 1 : (e.button == 2) ? 2 : 0);
        return false;
    };

    canvas.oncontextmenu = function(e) {
        e.preventDefault();
        return false;
    };

    canvas.ontouchstart = function(e) {
        e.preventDefault();

        cloth.setMouseButton(1);
    };

    canvas.ontouchmove = function(e) {
        e.preventDefault();

        var touch = e.changedTouches[0];
        console.log(touch.pageX, touch.pageY);
        onInteract(touch.pageX, touch.pageY);
    };

    document.onkeydown = function(e) {
        var btn = cloth.getMouseButton();

        switch(e.keyCode) {
        case 81:
            cloth.setMouseButton(btn == 1 ? 0 : 1); break;
        case 65:
            cloth.setMouseButton(btn == 2 ? 0 : 2); break;
        default:
            cloth.setMouseButton(0);
        }
    };
    
    function updateStatus(w, h) {
        document.getElementById('status').innerHTML = w + ', ' + h;
    }

    function setGravity() {
        cloth.setGravity(980);
    }

    function start() {
        lastTime = Date.now();
        running = true;
        requestAnimFrame(heartbeat);
    }

    function stop() {
        running = false;
    }

    function heartbeat() {
        if(!running) {
            return;
        }

        requestAnimFrame(heartbeat);

        stats.begin();
        var now = currentTime();
        var dt = now - lastTime;
        lastTime = now;

        // update

        cloth.update();

        // render

        var ptr = cloth.renderLines();
        var length = window.F4[ptr >> 2];

        var points = window.F4.subarray((ptr >> 2) + 1, (ptr >> 2) + length);
        renderer.render(points,
                        cloth.getClothW(),
                        cloth.getClothH());

        stats.end();
    }

    cloth.main(canvas.width);
    setGravity();

    function updateSize(value) {
        var output = document.querySelector('.sizer .output');
        cloth.constructMesh(value);
        output.innerHTML = cloth.getClothW() + 'x' + cloth.getClothH();
    }

    var slider = document.querySelector('.sizer input[name=size]');
    updateSize(slider.value);
    slider.addEventListener('change', function() {
        updateSize(slider.value);
    });

    var els = Array.prototype.slice.call(document.querySelectorAll('.info'));
    els.forEach(function(el) {
        el.addEventListener('click', function(e) {
            document.querySelector('a.info').classList.toggle('closed');
            document.querySelector('div.info').classList.toggle('closed');
        });
    });

    var stats = new Stats();
    stats.setMode(1); // 0: fps, 1: ms
    stats.domElement.style.position = 'absolute';
    stats.domElement.style.left = '0px';
    stats.domElement.style.top = '0px';
    document.body.appendChild(stats.domElement);

    start();
});

function currentTime() {
    if(typeof performance !== 'undefined' && performance.now) {
        return performance.now();
    }
    else {
        return Date.now();
    }
}

function print(arg) {
    console.log(arg);
}
