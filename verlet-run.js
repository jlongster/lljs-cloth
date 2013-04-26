
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
    // var ctx = canvas.getContext('2d');
    // ctx.fillStyle = '#111111';
    // ctx.strokeStyle = 'blue';

    document.body.appendChild(canvas);

    var renderer = new Renderer(canvas);
    var prevMouse = null;
    var running = false;
    var meshLevel = 0;
    var meshSettled = false;
    var meshLastChange = 0;
    var lastTime, leftClick, rightClick;
    var F4 = new Float32Array(window.asmBuffer);

    canvas.onmousemove = function(e) {
        e.preventDefault();
        var rect = canvas.getBoundingClientRect();
        var scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
        var scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        var mouse = [e.pageX - rect.left - scrollLeft,
                     e.pageY - rect.top - scrollTop];

        if(prevMouse) {
            var diff = [mouse[0] - prevMouse[0], mouse[1] - prevMouse[1]];

            window.verlet.mousemove(prevMouse[0] + diff[0] / 2.0,
                                    prevMouse[1] + diff[1] / 2.0,
                                    leftClick,
                                    rightClick);
            window.verlet.mousemove(mouse[0], mouse[1], leftClick, rightClick);
        }
        else {
            window.verlet.setMouse(mouse[0], mouse[1]);
        }

        prevMouse = mouse;
    };

    canvas.onmouseup = function(e) {
        e.preventDefault();
        leftClick = false;
        rightClick = false;
    };

    canvas.onmouseleave = function(e) {
        prevMouse = null;
    };

    canvas.onmousedown = function(e) {
        e.preventDefault();
        leftClick = false;
        rightClick = false;

        if(e.button == 0) {
            leftClick = true;
        }
        else if(e.button == 2) {
            rightClick = true;
        }

        return false;
    };

    canvas.oncontextmenu = function(e) {
        e.preventDefault();
        return false;
    };

    document.onkeydown = function(e) {
        switch(e.keyCode) {
        case 81:
            rightClick = false;
            leftClick = !leftClick; break;
        case 65:
            leftClick = false;
            rightClick = !rightClick; break;
        default:
            leftClick = false;
            rightClick = false;
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
        meshLastChange = 0;
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

        if(!meshSettled && now - meshLastChange > 1000) {
            meshSettled = true;
            var msg = document.querySelector('.message');
            msg.innerHTML = 'Done!';
            msg.style.backgroundColor = '#66df66';
            msg.style.color = 'black';
            msg.className = msg.className + ' disappear';

            setTimeout(function() {
                msg.style.display = 'none';
            }, 3000);

            window.verlet.setWind(0);
            window.verlet.constructMesh(meshLevel);
            
            setGravity();
        }

        if(!meshSettled) {
            for(var i=0; i<4; i++) {
                window.verlet.mousemove(canvas.width / 2 + i, 100, false, true);
            }
        }

        // update

        window.verlet.update(dt);

        // render

        var ptr = window.verlet.render();
        var length = F4[ptr >> 2];

        var points = F4.subarray((ptr >> 2) + 1, (ptr >> 2) + length);
        renderer.render(points);

        // ctx.clearRect(0, 0, canvas.width, canvas.height);
        // ctx.beginPath();
        // for(var i=0; i<length; i+=4) {
        //     ctx.moveTo(points[i], points[i+1]);
        //     ctx.lineTo(points[i+2], points[i+3]);
        // }
        // ctx.stroke();

        var after = currentTime();
        if(after - now < 14 && !meshSettled) {
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
            window.verlet.constructMesh(meshLevel);
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
    if(performance.now) {
        return performance.now();
    }
    else {
        return Date.now();
    }
}

function print(arg) {
    console.log(arg);
}
