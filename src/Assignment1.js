"use strict";

var canvas;
var gl;

var points = [];

var NumTimesToSubdivide = 5;
var theta;

var bufferId;

window.onload = function init()
{
    canvas = document.getElementById( "gl-canvas" );

    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    //
    //  Configure WebGL
    //
    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 1.0, 1.0, 1.0, 1.0 );

    //  Load shaders and initialize attribute buffers

    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );

    // Load the data into the GPU
    var bufferId = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, bufferId);
    gl.bufferData(gl.ARRAY_BUFFER, 8*Math.pow(3, 6), gl.STATIC_DRAW); //3 to the 6th because 0 subdivisions = 3^1, thus 5 subdivisions must be 3^6 because 5 = 6-1

    // Associate out shader variables with our data buffer

    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 2, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );

    var elmSlider = document.getElementById("slider");
    elmSlider.onchange = function (event) {
        NumTimesToSubdivide = parseInt(event.target.value);
        render();
    };
    //NumTimesToSubdivide = parseInt(elmSlider.value);    //match the initial # of subdivisions to the 
    elmSlider.value = NumTimesToSubdivide;

    var elmTheta = document.getElementById("theta");
    elmTheta.onchange = function (event) {
        var temp = parseInt(event.target.value);
        if (isNaN(temp))
            return;
        theta = temp;
        render();
    }

    render();
};

function triangle( a, b, c )
{
    points.push( a, b, c );
}

function divideTriangle( a, b, c, count )
{

    // check for end of recursion

    if ( count === 0 ) {
        triangle( a, b, c );
    }
    else {

        //bisect the sides

        var ab = mix( a, b, 0.5 );
        var ac = mix( a, c, 0.5 );
        var bc = mix( b, c, 0.5 );

        --count;

        // three new triangles

        divideTriangle( a, ab, ac, count );
        divideTriangle( c, ac, bc, count );
        divideTriangle( b, bc, ab, count );
    }
}

function render()
{
    // First, initialize the corners of our gasket with three points.

    var vertices = [
        vec2(-1, -1),
        vec2(0, 1),
        vec2(1, -1)
    ];
    points = [];
    divideTriangle(vertices[0], vertices[1], vertices[2], NumTimesToSubdivide);

    gl.bufferSubData(gl.ARRAY_BUFFER, 0, flatten(points));

    gl.clear( gl.COLOR_BUFFER_BIT );
    gl.drawArrays( gl.TRIANGLES, 0, points.length );
}
