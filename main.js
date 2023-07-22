import './style.css';

import * as THREE from 'three';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls';

import GUI from 'lil-gui';
import { gsap } from 'gsap';


//Sizes 
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight
}

//Renderer
const canvas = document.querySelector('.experience');
const renderer = new THREE.WebGLRenderer({canvas:canvas});

renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));


//Resize
window.addEventListener('resize', ()=>{
  //Update Sizes 
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;
  //Update Camera
  camera.aspect = sizes.width/sizes.height;
  camera.updateProjectionMatrix();
  //Update renderer
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
})


//Scene 
const scene = new THREE.Scene();

//Camera 
const camera = new THREE.PerspectiveCamera(50, sizes.width/sizes.height  , 0.1, 100);
camera.position.set(0, 1, 3);

//Controls
const orbitControls = new OrbitControls(camera, canvas);
orbitControls.enableDamping = true;

//Objects 
const cube = new THREE.Mesh(
  new THREE.BoxGeometry(1, 1, 1),
  new THREE.MeshBasicMaterial({color:'white'}),
);
  
scene.add(cube);
camera.lookAt(cube.position);
  
  
//Gui 

//Animation

const clock = new THREE.Clock();

const tick = ()=>{
  renderer.render(scene, camera);
  window.requestAnimationFrame(tick);
}
tick();