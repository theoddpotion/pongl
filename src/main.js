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


	let cameraTranslation = [0.0, 0.0, 10.0];
	let cameraRotationDeg = [0.0, 0.0, 0.0];

	let translation = [0.0, 0.0, 0.0];
	let rotationDeg = [0.0, 0.0, 0.0];
	let scale = [1.0, 1.0, 1.0];

	requestAnimationFrame(render);

	let timer = 0;
	function render(){
		//resize(gl);

		timer += 0.01;
		rotationDeg[0] = Math.sin(timer*2) * 45.0;
		rotationDeg[1] += 0.5;

		cameraRotationDeg[1] = Math.sin(timer) * 30;

		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

		gl.useProgram(program);
		gl.bindVertexArray(vao);

		//set uniforms

		//MVP = projection * view * model

		const fov = DegToRad(45);
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

		// let viewProjectionMatrix = glMatrix.mat4.create();
		// viewProjectionMatrix = glMatrix.mat4.multiply(viewProjectionMatrix, projectionMatrix, viewMatrix);

		let modelViewMatrix = glMatrix.mat4.create();
		modelViewMatrix = glMatrix.mat4.translate(modelViewMatrix, modelViewMatrix, [translation[0], translation[1], translation[2]]);
		modelViewMatrix = glMatrix.mat4.rotateX(modelViewMatrix, modelViewMatrix, DegToRad(rotationDeg[0]));
		modelViewMatrix = glMatrix.mat4.rotateY(modelViewMatrix, modelViewMatrix, DegToRad(rotationDeg[1]));
		modelViewMatrix = glMatrix.mat4.rotateZ(modelViewMatrix, modelViewMatrix, DegToRad(rotationDeg[2]));
		modelViewMatrix = glMatrix.mat4.scale(modelViewMatrix, modelViewMatrix, [scale[0], scale[1], scale[2]]);
		gl.uniformMatrix4fv(modelViewMatrixLocation, false, modelViewMatrix);

		//gl.uniform4fv(colorAttributeLocation, [1.0, 1.0, 1.0, 1.0]);
		

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

// let Mat3 = {
// 	projection: function(width, height){
// 		return [
// 			2.0 / width, 0.0, 0.0,
// 			0.0, -2.0 / height, 0.0,
// 			-1.0, 1.0, 1.0
// 		];
// 	},

// 	identity: function(){
// 		return [
// 			1, 0, 0,
// 			0, 1, 0,
// 			0, 0, 1
// 		];
// 	},

// 	translate: function(m, tx, ty){
// 		return Mat3.multiply(m, Mat3.translation(tx, ty));
// 	},

// 	rotate: function(m, angleRad){
// 		return Mat3.multiply(m, Mat3.rotation(angleRad));
// 	},

// 	scale: function(m, sx, sy){
// 		return Mat3.multiply(m, Mat3.scaling(sx, sy));
// 	},

// 	multiply: function(a, b){
// 		var a00 = a[0 * 3 + 0];
// 		var a01 = a[0 * 3 + 1];
// 		var a02 = a[0 * 3 + 2];

// 		var a10 = a[1 * 3 + 0];
// 		var a11 = a[1 * 3 + 1];
// 		var a12 = a[1 * 3 + 2];

// 		var a20 = a[2 * 3 + 0];
// 		var a21 = a[2 * 3 + 1];
// 		var a22 = a[2 * 3 + 2];

// 		var b00 = b[0 * 3 + 0];
// 		var b01 = b[0 * 3 + 1];
// 		var b02 = b[0 * 3 + 2];

// 		var b10 = b[1 * 3 + 0];
// 		var b11 = b[1 * 3 + 1];
// 		var b12 = b[1 * 3 + 2];

// 		var b20 = b[2 * 3 + 0];
// 		var b21 = b[2 * 3 + 1];
// 		var b22 = b[2 * 3 + 2];

// 		return [
// 			b00 * a00 + b01 * a10 + b02 * a20,
// 			b00 * a01 + b01 * a11 + b02 * a21,
// 			b00 * a02 + b01 * a12 + b02 * a22,
// 			b10 * a00 + b11 * a10 + b12 * a20,
// 			b10 * a01 + b11 * a11 + b12 * a21,
// 			b10 * a02 + b11 * a12 + b12 * a22,
// 			b20 * a00 + b21 * a10 + b22 * a20,
// 			b20 * a01 + b21 * a11 + b22 * a21,
// 			b20 * a02 + b21 * a12 + b22 * a22,
// 		];
// 	},

// 	translation: function(tx, ty){
// 		return [
// 			1, 0, 0,
// 			0, 1, 0,
// 			tx, ty, 1
// 		];
// 	},

// 	rotation: function(angleRad){
// 		var c = Math.cos(angleRad);
// 		var s = Math.sin(angleRad);

// 		return [
// 			c, -s, 0,
// 			s, c, 0,
// 			0, 0, 1
// 		];
// 	}, 

// 	scaling: function(sx, sy){
// 		return [
// 			sx, 0, 0,
// 			0, sy, 0,
// 			0, 0, 1
// 		];
// 	}
// };

// let Mat4 = {
// 	perspective: function(out, fovY, aspect, near, far){
// 		let f = 1.0 / Math.tan(fovY / 2.0), nf;

// 		out = [
// 			f / aspect, 0.0, 0.0, 0.0,
// 			0.0, f, 0.0, 0.0,
// 			0.0, 0.0, -1.0, -1.0,
// 			0.0, 0.0, -2.0 * near, 0.0
// 		];

// 		if(far != null && far !== Infinity){
// 			nf = 1.0 / (near - far);
// 			out[10] = (far + near) * nf;
// 			out[14] = (2.0 * far * near) * nf;
// 		}

// 		return out;
// 	},

// 	identity: function(){
// 		return [
// 			1, 0, 0, 0,
// 			0, 1, 0, 0,
// 			0, 0, 1, 0,
// 			0, 0, 0, 1
// 		];
// 	},

// 	translate: function(m, tx, ty, tz){
// 		return Mat4.multiply(m, Mat4.translation(tx, ty, tz));
// 	},

// 	xRotate: function(m, angleRad){
// 		return Mat4.multiply(m, Mat4.xRotation(angleRad));
// 	},

// 	yRotate: function(m, angleRad){
// 		return Mat4.multiply(m, Mat4.yRotation(angleRad));
// 	},

// 	zRotate: function(m, angleRad){
// 		return Mat4.multiply(m, Mat4.zRotation(angleRad));
// 	},

// 	scale: function(m, sx, sy, sz){
// 		return Mat4.multiply(m, Mat4.scaling(sx, sy, sz));
// 	},

// 	multiply: function(a, b){
// 		var a00 = a[0 * 4 + 0];
// 		var a01 = a[0 * 4 + 1];
// 		var a02 = a[0 * 4 + 2];
// 		var a03 = a[0 * 4 + 3];
// 		var a10 = a[1 * 4 + 0];
// 		var a11 = a[1 * 4 + 1];
// 		var a12 = a[1 * 4 + 2];
// 		var a13 = a[1 * 4 + 3];
// 		var a20 = a[2 * 4 + 0];
// 		var a21 = a[2 * 4 + 1];
// 		var a22 = a[2 * 4 + 2];
// 		var a23 = a[2 * 4 + 3];
// 		var a30 = a[3 * 4 + 0];
// 		var a31 = a[3 * 4 + 1];
// 		var a32 = a[3 * 4 + 2];
// 		var a33 = a[3 * 4 + 3];
// 		var b00 = b[0 * 4 + 0];
// 		var b01 = b[0 * 4 + 1];
// 		var b02 = b[0 * 4 + 2];
// 		var b03 = b[0 * 4 + 3];
// 		var b10 = b[1 * 4 + 0];
// 		var b11 = b[1 * 4 + 1];
// 		var b12 = b[1 * 4 + 2];
// 		var b13 = b[1 * 4 + 3];
// 		var b20 = b[2 * 4 + 0];
// 		var b21 = b[2 * 4 + 1];
// 		var b22 = b[2 * 4 + 2];
// 		var b23 = b[2 * 4 + 3];
// 		var b30 = b[3 * 4 + 0];
// 		var b31 = b[3 * 4 + 1];
// 		var b32 = b[3 * 4 + 2];
// 		var b33 = b[3 * 4 + 3];

// 		return [
// 			b00 * a00 + b01 * a10 + b02 * a20 + b03 * a30,
// 			b00 * a01 + b01 * a11 + b02 * a21 + b03 * a31,
// 			b00 * a02 + b01 * a12 + b02 * a22 + b03 * a32,
// 			b00 * a03 + b01 * a13 + b02 * a23 + b03 * a33,
// 			b10 * a00 + b11 * a10 + b12 * a20 + b13 * a30,
// 			b10 * a01 + b11 * a11 + b12 * a21 + b13 * a31,
// 			b10 * a02 + b11 * a12 + b12 * a22 + b13 * a32,
// 			b10 * a03 + b11 * a13 + b12 * a23 + b13 * a33,
// 			b20 * a00 + b21 * a10 + b22 * a20 + b23 * a30,
// 			b20 * a01 + b21 * a11 + b22 * a21 + b23 * a31,
// 			b20 * a02 + b21 * a12 + b22 * a22 + b23 * a32,
// 			b20 * a03 + b21 * a13 + b22 * a23 + b23 * a33,
// 			b30 * a00 + b31 * a10 + b32 * a20 + b33 * a30,
// 			b30 * a01 + b31 * a11 + b32 * a21 + b33 * a31,
// 			b30 * a02 + b31 * a12 + b32 * a22 + b33 * a32,
// 			b30 * a03 + b31 * a13 + b32 * a23 + b33 * a33,
// 		];
// 	},

// 	translation: function(tx, ty, tz){
// 		return [
// 			1.0, 0.0, 0.0, 0.0,
// 			0.0, 1.0, 0.0, 0.0,
// 			0.0, 0.0, 1.0, 0.0,
// 			tx, ty, tz, 1.0
// 		];
// 	},

// 	xRotation: function(angleRad){
// 		var c = Math.cos(angleRad);
// 		var s = Math.sin(angleRad);

// 		return [
// 			1.0, 0.0, 0.0, 0.0,
// 			0.0, c, s, 0.0,
// 			0.0, -s, c, 0.0,
// 			0.0, 0.0, 0.0, 1.0
// 		];
// 	},

// 	yRotation: function(angleRad){
// 		var c = Math.cos(angleRad);
// 		var s = Math.sin(angleRad);

// 		return [
// 			c, 0.0, -s, 0.0,
// 			0.0, 1.0, 0.0, 0.0,
// 			s, 0.0, c, 0.0,
// 			0.0, 0.0, 0.0, 1.0
// 		];
// 	},

// 	zRotation: function(angleRad){
// 		var c = Math.cos(angleRad);
// 		var s = Math.sin(angleRad);

// 		return [
// 			c, s, 0.0, 0.0,
// 			-s, c, 0.0, 0.0,
// 			0.0, 0.0, 1.0, 0.0,
// 			0.0, 0.0, 0.0, 1.0
// 		];
// 	},

// 	scaling: function(sx, sy, sz){
// 		return [
// 			sx, 0.0, 0.0, 0.0,
// 			0.0, sy, 0.0, 0.0,
// 			0.0, 0.0, sz, 0.0,
// 			0.0, 0.0, 0.0, 1.0
// 		];
// 	}
// };

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