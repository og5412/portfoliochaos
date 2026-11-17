// One clock drives the dolly, surface crossfade and wire reveal. Retargeting
// starts at the displayed state, so changing direction never restores a preset.
export const STAGE_DURATION_MS=4200;
export const VIEW_DURATION_MS=2800;
export const presentationEase=t=>t*t*t*(t*(t*6-15)+10);
const copyState=state=>({...state,target:[...state.target],weights:[...state.weights]});

export function createMotion(initial){
 return {state:copyState(initial),from:copyState(initial),to:copyState(initial),elapsed:0,duration:0,active:false};
}
export function retargetMotion(motion,destination,duration){
 motion.from=copyState(motion.state);
 motion.to=copyState(destination);
 motion.elapsed=0;
 motion.duration=Math.max(0,duration);
 motion.active=motion.duration>0;
 if(!motion.active)motion.state=copyState(destination);
}
export function advanceMotion(motion,delta){
 if(!motion.active)return;
 motion.elapsed=Math.min(motion.duration,motion.elapsed+Math.max(0,delta));
 const amount=presentationEase(motion.elapsed/motion.duration);
 const mix=(from,to)=>from+(to-from)*amount;
 motion.state.distance=mix(motion.from.distance,motion.to.distance);
 motion.state.damage=mix(motion.from.damage,motion.to.damage);
 motion.state.target=motion.from.target.map((value,index)=>mix(value,motion.to.target[index]));
 motion.state.weights=motion.from.weights.map((value,index)=>mix(value,motion.to.weights[index]));
 motion.active=motion.elapsed<motion.duration;
}
export function orbitPosition(target,distance,yaw,pitch){
 return [target[0]+Math.sin(yaw)*distance,target[1]+Math.tan(pitch)*distance,target[2]+Math.cos(yaw)*distance];
}
export const shortestAngle=(from,to)=>from+Math.atan2(Math.sin(to-from),Math.cos(to-from));
