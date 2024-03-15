const frag = `
	
	${includes}

	uniform float time;
	uniform samplerCube cube;
	uniform int metalType;
	uniform int pointCount;
	uniform int previousMetalType;
	uniform float radius;

	varying float vMouseScore;
	varying vec3 v_position;
	varying vec3 v_normal;
	varying vec2 v_uv;

	struct Light {
		vec3 color;
		vec3 position;
	};

	vec3 addAmbientLight(vec3 lightColor, vec3 lightPosition) {
		float ambientStrength = 2.;
		vec3 ambientColor = ambientStrength * lightColor;
		return (ambientColor);
	}

	vec3 addDiffuseLight(vec3 lightColor, vec3 lightPosition) {
		// diffuse color – matte color
		vec3 lightDirection = normalize(lightPosition - v_position * .1);
		float diffuseStrength = .01;
		
		//float diffuseScore = max(dot(-v_normal, lightDirection), 0.1);
		float diffuseScore = max(dot(lightDirection, v_normal  * .1), .9);
		vec3 diffuseColor = diffuseStrength * diffuseScore * lightColor;
		return (diffuseColor);
	}

	vec3 addSpecularLight(vec3 lightColor, vec3 lightPosition) {

		vec3 lightDirection = normalize(lightPosition - v_position);

		// specular color - gloss
		//vec3 cameraDirection = normalize(cameraPosition - v_position);
		vec3 cameraDirection = ((10.0, 10.0, 10.) - v_position);
		//vec3 cameraDirection = (cameraPosition - v_position * 1.1);
		vec3 reflectionDirection = normalize(lightDirection + cameraDirection);
		float specularStrength = 2.;
		float shininess = 15.;
		float specularScore = pow(max(dot(reflectionDirection, v_normal), .0), shininess);
		vec3 specularColor = specularStrength * specularScore * lightColor;

		return (specularColor);
	}

	vec3 addSpecularGlare(vec3 lightColor, vec3 lightPosition) {

		vec3 lightDirection = normalize(lightPosition - v_position);

		// specular color - gloss
		vec3 cameraDirection = normalize(cameraPosition - v_position);
		//vec3 cameraDirection = ((10.0, 10.0, 10.) - v_position);
		//vec3 cameraDirection = (cameraPosition - v_position);
		vec3 reflectionDirection = normalize(lightDirection + cameraDirection);
		float specularStrength = 1.;
		float shininess = 5.;
		float specularScore = pow(max(dot(reflectionDirection, v_normal), .0), shininess);
		vec3 specularColor = specularStrength * specularScore * lightColor;

		return (specularColor);
	}



	void main () {

		// INITIAL NORMALIZATION
		//vec3 cameraDirection = normalize(cameraPosition - v_position);
		vec3 cameraDirection = (cameraPosition - v_position);
		//vec3 cameraDirection = ((50.0, 50.0, 50.) - v_position);
		vec3 normal = normalize(v_normal);


		// BASE COLORS
		vec4 aluminumColor = vec4(202.0 / 255.0, 204.0 / 255.0, 206.0 / 255.0, 1.0);  
		vec4 brassColor = vec4(181.0 / 255.0, 166.0 / 255.0, 66.0 / 255.0, 1.0); 
		vec4 bronzeColor = vec4(205.0 / 255.0, 127.0 / 255.0, 50.0 / 255.0, 1.0); 
		vec4 copperColor = vec4(110.0 / 255.0, 77.0 / 255.0, 37.0 / 255.0, 1.0);   
		//vec4 copperColor = vec4(245.0 / 255.0, 135.0 / 255.0, 37.0 / 2.0, 1.0);   
		vec4 steelColor = vec4(150.0 / 255.0, 150.0 / 255.0, 150.0 / 255.0, 1.0);  
		vec4 silverColor = vec4(192.0 / 255.0, 192.0 / 255.0, 192.0 / 255.0, 1.0);  


		vec4 metals[6];
		metals[0] = copperColor;
		metals[1] = bronzeColor;
		metals[2] = brassColor; 
		metals[3] = steelColor;	
		metals[4] = silverColor;
		metals[5] = aluminumColor;
	
		
		// BASE LIGHTS
		vec3 aluminumLight = vec3(202.0 / 255.0, 204.0 / 255.0, 206.0 / 255.0);  
		vec3 brassLight = vec3(181.0 / 255.0, 166.0 / 255.0, 66.0 / 255.0); 
		vec3 bronzeLight = vec3(205.0 / 255.0, 127.0 / 255.0, 50.0 / 255.0); 
		vec3 copperLight = vec3(110.0 / 255.0, 77.0 / 255.0, 37.0 / 255.0);  
		//vec3 copperLight = vec3(245.0 / 255.0, 135.0 / 255.0, 2.0 / 255.0);  
		vec3 steelLight = vec3(150.0 / 255.0, 150.0 / 255.0, 150.0 / 255.0);  
		vec3 silverLight = vec3(192.0 / 255.0, 192.0 / 255.0, 192.0 / 255.0);  
		

		vec3 metalLights[6];
		metalLights[0] = copperLight;
		metalLights[1] = bronzeLight;
		metalLights[2] = brassLight; 
		metalLights[3] = steelLight;
		metalLights[4] = silverLight;	
		metalLights[5] = aluminumLight;



		// NOISE + GRAIN
		// vec3 wind = vec3(
		// 	mix(-1., 1., fbm(.1 * v_position + .5 * sin(time * .3))),
		// 	mix(-1., 1., fbm(.2 * v_position - .5 * sin(time * .1))),
		// 	mix(-1., 1., fbm(.3 * v_position + .5 * sin(time * .2)))
		// );
		// vec3 wind = vec3(
		// 	mix((-1. * float(pointCount/4)), (1. * float(pointCount/50)), fbm(1.1 * v_position + .5 * sin(time * .003))),
		// 	mix((-1. * float(pointCount/4)), (1. * float(pointCount/50)), fbm(1.2 * v_position - .5 * sin(time * .001))),
		// 	mix((-1. * float(pointCount/4)), (1. * float(pointCount/50)), fbm(1.3 * v_position + .5 * sin(time * .002)))
		// );
		vec3 wind = vec3(
			mix(-1., (1. * float(pointCount/20)), fbm(.001 * v_position + .5 * sin(time * .3))),
			mix(-1., (1. * float(pointCount/20)), fbm(.02 * v_position - .5 * sin(time * .1))),
			mix(-1., (1. * float(pointCount/20)), fbm(.3 * v_position + .5 * sin(time * .2)))
		);

		vec3 windGlare = vec3(
		 	mix(-1., .3, fbm(.01 * v_position + .5 * sin(time * .3))),
		 	mix(-1., .8, fbm(.02 * v_position - .5 * sin(time * .1))),
	 		mix(-1., .8, fbm(.03 * v_position + .5 * sin(time * .2)))
		);

		float strength  = smoothstep(2.5, -1.0, .1);
		//float grain = rand(100. * v_uv) * mix(0.2, 10.01, strength);
		//float grain = rand(100. * v_uv) * mix(1.02, 1.01, strength);
		float grain = rand(100. * v_uv) * mix(0.2, 10.01, strength);
		
		float thickness = mix(-.1, .1, fbm(.1 * v_position + wind));

		//vec3 rr = refract(cameraDirection * .3, v_normal, .8 + thickness );
		//vec3 rg = refract(cameraDirection * .4, v_normal, .8 + thickness);
		//vec3 rb = refract(cameraDirection * .5, v_normal, .8 + thickness);
		vec3 rr = refract(cameraDirection * 1., v_normal, thickness);
		vec3 rg = refract(cameraDirection * .9 , v_normal, thickness);
		vec3 rb = refract(cameraDirection * .8, v_normal, thickness * grain);

		vec4 rSample = textureCube(cube, rr );
		vec4 gSample = textureCube(cube, rg);
		vec4 bSample = textureCube(cube, rb);

		//vec4 sampleColor = vec4(rSample.r, gSample.g, bSample.b, 1.0);

		// convert the rgb to greyscale values
		float luminance = 0.2126 * rSample.r + 0.7152 * gSample.g + 0.0722 * bSample.b;
		vec4 sampleColor = vec4(luminance, luminance , luminance, .2);


		// MATERIAL BLEND
		vec3 baseColor = vec3(0.0);
		vec4 colorBlend = vec4(0.0);
		float pct = abs(sin(time ));
		colorBlend = mix(metals[previousMetalType], metals[metalType], pct);
		baseColor = mix(metalLights[previousMetalType], metalLights[metalType], pct * .5);
		float blendFactor = .2 * vMouseScore;
		vec4 objectColor = mix(sampleColor, metals[metalType], blendFactor);
		


		// AMBIENT LIGHT
		vec3 ambientLight = addAmbientLight(
			baseColor,
			vec3(100., 100., 100.)
		);


		// DIRECTIONAL LIGHT
		vec3 diffuseLight = addDiffuseLight(
			baseColor *  vMouseScore,
			//vec3(100., 100.0, 100.0)
			//vec3(1. * sin(time * .001), 1. * cos(time * .001), 1.)
			vec3(100., 100., 100.) 

		);


		// SPECULAR LIGHT
		vec3 specularLight = addSpecularLight(
			baseColor *  vMouseScore,
			//vec3(1. * sin(time * .001), 100. * cos(time * .001), 100.)
			//vec3(1. * cos(sin(time * .001 )), 1. * cos(sin(time * .001)), 1.) 
			vec3(1., 1., 1.) 

		);



		// SPECULAR GLARE
		vec3 specularGlare = addSpecularGlare(
			baseColor - .1,
			//vec3(10. * cos(time * .1), 10. * sin(time *.1), 10.) * vMouseScore * ( windGlare * 1000.)
			vec3(10. * cos(time * .1 * vMouseScore), 10. * sin(time *.1 * vMouseScore ), 10.) * ( windGlare * 1000. * grain)


		);



		//vec4 finalColor = vec4((ambientLight + diffuseLight + (specularLight) + (specularGlare * .1) + (specularGlare2 * .1)) * objectColor.rgb, 1.);
		//vec4 finalColor = vec4(( ambientLight +  diffuseLight + (specularGlare * .2) +  (specularLight) +specularGlare2 * .4)  * objectColor.rgb, 1.);
		//vec4 finalColor = vec4(( ambientLight +  diffuseLight + specularGlare + specularGlare2) * objectColor.rgb, 1.);
		vec4 finalColor = vec4(( ambientLight +  diffuseLight  +  specularLight + (specularGlare) )  * objectColor.rgb, 1.);


		vec2 center = vec2(0.5, 0.5); // Center of the plane
        float dist = distance(v_uv, center);
        if (dist > .5) {
            discard; // Discard pixels outside the specified radius
			//gl_FragColor = colorBlend;
        } else {
            gl_FragColor = finalColor;
        }
		// gl_FragColor = finalColor;

	}

`