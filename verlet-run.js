
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
    canvas.width = 900;
    canvas.height = 700;

    document.body.appendChild(canvas);

    var renderer = new Renderer(canvas);
    var prevMouse = null;
    var running = false;
    var lastTime, rightClick;
    var F4 = new Float32Array(window.asmBuffer);

    canvas.onmousemove = function(e) {
        e.preventDefault();
        var offset = $(canvas).offset();
        var mouse = [e.pageX - offset.left, e.pageY - offset.top];

        if(prevMouse) {
            var diff = [mouse[0] - prevMouse[0], mouse[1] - prevMouse[1]];
            var d = Math.sqrt(diff[0] * diff[0] + diff[1] * diff[1]);
            
            for(var i=0; i<d; i+=1) {
                window.verlet.mousemove(prevMouse[0] + diff[0] * (i / d),
                                        prevMouse[1] + diff[1] * (i / d),
                                        rightClick);
            }
        }

        window.verlet.mousemove(mouse[0], mouse[1], rightClick);
        prevMouse = mouse;
    };

    canvas.ontouchstart = function(e) {
        var touch = e.changedTouches[0];
        canvas.onmousemove({ preventDefault: function() {},
                             pageX: touch.pageX,
                             pageY: touch.pageY });
    };

    canvas.onmouseup = function(e) {
        e.preventDefault();
        rightClick = false;
    };

    canvas.onmousedown = function(e) {
        e.preventDefault();

        if(e.button == 2) {
            rightClick = true;
        }
        else {
            rightClick = false;
        }

        return false;
    };

    canvas.oncontextmenu = function(e) {
        e.preventDefault();
    };

    function start() {
        lastTime = Date.now();
        running = true;
        requestAnimFrame(heartbeat);
    }

    function stop() {
        running = false;
    }

    var count = 0;
    function heartbeat() {
        if(!running) {
            return;
        }

        var now = currentTime();
        var dt = now - lastTime;
        lastTime = now;

        // update

        window.verlet.update(dt);

        // render

        var ptr = window.verlet.render();
        var length = F4[ptr >> 2];

        var points = F4.subarray((ptr >> 2) + 1, (ptr >> 2) + length);
        renderer.render(points);

        requestAnimFrame(heartbeat);
        count++;
    }

    window.verlet.main(canvas.width);
    start();
});

function currentTime() {
    if(performance.now) {
        return performance.now();
    }
    else {
        return Date.now();
    }
}

function print() {
    console.log.apply(this, arguments);
}
