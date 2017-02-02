// webGL stuff
var color
var program
var canvas;
var gl;

// Necessary arrays
var vertices = []
var points = [];
var colors = [];
var cubeColors = []

// Cube vertex buffer
var vBuffer

// Maniuplation Matrices
var modelViewMatrix
var projectionMatrix
var orthoMatrix


//Camera Stuff
var fov = 50 // set to 50 to prevent distortion
var aspect // will set to width/height to prevent distortion w/ different canvas size
var rotDeg = 0 // camera's heading
var x = 0
var y = 0
var z = -45

// Boolean to control whether to display crosshairs or not
var displayCrosshairs = false

/*===HELPER FUNCTIONS===*/

// populate the points for the cubes using the quad function
function setUpCubes(points) {
  quad( 1, 0, 3, 2 );
  quad( 2, 3, 7, 6 );
  quad( 3, 0, 4, 7 );
  quad( 6, 5, 1, 2 );
  quad( 4, 5, 6, 7 );
  quad( 5, 4, 0, 1 );
  setUpOutlines()
}


// Push the indices for the outline into the points array
function setUpOutlines() {
  var indices = [ 0, 1, 1, 2, 2, 3, 3, 0, 0, 4, 1, 5, 2, 6, 3, 7, 5, 6, 6, 7, 7, 4, 4, 5];

  for(var i =  0; i < indices.length; i++) {
    points.push(vertices[indices[i]])
  }
}

// Draw the crosshair
function drawCrosshairs() {
  var crossPoints = [
    vec2(-0.05, 0),
    vec2(0.05, 0),
    vec2(0, -0.05),
    vec2(0, 0.05)
  ]

  //Load the crosshair buffer
  var cBuffer = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer)
  gl.bufferData(gl.ARRAY_BUFFER, flatten(crossPoints), gl.STATIC_DRAW);
  gl.vertexAttribPointer(gl.getAttribLocation(program, "vPosition"), 2, gl.FLOAT, false, 0, 0);

  //Apply the orthoMatrix to the crosshair
  var mx = mat4()
  mx = mult(mx, orthoMatrix)

  // Set color to white and draw the crosshair
  gl.uniform4fv(color, flatten(vec4(1.0, 1.0, 1.0, 1.0)));
  gl.uniformMatrix4fv(modelViewMatrix, false, flatten(mx));  
  gl.drawArrays(gl.LINES, 0, 4);


}

// applying similar logic to quad function from the textbook to populate points
function quad(a, b, c, d) {
  vertices = [
      vec4( -0.5, -0.5,  0.5, 0.5 ),
      vec4( -0.5,  0.5,  0.5, 0.5 ),
      vec4(  0.5,  0.5,  0.5, 0.5 ),
      vec4(  0.5, -0.5,  0.5, 0.5 ),
      vec4( -0.5, -0.5, -0.5, 0.5 ),
      vec4( -0.5,  0.5, -0.5, 0.5 ),
      vec4(  0.5,  0.5, -0.5, 0.5 ),
      vec4(  0.5, -0.5, -0.5, 0.5 ),

  ];

  var indices = [ a, b, c, a, c, d ];

  for ( var i = 0; i < indices.length; ++i ) {
      points.push( vertices[indices[i]] );
  }
}

// function to draw the cube
function drawCube(index, matrix, trans, cubeColor) {
  matrix = mat4()
  matrix = mult(matrix, projectionMatrix) // create perspective 
  matrix = mult(matrix, rotate(rotDeg, [0, 1, 0])) // set up camera rotation
  matrix = mult(matrix, translate(vec3(x,y,z)))
  matrix = mult(matrix, translate(trans)) // move 8 cubes into positions

  // set color of cubes and draw
  gl.uniform4fv(color, flatten(cubeColor));
  gl.uniformMatrix4fv(modelViewMatrix, false, flatten(matrix))
  gl.drawArrays(gl.TRIANGLES, 0, 36);

  // set color of outlines to white and draw (Req. 4)
  gl.uniform4fv(color, flatten([1.0, 1.0, 1.0, 1.0]));
  gl.drawArrays(gl.LINES, 36, 24)
}

// function to cycle cube color (Req. 5)
function cycleColor(colors) {
  var temp = colors[0]

  for(var i = 0; i < colors.length-1; i++) {
    colors[i] = colors[i+1]
  }

  colors[colors.length-1] = temp
}

// function to calculate new x and z for i, j, k, m navigation
function calculateCos() {
  return 0.25*Math.cos(radians(rotDeg))
}

function caluclateSin() {
  return 0.25*Math.sin(radians(rotDeg))
}



window.onload = function init() {
  canvas = document.getElementById('gl-canvas')

  // Set up WebGL
  gl = WebGLUtils.setupWebGL(canvas)
  if (!gl)
    alert('WebGL is not available')

  // set up key triggers
  document.onkeydown = function(e) {
    // Cycle cube colors (Req. 5)
    e = e || window.event;
    if(e.keyCode === 67) { //key c
      cycleColor(cubeColors)
    }

    // reset the camera (Req. 9)
    if(e.keyCode === 82) { //key r
      x = 0
      y = 0
      z = -45
      rotDeg = 0
      fov = 50
    }

    // narrow the FOV (Req. 10)
    if(e.keyCode === 78) { //key n
      console.log('n pressed')
      fov -= 1
    }

    // widen the FOV (Req. 10)
    if(e.keyCode === 87) { //key w
      console.log('w pressed')
      fov += 1
    }

    /* i, j, k, m implementations uses calculateCos() and calculateSin()
    functions which take into account the heading and outputs the respective x and z*/
    // Move forward (Req. 9)
    if(e.keyCode === 73) { //key i
      console.log('i key pressed')
      z += (calculateCos())
      x -= (caluclateSin())
    }

    // Move left (Req. 9)
    if(e.keyCode === 74) { //key j
      console.log('j key pressed')
      x += calculateCos()
      z += caluclateSin()
    }


    // Move right (Req. 9)
    if(e.keyCode === 75) { //key k
      console.log('k key pressed')
      x -= calculateCos()
      z -= caluclateSin()
    }

    // Move backward (Req. 9)
    if(e.keyCode === 77) { //key m
      console.log('m key pressed')
      z -= calculateCos()
      x += caluclateSin()
    }

    // Control position of camera along Y axis (Req. 7)  
    if(e.keyCode === 38) { //key up
      console.log('up arrow pressed')
      y -= .25
    }

    // Control position of camera along Y axis (Req. 7)  
    if(e.keyCode === 40) { //key down
      console.log('down arrow pressed')
      y += .25
    }

    // Control heading of camera (Req. 8)
    if(e.keyCode === 37) { //key left
      console.log('left arrow pressed')
      rotDeg -= 4
      console.log(rotDeg)
    }

    // Control heading of camera (Req. 8)
    if(e.keyCode === 39) { //key right
      console.log('right arrow pressed')
      rotDeg += 4
      console.log(rotDeg)
    }

    // Toggles crosshair (Req. 11)
    if(e.keyCode === 187) { //key plus sign
      console.log('plus key pressed')
      displayCrosshairs = !displayCrosshairs
      console.log(displayCrosshairs)
    }
  }



  gl.viewport(0, 0, canvas.width, canvas.height) // set viewport
  gl.clearColor(0.0, 0.0, 0.0, 1.0) // set canvas to black (Req. 2)
  gl.enable(gl.DEPTH_TEST) // enable depth test (Req. 2)

  cubeColors = [
    vec4(0.08, 0.21, 0.51, 1.0),  // dark blue
    vec4(0.51, 0.03, 0.49, 1.0),  // dark magenta
    vec4(0.76, 0.53, 0.04, 1.0),  // dark gold
    vec4(0.61, .74, 0.04, 1.0),  // dark green
    vec4(0.38, 0.5, .77, 1.0),  // light blue
    vec4(.78, 0.34, .76, 1.0),  // light magenta
    vec4(1.0, .81, 0.44, 1.0),  // light gold
    vec4(0.88, .97, .43, 1.0)   // light green
  ];

  // set up points
  setUpCubes(points)

  // Load shaders and initialize attribute buffers (similar to textbook code)
  program = initShaders(gl, "vertex-shader", "fragment-shader")
  gl.useProgram(program)

  // create vertex buffer that will hold the vertex data that will be drawn
  vBuffer = gl.createBuffer(); // create vertex buffer
  gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer ); // bind buffer
  gl.bufferData( gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW ); // inserted vertices into buffer

  // find attribute position
  var vPosition = gl.getAttribLocation( program, "vPosition" );
  gl.vertexAttribPointer( vPosition, 4, gl.FLOAT, false, 0, 0 );
  gl.enableVertexAttribArray( vPosition );


  render()
}

function render() {

  // this matrix will handle all transformations
  var mx = mat4()

  // set the aspect ration
  aspect = canvas.width/canvas.height

  projectionMatrix = perspective(fov/aspect, aspect, 1, 100) // creates perspective, keeps the cubes in a square aspect ration (Req. 6)
  orthoMatrix = ortho(-1.0, 1.0, -1.0, 1.0, -1.0, 1.0) // used for the crosshair
  color = gl.getUniformLocation(program, "color")
  modelViewMatrix = gl.getUniformLocation(program, "modelViewMatrix")


  gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  // create array that specifies
  var pos = [
    vec3(-10, -10, -10),
    vec3(-10, -10, 10),
    vec3(-10, 10, -10),
    vec3(-10, 10, 10),
    vec3(10, -10, -10),
    vec3(10, -10, 10),
    vec3(10, 10, -10),
    vec3(10, 10, 10)
  ]

  // This will draw the 8 cubes w/ color and position dependent on index (Req. 3)
  for (var i=0; i < 8; i++) {
    drawCube(i, mx, pos[i], cubeColors[i]);
  }

  // check if crosshairs need to be displayed (Req. 11)
  if(displayCrosshairs){
    drawCrosshairs()
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    // after drawing crosshair, reset the buffer to the cubes
    gl.vertexAttribPointer(gl.getAttribLocation(program, "vPosition"), 4, gl.FLOAT, false, 0, 0);
  }

  window.requestAnimFrame(render);
}
