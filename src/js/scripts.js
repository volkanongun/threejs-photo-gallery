import * as THREE from 'three'
import * as dat from 'dat.gui'
import gsap from 'gsap'

const textureLoader = new THREE.TextureLoader()
const gui = new dat.GUI()
const renderer = new THREE.WebGLRenderer()

renderer.setSize(window.innerWidth, window.innerHeight)
document.body.appendChild(renderer.domElement)

const scene = new THREE.Scene()

const camera = new THREE.PerspectiveCamera(
  75, 
  window.innerWidth/window.innerHeight,
  .01,
  10000
)

camera.position.set(2, 0, -2)
camera.rotation.x = Math.PI
camera.rotation.z = Math.PI

const ambientLight = new THREE.AmbientLight(0xFFF)
scene.add(ambientLight)

const planeMeshes = []

const planeWrapper = new THREE.Object3D()

const texture = Promise.all([
  textureLoader.load('1.jpg'), 
  textureLoader.load('2.jpg'), 
  textureLoader.load('3.jpg'), 
  textureLoader.load('4.jpg')], (resolve, reject) => {
  resolve(texture);
}).then(result => {
  
  for (let i = 1; i < result.length + 1; i++) {
    textureLoader.load(`./assets/${i}.jpg`, (texture)=>{  
      const geometry = new THREE.PlaneGeometry( 1, 1.5 );
      const material = new THREE.MeshBasicMaterial( {
        color: 0xffffff, 
        side: THREE.DoubleSide,
        map: texture
      } );
      const plane = new THREE.Mesh( geometry, material );
      planeWrapper.add(plane)
      planeMeshes.push(plane)
      
      plane.position.set(Math.random() + .3, -i * 2, 0)
    })
  }

  scene.add( planeWrapper );
  planeWrapper.position.set(0, 2.5, 0)

});

gui.add(camera.position, "y").min(-10).max(10).step(.0001)
gui.add(camera.rotation, "x").min(-10).max(10).step(.0001)
gui.add(camera.rotation, "y").min(-10).max(10).step(.0001)
gui.add(camera.rotation, "z").min(-10).max(10).step(.0001)

let yPos = 0
let pos = 0

window.addEventListener('wheel', function(e){
  yPos = -e.deltaY * .0007
})

const raycaster = new THREE.Raycaster()
const mouse = new THREE.Vector2()

window.addEventListener('mousemove', function(e){
  mouse.x = e.clientX / window.innerWidth * 2 - 1
  mouse.y = -(e.clientY / window.innerHeight) * 2 + 1
})

const clock = new THREE.Clock()

function animate(){
  const elapsedTime = clock.getElapsedTime()

  pos += yPos
  yPos *= .9

  camera.position.y = pos

  raycaster.setFromCamera(mouse, camera)
  const intersects = raycaster.intersectObjects(planeMeshes)
  
  for (const intersect of intersects) {
    gsap.to(intersect.object.scale, { x : 1.7, y: 1.7 })
    gsap.to(intersect.object.rotation, { y: -.5 })
    gsap.to(intersect.object.position, { z: .9 })
  }

  for (const planeMesh of planeMeshes) {
    if(!intersects.find(intersect => intersect.object === planeMesh)){
      gsap.to(planeMesh.scale, { x: 1, y: 1})
      gsap.to(planeMesh.rotation, { y: 0 })
      gsap.to(planeMesh.position, { z: 0 })
    }
  }

  renderer.render(scene, camera)
}

renderer.setAnimationLoop(animate)

window.addEventListener('resize', function(){
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()
  renderer.setSize(window.innerWidth, window.innerHeight)
})

const mousePosition = new THREE.Vector2()
window.addEventListener('mousemove', function(e){
  mousePosition.x = (e.clientX / window.innerWidth) * 2 - 1
  mousePosition.y = - (e.clientY / window.innerHeight) * 2 + 1
})