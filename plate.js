let pointCount = 0;
let metalType = 0; 
let refresh = false;

// get the tags from HTML
const section = document.querySelector("section")

// set up a scene + camera
const scene = new THREE.Scene()
const camera = new THREE.PerspectiveCamera(50, section.clientWidth / section.clientHeight, 0.1, 1000)

// add a three.js canvas to the section tag
const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true })
renderer.setClearColor(0x000000, 1);
renderer.setSize(section.clientWidth, section.clientHeight)
section.appendChild(renderer.domElement)

// setup tools
const loader = new THREE.TextureLoader()
const clock = new THREE.Clock()
const cubeLoader = new THREE.CubeTextureLoader()

uniforms = {
  time: { value: clock.getElapsedTime() },
  cube: { value: cubeLoader.load(
    ["sky.jpg", "sky.jpg", 
     "sky.jpg", "sky.jpg", 
     "sky.jpg", "sky.jpg"]) },
  previousPointCount: { value: 0 },
  pointCount: { value: 0 },
  sampleDuration: { value: 200 },
  metalType: { value: 1 },
  previousMetalType: { value: 1 }
}

const dpi = 300

const geometry = new THREE.PlaneGeometry( 10, 10, dpi, dpi);

const material = new THREE.ShaderMaterial({ 
   uniforms: uniforms,
   vertexShader: vert,
   fragmentShader: frag,
   wireframe: false,
   side: THREE.DoubleSide,
})
  
const shape = new THREE.Mesh(geometry, material)
shape.position.set(0, 1.1, -10.);
shape.rotation.set(-.5, 0, 0);
scene.add(shape)

const animate = function () {
  
  // update its uniforms
  uniforms.time = { value: clock.getElapsedTime() }

  // shape.rotation.x += 0.01;
  // shape.rotation.y += 0.0001;
  // oscillation on the y-axis within a 15-degree range
  const amplitude = 5 * Math.PI / 180; // Convert degrees to radians
  const speed = .1; 
  shape.rotation.y = Math.sin(speed * Date.now() * 0.003) * amplitude;
  shape.rotation.z += 0.002;

  requestAnimationFrame( animate );
  renderer.render( scene, camera );
}

uniforms[pointCount] = { value: 0 }

animate()


