#version 300 es
precision mediump float;

in vec3 oNormal;
in vec3 vFragPos;
in vec2 oTexCoord;
in vec4 vFragPosLightSpace;
in vec3 vReflectionDir;

uniform sampler2D diffuseTexture;
uniform sampler2D depthTexture;
uniform vec3 lightColor;
uniform vec3 lightPosition;
uniform vec3 viewPos;
uniform float ambientKaStrength;
uniform float diffuseStrength;
uniform float specularStrength;
uniform float shininess;
uniform samplerCube cubeSampler;
uniform int isMirror;  // 标记是否为镜面物体

out vec4 FragColor;

/*TODO2: 根据phong shading方法计算ambient,diffuse,specular*/
vec3 calculatePhongLight() {
    // 环境光
    vec3 ambient = ambientKaStrength * lightColor;
    
    // 漫反射
    vec3 norm = normalize(oNormal);
    vec3 lightDir = normalize(lightPosition - vFragPos);
    float diff = max(dot(norm, lightDir), 0.0);
    vec3 diffuse = diffuseStrength * diff * lightColor;
    
    // 镜面反射
    vec3 viewDir = normalize(viewPos - vFragPos);
    vec3 reflectDir = reflect(-lightDir, norm);
    float spec = pow(max(dot(viewDir, reflectDir), 0.0), shininess);
    vec3 specular = specularStrength * spec * lightColor;
    
    // 结合纹理颜色
    vec3 texColor = texture(diffuseTexture, oTexCoord).rgb;
    return (ambient + diffuse + specular) * texColor;
}

/*TODO3: 添加阴影计算，返回1表示是阴影，返回0表示非阴影*/
float calculateShadow() {
    // 转换到[-1,1]范围
    vec3 projCoords = vFragPosLightSpace.xyz / vFragPosLightSpace.w;
    // 转换到[0,1]范围
    projCoords = projCoords * 0.5 + 0.5;
    
    // 获取深度贴图中的深度值
    float closestDepth = texture(depthTexture, projCoords.xy).r;
    // 当前片段在光源空间中的深度
    float currentDepth = projCoords.z;
    
    // 解决阴影 acne 问题
    float bias = max(0.05 * (1.0 - dot(oNormal, normalize(lightPosition - vFragPos))), 0.005);
    float shadow = currentDepth - bias > closestDepth ? 1.0 : 0.0;
    
    // 超出光源视锥体的部分不产生阴影
    if(projCoords.z > 1.0)
        shadow = 0.0;
        
    return shadow;
}

void main() {
    if(isMirror == 1) {
        // 镜面物体使用环境纹理反射
        vec3 reflectColor = texture(cubeSampler, vReflectionDir).rgb;
        FragColor = vec4(reflectColor, 1.0);
    } else {
        // 普通物体使用Phong光照和阴影
        vec3 phongColor = calculatePhongLight();
        float shadow = calculateShadow();
        FragColor = vec4(phongColor * (1.0 - shadow), 1.0);
    }
}