
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
    canvas.width = 1200;
    canvas.height = 800;

    document.body.appendChild(canvas);

    var renderer = new GLRenderer(canvas);
    if(renderer.unsupported) {
        renderer = new CanvasRenderer(canvas);
    }

    var prevMouse = null;
    var running = false;
    var meshLevel = 0;
    var meshSettled = false;
    var meshLastChange = 0;
    var lastTime;
    var F4 = new Float32Array(window.asmBuffer);

    function onInteract(x, y) {
        var rect = canvas.getBoundingClientRect();
        var scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
        var scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        var mouse = [x - rect.left - scrollLeft, y - rect.top - scrollTop];

        if(prevMouse) {
            window.verlet.mouseMove(mouse[0], mouse[1]);
        }
        else {
            window.verlet.setMouse(mouse[0], mouse[1]);
        }

        prevMouse = mouse;
    }

    canvas.onmousemove = function(e) {
        e.preventDefault();
        onInteract(e.pageX, e.pageY);
    };

    canvas.onmouseup = function(e) {
        e.preventDefault();
        window.verlet.setMouseButton(0);
    };

    canvas.onmouseleave = function(e) {
        prevMouse = null;
    };

    canvas.onmousedown = function(e) {
        e.preventDefault();
        window.verlet.setMouseButton(e.button == 0 ? 1 : (e.button == 2) ? 2 : 0);
        return false;
    };

    canvas.oncontextmenu = function(e) {
        e.preventDefault();
        return false;
    };

    canvas.ontouchstart = function(e) {
        e.preventDefault();

        window.verlet.setMouseButton(1);
    };

    canvas.ontouchmove = function(e) {
        e.preventDefault();

        var touch = e.changedTouches[0];
        console.log(touch.pageX, touch.pageY);
        onInteract(touch.pageX, touch.pageY);
    };

    document.onkeydown = function(e) {
        var btn = window.verlet.getMouseButton();

        switch(e.keyCode) {
        case 81:
            window.verlet.setMouseButton(btn == 1 ? 0 : 1); break;
        case 65:
            window.verlet.setMouseButton(btn == 2 ? 0 : 2); break;
        default:
            window.verlet.setMouseButton(0);
        }
    };
    
    function updateStatus(w, h) {
        document.getElementById('status').innerHTML = w + ', ' + h;
    }

    function setGravity() {
        window.verlet.setGravity(980);
    }

    function start() {
        lastTime = Date.now();
        meshLastChange = lastTime;
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

        var now = currentTime();
        var dt = now - lastTime;
        lastTime = now;

        // Require a minimum meshLevel of 5 because if the page is
        // opened in a background tab it will not be run will think it
        // has settled
        if(!meshSettled && now - meshLastChange > 1000 && meshLevel > 5) {
            meshSettled = true;
            var msg = document.querySelector('.message');
            msg.innerHTML = 'Done!';
            msg.style.animationName = 'none';
            msg.style.webkitAnimationName = 'none';
            msg.style.backgroundColor = '#66df66';
            msg.style.color = 'black';
            msg.className = msg.className + ' disappear';

            setTimeout(function() {
                msg.style.display = 'none';
            }, 3000);

            window.verlet.setWind(0);
            window.verlet.setMouseButton(0);
            window.verlet.constructMesh(meshLevel);
            
            setGravity();
        }
        else if(!meshSettled) {
            window.verlet.setMouseButton(1);
            window.verlet.mouseMove(canvas.width / 2 + Math.random() * 100 - 50, 100);
        }

        // update

        window.verlet.update();

        // render

        var ptr = window.verlet.render();
        var length = F4[ptr >> 2];

        var points = F4.subarray((ptr >> 2) + 1, (ptr >> 2) + length);
        renderer.render(points);

        var after = currentTime();
        if(after - now < 15 && !meshSettled) {
            window.verlet.constructMesh(meshLevel++);
            meshLastChange = after;

            updateStatus(window.verlet.getClothW(), window.verlet.getClothH());
        }
    }

    var gravity = document.querySelector('.controls .gravity input');
    gravity.checked = true;
    gravity.addEventListener('click', function() {
        if(this.checked) {
            setGravity();
        }
        else {
            window.verlet.setGravity(0);
        }
    });

    var wind = document.querySelector('.controls .wind input');
    wind.checked = false;
    wind.addEventListener('click', function() {
        if(this.checked) {
            window.verlet.setWind(1);
        }
        else {
            window.verlet.setWind(0);
        }
    });

    var resetbtn = document.querySelector('.controls .reset button');
    resetbtn.addEventListener('click', function() {
        window.verlet.constructMesh(meshLevel);
    });

    var share = document.querySelector('.sidebar .share a');
    share.addEventListener('click', function(e) {
        e.preventDefault();
        this.style.display = 'none';

        document.querySelector('.sidebar .share-buttons').style.display = 'block';

        var js, fjs = document.getElementsByTagName('script')[0];
        if(document.getElementById('facebook-jssdk')) return;
        js = document.createElement('script'); js.id = 'facebook-jssdk';
        js.src = "//connect.facebook.net/en_US/all.js#xfbml=1&appId=648899888459868";
        fjs.parentNode.insertBefore(js, fjs);
    });

    window.verlet.main(canvas.width);
    window.verlet.constructMesh(0);
    window.verlet.setWind(1);
    setGravity();
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
