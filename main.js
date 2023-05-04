// @ts-check

import * as THREE from 'https://unpkg.com/three@0.125.2/build/three.module.js';
import { GLTFLoader } from 'https://unpkg.com/three@0.125.2/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'https://unpkg.com/three@0.125.2/examples/jsm/controls/OrbitControls.js';
import { CharacterControls } from './charactercontrol.js';
//import { KeyDisplay } from './utils.js'
let lastframe = Date.now(), dt;
let walk,idle,run,walkDirection,animationsMap;
let runVelocity = 5,walkVelocity = 2,fadeDuration= 0.2;
let currentBaseAction = 'idle';
let numAnimations,mixer,model,currentAction,toggleRun = true;
// const actions = [];
// const W = 'w';
// const A = 'a';
// const S = 's';
// const D = 'd';
// const DIRECTIONS = [W, A, S, D];

const scene = new THREE.Scene();
//scene.background = new THREE.Color( 0xa0a0a0 );
//scene.fog = new THREE.Fog( 0xa0a0a0, 1000, 5000 );
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );
renderer.shadowMap.enabled = true;


window.addEventListener('resize',function(){
  var width = window.innerWidth;
  var height = window.innerHeight;
  renderer.setSize(width,height);
  camera.aspect = width/height;
  camera.updateProjectionMatrix;
})

  camera.position.z = 5;
  camera.position.x = 0;  
  camera.position.y = 1;



  let hemilight = new THREE.HemisphereLight( 0xffffff, 0x444444 );
  hemilight.position.set( 0, 200, 0 );
  scene.add( hemilight );

  const shadowSize = 200;
  let dirlight = new THREE.DirectionalLight( 0xffffff );
  dirlight.position.set( 0, 200, 100 );
  dirlight.castShadow = true;
  dirlight.shadow.camera.top = shadowSize;
  dirlight.shadow.camera.bottom = -shadowSize;
  dirlight.shadow.camera.left = -shadowSize;
  dirlight.shadow.camera.right = shadowSize;
  scene.add( dirlight );
  //sun = light;


const orbitControls = new OrbitControls(camera,renderer.domElement); 
orbitControls.enableDamping = true;
orbitControls.screenSpacePanning = false;
orbitControls.minDistance = 5;
orbitControls.maxDistance = 15;
orbitControls.maxPolarAngle = Math.PI/2 ;
orbitControls.update();


// ground
var mesh = new THREE.Mesh( new THREE.PlaneBufferGeometry( 10000, 10000 ), new THREE.MeshPhongMaterial( { color: 0x999999, depthWrite: false } ) );
mesh.rotation.x = - Math.PI / 2;
mesh.receiveShadow = true;
scene.add( mesh );

var grid = new THREE.GridHelper( 5000, 40, 0x000000, 0x000000 );
grid.material.opacity = 0.2;
grid.material.transparent = true;
scene.add( grid );


// //var texture = THREE.ImageUtils.loadTexture( "tex.jpg" );
// const texture = new THREE.TextureLoader().load( "tex.jpg" );
// // assuming you want the texture to repeat in both directions:
// texture.wrapS = THREE.RepeatWrapping; 
// texture.wrapT = THREE.RepeatWrapping;
// texture.repeat.set( 4, 4 );

// var groundMaterial = new THREE.MeshStandardMaterial( { map: texture } );
// let floorGeometry = new THREE.PlaneGeometry(5000, 5000, 1, 1);
// let floorMaterial = new THREE.MeshPhongMaterial();
// floorMaterial.map = texture;

// let floor = new THREE.Mesh(floorGeometry, floorMaterial);
// floor.rotation.x = -0.5 * Math.PI; // This is 90 degrees by the way
// floor.receiveShadow = true;
// floor.position.y = -11;
// scene.add(floor);



//const MODEL_PATH = 'Xbot.glb';
var characterControls
const loader = new GLTFLoader();
loader.load( 'Soldier.glb', (gltf) => {
  
  //walk = mixer.clipAction( gltf.animations[ 6 ] )
  //run = mixer.clipAction( gltf.animations[ 3 ] )
  //idle =  mixer.clipAction( gltf.animations[ 0 ] )
  //idle.play();
  model = gltf.scene;
  mixer = new THREE.AnimationMixer( model );
  scene.add( model )
  const clips = gltf.animations;
  animationsMap = new Map();
  clips.filter(a => a.name !== 'TPose').forEach((a) => {
     animationsMap.set(a.name, mixer.clipAction(a));
   });

   //const ac = animationsMap.get('run')
   //ac.play();
  //currentAction = currentBaseAction;
  // Load your animation clips
  // clips.forEach((clip) => {
  //   const action = mixer.clipAction(clip);
  //   actions[clip.name] = action;

  characterControls = new CharacterControls(model, mixer, animationsMap, orbitControls, camera,  'Idle')
    
  animate();

  
  } );
  // function switchRunToggle() {
  //   toggleRun = !toggleRun
  // }
 
  // const keyStates = {};
  // document.addEventListener('keydown', (event) => {
  //   keyStates[event.code] = true;
  //   run.play();
  //   currentAction =  'run';
  //   move();
  
  //   });
  // document.addEventListener('keyup', (event) => {
  //   keyStates[event.code] = false;
  //   run.stop();
  // });  

const keysPressed = {  }
//const keyDisplayQueue = new KeyDisplay();
document.addEventListener('keydown', (event) => {
    //keyDisplayQueue.down(event.key)
    if (event.shiftKey ) {
      characterControls.switchRunToggle()
    } else {
        (keysPressed )[event.key.toLowerCase()] = true
        //console.log("w entered");
    }
}, false);
document.addEventListener('keyup', (event) => {
    //keyDisplayQueue.up(event.key);
    (keysPressed)[event.key.toLowerCase()] = false
}, false);


//   document.addEventListener('keydown', function(event) {
//     switch (event.code) {
//         case 'KeyW':
//             run.play();
//             currentAction = 'Run';
//             if (currentAction == 'Run' || currentAction == 'Walk') {
//               // calculate towards camera direction
//               var angleYCameraDirection = Math.atan2(
//                       (camera.position.x - model.position.x), 
//                       (camera.position.z - model.position.z))
//               // calculate direction
//               walkDirection = new THREE.Vector3()
//               camera.getWorldDirection(walkDirection)
//               walkDirection.y = 0
//               walkDirection.normalize()
//     //walkDirection.applyAxisAngle(rotateAngle, directionOffset)
//     let delta = clock.getDelta();
//     // run/walk velocity
//     const velocity = currentAction == 'Run' ? runVelocity : walkVelocity

//     // move model & camera
//     const moveX = walkDirection.x * velocity * delta
//     const moveZ = walkDirection.z * velocity * delta
//     model.position.x += moveX
//     model.position.z += moveZ
//     updateCameraTarget(moveX, moveZ)    }    
//             break;
//         case 'KeyA':
//             moveLeft = true;
//             break;
//         case 'KeyS':
//             moveBackward = true;
//             break;
//         case 'KeyD':
//             moveRight = true;
//             break;
//         case 'ShiftLeft':
//             run = true;
//             break;
//     }
// });

// document.addEventListener('keyup', function(event) {
//     switch (event.code) {
//         case 'KeyW':
//             run.stop();
//             break;
//         case 'KeyA':
//             moveLeft = false;
//             break;
//         case 'KeyS':
//             moveBackward = false;
//             break;
//         case 'KeyD':
//             moveRight = false;
//             break;
//         case 'ShiftLeft':
//             run = false;
//             break;
//     }
// });



// const rotateQuarternion = new THREE.Quaternion()  ;
// function update(delta,keysPressed) 
// {
//   const directionPressed = DIRECTIONS.some(key => keysPressed[key] == true)

//   var play = '';
//   if (directionPressed && toggleRun) {
//       play = 'Run'
//   } else if (directionPressed) {
//       play = 'Walk'
//   } else {
//       play = 'Idle'
//   }

//   // if (currentAction != play) {
//   //     const toPlay = animationsMap.get(play)
//   //     const current = animationsMap.get(currentAction)

//   //     current.fadeOut(fadeDuration)
//   //     toPlay.reset().fadeIn(fadeDuration).play();

//   //     currentAction = play
//   // }
  
//   //mixer.update(delta)
//   if (currentAction == 'Run' || currentAction == 'Walk') {
//     // calculate towards camera direction
//     var angleYCameraDirection = Math.atan2(
//             (camera.position.x - model.position.x), 
//             (camera.position.z - model.position.z))
//     // diagonal movement angle offset
//     var directionOffset = directionOffset(keysPressed)

//     // rotate model
//     rotateQuarternion.setFromAxisAngle(rotateAngle, angleYCameraDirection + directionOffset)
//     model.quaternion.rotateTowards(rotateQuarternion, 0.2)

//     // calculate direction
//     walkDirection = new THREE.Vector3()
//     camera.getWorldDirection(walkDirection)
//     walkDirection.y = 0
//     walkDirection.normalize()
//     walkDirection.applyAxisAngle(rotateAngle, directionOffset)

//     // run/walk velocity
//     const velocity = currentAction == 'Run' ? runVelocity : walkVelocity

//     // move model & camera
//     const moveX = walkDirection.x * velocity * delta
//     const moveZ = walkDirection.z * velocity * delta
//     model.position.x += moveX
//     model.position.z += moveZ
//     updateCameraTarget(moveX, moveZ)
// }
// }

// function updateCameraTarget(moveX, moveZ) {
//   // move camera
//   camera.position.x += moveX
//   camera.position.z += moveZ
//   const cameraTarget = new THREE.Vector3()
//   // update camera target
//   cameraTarget.x = model.position.x
//   cameraTarget.y = model.position.y + 1
//   cameraTarget.z = model.position.z
//   orbitControls.target = cameraTarget
// }

// function directionOffset(keysPressed) {
//   var directionOffset = 0 // w

//   if (keysPressed[W]) {
//       if (keysPressed[A]) {
//           directionOffset = Math.PI / 4 // w+a
//       } else if (keysPressed[D]) {
//           directionOffset = - Math.PI / 4 // w+d
//       }
//   } else if (keysPressed[S]) {
//       if (keysPressed[A]) {
//           directionOffset = Math.PI / 4 + Math.PI / 2 // s+a
//       } else if (keysPressed[D]) {
//           directionOffset = -Math.PI / 4 - Math.PI / 2 // s+d
//       } else {
//           directionOffset = Math.PI // s
//       }
//   } else if (keysPressed[A]) {
//       directionOffset = Math.PI / 2 // a
//   } else if (keysPressed[D]) {
//       directionOffset = - Math.PI / 2 // d
//   }

//   return directionOffset
//}

const clock = new THREE.Clock();
function animate() {
  //const clock = new THREE.Clock();
  //dt = (Date.now()-lastframe)/1000
  let mixerUpdateDelta = clock.getDelta();
  if(characterControls){
    characterControls.update(mixerUpdateDelta,keysPressed);        
  }
  //update(mixerUpdateDelta,keysPressed)
  orbitControls.update();
	renderer.render( scene, camera );
  //lastframe=Date.now()
  requestAnimationFrame( animate );
}

animate();