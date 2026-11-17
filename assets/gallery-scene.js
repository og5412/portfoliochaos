import * as THREE from './vendor/three.module.js';
import { GLTFLoader } from './vendor/GLTFLoader.js';
import { createSurfaceMaterials } from './surface-materials.js?v=reference-material-21';

// Source measurements and room geometry are recovered from the original cube.c4d scene.
// Legacy C4D percentages are unitless. One calibrated power scale keeps their 1 : 0.4 relation.
export async function createGallery(renderer){
 const response=await fetch(new URL('./fruit/source-gallery-config.json?v=reference-material-21',import.meta.url));
 if(!response.ok)throw new Error('Could not load original gallery layout');
 const layout=await response.json();
 const roomAsset=await new GLTFLoader().loadAsync(new URL('./fruit/gallery-room.glb?v=deep-gray-8',import.meta.url).href);
 const surfaceMaterials=await createSurfaceMaterials(renderer);
 surfaceMaterials.applyRoom(roomAsset.scene,layout);
 const scene=new THREE.Scene();scene.background=new THREE.Color('#101010');
 const camera=new THREE.PerspectiveCamera(34,1,.04,120);
 const cubeGroup=new THREE.Group();cubeGroup.name='Original sculpture placement';cubeGroup.position.fromArray(layout.cube.position);
 const b=layout.cube.rotationBasis;
 const orientation=new THREE.Matrix4().makeBasis(new THREE.Vector3(...b.v1),new THREE.Vector3(...b.v2),new THREE.Vector3(...b.v3));
 cubeGroup.quaternion.setFromRotationMatrix(orientation);
 roomAsset.scene.traverse(object=>{
  if(!object.isMesh)return;
  object.receiveShadow=true;object.castShadow=object.name.startsWith('source_suspension');
 });
 scene.add(roomAsset.scene);
 const lightPower=4.5*Math.PI;
 for(const source of layout.lights){
  const color=new THREE.Color(...source.color);let light;
  if(source.type==='spot'){
   light=new THREE.SpotLight(color,1,0,source.threeSpotHalfAngleRadians,.72,0);
   light.position.fromArray(source.position);light.target.position.copy(light.position).add(new THREE.Vector3(...source.forward));scene.add(light.target);
   light.shadow.mapSize.set(2048,2048);light.shadow.camera.near=.15;light.shadow.camera.far=45;light.shadow.focus=1;
  }else{
   light=new THREE.PointLight(color,1,0,0);
   light.position.fromArray(source.position);light.shadow.mapSize.set(512,512);light.shadow.camera.near=.15;light.shadow.camera.far=45;
  }
  light.power=lightPower*source.relativeBrightness;light.name=`Original ${source.type} light`;light.castShadow=true;light.shadow.bias=-.0003;light.shadow.normalBias=.025;light.shadow.radius=3.3;light.shadow.intensity=source.type==='omni'?.65:1;
  scene.add(light);
 }
 scene.add(new THREE.HemisphereLight('#d8d8d8','#282828',.20));
 const environmentGenerator=new THREE.PMREMGenerator(renderer);
 const environmentTarget=environmentGenerator.fromScene(scene,.08,.1,100,{size:128,position:cubeGroup.position});
 scene.environment=environmentTarget.texture;scene.environmentIntensity=.25;environmentGenerator.dispose();
 scene.add(cubeGroup);
 const near=layout.cameras.find(item=>item.active)||layout.cameras[0];
 const far=layout.cameras.find(item=>!item.active)||layout.cameras[1];
 const center=new THREE.Vector3(...layout.cube.position);
 function sourceView(source){
  const position=new THREE.Vector3(...source.position),forward=new THREE.Vector3(...source.forward);
  const reach=(center.z-position.z)/forward.z;
  // Source pitch comes from the look target. Orbiting must keep world vertical,
  // rather than reusing an up vector tilted for one particular camera heading.
  return {position,target:position.clone().addScaledVector(forward,reach),up:[0,1,0]};
 }
 const close=sourceView(near);
 // The archived far camera is outside the original open room. Navigation in
 // the completed room stays inside all four walls, including while orbiting.
 const entryDistance=Math.min(layout.room.width,layout.room.depth)/2-.95;
 const closeDistance=Math.hypot(close.position.x-center.x,close.position.z-center.z);
 const distances=[entryDistance,(entryDistance+closeDistance)/2,closeDistance];
 const entryPitch=Math.atan2(far.position[1]-center.y,entryDistance);
 const descriptions=[
  {name:'Before the influence',text:'Enter the original gallery space. A single intact cube hangs beneath the overhead light. Move forward to begin the material sequence.',label:'Original room / unaffected surface',damage:0},
  {name:'The first traces',text:'The first marks emerge. A few iron strands wrap across the faces, touch the surface, bend away and disappear into the concrete.',label:'First bindings / surface contact',damage:.35},
  {name:'What remains',text:'The iron weaves through the eroded form: touching, bending out, entering the cube and emerging again. Drag to follow the irregular paths around the work.',label:'Irregular wire / entry and exit points',damage:1}
 ];
 const stages=descriptions.map((description,index)=>{
  const distance=distances[index];
  return {...description,distance,y:center.y+Math.tan(entryPitch)*distance,angle:0,target:center.clone(),up:[0,1,0]};
 });
 const inspectionView={distance:Math.min(closeDistance,5.25),target:center.clone()};
 // A wider walkthrough lens retains a spacious view from inside the closed
 // room. The original C4D camera/lens measurements remain in the source layout.
 return {scene,camera,cubeGroup,stages,layout,environmentTarget,surfaceMaterials,inspectionView,horizontalFov:75};
}

