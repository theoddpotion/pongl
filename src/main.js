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
	let modelMatrixLocation = gl.getUniformLocation(program, 'u_modelMatrix');


	let vao = gl.createVertexArray();
	gl.bindVertexArray(vao);

	//Setup geometry data with vao
	let positions = [
		//Top
		-0.5, 0.5, -0.5,
		-0.5, 0.5, 0.5,
		0.5, 0.5, 0.5,
		0.5, 0.5, -0.5,

		//Front
		0.5, 0.5, 0.5,
		-0.5, 0.5, 0.5,
		-0.5, -0.5, 0.5,
		0.5, -0.5, 0.5,

		//Back
		-0.5, 0.5, -0.5,
		0.5, 0.5, -0.5,
		0.5, -0.5, -0.5,
		-0.5, -0.5, -0.5,
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
		255, 255, 255,
		255, 255, 255,
		255, 255, 255,
		255, 255, 255,

		128, 128, 128,
		128, 128, 128,
		128, 128, 128,
		128, 128, 128,

		128, 128, 128,
		128, 128, 128,
		128, 128, 128,
		128, 128, 128
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

	let indices = [
		0, 1,  2,  2,  3, 0,
		4, 5,  6,  6,  7, 4,
		8, 9, 10, 10, 11, 8
	];

	let indicesBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indicesBuffer);
	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);



	//Camera transform
	let cameraTranslation = [0.0, 15.0, 15.0];
	let cameraRotationDeg = [-45.0, 0.0, 0.0];

	//player paddle transform
	let pTransform = new Transform();
	pTransform.setPosition(0.0, 0.0, 12.0);
	pTransform.setScale(3.0, 1.0, 1.0);

	//ai paddle transform
	let aiTransform = new Transform();
	aiTransform.setPosition(0.0, 0.0, -12.0);
	aiTransform.setScale(3.0, 1.0, 1.0);

	//ball transform
	let bTransform = new Transform();

	let bDir = getNormalizedDirection(Math.random() * 2 - 1, 0, Math.random() * 2 - 1);
	let bSpeed = 30;

	

	//Begin render loop
	requestAnimationFrame(render);

	let then = 0.0;
	function render(now){
		now *= 0.001;
		let deltaTime = now - then;

		let levelWidth = 36;
		let levelDepth = 32;

		//Input stuffs
		if(Keyboard.getKey(Keyboard.KeyCode.LEFT)){
			//cameraRotationDeg[1] += 90.0 * deltaTime;
			pTransform.getPosition()[0] -= 25.0 * deltaTime;
			if(pTransform.getPosition()[0] < -(levelWidth/2.0) + pTransform.getScale()[0]/2.0){
				pTransform.getPosition()[0] = -(levelWidth/2.0) + pTransform.getScale()[0]/2.0;
			}
		}else if(Keyboard.getKey(Keyboard.KeyCode.RIGHT)){
			//cameraRotationDeg[1] -= 90.0 * deltaTime;
			pTransform.getPosition()[0] += 25.0 * deltaTime;
			if(pTransform.getPosition()[0] > (levelWidth/2.0) - pTransform.getScale()[0]/2.0){
				pTransform.getPosition()[0] = (levelWidth/2.0) - pTransform.getScale()[0]/2.0;
			}
		}

		//"Perfect AI"? Gross.
		aiTransform.getPosition()[0] = bTransform.getPosition()[0];

		//Do all ball movement and collision testing
		let pPos = pTransform.getPosition();
		let pScale = pTransform.getScale();
		let pHalfScale = [pScale[0]/2, pScale[1]/2, pScale[2]/2];
		let pTop = pPos[2] - pHalfScale[2];
		let pBottom = pPos[2] + pHalfScale[2];
		let pLeft = pPos[0] - pHalfScale[0];
		let pRight = pPos[0] + pHalfScale[0];

		let aiPos = aiTransform.getPosition();
		let aiScale = aiTransform.getScale();
		let aiHalfScale = [aiScale[0]/2, aiScale[1]/2, aiScale[2]/2];
		let aiTop = aiPos[2] - aiHalfScale[2];
		let aiBottom = aiPos[2] + aiHalfScale[2];
		let aiLeft = aiPos[0] - aiHalfScale[0];
		let aiRight = aiPos[0] + aiHalfScale[0];

		let bPos = bTransform.getPosition();
		let bScale = bTransform.getScale();
		let bHalfScale = [bScale[0]/2, bScale[1]/2, bScale[2]/2];
		let bTop = bPos[2] - bHalfScale[2];
		let bBottom = bPos[2] + bHalfScale[2];
		let bLeft = bPos[0] - bHalfScale[0];
		let bRight = bPos[0] + bHalfScale[0];

		//Move ball horizontally
		bPos[0] += bDir[0] * bSpeed * deltaTime;

		//Check horizontal bounds collision
		//if box left is less than level right aka -(levelWidth/2)
		if(bLeft < -(levelWidth/2.0)){
			bPos[0] = -(levelWidth/2.0) + bHalfScale[0];
			bDir[0] = -bDir[0];
		}else if(bRight > (levelWidth/2.0)){
			bPos[0] = (levelWidth/2.0) - bHalfScale[0];
			bDir[0] = -bDir[0];
		}

		//Move ball "vertically"
		bPos[2] += bDir[2] * bSpeed * deltaTime;		

		//check "vertical" bounds collision
		if(bTop < -(levelDepth/2.0)){
			//display result message
			console.log('Player wins!');

			//update score

			//reset ball
			resetBall(bPos);
			bDir = getNormalizedDirection(Math.random() * 2 - 1, 0, Math.random() * 2 - 1);
		}else if(bBottom > (levelDepth/2.0)){
			//display result message
			console.log('AI wins.. I mean.. YAY!');

			//update score

			//reset ball
			resetBall(bPos);
			bDir = getNormalizedDirection(Math.random() * 2 - 1, 0, Math.random() * 2 - 1);
		}

		//Check ball collision with player paddle
		if(bLeft < pRight && bRight > pLeft){
			//console.log('in column above player paddle');
			if(bBottom > pTop){
				//console.log('collision');
				if(bPos[2] < pPos[2]){ //if ball is already past the paddle dont make it bounce. (obv not perfect but works)
					bPos[2] = pPos[2] - pHalfScale[2] - bHalfScale[2];
					bDir[2] = -bDir[2];
				}
			}
		}

		//Check ball collision with ai paddle
		if(bLeft < aiRight && bRight > aiLeft){
			//console.log('in column below ai paddle');
			if(bTop < aiBottom){
				//console.log('collision');
				if(bPos[2] > aiPos[2]){
					bPos[2] = aiPos[2] + aiHalfScale[2] + bHalfScale[2];
					bDir[2] = -bDir[2];
				}
			}
		}


		//Render//

		//Begin render by clearing canvas
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

		gl.useProgram(program);
		gl.bindVertexArray(vao);

		//Setup matrices. Should be created at init and updated during tick
		//Setup projection matrix
		const fov = DegToRad(80);
		const aspect = gl.canvas.width / gl.canvas.height;
		const zNear = 0.1;
		const zFar = 100.0;
		const projectionMatrix = glMatrix.mat4.create();
		glMatrix.mat4.perspective(projectionMatrix, fov, aspect, zNear, zFar);
		gl.uniformMatrix4fv(projectionMatrixLocation, false, projectionMatrix);

		//Setup camera matrix
		let cameraMatrix = glMatrix.mat4.create();
		cameraMatrix = glMatrix.mat4.translate(cameraMatrix, cameraMatrix, [cameraTranslation[0], cameraTranslation[1], cameraTranslation[2]]);
		cameraMatrix = glMatrix.mat4.rotateZ(cameraMatrix, cameraMatrix, DegToRad(cameraRotationDeg[2]));
		cameraMatrix = glMatrix.mat4.rotateY(cameraMatrix, cameraMatrix, DegToRad(cameraRotationDeg[1]));
		cameraMatrix = glMatrix.mat4.rotateX(cameraMatrix, cameraMatrix, DegToRad(cameraRotationDeg[0]));
		
		//Setup view matrix
		let viewMatrix = glMatrix.mat4.create();
		viewMatrix = glMatrix.mat4.invert(viewMatrix, cameraMatrix);
		gl.uniformMatrix4fv(viewMatrixLocation, false, viewMatrix);


		{
			//Setup player paddle
			let modelMatrix = glMatrix.mat4.create();
			modelMatrix = glMatrix.mat4.translate(modelMatrix, modelMatrix, pTransform.getPosition());
			modelMatrix = glMatrix.mat4.rotateX(modelMatrix, modelMatrix, DegToRad(pTransform.getRotation()[0]));
			modelMatrix = glMatrix.mat4.rotateY(modelMatrix, modelMatrix, DegToRad(pTransform.getRotation()[1]));
			modelMatrix = glMatrix.mat4.rotateZ(modelMatrix, modelMatrix, DegToRad(pTransform.getRotation()[2]));
			modelMatrix = glMatrix.mat4.scale(modelMatrix, modelMatrix, pTransform.getScale());
			gl.uniformMatrix4fv(modelMatrixLocation, false, modelMatrix);
		
			
			//Draw everything
			let primitiveType = gl.TRIANGLES;
			let offset = 0;
			let count = 18;
			//gl.drawArrays(primitiveType, offset, count);
			gl.drawElements(gl.TRIANGLES, count, gl.UNSIGNED_SHORT, 0);
		}

		{
			//Setup ai paddle
			let modelMatrix = glMatrix.mat4.create();
			modelMatrix = glMatrix.mat4.translate(modelMatrix, modelMatrix, aiTransform.getPosition());
			modelMatrix = glMatrix.mat4.rotateX(modelMatrix, modelMatrix, DegToRad(aiTransform.getRotation()[0]));
			modelMatrix = glMatrix.mat4.rotateY(modelMatrix, modelMatrix, DegToRad(aiTransform.getRotation()[1]));
			modelMatrix = glMatrix.mat4.rotateZ(modelMatrix, modelMatrix, DegToRad(aiTransform.getRotation()[2]));
			modelMatrix = glMatrix.mat4.scale(modelMatrix, modelMatrix, aiTransform.getScale());
			gl.uniformMatrix4fv(modelMatrixLocation, false, modelMatrix);
		
		
			//Draw everything
			let primitiveType = gl.TRIANGLES;
			let offset = 0;
			let count = 18;
			//gl.drawArrays(primitiveType, offset, count);
			gl.drawElements(gl.TRIANGLES, count, gl.UNSIGNED_SHORT, 0);
		}


		{
			//Setup ball
			let modelMatrix = glMatrix.mat4.create();
			modelMatrix = glMatrix.mat4.translate(modelMatrix, modelMatrix, bTransform.getPosition());
			modelMatrix = glMatrix.mat4.rotateX(modelMatrix, modelMatrix, DegToRad(bTransform.getRotation()[0]));
			modelMatrix = glMatrix.mat4.rotateY(modelMatrix, modelMatrix, DegToRad(bTransform.getRotation()[1]));
			modelMatrix = glMatrix.mat4.rotateZ(modelMatrix, modelMatrix, DegToRad(bTransform.getRotation()[2]));
			modelMatrix = glMatrix.mat4.scale(modelMatrix, modelMatrix, bTransform.getScale());
			gl.uniformMatrix4fv(modelMatrixLocation, false, modelMatrix);
		
		
			//Draw everything
			let primitiveType = gl.TRIANGLES;
			let offset = 0;
			let count = 18;
			//gl.drawArrays(primitiveType, offset, count);
			gl.drawElements(gl.TRIANGLES, count, gl.UNSIGNED_SHORT, 0);
		}


		then = now;

		requestAnimationFrame(render);
	}
}

function resetBall(bPos, bDir){
	bPos[0] = 0.0;
	bPos[1] = 0.0;
	bPos[2] = 0.0;
}


function getNormalizedDirection(x, y, z){
	let dir = [x, y, z];

	let mag = Math.sqrt((x * x) + (y * y) + (z * z));

	dir[0] = dir[0] / mag;
	dir[1] = dir[1] / mag;
	dir[2] = dir[2] / mag;

	console.log(mag);

	return dir;
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

function createProgram(gl, vertShader, fragShader, validate){
	let program = gl.createProgram();
	gl.attachShader(program, vertShader);
	gl.attachShader(program, fragShader);
	gl.linkProgram(program);

	let success = gl.getProgramParameter(program, gl.LINK_STATUS);
	if(success){
		return program;
	}

	if(validate){
		gl.validateProgram(program);
		if(!gl.getProgramParameter(program, gl.VALIDATE_STATUS)){
			console.error('Error validating shader program: ' + gl.getProgramInfoLog(program));
			gl.deleteProgram(program);
			return null;
		}
	}

	console.error('Error linking shader program: ' + gl.getProgramInfoLog(program));
	gl.deleteProgram(program);
}

function createProgramFromSource(gl, vertShaderSource, fragShaderSource, validate = false){
	let vertShader = createShader(gl, gl.VERTEX_SHADER, vertShaderSource);
	let fragShader = createShader(gl, gl.FRAGMENT_SHADER, fragShaderSource);
	return createProgram(gl, vertShader, fragShader, validate);
}


//Shader sources
const vertShaderSourceData = `#version 300 es

	uniform mat4 u_projectionMatrix;
	uniform mat4 u_viewMatrix;
	uniform mat4 u_modelMatrix;

	in vec4 a_position;
	in vec4 a_color;

	out vec4 v_color;

	void main(){
		v_color = a_color;

		gl_Position = u_projectionMatrix * u_viewMatrix * u_modelMatrix * a_position;
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

class Transform {
	constructor(){
		this.position = [0.0, 0.0, 0.0];
		this.rotation = [0.0, 0.0, 0.0];
		this.scale = [1.0, 1.0, 1.0];
	}

	setPosition(x, y, z){
		this.position[0] = x;
		this.position[1] = y;
		this.position[2] = z;
	}

	// setPosition(pos){
	// 	this.setPosition(pos[0], pos[1], pos[2]);
	// }

	getPosition(){
		return this.position;
	}

	setRotation(x, y, z){	//in degrees
		this.rotation[0] = x;
		this.rotation[1] = y;
		this.rotation[2] = z;
	}

	// setRotation(rot){
	// 	this.setRotation(rot[0], rot[1], rot[2]);
	// }

	getRotation(){
		return this.rotation;
	}

	setScale(x, y, z){
		this.scale[0] = x;
		this.scale[1] = y;
		this.scale[2] = z;
	}

	// setScale(scale){
	// 	this.setScale(scale[0], scale[1], scale[2]);
	// }

	getScale(){
		return this.scale;
	}
}


