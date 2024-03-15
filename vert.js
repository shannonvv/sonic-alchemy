const vert = `

	${includes}

	uniform float time;
	uniform int pointCount;
	uniform float sampleDuration;

	varying vec3 v_position;
	varying vec3 v_normal;
	varying vec2 v_uv;
	varying float vMouseScore;

	float row1 = 10.0;
	float scores[10];

	void main () {
		vec3 newPosition = position; 
		vec3 newNormal = normal; 
		mat3 r = rotation3dY(0.1 * time);
		
		// DEFINE GRID OF POINTS
		const int gridSize = 10; 
		const int maxPointCount = 100;
		vec2 point[maxPointCount];

		// ADD GRAIN FOR VARIABLE TRANSORM
		float strength  = smoothstep(.1, 1.0, .1);
		float grain = rand(100. * v_uv) * mix(0.2, 1.01, strength);

		// DEFINE POINT COORDS
		for (int i = 0; i < maxPointCount; ++i) {
			float x = 0.09 + 0.09 * float(i % gridSize);
		 	float y = 0.09 + 0.09 * float(i / gridSize);

			 // Adjust coordinates based on distance from the center using a Gaussian function
			 float distanceFromCenter = distance(vec2(0.5, 0.5), vec2(x, y));

			 float densityFactor = exp(-distanceFromCenter * distanceFromCenter * .5); 
			 x = 0.5 + (x - 0.5) * densityFactor;
			 y = 0.5 + (y - 0.5) * densityFactor;

			 // Add slight random offsets
			 float xOffset = (rand(vec2(float(i), 0.0)) - 0.5) * .1;
			 float yOffset = (rand(vec2(float(i + 100), 0.0)) - 0.5) * .1;
			 x += xOffset;
			 y += yOffset;

		 	point[i] = vec2(x, y);
		}

		// DEFINE POINT SCORES
		float score[100];
		for (int i = 0; i < pointCount; ++i) {
			score[i] = smoothstep(.015, 0.00, distance(point[i], uv));
		}

		float mouseScore = 0.0;
		for (int i = 0; i < 100; i += 4) {
			mouseScore += dot(vec4(score[i], score[i + 1], score[i + 2], score[i + 3]), vec4(1.0));
		}
		vMouseScore = mouseScore;


		// ADD TIME FOR GRADUAL Z-AXIS TRANSFORM
		float pct = abs((sin(time * .6)));

		// MODIFY Z AXIS
		newPosition.z += mix(.0, .08, mouseScore);
		newNormal.z += mix(.0, .08, mouseScore);

		gl_Position = projectionMatrix * modelViewMatrix * vec4( newPosition, 1. );
		v_position = newPosition ;
		v_normal = newNormal  ;
		
		// vec4 is passed because it contains info regarding xyz as well as rotational info 
		v_normal = (modelMatrix * vec4(v_normal, 0.0)).xyz;
		v_uv = uv;
	}

`