
function ajaxGet(url, success) {
    var ajax = new XMLHttpRequest();

    ajax.onreadystatechange = function() {
        if(ajax.readyState == 4 && ajax.status == 200) {
            success(ajax.responseText);
        }
    };

    ajax.open('GET', url, true);
    ajax.send();
}

function Renderer(canvas) {
    var glOpts = {
        antialias: false,
        depth: false,
        preserveDrawingBuffer: true
    };

    this.width = canvas.width;
    this.height = canvas.height;
    this.gl = canvas.getContext('webgl', glOpts) || canvas.getContext('experimental-webgl', glOpts);
    this.persMatrix = mat4.create();
    this.worldTransform = mat4.create();
    this.finalMatrix = mat4.create();
    this.isReady = false;

    if(!this.gl) {
        alert('WebGL is required and is not available on your device');
    }

    mat4.ortho(0, this.width, this.height, 0, -1, 1, this.persMatrix);
    mat4.identity(this.worldTransform);

    // Fetch the shaders

    var vsrc, fsrc, renderer = this;

    ajaxGet('shaders/basic.vsh', function(r) {
        vsrc = r;

        if(vsrc && fsrc) {
           renderer.init(vsrc, fsrc);
        }
    });

    ajaxGet('shaders/basic.fsh', function(r) {
        fsrc = r;
        
        if(vsrc && fsrc) {
           renderer.init(vsrc, fsrc);
        }
    });
}

Renderer.prototype.init = function(vertexSrc, fragmentSrc) {
    var gl = this.gl;

    var vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    this.vertexBuffer = vertexBuffer;

    // program

    function compile(shader, src) {
        gl.shaderSource(shader, src);
        gl.compileShader(shader);

        var status = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
        if(!status) {
            var err = gl.getShaderInfoLog(shader);
            gl.deleteShader(shader);
            throw new Error('shader compilation error: ' + err);
        }

        return shader;
    }

    var vshader = compile(gl.createShader(gl.VERTEX_SHADER), vertexSrc);
    var fshader = compile(gl.createShader(gl.FRAGMENT_SHADER), fragmentSrc);

    var program = gl.createProgram();
    gl.attachShader(program, vshader);
    gl.attachShader(program, fshader);
    gl.linkProgram(program);
    gl.useProgram(program);

    var status = gl.getProgramParameter(program, gl.LINK_STATUS);
    if(!status) {
        var err = gl.getProgramInfoLog(program);
        gl.deleteProgram(program);
        throw new Error('program linking error: ' + err);
    }

    this.program = program;
    this.worldTransformLoc = gl.getUniformLocation(program, 'worldTransform');

    this.isReady = true;
};

Renderer.prototype.clear = function() {
    var gl = this.gl;
    gl.clearColor(.066666, .066666, .066666, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);
};

Renderer.prototype.render = function(points) {
    if(!this.isReady) {
        return;
    }

    var gl = this.gl;

    this.clear();
    mat4.multiply(this.persMatrix,
                  this.worldTransform,
                  this.finalMatrix);

    gl.uniformMatrix4fv(this.worldTransformLoc, false, this.finalMatrix);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, points, gl.STATIC_DRAW);

    var loc = gl.getAttribLocation(this.program, 'a_position');
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

    gl.drawArrays(gl.LINES, 0, points.length / 2);
};
