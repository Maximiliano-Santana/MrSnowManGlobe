import './style.css';

import * as THREE from 'three';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls';
import { FontLoader } from 'three/addons/loaders/FontLoader.js';
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';

import GUI from 'lil-gui';
import { gsap } from 'gsap';



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
const previewTexture = textureLoader.load('/resources/textures/texturePreview.png');
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

//Glass Texture
const  glassTexture = {
  roughness: textureLoader.load('/resources/textures/glassTexture/fingertips.jpg')
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
const fontUrl = '/resources/fonts/Shannia_Bold (1).json';
let nameplateFont = null;
const nameFont = fontLoader.load(fontUrl, (font)=>{
  nameplateFont = font;
});

//Nameplate Texture
const goldTexture = {
  color: textureLoader.load('/resources/textures/goldTexture/color_map.png'),
  roughness: textureLoader.load('/resources/textures/goldTexture/roughness_map.png'),
  normal: textureLoader.load('/resources/textures/goldTexture/normal_map.jpg'),
}


//----------------------------------------------Init project
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
	extrudeBevelSegments: 7,
  extrudeWireframeView: false,

  //Textures and Material
  textureRepeatX: 0.08,
  textureRepeatY: 0.05,
  textureRotation: (Math.PI/2),
  
  materialColor: '#988361',
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
  
  //Name properties
  nameSize: 2,
  nameHeight: 0.25,
  nameCurveSegments: 7,
  nameBevelEnabled: true,
  nameBevelThickness: 0.02,
  nameBevelSize: 0.025,
  nameBevelOffset: 0, 
  nameBevelSegments: 3,
  
  //Material propierties
  textureRepeatX: 2, 
  textureRepeatY: 1, 
  textureRotation: (Math.PI/2),
  wireframeView: false,

  materialColor: '#ffffff',
  materialRoughness: 0,
  materialMetalness: 1, 
  materialReflectivity: 0.25, 

  materialAoIntensity: 5,
  materialNormalScale: -5,
  envMapIntensity: 1
}

const spherePropierties = { 
  //Geometry options
  radius: 11,
  subdivisions: 40,
  
  //Material options
  textureRepeatX: 2.5,
  textureRepeatY: 2.5,
  textureRotation: 0,
  
  wireframeView: false,
  color: '#ffffff',
  metalness: 0.9,
  roughness: 0.3,
  envMapIntensity: 0.3,
  clearcoat: 1,
  transparent: true,
  transmission: 0,
  opacity: 0.25,
  reflectivity: 0.2,
  refractionRatio: 0.985,
  ior: 0.9
}


//Base

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
let nameplateGroup = new THREE.Group();

//Sphere
let sphereGeometry = null;
let sphereMaterial = null;
let sphereMesh = null;


//Scene 
const scene = new THREE.Scene();

function initProject(){

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



  //Camera 
  const camera = new THREE.PerspectiveCamera(50, sizes.width/sizes.height  , 0.1, 100);
  camera.position.set(0, 20, 50);

  //Controls
  const orbitControls = new OrbitControls(camera, canvas);
  orbitControls.enableDamping = true;

  //Lights 
  const ambientLight = new THREE.AmbientLight('#ffffff', 1);
  scene.add(ambientLight);

  // const pointLight = new THREE.PointLight('#ffffff', 1)
  // pointLight.position.set(0, 10, -20)
  // scene.add(pointLight);

  //Geometries


  //Materials

  //--------------Base 


  //Base variables 

  generateBase();
  generateSphere();



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

  const baseGui = gui.addFolder('Base').onFinishChange(generateBase)//.close();

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

  const nameplateGui = baseGui.addFolder('Nameplate').close();

  nameplateGui.add(nameplateProperties, 'plateDepth', 0, 5);
  nameplateGui.add(nameplateProperties, 'wireframeView');

  //Nampleate text folder
  const nameplateTextGui = nameplateGui.addFolder('Text').close();

  nameplateTextGui.add(nameplateProperties, 'nameSize', 0, 5).name('Size')
  nameplateTextGui.add(nameplateProperties, 'nameHeight', 0, 5).name('Depth')
  nameplateTextGui.add(nameplateProperties, 'nameCurveSegments', 1 , 10, 1).name('Curve Segments');
  nameplateTextGui.add(nameplateProperties, 'nameBevelEnabled').name('Bevel enabled');
  nameplateTextGui.add(nameplateProperties, 'nameBevelThickness', 0, 4).name('Bevel Thickness');
  nameplateTextGui.add(nameplateProperties, 'nameBevelSize', 0, 4).name('Bevel Size');
  nameplateTextGui.add(nameplateProperties, 'nameBevelOffset', 0, 4).name('Bevel Offset');
  nameplateTextGui.add(nameplateProperties, 'nameBevelSegments', 0, 4, 1).name('Bevel Segments');


  //Nameplate material folder

  const nameplateMaterialGui = nameplateGui.addFolder('Material').close();

  nameplateMaterialGui.add(nameplateProperties, 'textureRepeatX', 0, 10).name('Repeat X');
  nameplateMaterialGui.add(nameplateProperties, 'textureRepeatY', 0, 10).name('Repeat Y');
  nameplateMaterialGui.add(nameplateProperties, 'textureRotation', 0, 6.283).name('Rotation');

  nameplateMaterialGui.addColor(nameplateProperties, 'materialColor').name('Material Color');
  nameplateMaterialGui.add(nameplateProperties, 'materialRoughness', 0, 1).name('Roughness');
  nameplateMaterialGui.add(nameplateProperties, 'materialMetalness', 0, 1).name('Metalness');
  nameplateMaterialGui.add(nameplateProperties, 'materialReflectivity', 0, 10).name('Reflectivity');
  nameplateMaterialGui.add(nameplateProperties, 'materialNormalScale', -10, 10).name('NormalScale');
  nameplateMaterialGui.add(nameplateProperties, 'envMapIntensity', -5, 5).name('EnvMap Intensity');

  //Sphere folder

  const sphereGui = gui.addFolder('Sphere').onChange(generateSphere).close();

  sphereGui.add(spherePropierties, 'radius', 0, 30);
  sphereGui.add(spherePropierties, 'subdivisions', 0, 100);
  sphereGui.add(spherePropierties, 'wireframeView')
  
  //Sphere Material folder
  
  const sphereMaterialGui = sphereGui.addFolder('Material').close();
  
  sphereMaterialGui.add(spherePropierties, 'textureRepeatX', 0, 6).name('Repeat X');
  sphereMaterialGui.add(spherePropierties, 'textureRepeatY', 0, 6).name('Repeat Y');
  sphereMaterialGui.add(spherePropierties, 'textureRotation', 0, 6.283).name('Rotation');
  sphereMaterialGui.addColor(spherePropierties, 'color', 0, 100);
  sphereMaterialGui.add(spherePropierties, 'metalness', 0, 1);
  sphereMaterialGui.add(spherePropierties, 'roughness', 0, 1);
  sphereMaterialGui.add(spherePropierties, 'envMapIntensity', 0, 5);
  sphereMaterialGui.add(spherePropierties, 'clearcoat', 0, 1);
  sphereMaterialGui.add(spherePropierties, 'transparent');
  sphereMaterialGui.add(spherePropierties, 'transmission', 0, 1);
  sphereMaterialGui.add(spherePropierties, 'opacity', 0, 1);
  sphereMaterialGui.add(spherePropierties, 'reflectivity', 0, 1);
  sphereMaterialGui.add(spherePropierties, 'refractionRatio', 0, 1);
  sphereMaterialGui.add(spherePropierties, 'ior', 0, 1);



  const clock = new THREE.Clock();

  const tick = ()=>{
    orbitControls.update();

    renderer.render(scene, camera);
    window.requestAnimationFrame(tick);
  }
  tick();
}




function generateBase(){
  //Creo la forma base y la extruyo con las anteriores funciones
  generateBaseShape();
  generateBaseMesh();

  // Elimino grupos anteriores Creo un grupo para manipular todo en conjunto de la extruccion
  if(baseGroup){
    baseGroup.clear();
    scene.remove(baseGroup);
  }

  //Condiciono a si el visualizar base no esta activado entonces que no agregue al grupo
  if(baseProperties.visualizeBaseShape){  
    baseGroup.add(baseLine);
  }
  baseGroup.add(baseMesh);
  scene.add(baseGroup)
  baseGroup.rotation.x = -Math.PI/2;

  //Creo la placa con el nombre y el material de ambos

  //Update the textures atributes
  Object.keys(goldTexture).forEach((texture)=>{
    goldTexture[texture].wrapS = THREE.RepeatWrapping;
    goldTexture[texture].wrapT = THREE.RepeatWrapping;
    goldTexture[texture].repeat.x = nameplateProperties.textureRepeatX;
    goldTexture[texture].repeat.y = nameplateProperties.textureRepeatY;
    goldTexture[texture].rotation = nameplateProperties.textureRotation;
  })
  

  nameplateMaterial = new THREE.MeshStandardMaterial({
    map: goldTexture.color,
    roughnessMap: goldTexture.roughness,
    normalMap: goldTexture.normal,
    envMap:environmentMapTexture,
    envMapIntensity: nameplateProperties.envMapIntensity,

    wireframe: baseProperties.extrudeWireframeView,
    color: nameplateProperties.materialColor, 
    metalness: nameplateProperties.materialMetalness,
    reflectivity: nameplateProperties.materialReflectivity, 
  });

  nameplateMaterial.normalScale.x = nameplateProperties.materialNormalScale;
  nameplateMaterial.normalScale.y = nameplateProperties.materialNormalScale;
  
  generatePlateMesh();
  generateNameMesh();

  //Elimino el nameplate anterior y creo uno nuevo
  if(nameplateGroup){
    nameplateGroup.clear();
    scene.remove.nameplateGroup
  }
  nameplateGroup.add(nameMesh);
  nameplateGroup.add(plateMesh);
  nameplateGroup.position.z = ((baseProperties.height/2) + (baseProperties.extrudeBevelOffset) + (baseProperties.extrudeBevelSize))
  scene.add(nameplateGroup)
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
  }

  //Update plate properties on depends the base size
  nameplateProperties.plateHeight = baseProperties.extrudeDepth,
  nameplateProperties.plateWidth = baseProperties.width,

  //Create Plate Geometry

  plateGeometry = new THREE.BoxGeometry(nameplateProperties.plateWidth, nameplateProperties.plateHeight, nameplateProperties.plateDepth);
  
  //Create Plate Material
  plateMesh = new THREE.Mesh(plateGeometry, nameplateMaterial);
}

function generateNameMesh(){
  if(nameMesh){
    nameGeometry.dispose();
  }

  nameGeometry = new TextGeometry('Max Santana', {
    font: nameplateFont,
    size: nameplateProperties.nameSize,
    height: nameplateProperties.nameHeight,
    curveSegments: nameplateProperties.nameCurveSegments,
    bevelEnabled: nameplateProperties.nameBevelEnabled,
    bevelThickness: nameplateProperties.nameBevelThickness,
    bevelSize: nameplateProperties.nameBevelSize,
    bevelOffset: nameplateProperties.nameBevelOffset,
    bevelSegments: nameplateProperties.nameBevelSegments,
  })

  nameGeometry.center();
  nameGeometry.translate(0, 0, (nameplateProperties.nameHeight/2) + (nameplateProperties.plateDepth/2))

  nameMesh = new THREE.Mesh(nameGeometry, nameplateMaterial);
}

function generateSphere(){
  if(sphereMesh){
    sphereGeometry.dispose();
    sphereMaterial.dispose();
    scene.remove(sphereMesh);
  }

  sphereGeometry = new THREE.SphereGeometry(
    spherePropierties.radius, 
    spherePropierties.subdivisions, 
    spherePropierties.subdivisions
  );

  //Update textures properties 
  Object.keys(glassTexture).forEach((texture)=>{
    glassTexture[texture].wrapS = THREE.RepeatWrapping;
    glassTexture[texture].wrapT = THREE.RepeatWrapping;
    glassTexture[texture].repeat.x = spherePropierties.textureRepeatX;
    glassTexture[texture].repeat.y = spherePropierties.textureRepeatY;
    glassTexture[texture].rotation = spherePropierties.textureRotation;
  })

  sphereMaterial = new THREE.MeshPhysicalMaterial({
    envMap: environmentMapTexture,
    roughnessMap: glassTexture.roughness,

    color: spherePropierties.color,
    wireframe: spherePropierties.wireframeView,
    metalness: spherePropierties.metalness,
    roughness: spherePropierties.roughness,
    envMapIntensity: spherePropierties.envMapIntensity,
    clearcoat: spherePropierties.clearcoat,
    transparent: spherePropierties.transparent,
    transmission: spherePropierties.transmission,
    opacity: spherePropierties.opacity,
    reflectivity: spherePropierties.reflectivity,
    refractionRatio: spherePropierties.refractionRatio,
    ior: spherePropierties.ior,
    envMapIntensity: spherePropierties.envMapIntensity
  });

  sphereMesh = new THREE.Mesh(sphereGeometry, sphereMaterial);

  sphereMesh.position.y = (spherePropierties.radius) - baseProperties.extrudeDepth/2 ;

  scene.add(sphereMesh);
}