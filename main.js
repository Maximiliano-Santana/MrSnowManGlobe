import './style.css';

import * as THREE from 'three';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls';

import GUI from 'lil-gui';
import { gsap } from 'gsap';

THREE.ColorManagement.enabled = false


//Sizes 
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight
}

//----------------------------------------------Textures 
//Loading manager
const loadingManager = new THREE.LoadingManager();
loadingManager.onStart = () => {
  //console.log('onstart')
}
loadingManager.onLoad = () => {
  console.log('on loaded')
}
loadingManager.onProgress = () => {
  //console.log('on progress')
}
loadingManager.onError = () => {
  //console.log('on error')
}

const textureLoader = new THREE.TextureLoader(loadingManager);

//Preview Texture
const previewTexture = textureLoader.load('/resources/textures/texturePreview8x8.png');
previewTexture.wrapS = THREE.RepeatWrapping
previewTexture.wrapT = THREE.RepeatWrapping
previewTexture.repeat.x = 0.5;
previewTexture.repeat.y = 0.5;
previewTexture.generateMipmaps = false;
previewTexture.magFilter = THREE.NearestFilter;

//Base texture 
const baseTexture = {
  color: textureLoader.load('/resources/textures/baseTextures/color_map.jpg'),
  ambientOcclusion: textureLoader.load('/resources/textures/baseTextures/ao_map.jpg'),
  displacement: textureLoader.load('/resources/textures/baseTextures/displacement_map.jpg'),
  normal: textureLoader.load('/resources/textures/baseTextures/normal_map_opengl.jpg'),
  roughness: textureLoader.load('/resources/textures/baseTextures/roughness_map.jpg'),
}

Object.keys(baseTexture).forEach((texture)=>{
  baseTexture[texture].wrapS = THREE.MirroredRepeatWrapping;
  baseTexture[texture].wrapT = THREE.MirroredRepeatWrapping;
  baseTexture[texture].repeat.x = 0.05;
  baseTexture[texture].repeat.y = 0.05;
})


//Renderer
const canvas = document.querySelector('.experience');
const renderer = new THREE.WebGLRenderer({canvas:canvas});
renderer.outputColorSpace = THREE.LinearSRGBColorSpace


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

//Lights 
const ambientLight = new THREE.AmbientLight('#ffffff', 1);
scene.add(ambientLight);

//Geometries


//Materials

//--------------Base 
const baseProperties = {
  //BaseShape Properties
  width: 20,
  height: 20, 
  visualizeBaseShape: false,
  
  //Extrude Geometry
  extrudeSteps: 1,
  extrudeDepth: 4, 
  extrudeBevelEnabled: true,
	extrudeBevelThickness: 1,
	extrudeBevelSize: 1,
	extrudeBevelOffset: 0,
	extrudeBevelSegments: 3,
  extrudeWireframeView: false,

  //Textures and Material
  textureRepeatX: 0.05,
  textureRepeatY: 0.05,
}


let baseShape = null;

let baseLineGeometry = null;
let baseLineMaterial = null;
let baseLine = null;

let baseGeometry = null;
let baseMaterial = null;
let baseMesh = null;

let baseGroup = new THREE.Group();

generateBase();


baseGroup.rotation.x = -Math.PI/2;



//Objects 
// const cube = new THREE.Mesh(
//   new THREE.BoxGeometry(40, 40 ,40),
//   baseMaterial,
// );

// scene.add(cube)
// console.log(cube.geometry.attributes)
// console.log(baseMesh.geometry.attributes)

//cube.scale = 1

camera.lookAt(new THREE.Vector3(0,0,0));
  
  
//--------------------Gui 

const gui = new GUI();

//Base folder

const baseGui = gui.addFolder('Base').onFinishChange(generateBase);

//Folder Base Shape
const baseShapeGui = baseGui.addFolder('Base Shape').close();

baseShapeGui.add(baseProperties, 'visualizeBaseShape');
baseShapeGui.add(baseProperties, 'height', 0, 40);
baseShapeGui.add(baseProperties, 'width', 0, 40);

//Folder Extrude Base Shape

const extrudeBaseShapeGui = baseGui.addFolder('Extrude Base Shape').close();

extrudeBaseShapeGui.add(baseProperties, 'extrudeDepth', 1, 40, 1).name('Extrude Depth');
extrudeBaseShapeGui.add(baseProperties, 'extrudeWireframeView').name('Wireframe view');
extrudeBaseShapeGui.add(baseProperties, 'extrudeSteps', 1, 4, 1).name('Extrude Steps');
extrudeBaseShapeGui.add(baseProperties, 'extrudeBevelEnabled').name('Bevel enabled');
extrudeBaseShapeGui.add(baseProperties, 'extrudeBevelThickness', 0, 2).name('Bevel Thickness');
extrudeBaseShapeGui.add(baseProperties, 'extrudeBevelSize', 0, 4).name('Bevel Size');
extrudeBaseShapeGui.add(baseProperties, 'extrudeBevelOffset', 0, 4).name('Bevel Offset');
extrudeBaseShapeGui.add(baseProperties, 'extrudeBevelSegments', 0, 8, 1).name('Bevel Segments');

//Folder Textures and Materials

const textureBaseGui = baseGui.addFolder('Textures & Materials');

textureBaseGui.add(baseProperties, 'textureRepeatX', );
textureBaseGui.add(baseProperties, 'textureRepeatY', );
//Animation

const clock = new THREE.Clock();

const tick = ()=>{
  orbitControls.update();

  renderer.render(scene, camera);
  window.requestAnimationFrame(tick);
}
tick();

function generateBase(){
  //Creo la forma base y la extruyo con las anteriores funciones
  generateBaseShape();
  extrudeBaseGoemetry();

  //Creo un grupo para manipular todo en conjunto 
  baseGroup.clear();
  if(baseProperties.visualizeBaseShape){
    baseGroup.add(baseLine);
  }
  baseGroup.add(baseMesh);
  scene.add(baseGroup)

}

function generateBaseShape(){
  if(baseLine){ //Elimino en memoria la linea anterior creada
    baseLineGeometry.dispose();
    baseLineMaterial.dispose();
  }

  //Creo la forma
  baseShape = new THREE.Shape();
  baseShape.lineTo (baseProperties.width, 0);
  baseShape.lineTo (baseProperties.width, baseProperties.height);
  baseShape.lineTo (0, baseProperties.height);
  baseShape.closePath();
  
  if(baseProperties.visualizeBaseShape){ //Por temas de rendimiento condiciono a que se cree o no el visualizador de la forma base

    //Para poder visualizar la forma creada voy a crear un objeto3D Line
    baseLineMaterial = new THREE.LineDashedMaterial( { color: 0xff0000, dashSize: 1, gapSize: 0.5 } )
    
    //Creo una geometria a partir de los puntos de mi baseShape con la funcion setFromPoints del bufferGeometry y le paso el arreglo de vectores que retorna la funcion .getPoints()
    baseLineGeometry = new THREE.BufferGeometry().setFromPoints(baseShape.getPoints());
    
    baseLineGeometry.center();
    baseLineGeometry.translate(0, 0, -baseProperties.extrudeDepth/2) //Pongo la geometria en el inicio de la extruccion.

    //baseLineGeometry.center(); //Centro la geometria al origen
    
    baseLine = new THREE.Line( baseLineGeometry, baseLineMaterial );
  }
}

function extrudeBaseGoemetry(){
  if(baseMesh){ //Elimino en memoria la linea anterior creada
    baseGeometry.dispose();
    baseMaterial.dispose();
  }

  baseGeometry = new THREE.ExtrudeGeometry(baseShape, {
    steps: baseProperties.extrudeSteps,
    depth: baseProperties.extrudeDepth,
    bevelEnabled: baseProperties.extrudeBevelEnabled,
    bevelThickness: baseProperties.extrudeBevelThickness,
    bevelOffset: baseProperties.extrudeBevelOffset,
    bevelSegments: baseProperties.extrudeBevelSegments,
    bevelSize: baseProperties.extrudeBevelSize,
  });

  baseGeometry.center();
  baseGeometry.translate
  baseMaterial  = new THREE.MeshStandardMaterial({
    map: baseTexture.color,
    wireframe: baseProperties.extrudeWireframeView,
  });
  baseMesh = new THREE.Mesh(baseGeometry, baseMaterial);
}
