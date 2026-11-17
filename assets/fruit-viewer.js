import * as THREE from './vendor/three.module.js';
import { GLTFLoader } from './vendor/GLTFLoader.js';
import { createGallery } from './gallery-scene.js?v=reference-material-26';
import { createMotion, retargetMotion, advanceMotion, orbitPosition, shortestAngle, presentationEase, STAGE_DURATION_MS, VIEW_DURATION_MS } from './viewer-motion.js';
import { createWireGrowth, wireProgressForDamage, STAGE_TWO_WINDINGS } from './wire-growth.js?v=stage-two-faces-26';
import { createGuidedDemo, startGuidedDemo, advanceGuidedDemo, guidedOrbitAngle, GUIDED_DEMO_DURATION_MS } from './guided-demo.js?v=continuous-orbit-return-2';


const root=document.querySelector('#installation-viewer');
const area=root.querySelector('.scene-area');
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
let renderer;
try{renderer=new THREE.WebGLRenderer({antialias:true,alpha:false,powerPreference:'low-power'})}catch(error){throw new Error('WebGL is unavailable',{cause:error})}
renderer.setPixelRatio(Math.min(devicePixelRatio||1,1.75));renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFShadowMap;renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=.98;
renderer.domElement.setAttribute('aria-label','3D installation. Drag left or right to look around. Use Forward and Back to move through the three material states.');renderer.domElement.setAttribute('role','img');renderer.domElement.tabIndex=0;
area.prepend(renderer.domElement);
const gallery=await createGallery(renderer);
const {scene,camera,cubeGroup,stages,layout,environmentTarget}=gallery;
const defaultPitch=Math.atan2(stages[0].y-stages[0].target.y,stages[0].distance);
let stage=0,angle=stages[0].angle,pitch=defaultPitch,view='explore',detailView=false,animationId,visible=true,dragging=false,pointer=null,lastFrameTime=null,orientationMotion=null;
const gltfLoader=new GLTFLoader();
const [cubeAsset,wireAsset]=await Promise.all([gltfLoader.loadAsync('../assets/fruit/cube-stages.glb?v=binding-wear-11'),gltfLoader.loadAsync('../assets/fruit/barbed-wire.glb?v=face-binding-15')]);
const stageGroups=['cube_intact','cube_traces','cube_eroded'].map(name=>{const object=cubeAsset.scene.getObjectByName(name);if(!object)throw new Error(`Missing cube mesh: ${name}`);return object});
cubeGroup.add(cubeAsset.scene);
const wires=wireAsset.scene;wires.scale.setScalar(.95);cubeGroup.add(wires);
const wireGroups=['wire_early','wire_deep_a','wire_deep_b'].map(name=>{const object=wires.getObjectByName(name);if(!object)throw new Error(`Missing wire group: ${name}`);return object});
cubeGroup.traverse(object=>{if(!object.isMesh)return;object.castShadow=true;object.receiveShadow=true;const existing=Array.isArray(object.material)?object.material:[object.material];const cloned=existing.map(material=>material.clone());object.material=Array.isArray(object.material)?cloned:cloned[0]});
gallery.surfaceMaterials.applySculpture(stageGroups);
function opacityFor(object,opacity){object.visible=opacity>.001;object.traverse(child=>{if(!child.isMesh)return;for(const material of Array.isArray(child.material)?child.material:[child.material]){const transparent=opacity<.999;if(material.transparent!==transparent){material.transparent=transparent;material.depthWrite=!transparent;material.needsUpdate=true}material.opacity=opacity}})}
stageGroups.forEach((object,index)=>opacityFor(object,index===0?1:0));
const wireGrowth=wireGroups.map(group=>createWireGrowth(group,{stageTwoWindings:STAGE_TWO_WINDINGS}));wireGrowth.forEach(control=>control.set(0));
const target=stages[0].target.clone();
const motion=createMotion({distance:stages[0].distance,target:target.toArray(),damage:0,weights:[1,0,0]});
const demo=createGuidedDemo();
const demoPlay=root.querySelector('#play-demo'),demoStop=root.querySelector('#stop-demo'),demoStatus=root.querySelector('#demo-status');
const outsideDemoButtons=[...document.querySelectorAll('[data-start-demo]')];
let demoStartAngle=angle,demoStartPitch=pitch,demoHasPlayed=false;
function setDemoPresentation(active,message){
 root.dataset.demoState=active?'playing':'stopped';
 if(demoPlay){demoPlay.hidden=active;demoPlay.disabled=view!=='explore';demoPlay.textContent=demoHasPlayed?'Replay the sequence · 24s':'Watch the sequence · 24s'}
 if(demoStop){demoStop.hidden=!active;demoStop.disabled=!active}
 if(demoStatus)demoStatus.textContent=message;
 for(const button of outsideDemoButtons){button.disabled=false;button.setAttribute('aria-pressed',String(active))}
}
function stopGuidedSequence(message='Sequence stopped — explore freely.'){
 if(!demo.active)return false;
 const returning=Boolean(demo.phases[demo.index]?.roomReturn);
 demo.active=false;orientationMotion=null;
 // The closing pullback stops at the displayed distance. Earlier phases finish
 // only their current transition; manual controls can retarget either state.
 if(returning)retargetMotion(motion,motion.state,0);
 setDemoPresentation(false,message);schedule();return true;
}
function enterDemoSegment(phase){
 if(phase.roomReturn){
  if(!reduced.matches){
   detailView=false;orientationMotion=null;
   retargetMotion(motion,{...motion.state,distance:stages[0].distance},phase.transition);
   updateControls();
  }
 }else if(phase.destination){
  stage=phase.stage;if(!reduced.matches)detailView=Boolean(phase.detail);orientationMotion=null;
  if(reduced.matches){
   // Keep the visitor's current camera when reduced motion is preferred.
   retargetMotion(motion,{...motion.state,damage:stages[stage].damage,weights:stages.map((_,index)=>index===stage?1:0)},0);
   updateControls();
  }else{
   const clock=lastFrameTime;startMove(phase.transition);lastFrameTime=clock;
  }
 }
 if(demoStatus)demoStatus.textContent=phase.label;
}
function advanceDemoPresentation(delta){
 advanceMotion(motion,delta);
 if(!reduced.matches){
  angle=guidedOrbitAngle(demoStartAngle,demo.elapsed);pitch=demoStartPitch;
 }
 root.style.setProperty('--demo-progress',String(demo.bodyElapsed/GUIDED_DEMO_DURATION_MS));
}
function completeGuidedSequence(){
 demoHasPlayed=true;setDemoPresentation(false,'Sequence complete — explore freely.');root.dataset.demoState='complete';
}
function beginGuidedSequence(){
 if(demo.active)return;
 if(view!=='explore')root.querySelector('[data-view="explore"]').click();
 dragging=false;pointer=null;touchOrigin=null;orientationMotion=null;
 demoStartAngle=angle;demoStartPitch=pitch;
 const prepare=!reduced.matches&&(Math.abs(motion.state.damage)>.0001||motion.state.weights[0]<.9999||Math.abs(motion.state.distance-stages[0].distance)>.001||detailView);
 startGuidedDemo(demo,{prepare});
 root.style.setProperty('--demo-progress','0');setDemoPresentation(true,'Beginning the sequence…');
 advanceGuidedDemo(demo,0,{enter:enterDemoSegment,step:advanceDemoPresentation,complete:completeGuidedSequence});
 lastFrameTime=null;schedule();
}
demoPlay?.addEventListener('click',beginGuidedSequence);
demoStop?.addEventListener('click',()=>stopGuidedSequence());
for(const button of outsideDemoButtons)button.addEventListener('click',()=>{
 root.scrollIntoView({behavior:reduced.matches?'auto':'smooth',block:'start'});beginGuidedSequence();
});
document.addEventListener('keydown',event=>{if(event.key==='Escape')stopGuidedSequence()});
function handleMotionPreferenceChange(){
 stopGuidedSequence('Motion preference updated — explore freely.');
 if(reduced.matches){
  orientationMotion=null;
  retargetMotion(motion,{...motion.state,damage:stages[stage].damage,weights:stages.map((_,index)=>index===stage?1:0)},0);
  lastFrameTime=null;schedule();
 }
}
reduced.addEventListener('change',handleMotionPreferenceChange);
function startMove(duration){
 const destination=detailView?gallery.inspectionView:stages[stage];
 retargetMotion(motion,{distance:destination.distance,target:destination.target.toArray(),damage:stages[stage].damage,weights:stages.map((_,index)=>index===stage?1:0)},reduced.matches?0:duration);
 lastFrameTime=null;updateControls();schedule();
}
function updateControls(){
 const detailButton=root.querySelector('#inspect-detail');detailButton.textContent=detailView?'Room view ↙':'Inspect detail ↗';detailButton.setAttribute('aria-pressed',String(detailView));detailButton.disabled=view!=='explore';
 root.querySelector('#stage-name').textContent=view==='explore'?stages[stage].name:'The original work';root.querySelector('#stage-description').textContent=view==='explore'?stages[stage].text:'The original installation rendering presents the damaged cube. Its material and spatial studies are the reference for this interactive web reconstruction.';root.querySelector('#material-label').textContent=view==='explore'?stages[stage].label:'Original final-stage materials';root.querySelector('#step-number').textContent=view==='explore'?`0${stage+1}`:'03';root.querySelector('#scene-position').textContent=(detailView?'Detail observation':['01 / Gallery threshold','02 / Moving inward','03 / In the gallery'][stage]);
 root.querySelectorAll('[data-step]').forEach(button=>button.disabled=view!=='explore'||(button.dataset.step==='back'?stage===0:stage===2));
 root.querySelectorAll('[data-stage]').forEach(button=>button.disabled=view!=='explore');
 root.querySelectorAll('[data-stage]').forEach(button=>button.setAttribute('aria-pressed',String(Number(button.dataset.stage)===stage)));
 root.querySelectorAll('.step-progress span').forEach((line,i)=>line.classList.toggle('active',i<=(view==='explore'?stage:2)));
 root.querySelectorAll('.material-swatches img').forEach((image,i)=>{const shownStage=view==='explore'?stage+1:3;image.src=`../assets/fruit/stage-${shownStage}-${i+1}.jpg`;image.alt=`Original material study, stage ${shownStage}, surface ${i+1}`});
}
function changeStage(next){stopGuidedSequence();next=Math.max(0,Math.min(2,next));if(next===stage)return;stage=next;orientationMotion=null;startMove(STAGE_DURATION_MS)}
root.querySelectorAll('[data-step]').forEach(button=>button.addEventListener('click',()=>changeStage(stage+(button.dataset.step==='back'?-1:1))));
root.querySelectorAll('[data-stage]').forEach(button=>button.addEventListener('click',()=>changeStage(Number(button.dataset.stage))));
root.querySelector('#reset-view').addEventListener('click',()=>{
 stopGuidedSequence();
 detailView=false;
 if(reduced.matches){angle=stages[stage].angle;pitch=defaultPitch;orientationMotion=null}
 else orientationMotion={fromAngle:angle,toAngle:shortestAngle(angle,stages[stage].angle),fromPitch:pitch,toPitch:defaultPitch,elapsed:0,duration:VIEW_DURATION_MS};
 startMove(VIEW_DURATION_MS);
});
root.querySelector('#inspect-detail').addEventListener('click',()=>{stopGuidedSequence();detailView=!detailView;orientationMotion=null;startMove(VIEW_DURATION_MS)});
renderer.domElement.addEventListener('keydown',event=>{if(event.key==='ArrowUp'||event.key==='ArrowRight'){event.preventDefault();changeStage(stage+1)}if(event.key==='ArrowDown'||event.key==='ArrowLeft'){event.preventDefault();changeStage(stage-1)}if(event.key==='Home'){event.preventDefault();changeStage(0)}});
renderer.domElement.addEventListener('pointerdown',event=>{if(event.pointerType==='touch')return;stopGuidedSequence();dragging=true;orientationMotion=null;pointer={x:event.clientX,y:event.clientY};renderer.domElement.setPointerCapture(event.pointerId)});
renderer.domElement.addEventListener('pointermove',event=>{if(!dragging)return;angle-= (event.clientX-pointer.x)*.004;pitch=Math.max(-.20,Math.min(.32,pitch+(event.clientY-pointer.y)*.0015));pointer={x:event.clientX,y:event.clientY};schedule()});
renderer.domElement.addEventListener('pointerup',()=>dragging=false);renderer.domElement.addEventListener('pointercancel',()=>dragging=false);
// Horizontal touch drags rotate; vertical gestures retain ordinary page scrolling.
let touchOrigin=null;
renderer.domElement.addEventListener('touchstart',event=>{if(event.touches.length===1){stopGuidedSequence();orientationMotion=null;touchOrigin={x:event.touches[0].clientX,y:event.touches[0].clientY,angle}}},{passive:true});
renderer.domElement.addEventListener('touchmove',event=>{if(!touchOrigin||event.touches.length!==1)return;const dx=event.touches[0].clientX-touchOrigin.x,dy=event.touches[0].clientY-touchOrigin.y;if(Math.abs(dx)>Math.abs(dy)){angle=touchOrigin.angle-dx*.006;schedule()}},{passive:true});
root.querySelector('#fullscreen-view').addEventListener('click',async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else await area.requestFullscreen()}catch{root.querySelector('#fullscreen-view').textContent='Fullscreen unavailable'}});
root.querySelector('#exit-fullscreen').addEventListener('click',()=>document.exitFullscreen().catch(()=>{}));
document.addEventListener('fullscreenchange',()=>{root.querySelector('#fullscreen-view').textContent=document.fullscreenElement?'Exit fullscreen':'Fullscreen';resize()});
root.querySelectorAll('[data-view]').forEach(button=>button.addEventListener('click',()=>{
 stopGuidedSequence();
 view=button.dataset.view;lastFrameTime=null;root.querySelectorAll('[data-view]').forEach(item=>item.setAttribute('aria-selected',String(item===button)));renderer.domElement.hidden=view!=='explore';root.querySelector('.viewer-original').hidden=view==='explore';root.querySelectorAll('.scene-overlay').forEach(el=>el.hidden=view!=='explore');root.querySelector('#viewer-status').textContent=view==='explore'?'Interactive 3D':'Original render';root.querySelector('#fullscreen-view').disabled=view!=='explore';root.querySelector('#reset-view').disabled=view!=='explore';if(demoPlay)demoPlay.disabled=view!=='explore';updateControls();if(view==='explore'){resize();schedule()}
}));
const tabs=[...root.querySelectorAll('[data-view]')];tabs.forEach((button,index)=>button.addEventListener('keydown',event=>{if(event.key==='ArrowLeft'||event.key==='ArrowRight'){event.preventDefault();const next=tabs[(index+1)%tabs.length];next.focus();next.click()}}));
function resize(){const box=area.getBoundingClientRect();if(box.width<=0||box.height<=0)return;renderer.setSize(box.width,box.height);camera.aspect=box.width/box.height;camera.fov=THREE.MathUtils.radToDeg(2*Math.atan(Math.tan(THREE.MathUtils.degToRad(gallery.horizontalFov)/2)/camera.aspect));camera.updateProjectionMatrix();schedule()}
new ResizeObserver(resize).observe(area);
new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;lastFrameTime=null;if(visible)schedule()},{rootMargin:'100px'}).observe(root);
document.addEventListener('visibilitychange',()=>{lastFrameTime=null;if(!document.hidden)schedule()});
function schedule(){if(!animationId)animationId=requestAnimationFrame(frame)}
function frame(timestamp){
 animationId=null;if(!visible||document.hidden||view!=='explore'){lastFrameTime=null;return}
 const delta=lastFrameTime===null?0:Math.max(0,timestamp-lastFrameTime);lastFrameTime=timestamp;
 if(demo.active)advanceGuidedDemo(demo,delta,{enter:enterDemoSegment,step:advanceDemoPresentation,complete:completeGuidedSequence});
 else advanceMotion(motion,delta);
 if(orientationMotion){
  orientationMotion.elapsed=Math.min(orientationMotion.duration,orientationMotion.elapsed+delta);
  const amount=presentationEase(orientationMotion.elapsed/orientationMotion.duration);
  angle=THREE.MathUtils.lerp(orientationMotion.fromAngle,orientationMotion.toAngle,amount);
  pitch=THREE.MathUtils.lerp(orientationMotion.fromPitch,orientationMotion.toPitch,amount);
  if(orientationMotion.elapsed===orientationMotion.duration)orientationMotion=null;
 }
 const state=motion.state;target.fromArray(state.target);camera.up.set(0,1,0);
 stageGroups.forEach((object,index)=>opacityFor(object,state.weights[index]));
 const growth=wireProgressForDamage(state.damage);wireGrowth.forEach((control,index)=>control.set(growth[index],state.damage));
 camera.position.fromArray(orbitPosition(state.target,state.distance,angle,pitch));camera.lookAt(target);renderer.render(scene,camera);
 if(motion.active||orientationMotion||demo.active)schedule();
}
root.querySelector('.scene-hint').hidden=true;root.querySelector('#viewer-status').textContent='Interactive 3D';root.dataset.ready='true';root.dataset.roomWidth=String(layout.room.width);root.dataset.sceneSource='original-c4d-room';root.querySelectorAll('[data-view],#reset-view,#fullscreen-view,#inspect-detail').forEach(b=>b.disabled=false);setDemoPresentation(false,'Three material states · about 24 seconds');updateControls();resize();schedule();
window.addEventListener('pageshow',event=>{if(event.persisted){lastFrameTime=null;resize();schedule()}});
window.addEventListener('pagehide',event=>{cancelAnimationFrame(animationId);animationId=null;lastFrameTime=null;if(event.persisted)return;renderer.dispose();wireGrowth.forEach(control=>control.dispose());const textures=new Set();scene.traverse(object=>{object.geometry?.dispose();if(object.material){for(const material of Array.isArray(object.material)?object.material:[object.material]){for(const value of Object.values(material)){if(value?.isTexture)textures.add(value)}material.dispose()}}});textures.forEach(texture=>{texture.dispose();texture.image?.close?.()});environmentTarget.dispose()});






