#version 300 es
precision mediump float;
precision mediump int;

in vec4 vPosition;
in vec3 vNormal;
in vec2 vTexCoord;

uniform mat4 u_ModelMatrix;
uniform mat4 u_ViewMatrix;
uniform mat4 u_ProjectionMatrix;
uniform mat4 u_LightSpaceMatrix;

out vec3 oNormal;
out vec3 vFragPos;
out vec2 oTexCoord;
out vec4 vFragPosLightSpace;
out vec3 vReflectionDir;  // 新增反射方向输出

uniform vec3 viewPos;

void main() {
    gl_Position = u_ProjectionMatrix * u_ViewMatrix * u_ModelMatrix * vPosition;
    vFragPos = vec3(u_ModelMatrix * vPosition);
    oNormal = mat3(transpose(inverse(u_ModelMatrix))) * vNormal;
    oTexCoord = vTexCoord;
    vFragPosLightSpace = u_LightSpaceMatrix * vec4(vFragPos, 1.0);
    
    // 计算反射方向（用于镜面效果）
    vec3 viewDir = normalize(vFragPos - viewPos);
    vReflectionDir = reflect(viewDir, normalize(vNormal));
}