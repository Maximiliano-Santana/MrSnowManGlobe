import './style.css';

import * as THREE from 'three';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls';
import { FontLoader } from 'three/addons/loaders/FontLoader.js';
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';

import GUI from 'lil-gui';
import { gsap } from 'gsap';



THREE.ColorManagement.enabled = false


//Sizes 
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight
}

//----------------------------------------------Loaders

//Loading manager
const loadingManager = new THREE.LoadingManager();
loadingManager.onStart = () => {
  //console.log('onstart')
}
loadingManager.onLoad = () => {
  console.log('assets loaded');
  console.log('initializing project')
  initProject();
}
loadingManager.onProgress = (asset) => {
  console.log('asset loaded: ' + asset)
}
loadingManager.onError = () => {
  //console.log('on error')
}

const textureLoader = new THREE.TextureLoader(loadingManager);
const cubeTextureLoader = new THREE.CubeTextureLoader(loadingManager);
const fontLoader = new FontLoader(loadingManager);


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

//Enviroment Map Texture
const environmentMapTexture = cubeTextureLoader.load([
  'resources/textures/environmentMap/px.png',
  'resources/textures/environmentMap/nx.png',
  'resources/textures/environmentMap/py.png',
  'resources/textures/environmentMap/ny.png',
  'resources/textures/environmentMap/pz.png',
  'resources/textures/environmentMap/nz.png',
]);

//Nameplate Text 
const fontUrl = '/node_modules/three/examples/fonts/gentilis_regular.typeface.json';
let nameplateFont = null;
const nameFont = fontLoader.load(fontUrl, (font)=>{
  nameplateFont = font;
});




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

const pointLight = new THREE.PointLight('#ffffff', 1)
pointLight.position.set(0, 10, -20)
scene.add(pointLight);

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
  textureRepeatX: 0.08,
  textureRepeatY: 0.05,
  textureRotation: (Math.PI/2),
  
  materialColor: '#6c5a3d',
  materialRoughness: 0,
  materialMetalness: 0, 
  materialReflectivity: 0.25, 
  materialclearCoat: 0.5,
  materialclearCoatRoughness: 0,
  
  materialAoIntensity: 5,
  materialNormalScale: -2,
  envMapIntensity: 1
}

const nameplateProperties = {
  //Plate Properties 
  plateHeight: baseProperties.extrudeDepth,
  plateWidth: baseProperties.width,
  plateDepth: 0.25,
}

//Base variables 
let baseShape = null;

let baseLineGeometry = null;
let baseLineMaterial = null;
let baseLine = null;

let baseGeometry = null;
let baseMaterial = null;
let baseMesh = null;

let plateGeometry = null
let plateMesh = null

let nameGeometry = null;
let nameMesh = null;
let nameplateMaterial = null



let baseGroup = new THREE.Group();

function initProject(){


  generateBase();

}




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

const baseGui = gui.addFolder('Base').onChange(generateBase)//.close();

//Wood Base Folder
const woodBaseGui = baseGui.addFolder('Wood Base').close();

//Folder Base Shape
const baseShapeGui = woodBaseGui.addFolder('Base Shape').close();

baseShapeGui.add(baseProperties, 'visualizeBaseShape');
baseShapeGui.add(baseProperties, 'height', 0, 40);
baseShapeGui.add(baseProperties, 'width', 0, 40);

//Folder Extrude Base Shape

const extrudeBaseShapeGui = woodBaseGui.addFolder('Extrude Base Shape').close();

extrudeBaseShapeGui.add(baseProperties, 'extrudeDepth', 1, 40, 1).name('Extrude Depth');
extrudeBaseShapeGui.add(baseProperties, 'extrudeWireframeView').name('Wireframe view');
extrudeBaseShapeGui.add(baseProperties, 'extrudeSteps', 1, 4, 1).name('Extrude Steps');
extrudeBaseShapeGui.add(baseProperties, 'extrudeBevelEnabled').name('Bevel enabled');
extrudeBaseShapeGui.add(baseProperties, 'extrudeBevelThickness', 0, 2).name('Bevel Thickness');
extrudeBaseShapeGui.add(baseProperties, 'extrudeBevelSize', 0, 4).name('Bevel Size');
extrudeBaseShapeGui.add(baseProperties, 'extrudeBevelOffset', 0, 4).name('Bevel Offset');
extrudeBaseShapeGui.add(baseProperties, 'extrudeBevelSegments', 0, 8, 1).name('Bevel Segments');

//Folder Wood Base Textures and Materials

const textureBaseGui = woodBaseGui.addFolder('Base Textures & Materials').close();

textureBaseGui.add(baseProperties, 'textureRepeatX', 0.005, 0.15).name('Repeat X');
textureBaseGui.add(baseProperties, 'textureRepeatY', 0.005, 0.15).name('Repeat Y');
textureBaseGui.add(baseProperties, 'textureRotation', 0, 6.283).name('Rotation');

textureBaseGui.addColor(baseProperties, 'materialColor').name('Material Color');
textureBaseGui.add(baseProperties, 'materialRoughness', 0, 1).name('Roughness');
textureBaseGui.add(baseProperties, 'materialAoIntensity', 0, 15).name('Ao Intensity');
textureBaseGui.add(baseProperties, 'materialMetalness', 0, 1).name('Metalness');
textureBaseGui.add(baseProperties, 'materialReflectivity', 0, 1).name('Reflectivity');
textureBaseGui.add(baseProperties, 'materialclearCoat', 0, 1).name('Clear Coat');
textureBaseGui.add(baseProperties, 'materialclearCoatRoughness', 0, 1).name('ClearC Roughness');
textureBaseGui.add(baseProperties, 'materialNormalScale', -5, 5).name('NormalScale');
textureBaseGui.add(baseProperties, 'envMapIntensity', -5, 5).name('EnvMap Intensity');

//Nameplate Folder

const nameplateGui = baseGui.addFolder('Nameplate');

nameplateGui.add(nameplateProperties, 'plateDepth', 0, 5);

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
  generateBaseMesh();

  //Creo un grupo para manipular todo en conjunto de la extruccion
  baseGroup.clear();
  if(baseProperties.visualizeBaseShape){
    baseGroup.add(baseLine);
  }
  baseGroup.add(baseMesh);
  scene.add(baseGroup)
  baseGroup.rotation.x = -Math.PI/2;

  //Creo la placa con el nombre y el material de ambos
  nameplateMaterial = new THREE.MeshBasicMaterial({color:'Yellow'});
  generatePlateMesh();
  generateNameMesh();
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

function generateBaseMesh(){
  if(baseMesh){ //Elimino en memoria la linea anterior creada
    baseGeometry.dispose();
    baseMaterial.dispose();
  }

  //Create Geometry
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

  //Update the textures atributes
  Object.keys(baseTexture).forEach((texture)=>{
    baseTexture[texture].wrapS = THREE.RepeatWrapping;
    baseTexture[texture].wrapT = THREE.RepeatWrapping;
    baseTexture[texture].repeat.x = baseProperties.textureRepeatX;
    baseTexture[texture].repeat.y = baseProperties.textureRepeatY;
    baseTexture[texture].rotation = baseProperties.textureRotation;

  })

  //Material
  baseMaterial  = new THREE.MeshPhysicalMaterial({
    map: baseTexture.color,
    normalMap: baseTexture.normal,
    aoMap: baseTexture.ambientOcclusion,
    roughnessMap: baseTexture.roughness,
    wireframe: baseProperties.extrudeWireframeView,

    color: baseProperties.materialColor, 
    roughness: baseProperties.materialRoughness,
    aoMapIntensity: baseProperties.materialAoIntensity,
    metalness: baseProperties.materialMetalness,
    reflectivity: baseProperties.materialReflectivity, 
    clearcoat: baseProperties.materialclearCoat,
    clearcoatRoughness: baseProperties.materialclearCoatRoughness,
    envMap:environmentMapTexture,
    envMapIntensity: baseProperties.envMapIntensity,
  });

  baseMaterial.normalScale.x = baseProperties.materialNormalScale
  baseMaterial.normalScale.y = baseProperties.materialNormalScale

  baseMesh = new THREE.Mesh(baseGeometry, baseMaterial);
}

function generatePlateMesh(){
  if(plateMesh){ 
    plateGeometry.dispose();
    nameplateMaterial.dispose();
    scene.remove(plateMesh);
  }

  //Update plate properties on depends the base size
  nameplateProperties.plateHeight = baseProperties.extrudeDepth,
  nameplateProperties.plateWidth = baseProperties.width,

  //Create Plate Geometry

  plateGeometry = new THREE.BoxGeometry(nameplateProperties.plateWidth, nameplateProperties.plateHeight, nameplateProperties.plateDepth);
  
  //Create Plate Material
  plateMesh = new THREE.Mesh(plateGeometry, nameplateMaterial);
  scene.add(plateMesh)
}

function generateNameMesh(){

}

