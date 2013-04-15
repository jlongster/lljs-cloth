
window.requestAnimFrame = (function(){
  return (window.requestAnimationFrame ||
          window.webkitRequestAnimationFrame ||
          window.mozRequestAnimationFrame ||
          function(callback){
            window.setTimeout(callback, 1000 / 60);
          });
})();

document.addEventListener('DOMContentLoaded', function() {
    var canvas, ctx, lastTime, leftOverTime, rightClick;

    canvas = document.createElement('canvas');
    ctx = canvas.getContext('2d');
    canvas.width = 500;
    canvas.height = 500;

    $('article > .canvas-here').first().before(canvas);

    var prevMouse = null;
    var running = false;
    var query = window.location.href.split('?')[1];
    var min = query === 'min';

    canvas.onmousemove = function(e) {
        e.preventDefault();
        var offset = $(canvas).offset();
        var mouse = [e.pageX - offset.left, e.pageY - offset.top];

        if(prevMouse) {
            var diff = [mouse[0] - prevMouse[0], mouse[1] - prevMouse[1]];
            var d = Math.sqrt(diff[0] * diff[0] + diff[1] * diff[1]);
            
            for(var i=0; i<d; i+=1) {
                mousemove(prevMouse[0] + diff[0] * (i / d),
                          prevMouse[1] + diff[1] * (i / d));
            }
        }

        mousemove(mouse[0], mouse[1]);
        prevMouse = mouse;
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

    start();

    function start() {
        lastTime = Date.now();
        leftOverTime = 0;
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

        var now = Date.now();
        var dt = now - lastTime;
        lastTime = now;

        var steps = Math.min(Math.max(Math.floor((dt + leftOverTime) / 16), 5), 50);
        leftOverTime = dt - steps * 16;

        for(var i=0; i<steps; i++) {
            update(16 / 1000);
        }

        render();
        requestAnimFrame(heartbeat);
    }

    function render() {
        ctx.fillStyle = 'black';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        for(var i=0, l=entities.length; i<l; i++) {
            var ent = entities[i];
            var pos = ent.pos;
            var size = ent.size;
            var links = ent.links;

            // ctx.fillStyle = ent.color;
            // ctx.fillRect(pos[0] - size[0] / 2,
            //              pos[1] - size[1] / 2,
            //              size[0],
            //              size[1]);

            ctx.strokeStyle = 'rgb(200, 210, 200)';

            for(var j=0; j<links.length; j++) {
                var p2 = links[j].point2;
                var pos2 = p2.pos;

                ctx.beginPath();
                ctx.moveTo(pos[0], pos[1]);
                ctx.lineTo(pos2[0], pos2[1]);
                ctx.closePath();
                ctx.stroke();
            }
        }

    }

    function update(dt) {
        for(var z=0; z<3; z++) {
            for(var i=0; i<entities.length; i++) {
                entities[i].solveConstraints();
            }
        }

        for(var i=0, l=entities.length; i<l; i++) {
            entities[i].update(dt);
        }
    }

    var mouseInfluenceSize = 20;
    var mouseInfluenceScalar = min ? 20 : 8;
    var lastMouse = [0, 0];
    function mousemove(x, y) {
        if(rightClick) {
            for(var i=0; i<entities.length; i++) {
                if(entities[i].pinned) {
                    continue;
                }

                var pos = entities[i].pos;
                var size = entities[i].size;

                if(x > pos[0] && x < pos[0] + size[0] &&
                   y > pos[1] && y < pos[1] + size[1]) {
                    entities[i].removeLinks();
                    entities.splice(i, 1);
                    break;
                }
            }            
        }
        else {
            for(var i=0; i<entities.length; i++) {
                if(entities[i].pinned) {
                    continue;
                }

                var pos = entities[i].pos;
                var line = [pos[0] - x, pos[1] - y];
                var dist = Math.sqrt(line[0]*line[0] + line[1]*line[1]);

                if(dist < mouseInfluenceSize) {
                    entities[i].lastPos[0] =
                        (entities[i].pos[0] -
                         (x - lastMouse[0]) * mouseInfluenceScalar);

                    entities[i].lastPos[1] = 
                        (entities[i].pos[1] -
                         (y - lastMouse[1]) * mouseInfluenceScalar);
                }
            }
        }

        lastMouse = [x, y];
    }

    // objects

    function Point(pos, size, mass, pinned) {
        this.pos = pos;
        this.lastPos = pos;
        this.size = size;
        this.mass = 1;
        this.acc = [0, .05];
        this.pinned = pinned;
        this.links = [];

        this.color = 'rgb(0,' + Math.floor(pos[0]/canvas.width*100+156) + ',220)';
    }

    Point.prototype.update = function(dt) {
        this.applyForce([0, this.mass * gravity]);
        var dtSeq = dt * dt;

        var x = this.pos[0];
        var y = this.pos[1];
        var lx = this.lastPos[0];
        var ly = this.lastPos[1];
        var acc = this.acc;

        var vel = [(x - lx) * .99, (y - ly) * .99];
        var next = [x + vel[0] + acc[0] * dtSeq,
                    y + vel[1] + acc[1] * dtSeq];
        this.lastPos = this.pos;
        this.pos = next;

        this.acc = [0, 0];
    };

    Point.prototype.solveConstraints = function() {
        var links = this.links;

        for(var i=0; i<links.length; i++) {
            links[i].solve();
        }

        if(this.pinned) {
            this.pos[0] = this.lastPos[0];
            this.pos[1] = this.lastPos[1];
        }
    };

    Point.prototype.applyForce = function(force) {
        this.acc[0] += force[0] / this.mass;
        this.acc[1] += force[1] / this.mass;
    };
    
    Point.prototype.attachTo = function(point, distRest, stiffness, tearness) {
        this.links.push(new Link(this, point, distRest, stiffness, tearness));
    };

    Point.prototype.removeLink = function(link) {
        this.links.splice(this.links.indexOf(link), 1);
    };

    Point.prototype.removeLinks = function() {
        this.links = [];
    };

    function Link(point1, point2, distRest, stiffness, tearness) {
        this.point1 = point1;
        this.point2 = point2;
        this.distRest = distRest;
        this.stiffness = stiffness;
        this.tearness = tearness;
    }

    Link.prototype.solve = function() {
        var p1 = this.point1.pos;
        var p2 = this.point2.pos;

        var diff = [p1[0] - p2[0], p1[1] - p2[1]];
        var d = Math.sqrt(diff[0] * diff[0] + diff[1] * diff[1]);

        if(d > this.tearness) {
            this.point1.removeLink(this);
        }

        var scalar = (this.distRest - d) / d;

        var im1 = 1 / this.point1.mass;
        var im2 = 1 / this.point2.mass;
        var scalarP1 = (im1 / (im1 + im2)) * this.stiffness;
        var scalarP2 = this.stiffness - scalarP1;

        if(!this.point1.pinned) {
            p1[0] += diff[0] * scalarP1 * scalar;
            p1[1] += diff[1] * scalarP1 * scalar;
        }

        if(!this.point2.pinned) {
            p2[0] -= diff[0] * scalarP2 * scalar;
            p2[1] -= diff[1] * scalarP2 * scalar;
        }
    };

    // game state

    var entities = [];
    var gravity = 500;

    var clothW = min ? 15 : 70;
    var clothH = min ? 15 : 60;
    var clothStartY = 25;
    var restingDistances = min ? 30 : 6;
    var stiffness = 1;
    var curtainTearSensitivity = min ? 100 : 30;

    var minWidth = canvas.width / 2 - (clothW * restingDistances) / 2;

    for(var y=0; y<clothH; y++) {
        for(var x=0; x<clothW; x++) {
            var p = new Point([minWidth + x * restingDistances,
                               y * restingDistances + clothStartY],
                              [3, 3],
                              1,
                              y == 0);

            if(x > 0) {
                p.attachTo(entities[entities.length - 1],
                           restingDistances,
                           1,
                           curtainTearSensitivity);
            }

            if(y > 0) {
                p.attachTo(entities[(y - 1) * clothW + x],
                           restingDistances,
                           1,
                           curtainTearSensitivity);
            }

            entities.push(p);
        }
    }
});
