window.addEventListener('load', function(){
	main();
});

function main(){
	let canvas = document.getElementById('glCanvas');
	let gl = canvas.getContext('webgl2');
	if(!gl){
		console.error('Your browser does not support WebGL 2.0!');
		//alert or something, shouldnt ever happen within node-webkit
	}


	let win = nw.Window.get();
	win.on('resize', function(){
		if(gl) resize(gl);
	});
	resize(gl);


	let vertShader = createShader(gl, gl.VERTEX_SHADER, vertShaderSource);
	let fragShader = createShader(gl, gl.FRAGMENT_SHADER, fragShaderSource);

	let program = createProgram(gl, vertShader, fragShader);

	let positionAttributeLocation = gl.getAttribLocation(program, 'a_position');

	let positions = [
		0.0, 0.0, 0.0,
		0.0, 0.5, 0.0,
		0.5, 0.0, 0.0,
		0.5, 0.0, 0.0,
		0.0, 0.5, 0.0,
		0.5, 0.5, 0.0
	];
	let positionBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

	let vao = gl.createVertexArray();
	gl.bindVertexArray(vao);
	gl.enableVertexAttribArray(positionAttributeLocation);

	{
		let size = 3;
		let type = gl.FLOAT;
		let normalize = false;
		let stride = 0;
		let offset = 0;
		gl.vertexAttribPointer(positionAttributeLocation, size, type, normalize, stride, offset);
	}


	gl.clearColor(0.0, 0.0, 0.0, 1.0);
	gl.clear(gl.COLOR_BUFFER_BIT);

	gl.useProgram(program);
	gl.bindVertexArray(vao);

	{
		let primitiveType = gl.TRIANGLES;
		let offset = 0;
		let count = 6;
		gl.drawArrays(primitiveType, offset, count);
	}
}



function resize(gl){
	let win = nw.Window.get();
	
	let w = win.width;
	let h = win.height - 17;

	let canvas = gl.canvas;
	if(canvas.width !== w || canvas.height !== h){
		canvas.width = w;
		canvas.height = h;
		canvas.style.width = w + 'px';
		canvas.style.height = h + 'px';

		gl.viewport(0, 0, w, h);
	}
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


//Shader sources
const vertShaderSource = `#version 300 es

	in vec4 a_position;

	void main(){
		gl_Position = a_position;
	}
`;

const fragShaderSource = `#version 300 es

	precision mediump float;

	out vec4 outColor;

	void main(){
		outColor = vec4(1.0, 1.0, 1.0, 1.0);
	}
`;