#version 300 es
precision mediump float;

out vec4 FragColor;

uniform float ambientStrength, specularStrength, diffuseStrength,shininess;

in vec3 Normal;//法向量
in vec3 FragPos;//相机观察的片元位置
in vec2 TexCoord;//纹理坐标
in vec4 FragPosLightSpace;//光源观察的片元位置

uniform vec3 viewPos;//相机位置
uniform vec4 u_lightPosition; //光源位置	
uniform vec3 lightColor;//入射光颜色

uniform sampler2D diffuseTexture;
uniform sampler2D depthTexture;
uniform samplerCube cubeSampler;//盒子纹理采样器
uniform bool isMirrorEnabled;//控制镜面效果是否启用


float shadowCalculation(vec4 fragPosLightSpace, vec3 normal, vec3 lightDir)
{
    float shadow=0.0;  //非阴影
    /*TODO3: 添加阴影计算，返回1表示是阴影，返回0表示非阴影*/
    
    // 将片元位置从光空间转换到NDC空间
    vec3 projCoords = fragPosLightSpace.xyz / fragPosLightSpace.w;
    
    // 将NDC坐标映射到[0, 1]范围
    projCoords = projCoords * 0.5 + 0.5;
    
    // 获取当前片元在光空间下的深度值
    float currentDepth = projCoords.z;
    
    // 进行阴影偏移，解决阴影 acne 问题
    float bias = max(0.05 * (1.0 - dot(normal, lightDir)), 0.005);
    
    // 简单的阴影采样
    float closestDepth = texture(depthTexture, projCoords.xy).r;
    
    // 如果当前深度大于最近深度，则在阴影中
    if (currentDepth > closestDepth + bias)
        shadow = 1.0;
    
    // 如果片元在光空间外，不绘制阴影
    if (projCoords.z > 1.0)
        shadow = 0.0;
    
    return shadow;
   
}       

void main()
{
    // 计算光照颜色
 	vec3 norm = normalize(Normal);
	vec3 lightDir;
	if(u_lightPosition.w==1.0) 
        lightDir = normalize(u_lightPosition.xyz - FragPos);
	else lightDir = normalize(u_lightPosition.xyz);
	vec3 viewDir = normalize(viewPos - FragPos);
	vec3 halfDir = normalize(viewDir + lightDir);

    // 对于中间立方体，根据isMirrorEnabled变量决定使用镜面反射效果还是原纹理
    // 通过判断FragPos的位置范围来确定是否是中间立方体
    if(abs(FragPos.x) < 1.1 && abs(FragPos.y) < 1.1 && abs(FragPos.z) < 1.1 && isMirrorEnabled) {
        // 计算反射方向
        vec3 reflectDir = reflect(-viewDir, norm);
        
        // 从立方体贴图中采样环境反射颜色
        vec3 reflectionColor = texture(cubeSampler, reflectDir).rgb;
        
        // 环境光计算
        vec3 ambient = ambientStrength * lightColor;
        
        // 漫反射计算（较弱，使镜面效果更明显）
        float diff = max(dot(norm, lightDir), 0.0);
        vec3 diffuse = diffuseStrength * 0.3 * diff * lightColor; // 降低漫反射强度
        
        // 镜面反射计算（较强，增强镜面效果）
        float spec = pow(max(dot(norm, halfDir), 0.0), shininess * 2.0); // 提高光泽度
        vec3 specular = specularStrength * 1.5 * spec * lightColor; // 提高镜面反射强度
        
        // 判定是否阴影
        float shadow = shadowCalculation(FragPosLightSpace, norm, lightDir);
        
        // 混合颜色，主要使用反射颜色
        vec3 lightReflectColor = ambient + (1.0 - shadow) * (diffuse + specular);
        vec3 resultColor = lightReflectColor * 0.2 + reflectionColor * 0.8; // 80%反射，20%光照
        
        FragColor = vec4(resultColor, 1.f);
    } 
    // 对于其他物体（如地面），使用普通的Phong shading和纹理
    else {
        //采样纹理颜色
        vec3 TextureColor = texture(diffuseTexture, TexCoord).xyz;

        /*TODO2:根据phong shading方法计算ambient,diffuse,specular*/
        // 环境光计算
        vec3 ambient = ambientStrength * lightColor;
        
        // 漫反射计算
        float diff = max(dot(norm, lightDir), 0.0);
        vec3 diffuse = diffuseStrength * diff * lightColor;
        
        // 镜面反射计算
        float spec = pow(max(dot(norm, halfDir), 0.0), shininess);
        vec3 specular = specularStrength * spec * lightColor;
      
      	vec3 lightReflectColor=(ambient +diffuse + specular);

        //判定是否阴影，并对各种颜色进行混合
        float shadow = shadowCalculation(FragPosLightSpace, norm, lightDir);
	    
        //vec3 resultColor =(ambient + (1.0-shadow) * (diffuse + specular))* TextureColor;
        vec3 resultColor=(1.0-shadow/2.0)* lightReflectColor * TextureColor;
        
        FragColor = vec4(resultColor, 1.f);
    }
}


