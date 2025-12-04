
    // Get a file as a string using  AJAX
    function loadFileAJAX(name) {
        var xhr = new XMLHttpRequest(),
        okStatus = document.location.protocol === "file:" ? 0 : 200;
        xhr.open('GET', name, false);
        xhr.send(null);
        if (xhr.status != okStatus) {
            console.error("Could not load shader file:", name, "Status:", xhr.status);
        }
        return xhr.status == okStatus ? xhr.responseText : null;
    };


    function initShaders(gl, vShaderName, fShaderName) {
        function getShader(gl, shaderName, type) {
            var shader = gl.createShader(type),
                shaderScript = loadFileAJAX(shaderName);
            if (!shaderScript) {
                alert("Could not find shader source: "+shaderName);
                return null;
            }
            gl.shaderSource(shader, shaderScript);
            gl.compileShader(shader);

            if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
                console.error("Shader compilation error:", shaderName);
                console.error(gl.getShaderInfoLog(shader));
                alert("Shader compilation error: " + shaderName + "\n" + gl.getShaderInfoLog(shader));
                return null;
            }
            console.log("Shader compiled successfully:", shaderName);
            return shader;
        }
        var vertexShader = getShader(gl, vShaderName, gl.VERTEX_SHADER),
            fragmentShader = getShader(gl, fShaderName, gl.FRAGMENT_SHADER),
            program = gl.createProgram();

        console.log("Vertex shader:", vertexShader);
        console.log("Fragment shader:", fragmentShader);
        console.log("Program:", program);

        if (!vertexShader || !fragmentShader) {
            console.error("Failed to create vertex or fragment shader");
            alert("Could not initialise shaders - shader creation failed");
            return null;
        }

        gl.attachShader(program, vertexShader);
        gl.attachShader(program, fragmentShader);
        gl.linkProgram(program);

        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
            console.error("Shader program link error:", gl.getProgramInfoLog(program));
            alert("Could not initialise shaders - link failed");
            return null;
        }
        console.log("Shader program linked successfully");


        return program;
    };
