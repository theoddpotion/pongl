import Keyboard from './keyboard.js';

window.addEventListener('load', function(){
	main();
});

function main(){
	//Initialize canvas and gl context
	let canvas = document.getElementById('glCanvas');
	let gl = canvas.getContext('webgl2');
	if(!gl){
		console.error('Your browser does not support WebGL 2.0!');
		//alert or something, shouldnt ever happen within node-webkit
	}

	//Setup window resize event to update canvas and gl.viewport when window resized
	let win = nw.Window.get();
	win.on('resize', function(){
		if(gl) resize(gl);
	});
	resize(gl);
	function resize(gl){
		let win = nw.Window.get();
		
		let w = win.width;
		let h = win.height - 18;

		let canvas = gl.canvas;
		if(canvas.width !== w || canvas.height !== h){
			canvas.width = w;
			canvas.height = h;
			canvas.style.width = w + 'px';
			canvas.style.height = h + 'px';

			gl.viewport(0, 0, w, h);
		}
	}

	//setup some rendering stuff
	gl.clearColor(0.0, 0.0, 0.0, 1.0);
	gl.clearDepth(1.0);
	gl.enable(gl.DEPTH_TEST);
	gl.depthFunc(gl.LEQUAL);

	gl.enable(gl.CULL_FACE);

	//Load shader program
	let program = createProgramFromSource(gl, vertShaderSourceData, fragShaderSourceData);

	//Store attribute locations
	let positionAttributeLocation = gl.getAttribLocation(program, 'a_position');
	let colorAttributeLocation = gl.getAttribLocation(program, 'a_color');

	//Store uniform locations
	let projectionMatrixLocation = gl.getUniformLocation(program, 'u_projectionMatrix');
	let viewMatrixLocation = gl.getUniformLocation(program, 'u_viewMatrix');
	let modelViewMatrixLocation = gl.getUniformLocation(program, 'u_modelViewMatrix');


	let vao = gl.createVertexArray();
	gl.bindVertexArray(vao);

	//Setup geometry data with vao
	//Define geometry data
	let positions = [
		//Column Front
		-0.5, 0.5, 0.125,	//0
		-0.5, -0.5, 0.125,	//1
		-0.25, -0.5, 0.125,	//2
		-0.25, -0.5, 0.125,	//2
		-0.25, 0.5, 0.125,	//3
		-0.5, 0.5, 0.125,	//0

		//Column Back
		-0.25, 0.5, -0.125,
		-0.25, -0.5, -0.125,
		-0.5, -0.5, -0.125,
		-0.5, -0.5, -0.125,
		-0.5, 0.5, -0.125,
		-0.25, 0.5, -0.125,

		//Column Top
		-0.5, 0.5, -0.125,
		-0.5, 0.5, 0.125,
		-0.25, 0.5, 0.125,
		-0.25, 0.5, 0.125,
		-0.25, 0.5, -0.125,
		-0.5, 0.5, -0.125,

		//Column Bottom
		-0.5, -0.5, 0.125,
		-0.5, -0.5, -0.125,
		-0.25, -0.5, -0.125,
		-0.25, -0.5, -0.125,
		-0.25, -0.5, 0.125,
		-0.5, -0.5, 0.125,

		//Column Side
		-0.5, 0.5, -0.125,
		-0.5, -0.5, -0.125,
		-0.5, -0.5, 0.125,
		-0.5, -0.5, 0.125,
		-0.5, 0.5, 0.125,
		-0.5, 0.5, -0.125,

		//Column Lower Side
		-0.25, -0.25, 0.125,
		-0.25, -0.5, 0.125,
		-0.25, -0.5, -0.125,
		-0.25, -0.5, -0.125,
		-0.25, -0.25, -0.125,
		-0.25, -0.25, 0.125,

		//Column Upper Side
		-0.25, 0.25, 0.125,
		-0.25, 0.0, 0.125,
		-0.25, 0.0, -0.125,
		-0.25, 0.0, -0.125,
		-0.25, 0.25, -0.125,
		-0.25, 0.25, 0.125,

		//Bar Upper Front
		-0.25, 0.5, 0.125,
		-0.25, 0.25, 0.125,
		0.5, 0.25, 0.125,
		0.5, 0.25, 0.125,
		0.5, 0.5, 0.125,
		-0.25, 0.5, 0.125,

		//Bar Upper Back
		0.5, 0.5, -0.125,
		0.5, 0.25, -0.125,
		-0.25, 0.25, -0.125,
		-0.25, 0.25, -0.125,
		-0.25, 0.5, -0.125,
		0.5, 0.5, -0.125,

		//Bar Upper Top
		-0.25, 0.5, -0.125,
		-0.25, 0.5, 0.125,
		0.5, 0.5, 0.125,
		0.5, 0.5, 0.125,
		0.5, 0.5, -0.125,
		-0.25, 0.5, -0.125,

		//Bar Upper Bottom
		-0.25, 0.25, 0.125,
		-0.25, 0.25, -0.125,
		0.5, 0.25, -0.125,
		0.5, 0.25, -0.125,
		0.5, 0.25, 0.125,
		-0.25, 0.25, 0.125,

		//Bar Upper End
		0.5, 0.5, 0.125,
		0.5, 0.25, 0.125,
		0.5, 0.25, -0.125,
		0.5, 0.25, -0.125,
		0.5, 0.5, -0.125,
		0.5, 0.5, 0.125,

		//Bar Lower Front
		-0.25, 0.0, 0.125,
		-0.25, -0.25, 0.125,
		0.25, -0.25, 0.125,
		0.25, -0.25, 0.125,
		0.25, 0.0, 0.125,
		-0.25, 0.0, 0.125,

		//Bar Lower Back
		0.25, 0.0, -0.125,
		0.25, -0.25, -0.125,
		-0.25, -0.25, -0.125,
		-0.25, -0.25, -0.125,
		-0.25, 0.0, -0.125,
		0.25, 0.0, -0.125,

		//Bar Lower Top
		-0.25, 0.0, -0.125,
		-0.25, 0.0, 0.125,
		0.25, 0.0, 0.125,
		0.25, 0.0, 0.125,
		0.25, 0.0, -0.125,
		-0.25, 0.0, -0.125,

		//Bar Lower Bottom
		-0.25, -0.25, 0.125,
		-0.25, -0.25, -0.125,
		0.25, -0.25, -0.125,
		0.25, -0.25, -0.125,
		0.25, -0.25, 0.125,
		-0.25, -0.25, 0.125,

		//Bar Lower End
		0.25, 0.0, 0.125,
		0.25, -0.25, 0.125,
		0.25, -0.25, -0.125,
		0.25, -0.25, -0.125,
		0.25, 0.0, -0.125,
		0.25, 0.0, 0.125,
	];
	let positionBuffer = gl.createBuffer();
	gl.enableVertexAttribArray(positionAttributeLocation);
	gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
	setPositions(gl, positions);

	//We need to define how the data that the 'a_position' attribute is expecting is laid out. 
	{
		let size = 3;
		let type = gl.FLOAT;
		let normalize = false;
		let stride = 0;
		let offset = 0;
		//this binds the currently bound ARRAY_BUFFER to the attribute.
		//this is what actually "connects" the data(positions) to the shaders "in vec4 a_position"
		gl.vertexAttribPointer(positionAttributeLocation, size, type, normalize, stride, offset);
	}


	//Setup color data with vao
	let colors = [
		//Column Front
		255, 0, 0,
		255, 0, 0,
		255, 0, 0,
		255, 0, 0,
		255, 0, 0,
		255, 0, 0,
		//Column Back
		0, 0, 255,
		0, 0, 255,
		0, 0, 255,
		0, 0, 255,
		0, 0, 255,
		0, 0, 255,

		//Column Top
		255, 0, 255,
		255, 0, 255,
		255, 0, 255,
		255, 0, 255,
		255, 0, 255,
		255, 0, 255,

		//Column Bottom
		255, 255, 0,
		255, 255, 0,
		255, 255, 0,
		255, 255, 0,
		255, 255, 0,
		255, 255, 0,

		//Column Side
		0, 255, 0,
		0, 255, 0,
		0, 255, 0,
		0, 255, 0,
		0, 255, 0,
		0, 255, 0,

		//Column Lower Side
		0, 255, 255,
		0, 255, 255,
		0, 255, 255,
		0, 255, 255,
		0, 255, 255,
		0, 255, 255,

		//Column Upper Side
		0, 255, 255,
		0, 255, 255,
		0, 255, 255,
		0, 255, 255,
		0, 255, 255,
		0, 255, 255,

		//Bar Upper Front
		255, 0, 0,
		255, 0, 0,
		255, 0, 0,
		255, 0, 0,
		255, 0, 0,
		255, 0, 0,

		//Bar Upper Back
		0, 0, 255,
		0, 0, 255,
		0, 0, 255,
		0, 0, 255,
		0, 0, 255,
		0, 0, 255,

		//Bar Upper Top
		255, 0, 255,
		255, 0, 255,
		255, 0, 255,
		255, 0, 255,
		255, 0, 255,
		255, 0, 255,

		//Bar Upper Bottom
		255, 255, 0,
		255, 255, 0,
		255, 255, 0,
		255, 255, 0,
		255, 255, 0,
		255, 255, 0,

		//Bar Upper Side
		0, 255, 255,
		0, 255, 255,
		0, 255, 255,
		0, 255, 255,
		0, 255, 255,
		0, 255, 255,

		//Bar Lower Front
		255, 0, 0,
		255, 0, 0,
		255, 0, 0,
		255, 0, 0,
		255, 0, 0,
		255, 0, 0,

		//Bar Lower Back
		0, 0, 255,
		0, 0, 255,
		0, 0, 255,
		0, 0, 255,
		0, 0, 255,
		0, 0, 255,

		//Bar Lower Top
		255, 0, 255,
		255, 0, 255,
		255, 0, 255,
		255, 0, 255,
		255, 0, 255,
		255, 0, 255,

		//Bar Lower Bottom
		255, 255, 0,
		255, 255, 0,
		255, 255, 0,
		255, 255, 0,
		255, 255, 0,
		255, 255, 0,

		//Bar Lower Side
		0, 255, 255,
		0, 255, 255,
		0, 255, 255,
		0, 255, 255,
		0, 255, 255,
		0, 255, 255,
	];
	let colorBuffer = gl.createBuffer();
	gl.enableVertexAttribArray(colorAttributeLocation);
	gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
	setColors(gl, colors);	

	{
		let size = 3;
		let type = gl.UNSIGNED_BYTE;
		let normalize = true;
		let stride = 0;
		let offset = 0;
		//this binds the currently bound ARRAY_BUFFER to the attribute.
		//this is what actually "connects" the data(positions) to the shaders "in vec4 a_position"
		gl.vertexAttribPointer(colorAttributeLocation, size, type, normalize, stride, offset);
	}

	//Camera transform
	let cameraTranslation = [0.0, 0.0, 10.0];
	let cameraRotationDeg = [0.0, 0.0, 0.0];

	//model 'F' transform
	let translation = [0.0, 0.0, 0.0];
	let rotationDeg = [0.0, 0.0, 0.0];
	let scale = [1.0, 1.0, 1.0];

	//Begin render loop
	requestAnimationFrame(render);

	let timer = 0;
	function render(){

		//Input stuffs
		if(Keyboard.getKey(Keyboard.KeyCode.LEFT)){
			cameraRotationDeg[1] += 5.0;
		}else if(Keyboard.getKey(Keyboard.KeyCode.RIGHT)){
			cameraRotationDeg[1] -= 5.0;
		}

		if(Keyboard.getKey(Keyboard.KeyCode.UP)){
			cameraRotationDeg[0] += 5.0;
		}else if(Keyboard.getKey(Keyboard.KeyCode.DOWN)){
			cameraRotationDeg[0] -= 5.0;
		}

		if(Keyboard.getKey(Keyboard.KeyCode.W)){
			let deltaX = -Math.sin(DegToRad(cameraRotationDeg[1]));
			let deltaZ = -Math.cos(DegToRad(cameraRotationDeg[1]));

			cameraTranslation[0] += deltaX * 0.5;
			cameraTranslation[2] += deltaZ * 0.5;
		}else if(Keyboard.getKey(Keyboard.KeyCode.S)){
			let deltaX = -Math.sin(DegToRad(cameraRotationDeg[1]));
			let deltaZ = -Math.cos(DegToRad(cameraRotationDeg[1]));

			cameraTranslation[0] -= deltaX * 0.5;
			cameraTranslation[2] -= deltaZ * 0.5;
		}

		//Temp animation stuff
		timer += 0.01;
		rotationDeg[0] = Math.sin(timer*2) * 45.0;
		rotationDeg[1] = Math.sin(timer) * 45.0;
		//cameraRotationDeg[0] = Math.sin(timer*2) * 5;

		//Begin render by clearing canvas
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

		gl.useProgram(program);
		gl.bindVertexArray(vao);

		//set uniforms
		const fov = DegToRad(90);
		const aspect = gl.canvas.width / gl.canvas.height;
		const zNear = 0.1;
		const zFar = 100.0;
		const projectionMatrix = glMatrix.mat4.create();
		glMatrix.mat4.perspective(projectionMatrix, fov, aspect, zNear, zFar);
		gl.uniformMatrix4fv(projectionMatrixLocation, false, projectionMatrix);

		let cameraMatrix = glMatrix.mat4.create();
		cameraMatrix = glMatrix.mat4.translate(cameraMatrix, cameraMatrix, [cameraTranslation[0], cameraTranslation[1], cameraTranslation[2]]);
		cameraMatrix = glMatrix.mat4.rotateX(cameraMatrix, cameraMatrix, DegToRad(cameraRotationDeg[0]));
		cameraMatrix = glMatrix.mat4.rotateY(cameraMatrix, cameraMatrix, DegToRad(cameraRotationDeg[1]));
		cameraMatrix = glMatrix.mat4.rotateZ(cameraMatrix, cameraMatrix, DegToRad(cameraRotationDeg[2]));

		let viewMatrix = glMatrix.mat4.create();
		viewMatrix = glMatrix.mat4.invert(viewMatrix, cameraMatrix);
		gl.uniformMatrix4fv(viewMatrixLocation, false, viewMatrix);

		let modelViewMatrix = glMatrix.mat4.create();
		modelViewMatrix = glMatrix.mat4.translate(modelViewMatrix, modelViewMatrix, [translation[0], translation[1], translation[2]]);
		modelViewMatrix = glMatrix.mat4.rotateX(modelViewMatrix, modelViewMatrix, DegToRad(rotationDeg[0]));
		modelViewMatrix = glMatrix.mat4.rotateY(modelViewMatrix, modelViewMatrix, DegToRad(rotationDeg[1]));
		modelViewMatrix = glMatrix.mat4.rotateZ(modelViewMatrix, modelViewMatrix, DegToRad(rotationDeg[2]));
		modelViewMatrix = glMatrix.mat4.scale(modelViewMatrix, modelViewMatrix, [scale[0], scale[1], scale[2]]);
		gl.uniformMatrix4fv(modelViewMatrixLocation, false, modelViewMatrix);
		
		//Draw everything
		let primitiveType = gl.TRIANGLES;
		let offset = 0;
		let count = 6 * 17;
		gl.drawArrays(primitiveType, offset, count);

		requestAnimationFrame(render);
	}
}




function setPositions(gl, positions){
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);
}

function setColors(gl, colors){
	gl.bufferData(gl.ARRAY_BUFFER, new Uint8Array(colors), gl.STATIC_DRAW);
}

function createShader(gl, type, source){
	let shader = gl.createShader(type);
	gl.shaderSource(shader, source);
	gl.compileShader(shader);

	let success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
	if(success){
		return shader;
	}

	console.log(gl.getShaderInfoLog(shader));
	gl.deleteShader(shader);
}

function createProgram(gl, vertShader, fragShader){
	let program = gl.createProgram();
	gl.attachShader(program, vertShader);
	gl.attachShader(program, fragShader);
	gl.linkProgram(program);

	let success = gl.getProgramParameter(program, gl.LINK_STATUS);
	if(success){
		return program;
	}

	console.log(gl.getProgramInfoLog(program));
	gl.deleteProgram(program);
}

function createProgramFromSource(gl, vertShaderSource, fragShaderSource){
	let vertShader = createShader(gl, gl.VERTEX_SHADER, vertShaderSource);
	let fragShader = createShader(gl, gl.FRAGMENT_SHADER, fragShaderSource);
	return createProgram(gl, vertShader, fragShader);
}


//Shader sources
const vertShaderSourceData = `#version 300 es

	uniform mat4 u_projectionMatrix;
	uniform mat4 u_viewMatrix;
	uniform mat4 u_modelViewMatrix;

	in vec4 a_position;
	in vec4 a_color;

	out vec4 v_color;

	void main(){
		v_color = a_color;

		gl_Position = u_projectionMatrix * u_viewMatrix * u_modelViewMatrix * a_position;
	}
`;

const fragShaderSourceData = `#version 300 es

	precision mediump float;

	in vec4 v_color;

	out vec4 outColor;

	void main(){
		outColor = v_color;
	}
`;

function DegToRad(deg){
	return deg * (Math.PI / 180.0);
}

function RadToDeg(rad){
	return rad * (180.0 / Math.PI);
}

//'F' vertex positions
// let positions = [
// 	//Column Front
// 	-0.5, 0.5, 0.125,	//0
// 	-0.5, -0.5, 0.125,	//1
// 	-0.25, -0.5, 0.125,	//2
// 	-0.25, -0.5, 0.125,	//2
// 	-0.25, 0.5, 0.125,	//3
// 	-0.5, 0.5, 0.125,	//0

// 	//Column Back
// 	-0.25, 0.5, -0.125,
// 	-0.25, -0.5, -0.125,
// 	-0.5, -0.5, -0.125,
// 	-0.5, -0.5, -0.125,
// 	-0.5, 0.5, -0.125,
// 	-0.25, 0.5, -0.125,

// 	//Column Top
// 	-0.5, 0.5, -0.125,
// 	-0.5, 0.5, 0.125,
// 	-0.25, 0.5, 0.125,
// 	-0.25, 0.5, 0.125,
// 	-0.25, 0.5, -0.125,
// 	-0.5, 0.5, -0.125,

// 	//Column Bottom
// 	-0.5, -0.5, 0.125,
// 	-0.5, -0.5, -0.125,
// 	-0.25, -0.5, -0.125,
// 	-0.25, -0.5, -0.125,
// 	-0.25, -0.5, 0.125,
// 	-0.5, -0.5, 0.125,

// 	//Column Side
// 	-0.5, 0.5, -0.125,
// 	-0.5, -0.5, -0.125,
// 	-0.5, -0.5, 0.125,
// 	-0.5, -0.5, 0.125,
// 	-0.5, 0.5, 0.125,
// 	-0.5, 0.5, -0.125,

// 	//Column Lower Side
// 	-0.25, -0.25, 0.125,
// 	-0.25, -0.5, 0.125,
// 	-0.25, -0.5, -0.125,
// 	-0.25, -0.5, -0.125,
// 	-0.25, -0.25, -0.125,
// 	-0.25, -0.25, 0.125,

// 	//Column Upper Side
// 	-0.25, 0.25, 0.125,
// 	-0.25, 0.0, 0.125,
// 	-0.25, 0.0, -0.125,
// 	-0.25, 0.0, -0.125,
// 	-0.25, 0.25, -0.125,
// 	-0.25, 0.25, 0.125,

// 	//Bar Upper Front
// 	-0.25, 0.5, 0.125,
// 	-0.25, 0.25, 0.125,
// 	0.5, 0.25, 0.125,
// 	0.5, 0.25, 0.125,
// 	0.5, 0.5, 0.125,
// 	-0.25, 0.5, 0.125,

// 	//Bar Upper Back
// 	0.5, 0.5, -0.125,
// 	0.5, 0.25, -0.125,
// 	-0.25, 0.25, -0.125,
// 	-0.25, 0.25, -0.125,
// 	-0.25, 0.5, -0.125,
// 	0.5, 0.5, -0.125,

// 	//Bar Upper Top
// 	-0.25, 0.5, -0.125,
// 	-0.25, 0.5, 0.125,
// 	0.5, 0.5, 0.125,
// 	0.5, 0.5, 0.125,
// 	0.5, 0.5, -0.125,
// 	-0.25, 0.5, -0.125,

// 	//Bar Upper Bottom
// 	-0.25, 0.25, 0.125,
// 	-0.25, 0.25, -0.125,
// 	0.5, 0.25, -0.125,
// 	0.5, 0.25, -0.125,
// 	0.5, 0.25, 0.125,
// 	-0.25, 0.25, 0.125,

// 	//Bar Upper End
// 	0.5, 0.5, 0.125,
// 	0.5, 0.25, 0.125,
// 	0.5, 0.25, -0.125,
// 	0.5, 0.25, -0.125,
// 	0.5, 0.5, -0.125,
// 	0.5, 0.5, 0.125,

// 	//Bar Lower Front
// 	-0.25, 0.0, 0.125,
// 	-0.25, -0.25, 0.125,
// 	0.25, -0.25, 0.125,
// 	0.25, -0.25, 0.125,
// 	0.25, 0.0, 0.125,
// 	-0.25, 0.0, 0.125,

// 	//Bar Lower Back
// 	0.25, 0.0, -0.125,
// 	0.25, -0.25, -0.125,
// 	-0.25, -0.25, -0.125,
// 	-0.25, -0.25, -0.125,
// 	-0.25, 0.0, -0.125,
// 	0.25, 0.0, -0.125,

// 	//Bar Lower Top
// 	-0.25, 0.0, -0.125,
// 	-0.25, 0.0, 0.125,
// 	0.25, 0.0, 0.125,
// 	0.25, 0.0, 0.125,
// 	0.25, 0.0, -0.125,
// 	-0.25, 0.0, -0.125,

// 	//Bar Lower Bottom
// 	-0.25, -0.25, 0.125,
// 	-0.25, -0.25, -0.125,
// 	0.25, -0.25, -0.125,
// 	0.25, -0.25, -0.125,
// 	0.25, -0.25, 0.125,
// 	-0.25, -0.25, 0.125,

// 	//Bar Lower End
// 	0.25, 0.0, 0.125,
// 	0.25, -0.25, 0.125,
// 	0.25, -0.25, -0.125,
// 	0.25, -0.25, -0.125,
// 	0.25, 0.0, -0.125,
// 	0.25, 0.0, 0.125,
// ];

//'F' vertex colors
// let colors = [
// 	//Column Front
// 	255, 0, 0,
// 	255, 0, 0,
// 	255, 0, 0,
// 	255, 0, 0,
// 	255, 0, 0,
// 	255, 0, 0,
// 	//Column Back
// 	0, 0, 255,
// 	0, 0, 255,
// 	0, 0, 255,
// 	0, 0, 255,
// 	0, 0, 255,
// 	0, 0, 255,

// 	//Column Top
// 	255, 0, 255,
// 	255, 0, 255,
// 	255, 0, 255,
// 	255, 0, 255,
// 	255, 0, 255,
// 	255, 0, 255,

// 	//Column Bottom
// 	255, 255, 0,
// 	255, 255, 0,
// 	255, 255, 0,
// 	255, 255, 0,
// 	255, 255, 0,
// 	255, 255, 0,

// 	//Column Side
// 	0, 255, 0,
// 	0, 255, 0,
// 	0, 255, 0,
// 	0, 255, 0,
// 	0, 255, 0,
// 	0, 255, 0,

// 	//Column Lower Side
// 	0, 255, 255,
// 	0, 255, 255,
// 	0, 255, 255,
// 	0, 255, 255,
// 	0, 255, 255,
// 	0, 255, 255,

// 	//Column Upper Side
// 	0, 255, 255,
// 	0, 255, 255,
// 	0, 255, 255,
// 	0, 255, 255,
// 	0, 255, 255,
// 	0, 255, 255,

// 	//Bar Upper Front
// 	255, 0, 0,
// 	255, 0, 0,
// 	255, 0, 0,
// 	255, 0, 0,
// 	255, 0, 0,
// 	255, 0, 0,

// 	//Bar Upper Back
// 	0, 0, 255,
// 	0, 0, 255,
// 	0, 0, 255,
// 	0, 0, 255,
// 	0, 0, 255,
// 	0, 0, 255,

// 	//Bar Upper Top
// 	255, 0, 255,
// 	255, 0, 255,
// 	255, 0, 255,
// 	255, 0, 255,
// 	255, 0, 255,
// 	255, 0, 255,

// 	//Bar Upper Bottom
// 	255, 255, 0,
// 	255, 255, 0,
// 	255, 255, 0,
// 	255, 255, 0,
// 	255, 255, 0,
// 	255, 255, 0,

// 	//Bar Upper Side
// 	0, 255, 255,
// 	0, 255, 255,
// 	0, 255, 255,
// 	0, 255, 255,
// 	0, 255, 255,
// 	0, 255, 255,

// 	//Bar Lower Front
// 	255, 0, 0,
// 	255, 0, 0,
// 	255, 0, 0,
// 	255, 0, 0,
// 	255, 0, 0,
// 	255, 0, 0,

// 	//Bar Lower Back
// 	0, 0, 255,
// 	0, 0, 255,
// 	0, 0, 255,
// 	0, 0, 255,
// 	0, 0, 255,
// 	0, 0, 255,

// 	//Bar Lower Top
// 	255, 0, 255,
// 	255, 0, 255,
// 	255, 0, 255,
// 	255, 0, 255,
// 	255, 0, 255,
// 	255, 0, 255,

// 	//Bar Lower Bottom
// 	255, 255, 0,
// 	255, 255, 0,
// 	255, 255, 0,
// 	255, 255, 0,
// 	255, 255, 0,
// 	255, 255, 0,

// 	//Bar Lower Side
// 	0, 255, 255,
// 	0, 255, 255,
// 	0, 255, 255,
// 	0, 255, 255,
// 	0, 255, 255,
// 	0, 255, 255,
// ];