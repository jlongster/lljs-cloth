
function CanvasRenderer(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.ctx.fillStyle = '#111111';
    this.ctx.strokeStyle = 'blue';
}

CanvasRenderer.prototype.render = function(points) {
    var canvas = this.canvas;
    var ctx = this.ctx;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.beginPath();
    for(var i=0, l=points.length; i<l; i+=4) {
        ctx.moveTo(points[i], points[i+1]);
        ctx.lineTo(points[i+2], points[i+3]);
    }
    ctx.stroke();

}
