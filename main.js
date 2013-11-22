
var mouse = {x:0,y:0}

IN = initialTexture
OUT = uPositionTexture1
//OUT = initialTexture
go()

IN = uPositionTexture1
OUT = uPositionTexture2

setInterval(function(){
	
go()
swap()

},17)

function go(){

	sgl.useShaderProgram(updateProgram)
	gl.viewport(0,0,OUT.width,OUT.height)
	gl.bindFramebuffer(gl.FRAMEBUFFER,OUT.framebuffer)

	
	gl.activeTexture(gl.TEXTURE0)
	gl.bindTexture(gl.TEXTURE_2D,IN.texture)
	gl.uniform1i(sgl.activeProgram.uPositionTexture,0)

	sgl.vertexAttribPointer("aVertexPosition",positionBuffer)
	sgl.vertexAttribPointer("aCoordinate",coordinateBuffer)

	//console.log(sgl.activeProgram)
	//console.log(sgl.activeProgram.uPoint)
	gl.uniform2f(sgl.activeProgram.uPoint,mouse.x,mouse.y)

	gl.drawArrays(gl.TRIANGLE_STRIP,0,4)
	gl.bindFramebuffer(gl.FRAMEBUFFER,null)
	render()
}


function render(){
gl.clear(gl.DEPTH_BUFFER_BIT | gl.COLOR_BUFFER_BIT)
sgl.useShaderProgram(renderProgram)
gl.viewport(0,0,c.width,c.height)

gl.activeTexture(gl.TEXTURE0)
gl.bindTexture(gl.TEXTURE_2D,OUT.texture)
gl.uniform1i(sgl.activeProgram.uPositionTexture,0)

sgl.vertexAttribPointer("aParticlePointer",particlePointerBuffer)
sgl.vertexAttribPointer("aVertexColor",particleColorBuffer)



gl.drawArrays(gl.POINTS,0,particlePointerBuffer.numItems)


}



/*

*/

window.addEventListener("mousemove",function(e){
	var centerX = c.width/2
	var centerY = c.height/2
	var pageX = e.pageX
	var pageY = -e.pageY + c.height
	var distanceX =  pageX - centerX  
	var distanceY =  pageY - centerY

	mouse.x = distanceX/ ( c.width/2)
	mouse.y = distanceY/ (c.height/2)

},true)