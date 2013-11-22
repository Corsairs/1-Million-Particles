var c = document.createElement('canvas')
	c.width = window.innerWidth - 40
	c.height = window.innerHeight - 40
	document.body.appendChild(c)
var gl = c.getContext('experimental-webgl')
	gl.clearColor(0.0,0.0,0.0,1.0)
	gl.viewport(0,0,c.width,c.height)
	gl.clear(gl.DEPTH_BUFFER_BIT | gl.COLOR_BUFFER_BIT)
	var OES_texture_float = gl.getExtension("OES_texture_float")

	//console.log(ext)

var particleCount = Math.pow(512,2)//65536
var WIDTH = Math.sqrt(particleCount)
var HEIGHT = Math.sqrt(particleCount) //8x8 Grid then 
var array 
array = []
for(var i=0;i<particleCount;i++){
	array.push(Math.random()-Math.random(),Math.random()-Math.random(),Math.random(),Math.random())
}
var initialTexture = new sgl.Texture(gl.TEXTURE_2D,new Float32Array(array),gl.RGBA,WIDTH,HEIGHT,gl.RGBA,gl.FLOAT)
var uPositionTexture1 = new sgl.RenderTexture(WIDTH,HEIGHT,gl.FLOAT)
	uPositionTexture1.flag = 1
var uPositionTexture2 = new sgl.RenderTexture(WIDTH,HEIGHT,gl.FLOAT)
	uPositionTexture2.flag = 2
array = []
for(var y=0;y<HEIGHT;y++){
	for(var x=0;x<WIDTH;x++){
		array.push(x/WIDTH,y/HEIGHT)
	}
}
var particlePointerBuffer = new sgl.Buffer(gl.ARRAY_BUFFER,new Float32Array(array),gl.STATIC_DRAW,gl.FLOAT,2,array.length/2)

array = []
for(var y=0;y<HEIGHT;y++){
	for(var x=0;x<WIDTH;x++){
		array.push(Math.random(),Math.random(),Math.random(),1)
	}
}
var particleColorBuffer = new sgl.Buffer(gl.ARRAY_BUFFER,new Float32Array(array),gl.STATIC_DRAW,gl.FLOAT,4,array.length/4)



var vRender = function(){/*
attribute vec2 aParticlePointer;
attribute vec4 aVertexColor;
varying vec4 vColor;
uniform sampler2D uPositionTexture;
	void main(void){
		vec4 info = texture2D(uPositionTexture,aParticlePointer);
		gl_Position = vec4(info.x,info.y,0,1.0);
		gl_PointSize = 1.0;
		vColor = aVertexColor;
	}

*/}
var fRender = function(){/*
precision highp float;
varying vec4 vColor;
	void main(void){
		gl_FragColor = vColor;
	}
*/}
var renderProgram = new sgl.ShaderProgram(vRender,fRender)



var positionBuffer = new sgl.Buffer(gl.ARRAY_BUFFER,new Float32Array([
	-1.0, 1.0,0.0,
	 1.0, 1.0,0.0,
	-1.0,-1.0,0.0,
	 1.0,-1.0,0.0
	]),gl.STATIC_DRAW,gl.FLOAT,3,4)

var coordinateBuffer = new sgl.Buffer(gl.ARRAY_BUFFER,new Float32Array([
	0.0,0.0,
	1.0,0.0,
	0.0,1.0,
	1.0,1.0
	]),gl.STATIC_DRAW,gl.FLOAT,2,4)


var vUpdate = function(){/*
attribute vec3 aVertexPosition;
attribute vec2 aCoordinate;
varying highp vec2 vCoord;

	void main(void){
		gl_Position = vec4(aVertexPosition,1.0);
		vCoord = aCoordinate;
	}

*/}
var fUpdate = function(){/*
precision mediump float;
varying highp vec2 vCoord;
uniform sampler2D uPositionTexture;
uniform vec2 uPoint;
float constant = .001;
	void main(void){
		vec4 info = texture2D(uPositionTexture,vCoord);
		vec2 displacement = constant * vec2( info.z , info.w);
		vec2 newPosition = info.xy + displacement;

		vec2 toMiddle =  ( uPoint -  info.xy);
		float toMiddleLength = sqrt(dot(toMiddle,toMiddle));
		toMiddle = toMiddle/toMiddleLength * .4;

		vec2 newVelocity =  (  toMiddle + info.zw ) ;
		vec4 newData = vec4(newPosition ,  newVelocity);

		gl_FragColor = newData;
	}

*/}
var updateProgram = new sgl.ShaderProgram(vUpdate,fUpdate)

var IN 
var OUT 
function swap(){
	var SAVE = IN
	IN = OUT
	OUT = SAVE
}
