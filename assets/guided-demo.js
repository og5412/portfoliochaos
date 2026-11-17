// Split real frame time at each narrative boundary so a slow device does not
// skip a material transition or apply an entire frame to the following state.
export const GUIDED_DEMO_DURATION_MS=24200;
export const GUIDED_ORBIT_RADIANS_PER_SECOND=.028;
export function guidedOrbitAngle(startingYaw,elapsedMs){
 return startingYaw+Math.max(0,elapsedMs)/1000*GUIDED_ORBIT_RADIANS_PER_SECOND;
}
const phases=[
 {id:'intact',duration:2500,stage:0,destination:true,transition:0,label:'01 / Intact — before the influence'},
 {id:'traces',duration:4200,stage:1,destination:true,transition:4200,label:'02 / Traces — the first marks emerge'},
 {id:'traces-hold',duration:1900,stage:1,label:'02 / Traces — observe the first strand'},
 {id:'erosion',duration:4200,stage:2,destination:true,transition:4200,label:'03 / Erosion — the binding grows'},
 {id:'erosion-hold',duration:1800,stage:2,label:'03 / Erosion — what remains'},
 {id:'detail',duration:2800,stage:2,detail:true,destination:true,transition:2800,label:'Close observation — material and binding'},
 {id:'detail-hold',duration:2600,stage:2,detail:true,label:'Close observation — explore the surface'},
 {id:'return',duration:4200,stage:2,roomReturn:true,transition:4200,label:'Return to the room — the marks remain'}
];
export function createGuidedDemo(){
 return {active:false,elapsed:0,bodyElapsed:0,phaseElapsed:0,index:0,pending:false,preparation:0,phases:[]};
}
export function startGuidedDemo(demo,{prepare=false}={}){
 const preparation=prepare?2800:0;
 Object.assign(demo,{active:true,elapsed:0,bodyElapsed:0,phaseElapsed:0,index:0,pending:true,preparation,
  phases:prepare?[{id:'prepare',duration:preparation,stage:0,destination:true,transition:preparation,label:'Returning to the beginning…'},...phases]:phases});
}
export function advanceGuidedDemo(demo,delta,{enter,step,complete}){
 if(!demo.active)return;
 let remaining=Number.isFinite(delta)?Math.max(0,delta):0;
 while(demo.active){
  const phase=demo.phases[demo.index];
  if(demo.pending){demo.pending=false;enter?.(phase,demo)}
  if(remaining<=0)break;
  const consumed=Math.min(remaining,phase.duration-demo.phaseElapsed);
  demo.phaseElapsed+=consumed;demo.elapsed+=consumed;
  demo.bodyElapsed=Math.min(GUIDED_DEMO_DURATION_MS,Math.max(0,demo.elapsed-demo.preparation));
  step?.(consumed,demo);
  remaining-=consumed;
  if(demo.phaseElapsed>=phase.duration){
   demo.index++;demo.phaseElapsed=0;demo.pending=true;
   if(demo.index===demo.phases.length){demo.active=false;demo.pending=false;complete?.(demo)}
  }
 }
}
