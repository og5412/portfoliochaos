import * as THREE from './vendor/three.module.js';

// Photographed surface maps provide the small-scale detail. The recovered
// sculpture geometry remains responsible for its larger erosion and chips.
export async function createSurfaceMaterials(renderer){
 const base=new URL('./fruit/materials/',import.meta.url);
 const response=await fetch(new URL('material-config.json?v=reference-coal-17',base));
 if(!response.ok)throw new Error('Could not load surface materials');
 const config=await response.json();
 const loader=new THREE.TextureLoader(),sources=new Map();
 const anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());
 await Promise.all(Object.values(config.textureSets).flatMap(set=>Object.entries(set.maps).map(async([kind,file])=>{
  if(sources.has(file))return;
  const texture=await loader.loadAsync(new URL(file,base).href);
  texture.name=file;texture.colorSpace=kind==='color'?THREE.SRGBColorSpace:THREE.NoColorSpace;
  texture.flipY=false;texture.wrapS=texture.wrapT=THREE.RepeatWrapping;texture.anisotropy=anisotropy;
  sources.set(file,texture);
 })));
 function make(profileName,previous,repeat){
  const profile=config.profiles[profileName],set=config.textureSets[profile.textureSet];
  const material=previous.clone();material.name=`Scanned surface / ${profileName}`;
  const assign=(kind,slot)=>{
   const file=set.maps[kind];if(!file){material[slot]=null;return}
   const texture=sources.get(file).clone();texture.repeat.fromArray(repeat);texture.needsUpdate=true;
   if(kind==='ao')texture.channel=0;
   material[slot]=texture;
  };
  assign('color','map');assign('normal','normalMap');assign('roughness','roughnessMap');assign('ao','aoMap');
  const mean=set.meanLinearLuminance;
  material.color.setScalar(profile.meanAlbedo/mean);
  material.metalness=0;material.roughness=profile.roughness;
  material.normalScale.setScalar(profile.normalStrength);material.aoMapIntensity=profile.aoStrength;
  material.envMapIntensity=profile.environmentStrength;material.dithering=true;
  material.bumpMap=null;material.displacementMap=null;
  material.onBeforeCompile=shader=>{
   shader.fragmentShader=shader.fragmentShader
    .replace('#include <map_fragment>',`#include <map_fragment>\nfloat surfaceLuminance=dot(diffuseColor.rgb,vec3(0.2126,0.7152,0.0722));\ndiffuseColor.rgb=min(mix(vec3(surfaceLuminance),diffuseColor.rgb,${profile.saturation.toFixed(5)}),vec3(0.78));`)
    .replace('#include <roughnessmap_fragment>',`#include <roughnessmap_fragment>\nroughnessFactor=mix(${profile.roughnessRange[0].toFixed(5)},${profile.roughnessRange[1].toFixed(5)},clamp(roughnessFactor,0.0,1.0));`);
  };
  material.customProgramCacheKey=()=>`scanned-concrete:${config.revision}:${profileName}`;
  material.needsUpdate=true;
  return material;
 }
 function replace(object,profile,repeat,retired){
  const previous=Array.isArray(object.material)?object.material:[object.material];
  const next=previous.map(old=>{retired.add(old);return make(typeof profile==='function'?profile(old):profile,old,repeat)});
  object.material=Array.isArray(object.material)?next:next[0];
 }
 function releaseRetired(materials){
  const textures=new Set();
  for(const material of materials){for(const value of Object.values(material))if(value?.isTexture)textures.add(value);material.dispose()}
  for(const texture of textures){texture.dispose();texture.image?.close?.()}
 }
 return {
  config,
  applyRoom(root,layout){
   const retired=new Set();
   root.traverse(object=>{
    if(!object.isMesh)return;
    let name,uvMeters;
    if(object.name==='source_floor'){name='floor';uvMeters=[layout.room.width,layout.room.depth]}
    else if(object.name==='source_ceiling'){name='ceiling';uvMeters=[layout.room.width,layout.room.depth]}
    else if(object.name.startsWith('source_wall_')){name='wall';uvMeters=[layout.room.ceilingY,layout.room.width]}
    else return;
    const tile=config.profiles[name].tileMeters;
    replace(object,name,[uvMeters[0]/tile[0],uvMeters[1]/tile[1]],retired);
   });
   releaseRetired(retired);
  },
  applySculpture(groups){
   const retired=new Set();
   groups.forEach((group,index)=>group.traverse(object=>{
    if(!object.isMesh)return;
    replace(object,old=>old.name.toLowerCase().includes('fresh')?'cubeFresh':['cubeIntact','cubeTraces','cubeEroded'][index],config.profiles.cubeEroded.repeat,retired);
   }));
   releaseRetired(retired);
  }
 };
}
