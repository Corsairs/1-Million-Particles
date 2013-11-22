var sgl = {}
    sgl.attributeRegex = new RegExp("\n *attribute .* .*;","g")
    sgl.uniformRegex = new RegExp("\n *uniform .* .*;","g")
    sgl.shaderStartRegex = new RegExp("function \\(\\)\\{\\/\\*","")
    sgl.shaderEndRegex = new RegExp("\\*\\/\\}","")
    sgl.lineStartRegex = new RegExp("\n *","g")
    sgl.whiteSpaceRegex = new RegExp(" *","g")
    sgl.semicolonRegex = new RegExp("\\;","")
    sgl.mimeTypeRegex = new RegExp('.*\\.')
    
    sgl.mimeTable = {}
    sgl.mimeTable.png = 6408 
     
    sgl.shaderReverseLookUp = {}
    sgl.shaderReverseLookUp["" + 35632] = "Fragment Shader"
    sgl.shaderReverseLookUp["" + 35633] = "Vertex Shader"
    
    sgl.shaders = {}
    sgl.shaders.vSprite = function(){/*
        attribute vec3 aVertexPosition;
        attribute vec2 aTextureCoordinate;
        varying highp vec2 vTextureCoordinate;
        uniform vec2 uHalfViewport;
        uniform mat4 uMVMatrix;
        uniform mat4 uPMatrix;

            void main(void){ 
                vec4 save =  uMVMatrix * vec4(aVertexPosition,1.0);
                vec4 converted = vec4(save.x/uHalfViewport.x,save.y/uHalfViewport.y,save.z,save.w);
                gl_Position = uPMatrix *  converted;
                vTextureCoordinate = aTextureCoordinate;
            }
    */}

    sgl.shaders.fSprite = function(){/*
        precision mediump float;
        uniform sampler2D uTexture;
        varying highp vec2 vTextureCoordinate;
            void main(void){  
                vec4 color = texture2D(uTexture,vTextureCoordinate); 
                if(color.a<1.0){
                    discard;
                }
                gl_FragColor = color;//vec4(1.0,0.0,0.0,1.0);
            }
    */}

    sgl.shaders.vGrid  = function(){/*
        attribute vec3 aVertexPosition;
        attribute vec2 aTextureCoordinate;
        attribute float FUV;
        varying highp vec2 vTextureCoordinate;
        
        uniform vec2 uHalfViewport;
        uniform mat4 uMVMatrix;
        uniform mat4 uPMatrix;

            void main(void){ 
                vec4 save =  uMVMatrix * vec4(aVertexPosition,1.0);
                vec4 converted = vec4(save.x/uHalfViewport.x,save.y/uHalfViewport.y,save.z,save.w);
                gl_Position = uPMatrix *  converted;
                gl_PointSize = 4.0;

                //hard coded number of textureAtlas thingamajigs
                vec2 UV = vec2(FUV/4.0,0.0);
                vTextureCoordinate = UV + aTextureCoordinate/4.0;
            }
    */}

    sgl.shaders.fGrid = function(){/*
        precision mediump float;
        uniform sampler2D uTextureAtlas;
        varying highp vec2 vTextureCoordinate;
            void main(void){  
                gl_FragColor = texture2D(uTextureAtlas,vTextureCoordinate);
            }
    */}




    sgl.activeProgram = {attributes:[],uniforms:[]}
    sgl.shaderPrograms = {}

    sgl.spriteTextureCoordinateBuffer

    sgl.init = function(){
        sgl.spriteTextureCoordinateBuffer = new sgl.Buffer(gl.ARRAY_BUFFER,new Float32Array([
             0.0,  0.0,
             1.0,  0.0,
             0.0,  1.0, 
             1.0,  1.0, 
        ]),gl.STATIC_DRAW,gl.FLOAT,2,4)

        sgl.shaderPrograms.Sprite = new sgl.ShaderProgram(sgl.shaders.vSprite,sgl.shaders.fSprite)
        sgl.shaderPrograms.Grid = new sgl.ShaderProgram(sgl.shaders.vGrid,sgl.shaders.fGrid)


    }


    sgl.parseShaderFunction = function(srcFunction){
         return srcFunction.toString().replace(sgl.shaderStartRegex,"").replace(sgl.shaderEndRegex,"")
    }
    
    sgl.Shader = function(type,srcFunction){
        this.sglTYPE = "Shader"
        this.srcText = sgl.parseShaderFunction(srcFunction)
        this.shader = gl.createShader(type)
        gl.shaderSource(this.shader,this.srcText)
        gl.compileShader(this.shader)
        if(!gl.getShaderParameter(this.shader,gl.COMPILE_STATUS)){
		 	console.log(gl.getShaderInfoLog(this.shader), "shaderType: ",sgl.shaderReverseLookUp[type])
		}
    }
    
    sgl.ShaderProgram = function(vShader,fShader){
        this.sglTYPE = "ShaderProgram"
        this.program = gl.createProgram()
        this.program.vShader = new sgl.Shader(gl.VERTEX_SHADER,vShader)
        this.program.fShader = new sgl.Shader(gl.FRAGMENT_SHADER,fShader)
        
        gl.attachShader(this.program,this.program.vShader.shader)
        gl.attachShader(this.program,this.program.fShader.shader)
        gl.linkProgram(this.program)
        if(!gl.getProgramParameter(this.program,gl.LINK_STATUS)){
				console.log("failed to link!")
		}
		
		this.attributes = this.program.vShader.srcText.match(sgl.attributeRegex) || []
		for(var i=0;i<this.attributes.length;i++){
		    this.attributes[i] = this.attributes[i].replace(sgl.lineStartRegex,"").split(" ")[2].replace(sgl.semicolonRegex,"")
		    this[this.attributes[i]] = gl.getAttribLocation(this.program,this.attributes[i])
		    if(this[this.attributes[i]]<0){
		        console.log("attribute " + this.attributes[i] +  " is messed up!")
		    }
		}

		this.uniforms =  (this.program.vShader.srcText + this.program.fShader.srcText).match(sgl.uniformRegex) || []
		for(var i=0;i<this.uniforms.length;i++){
		    this.uniforms[i] = this.uniforms[i].replace(sgl.lineStartRegex,"").split(" ")[2].replace(sgl.semicolonRegex,"")
		    this[this.uniforms[i]] = gl.getUniformLocation(this.program,this.uniforms[i])
		    if(this[this.uniforms[i]]<0){
		        console.log("uniform " + this.uniforms[i] +  " is messed up!")
		    }
		}
    }
    
    sgl.vertexAttribPointer = function(attribute,buffer,normalized,stride,pointer){

        //JUST LEAVING THE DEFAULTS I ALWAYS USE.
        var NORMALIZED = normalized || false
        var STRIDE = stride || 0
        var POINTER = pointer || 0
        
        gl.bindBuffer(buffer.target,buffer.buffer)
        gl.vertexAttribPointer(sgl.activeProgram[attribute],buffer.itemSize,buffer.type,NORMALIZED,STRIDE,POINTER)
        gl.bindBuffer(buffer.target,null)
    }
    sgl.useShaderProgram = function(shaderProgram){
        for(var i=0;i<sgl.activeProgram.attributes.length;i++){
            gl.disableVertexAttribArray(sgl.activeProgram[sgl.activeProgram.attributes[i]])
        }
        gl.useProgram(shaderProgram.program)
        sgl.activeProgram = shaderProgram
	    for(var i=0;i<shaderProgram.attributes.length;i++){
	    	gl.enableVertexAttribArray(shaderProgram[shaderProgram.attributes[i]])
	    }
    }
    sgl.render = function(camera,displayObject){
        camera.push()
        mat4.translate(camera.uMVMatrix,camera.uMVMatrix, [-camera.position[0],-camera.position[1],-camera.position[2]] )
      //  mat4.rotate(camera.uMVMatrix,camera.uMVMatrix,sprite.rotation,[0,0,1]) no camera rotation for now :/
        
        for(var i=0;i<displayObject.displayObjects.length;i++){
            console.log(" I dunno if I want to even support this. but eeeeeeh I guess I prob should .-. FUCK OFF")
        }


        sgl.useShaderProgram(sgl.shaderPrograms.Sprite)
        for(var i=0;i<displayObject.sprites.length;i++){
            sgl.renders.Sprite(camera,displayObject.sprites[i])
        }

        sgl.useShaderProgram(sgl.shaderPrograms.Grid)
        for(var i=0;i<displayObject.grids.length;i++){
            sgl.renders.Grid(camera,displayObject.grids[i])
        }


       camera.pop()
  
    }

    sgl.renders = {}
    sgl.renders.Sprite = function(camera,sprite){
        camera.push()
        
        mat4.translate(camera.uMVMatrix,camera.uMVMatrix,sprite.position) 
        mat4.rotate(camera.uMVMatrix,camera.uMVMatrix,sprite.rotation,[0,0,1])


        sgl.vertexAttribPointer("aVertexPosition",sprite.VPB)
        sgl.vertexAttribPointer("aTextureCoordinate",sgl.spriteTextureCoordinateBuffer)
        
        gl.uniform2f(sgl.activeProgram.uHalfViewport,c.width/2,c.height/2)
        
        gl.uniformMatrix4fv(sgl.activeProgram.uMVMatrix,false,camera.uMVMatrix)
        gl.uniformMatrix4fv(sgl.activeProgram.uPMatrix,false,camera.uPMatrix)
        //console.log(sprite)
        gl.activeTexture(gl.TEXTURE0)
        gl.bindTexture(gl.TEXTURE_2D,sprite.texture.texture)
        gl.uniform1i(sgl.activeProgram.uTexture,0)
       
        gl.drawArrays(gl.TRIANGLE_STRIP,0,4)
       // console.log(sgl.activeProgram)
        camera.pop()
    }

    sgl.renders.Grid = function(camera,grid){
        camera.push()
        
            mat4.translate(camera.uMVMatrix,camera.uMVMatrix,grid.position) 
            //mat4.rotate(camera.uMVMatrix,camera.uMVMatrix,sprite.rotation,[0,0,1])
            sgl.vertexAttribPointer("aVertexPosition",grid.VPB)
            sgl.vertexAttribPointer("aTextureCoordinate",grid.TCB)
            sgl.vertexAttribPointer("UVF",grid.UVB)
           
            gl.uniform2f(sgl.activeProgram.uHalfViewport,c.width/2,c.height/2)
            
            gl.uniformMatrix4fv(sgl.activeProgram.uMVMatrix,false,camera.uMVMatrix)
            gl.uniformMatrix4fv(sgl.activeProgram.uPMatrix,false,camera.uPMatrix)

            gl.activeTexture(gl.TEXTURE0)
            gl.bindTexture(gl.TEXTURE_2D,grid.textureAtlas.texture)
            gl.uniform1i(sgl.activeProgram.uTextureAtlas,0)


           gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,grid.IB.buffer)
           gl.drawElements(gl.TRIANGLES,grid.IB.numItems,gl.UNSIGNED_SHORT,0)
       
        camera.pop()
    }

    sgl.Buffer = function(target,data,usage,type,itemSize,numItems){
        this.sglTYPE = "Buffer"
        this.buffer = gl.createBuffer()
        this.target = target
        this.data = data
        this.usage = usage
        this.type = type
        this.itemSize = itemSize
        this.numItems = numItems
        
        gl.bindBuffer(this.target,this.buffer)
        gl.bufferData(this.target,this.data,this.usage)
        gl.bindBuffer(target,null)
    }
    
    sgl.Texture = function(target,pixels,internalFormat,width,height,format,type){
        this.sglTYPE = "Texture"
        var LEVEL = 0 // I NEVER CHANGE THIS EVER SO ITS STAYING AT 0 BITCH 
        var BORDER = 0 //SAME SHIT 
        this.target = target
        this.pixels = pixels
        this.texture = gl.createTexture()
        gl.bindTexture(this.target,this.texture)
        if(this.pixels instanceof Image){
            this.width = pixels.width
            this.height = pixels.height
            //HARD CODED RGBA, CAN CHANGE THAT LATER >_< FOR NOW JUST PNGS
            gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,this.pixels)
        }else if(this.pixels instanceof Object){
            this.width = width
            this.height = height
            this.internalFormat = internalFormat
            this.format = format
            this.type = type
            console.log()
            gl.texImage2D(this.target,LEVEL,this.internalFormat,this.width,this.height,BORDER,this.format,this.type,this.pixels)
        }

        //TEMP HARD CODED MIPMAPS STUFF YES I KNOW THATS NOT GOOD I FUCKING KNOW >_<
        gl.texParameteri(this.target,gl.TEXTURE_MIN_FILTER,gl.NEAREST)
        gl.texParameteri(this.target,gl.TEXTURE_MAG_FILTER,gl.NEAREST)
        //END HARD CODED MIPMAPPING THAT NEEDS TO GET FIXED LATER 
        gl.bindTexture(this.target,null)
    }
    sgl.RenderTexture = function (width,height,type){
        this.sglTYPE = "RenderTexture"
        this.width = width
        this.height = height
        this.type = type || gl.UNSIGNED_BYTE
        this.framebuffer = gl.createFramebuffer()
        gl.bindFramebuffer(gl.FRAMEBUFFER,this.framebuffer)

        this.renderbuffer = gl.createRenderbuffer()
        gl.bindRenderbuffer(gl.RENDERBUFFER,this.renderbuffer)

        this.texture = gl.createTexture()
        gl.bindTexture(gl.TEXTURE_2D,this.texture)

        gl.renderbufferStorage(gl.RENDERBUFFER,gl.DEPTH_COMPONENT16,this.width,this.height)
        gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,this.width,this.height,0,gl.RGBA,this.type,null)
        //MORE BAD HARDCODES, I KNOW BUT I DONT REALLY UNDERSTAND MIPMAPPING STUFF SO I ALWAYS JUST DO gl.NEAREST CAUSE IT DISABLES
        //ALL OF IT ALSO A SMALL NOTE I SHOULD PROB DEFAULT TO LIKE SOME EMPTY WHITE TEXTURE INSTEAD OF NULL AS NULL THROWS ERRORS
        gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.NEAREST)
        gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.NEAREST)

        gl.framebufferTexture2D(gl.FRAMEBUFFER,gl.COLOR_ATTACHMENT0,gl.TEXTURE_2D,this.texture,0)
        gl.framebufferRenderbuffer(gl.FRAMEBUFFER,gl.DEPTH_ATTACHMENT,gl.RENDERBUFFER,this.renderbuffer)

        gl.bindTexture(gl.TEXTURE_2D,null)
        gl.bindRenderbuffer(gl.RENDERBUFFER,null)
        gl.bindFramebuffer(gl.FRAMEBUFFER,null)


    }

   
    sgl.Sprite = function(position,rotation,width,height,texture){
        this.sglTYPE = "Sprite"
        this.position = position
        this.rotation = rotation
        this.width = width
        this.height = height
        this.texture = texture
        this.VPB = new sgl.Buffer(gl.ARRAY_BUFFER,new Float32Array([
            -width/2,   height/2,  0.0,
             width/2,   height/2,  0.0,
            -width/2,  -height/2,  0.0,
             width/2,  -height/2,  0.0,
            ]),gl.STATIC_DRAW,gl.FLOAT,3,4)
    }

    sgl.DisplayObjectContainer = function(position){
        this.sglTYPE = "DisplayObjectContainer"
        this.position = position
        this.displayObjects = []
        this.sprites = []
        this.grids = []
    }

    sgl.Grid = function(position,columns,rows,tileSize,UVB,textureAtlas){
        this.sglTYPE = "Grid"
        this.position = position
        this.columns = columns
        this.rows = rows
        this.tileSize = tileSize
        this.halfSize = tileSize/2
        this.textureAtlas = textureAtlas
        var array 
        array = []
        for(var y=0;y<this.columns;y++){
            for(var x=0;x<this.rows;x++){
              array.push( -this.halfSize + x*this.tileSize,  this.halfSize + y*this.tileSize, 0)
              array.push(  this.halfSize + x*this.tileSize,  this.halfSize + y*this.tileSize, 0)
              array.push( -this.halfSize + x*this.tileSize, -this.halfSize + y*this.tileSize, 0)

              array.push( -this.halfSize + x*this.tileSize, -this.halfSize + y*this.tileSize, 0)
              array.push(  this.halfSize + x*this.tileSize,  this.halfSize + y*this.tileSize, 0)
              array.push(  this.halfSize + x*this.tileSize, -this.halfSize + y*this.tileSize, 0)
            }
        }
        this.VPB = new sgl.Buffer(gl.ARRAY_BUFFER,new Float32Array(array),gl.STATIC_DRAW,gl.FLOAT,3,array.length)

        array = []
        for(var y=0;y<this.columns;y++){
            for(var x=0;x<this.rows;x++){
              array.push(0,0)
              array.push(1,0)
              array.push(0,1)

              array.push(0,1)
              array.push(1,0)
              array.push(1,1)
            }
        }
        this.TCB = new sgl.Buffer(gl.ARRAY_BUFFER,new Float32Array(array),gl.STATIC_DRAW,gl.FLOAT,2,array.length)
        this.UVB = UVB
        
        array = []
        for(var i=0;i<this.VPB.numItems/3.0;i++){
            array[i] = i 
        }
        //console.log(array.length)
        this.IB = new sgl.Buffer(gl.ELEMENT_ARRAY_BUFFER,new Uint16Array(array),gl.STATIC_DRAW,gl.UNSIGNED_SHORT,1,array.length) //
    }

    sgl.Camera = function(position,fov,aspect,near,far){
        this.sglTYPE = "Camera"
        this.position = position // we will get there, oh yessss we willl!!!!!
        this.uPMatrix = mat4.create()
        mat4.perspective(this.uPMatrix,fov,aspect,near,far)
        this.uMVMatrixStack = []
        this.uMVMatrix = mat4.create()
        mat4.identity(this.uMVMatrix)
        this.push = function(){
            this.uMVMatrixStack.push(mat4.clone(this.uMVMatrix))
        }
        this.pop = function(){
            this.uMVMatrix = this.uMVMatrixStack.pop()
        }

    }
    
    