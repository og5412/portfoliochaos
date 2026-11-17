import * as THREE from './vendor/three.module.js';

const smoothstep=(value,low,high)=>{
 const t=Math.max(0,Math.min(1,(value-low)/(high-low)));
 return t*t*(3-2*t);
};
export function wireProgressForDamage(damage){
 return [smoothstep(damage,0,.35),smoothstep(damage,.35,.91),smoothstep(damage,.46,1)];
}
export const STAGE_TWO_WINDINGS=Object.freeze(['response','bundle_low']);
const stageTwoWindows={response:[.10,.32],bundle_low:[.18,.35]};
export function stageTwoWindingAmountForDamage(damage,name){
 const window=stageTwoWindows[name];
 if(!window)throw new Error(`Unknown stage-two winding: ${name}`);
 return smoothstep(damage,window[0],window[1]);
}

// Each vertex stores its distance along the authored wire path. Cutting at
// that distance reveals solid geometry, including matching light/shadow passes.
export function patchGrowthShader(shader,progress){
 shader.uniforms.uWireProgress=progress;
 shader.vertexShader=shader.vertexShader.replace('#include <common>','#include <common>\nattribute float wireGrowth;\nvarying float vWireGrowth;')
  .replace('#include <begin_vertex>','#include <begin_vertex>\nvWireGrowth = wireGrowth;');
 shader.fragmentShader=shader.fragmentShader.replace('#include <common>','#include <common>\nuniform float uWireProgress;\nvarying float vWireGrowth;')
  .replace('#include <clipping_planes_fragment>','#include <clipping_planes_fragment>\nif ( vWireGrowth > uWireProgress ) discard;');
}

export function createWireGrowth(group,{stageTwoWindings=[]}={}){
 const progress={value:0},shadowMaterials=[],regularMeshes=[],earlyPaths=new Map(),earlyNames=new Set(stageTwoWindings);
 function attach(material,uniform=progress){
  material.transparent=false;material.opacity=1;material.depthWrite=true;
  material.onBeforeCompile=shader=>patchGrowthShader(shader,uniform);
  material.customProgramCacheKey=()=>`${material.type}:wire-path-growth-v1`;
  material.needsUpdate=true;
 }
 group.traverse(object=>{
  if(!object.isMesh)return;
  const attribute=object.geometry.getAttribute('_growth');
  if(!attribute||attribute.itemSize!==1)throw new Error(`Missing path progress on ${object.name}`);
  object.geometry.setAttribute('wireGrowth',attribute);
  const name=object.userData.winding_name;
  let early;
  if(earlyNames.has(name)){
   const start=object.userData.growth_start,end=object.userData.growth_end;
   if(!Number.isFinite(start)||!Number.isFinite(end)||start<0||end>1||start>=end)throw new Error(`Invalid growth interval on ${object.name}`);
   early=earlyPaths.get(name);
   if(!early){early={name,start,end,progress:{value:0},meshes:[]};earlyPaths.set(name,early)}
   if(early.start!==start||early.end!==end)throw new Error(`Mismatched strand and barb growth on ${name}`);
   early.meshes.push(object);
  }else regularMeshes.push(object);
  const uniform=early?.progress||progress;
  const materials=Array.isArray(object.material)?object.material:[object.material];
  materials.forEach(material=>attach(material,uniform));
  object.customDepthMaterial=new THREE.MeshDepthMaterial({depthPacking:THREE.RGBADepthPacking,side:materials[0].side});
  object.customDistanceMaterial=new THREE.MeshDistanceMaterial({side:materials[0].side});
  for(const material of [object.customDepthMaterial,object.customDistanceMaterial]){attach(material,uniform);shadowMaterials.push(material)}
 });
 return {
  set(value,damage){
   progress.value=Math.max(0,Math.min(1,value));
   regularMeshes.forEach(mesh=>mesh.visible=progress.value>0);
   let anyEarly=false;
   for(const path of earlyPaths.values()){
    const amount=Number.isFinite(damage)?stageTwoWindingAmountForDamage(damage,path.name):progress.value;
    path.progress.value=Math.max(progress.value,amount>0?path.start+(path.end-path.start)*amount:0);
    path.meshes.forEach(mesh=>mesh.visible=amount>0);anyEarly=anyEarly||amount>0;
   }
   group.visible=progress.value>0||anyEarly;
  },
  dispose(){shadowMaterials.forEach(material=>material.dispose())}
 };
}
