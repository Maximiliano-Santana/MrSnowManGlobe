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
camera.position.set(0, 20, 50);

//Controls
const orbitControls = new OrbitControls(camera, canvas);
orbitControls.enableDamping = true;

//Geometries



//Materials

//--------------Creando la base
const baseProperties = {
  width: 20,
  height: 5, 
  
  depth: 20, 
}

//Creo la forma base de la cual voy a extruir la forma
//Ademas creo un visualizador para ver las proporciones con las que este va contar
let baseShape = null;

let baseLineGeometry = null;
let baseLineMaterial = null;
let baseLine = null;

function generateBaseShape(){

  if(baseLine){ //Elimino en memoria la linea anterior creada
    baseLineGeometry.dispose();
    baseLineMaterial.dispose();
    scene.remove(baseLine)
  }

  //Creo la forma
  baseShape = new THREE.Shape();
  baseShape.lineTo (baseProperties.width, 0);
  baseShape.lineTo (baseProperties.width, baseProperties.height);
  baseShape.lineTo (0, baseProperties.height);
  baseShape.closePath();
  
  //Para poder visualizar la forma creada voy a crear un objeto3D Line
  baseLineMaterial = new THREE.LineBasicMaterial({
    color: 0xffffff, 
  });
  
  //Creo una geometria a partir de los puntos de mi baseShape con la funcion setFromPoints del bufferGeometry y le paso el arreglo de vectores que retorna la funcion .getPoints()
  baseLineGeometry = new THREE.BufferGeometry().setFromPoints(baseShape.getPoints());
  baseLineGeometry.center(); //Centro la geometria al origen
  
  baseLine = new THREE.Line( baseLineGeometry, baseLineMaterial );
  scene.add( baseLine );
}

generateBaseShape();


//Objects 
const cube = new THREE.Mesh(
  new THREE.BoxGeometry(1, 1 ,1),
  new THREE.MeshBasicMaterial({color:'white'}),
);

//cube.scale = 1

camera.lookAt(new THREE.Vector3(0,0,0));
  
  
//--------------------Gui 

const gui = new GUI();

//Base folder

const baseGui = gui.addFolder(`Base`);

baseGui.add(baseProperties, 'height', 0, 10).onChange(generateBaseShape);
baseGui.add(baseProperties, 'width', 0, 40).onChange(generateBaseShape);




//Animation

const clock = new THREE.Clock();

const tick = ()=>{
  orbitControls.update();

  renderer.render(scene, camera);
  window.requestAnimationFrame(tick);
}
tick();