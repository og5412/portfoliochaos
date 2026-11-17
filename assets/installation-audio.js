// New procedural sound study for Fruit of Their Love. No historical music or
// sampled recordings are used. Audio is unlocked only by setEnabled(true).
export const AUDIO_SETTINGS=Object.freeze({
 masterGain:.55,fadeSeconds:.075,suspendDelayMs:180,maxFrameMs:1000,
 noiseSeconds:7,seed:0x46525549,crackTravel:.018,crackIntervalMs:180,effectHoldSeconds:.12
});
const clamp=(value,low=0,high=1)=>Math.max(low,Math.min(high,value));
const finite=value=>Number.isFinite(value);
const smooth=(value,low,high)=>{const t=clamp((value-low)/(high-low));return t*t*(3-2*t)};
const quiet=(reason,active=false)=>({atmosphere:active?1:0,wire:0,erosion:0,release:0,crack:0,reason});
const channels=value=>Array.isArray(value)||ArrayBuffer.isView(value)?Array.from(value):[value];

export function createAudioMotionState(){return {previous:null,timeMs:0,crackTravel:0,lastCrackMs:-Infinity}}

// A pure, frame-rate-aware motion gate. Discrete stage jumps, a newly enabled
// player, and a resumed page establish a baseline instead of playing a burst.
export function advanceAudioMotion(state,{damage,wireProgress,deltaMs,active=true}={}){
 const wire=channels(wireProgress),valid=finite(damage)&&wire.length>0&&wire.every(finite);
 if(!active||!valid)return {state:createAudioMotionState(),controls:quiet(!active?'inactive':'invalid-input')};
 const current={damage:clamp(damage),wire:wire.map(value=>clamp(value))};
 const dt=finite(deltaMs)&&deltaMs>0?deltaMs:0;
 const baseline=reason=>({state:{...createAudioMotionState(),previous:current},controls:quiet(reason,true)});
 if(!state?.previous)return baseline('baseline');
 if(!dt||dt>AUDIO_SETTINGS.maxFrameMs||state.previous.wire.length!==current.wire.length)return baseline('clock-reset');
 const seconds=dt/1000,damageDelta=current.damage-state.previous.damage;
 const travel=current.wire.map((value,index)=>value-state.previous.wire[index]);
 // Real 4.2 s quintic transitions peak below .5 normalized units / second.
 if(Math.abs(damageDelta)>.025+.55*seconds||travel.some(value=>Math.abs(value)>.035+1.8*seconds))return baseline('discontinuity');
 const grow=travel.reduce((sum,value)=>sum+Math.max(0,value),0)/travel.length/seconds;
 const unwind=travel.reduce((sum,value)=>sum+Math.max(0,-value),0)/travel.length/seconds;
 const erosion=smooth(Math.max(0,damageDelta)/seconds,.004,.48);
 const release=smooth(Math.max(unwind,Math.max(0,-damageDelta)/seconds),.006,.5)*.45;
 const timeMs=state.timeMs+dt;
 let crackTravel=state.crackTravel+Math.max(0,damageDelta),crack=0,lastCrackMs=state.lastCrackMs;
 if(damageDelta<=0)crackTravel=0;
 if(erosion>.04&&crackTravel>=AUDIO_SETTINGS.crackTravel&&timeMs-lastCrackMs>=AUDIO_SETTINGS.crackIntervalMs){
  crack=.35+.65*erosion;crackTravel%=AUDIO_SETTINGS.crackTravel;lastCrackMs=timeMs;
 }
 return {state:{previous:current,timeMs,crackTravel,lastCrackMs},controls:{
  atmosphere:1,wire:smooth(grow,.006,.62),erosion,release,crack,reason:'continuous'
 }};
}

// Seeded noise makes the timbre repeatable without network assets or recording.
export function createNoiseSamples(length,seed=AUDIO_SETTINGS.seed){
 const result=new Float32Array(length);let word=seed>>>0||1;
 for(let i=0;i<length;i++){word^=word<<13;word^=word>>>17;word^=word<<5;result[i]=((word>>>0)/4294967296)*2-1}
 return result;
}
export function createCrackSamples(sampleRate,seed=AUDIO_SETTINGS.seed){
 const noise=createNoiseSamples(Math.ceil(sampleRate*.135),seed),result=new Float32Array(noise.length);
 let low=0;
 for(let i=0;i<noise.length;i++){
  const t=i/sampleRate;low+=.16*(noise[i]-low);
  const attack=Math.min(1,t/.0025),envelope=attack*Math.exp(-t/ .024);
  result[i]=envelope*(.6*(noise[i]-low)+.16*Math.sin(2*Math.PI*610*t)+.10*Math.sin(2*Math.PI*970*t));
 }
 return result;
}

export function createInstallationAudio(){
 let graph=null,wanted=false,disposed=false,active=false,suspendTimer=null,generation=0,motion=createAudioMotionState(),crackIndex=0;
 const glide=(param,value,seconds=AUDIO_SETTINGS.fadeSeconds)=>{
  const now=graph.context.currentTime;
  if(param.cancelAndHoldAtTime)param.cancelAndHoldAtTime(now);
  else {param.cancelScheduledValues(now);param.setValueAtTime(param.value,now)}
  param.setTargetAtTime(value,now,Math.max(.005,seconds/3));
 };
 const effect=(param,value,seconds)=>{
  glide(param,value,seconds);
  // The viewer need not keep rendering a static sculpture to release a sound.
  param.setTargetAtTime(0,graph.context.currentTime+AUDIO_SETTINGS.effectHoldSeconds,.055);
 };
 const clearSuspend=()=>{if(suspendTimer!==null){globalThis.clearTimeout(suspendTimer);suspendTimer=null}};
 function build(){
  const Constructor=globalThis.AudioContext||globalThis.webkitAudioContext;
  if(!Constructor)throw new Error('This browser does not support Web Audio.');
  const context=new Constructor({latencyHint:'interactive'}),nodes=[],sources=[],events=new Set();
  const node=(name,...args)=>{const value=context[name](...args);nodes.push(value);return value};
  const gain=value=>{const result=node('createGain');result.gain.value=value;return result};
  const filter=(type,frequency,Q)=>{const result=node('createBiquadFilter');result.type=type;result.frequency.value=frequency;result.Q.value=Q;return result};
  const master=gain(AUDIO_SETTINGS.masterGain),bus=gain(0),limiter=node('createDynamicsCompressor'),softLimit=node('createWaveShaper');
  limiter.threshold.value=-20;limiter.knee.value=8;limiter.ratio.value=20;limiter.attack.value=.003;limiter.release.value=.18;
  softLimit.curve=Float32Array.from({length:2049},(_,i)=>.8*Math.tanh(((i/2048)*2-1)/.8));softLimit.oversample='2x';
  bus.connect(master);master.connect(limiter);limiter.connect(softLimit);softLimit.connect(context.destination);
  const noise=context.createBuffer(1,Math.ceil(context.sampleRate*AUDIO_SETTINGS.noiseSeconds),context.sampleRate);
  noise.copyToChannel(createNoiseSamples(noise.length),0);
  function noiseSource(offset){const source=node('createBufferSource');source.buffer=noise;source.loop=true;source.start(0,offset);sources.push(source);return source}
  const ambientSource=noiseSource(0),ambientBand=filter('bandpass',135,.55),ambientLow=filter('lowpass',420,.7),ambientGain=gain(.08);
  ambientSource.connect(ambientBand);ambientBand.connect(ambientLow);ambientLow.connect(ambientGain);ambientGain.connect(bus);
  for(const [frequency,level] of [[47,.004],[71,.002]]){
   const source=node('createOscillator'),levelNode=gain(level);source.type='sine';source.frequency.value=frequency;source.connect(levelNode);levelNode.connect(bus);source.start();sources.push(source);
  }
  const steel=gain(0),steelSource=noiseSource(1.731);steelSource.connect(steel);
  for(const [frequency,Q,level] of [[240,9,.45],[630,12,.28],[1280,.7,.085]]){
   const band=filter('bandpass',frequency,Q),levelNode=gain(level);steel.connect(band);band.connect(levelNode);levelNode.connect(bus);
  }
  const grit=gain(0),gritSource=noiseSource(3.913),gritHigh=filter('highpass',650,.7),gritLow=filter('lowpass',4300,.7),gritLevel=gain(.10);
  gritSource.connect(grit);grit.connect(gritHigh);gritHigh.connect(gritLow);gritLow.connect(gritLevel);gritLevel.connect(bus);
  const release=gain(0),releaseSource=noiseSource(5.237),releaseBand=filter('bandpass',160,3),releaseLevel=gain(.12);
  releaseSource.connect(release);release.connect(releaseBand);releaseBand.connect(releaseLevel);releaseLevel.connect(bus);
  const crackBuffers=Array.from({length:4},(_,index)=>{
   const samples=createCrackSamples(context.sampleRate,AUDIO_SETTINGS.seed+index*7919),buffer=context.createBuffer(1,samples.length,context.sampleRate);buffer.copyToChannel(samples,0);return buffer;
  });
  graph={context,nodes,sources,events,bus,steel,grit,release,crackBuffers};
 }
 function silence(){
  motion=createAudioMotionState();active=false;
  if(!graph)return;
  glide(graph.bus.gain,0);glide(graph.steel.gain,0);glide(graph.grit.gain,0);glide(graph.release.gain,0);
  if(suspendTimer===null&&graph.context.state!=='suspended'){
   suspendTimer=globalThis.setTimeout(()=>{
    suspendTimer=null;
    if(graph&&!active&&graph.context.state!=='closed')graph.context.suspend().catch(()=>{});
   },AUDIO_SETTINGS.suspendDelayMs);
  }
 }
 function crack(amount){
  const source=graph.context.createBufferSource(),level=graph.context.createGain();
  source.buffer=graph.crackBuffers[crackIndex++%graph.crackBuffers.length];level.gain.value=.045*amount;
  source.connect(level);level.connect(graph.bus);const event={source,level};graph.events.add(event);
  source.onended=()=>{source.disconnect();level.disconnect();graph?.events.delete(event)};source.start();
 }
 return {
  get enabled(){return wanted&&!disposed},
  async setEnabled(value){
   if(disposed)return false;
   const token=++generation;wanted=Boolean(value);motion=createAudioMotionState();
   if(!wanted){silence();return false}
   try{
    if(!graph)build();clearSuspend();
    // resume() is invoked synchronously in the caller's click/touch gesture.
    const resume=graph.context.state!=='running'?graph.context.resume():Promise.resolve();
    await resume;
    return token===generation&&wanted&&!disposed;
   }catch(error){wanted=false;silence();throw error}
  },
  update(frame={}){
   if(disposed||!wanted||!graph)return;
   if(frame.active===false){if(active||motion.previous||graph.context.state==='running')silence();return}
   clearSuspend();
   if(graph.context.state==='suspended')graph.context.resume().catch(()=>{});
   const next=advanceAudioMotion(motion,frame);motion=next.state;
   if(!next.controls.atmosphere){silence();return}
   active=true;glide(graph.bus.gain,1);
   effect(graph.steel.gain,next.controls.wire,.095);effect(graph.grit.gain,next.controls.erosion,.07);effect(graph.release.gain,next.controls.release,.12);
   if(next.controls.crack>0)crack(next.controls.crack);
  },
  pause(){if(!disposed)silence()},
  dispose(){
   if(disposed)return;disposed=true;wanted=false;active=false;generation++;clearSuspend();motion=createAudioMotionState();
   if(!graph)return;
   const old=graph;graph=null;
   for(const source of old.sources){try{source.stop()}catch{}}
   for(const event of old.events){event.source.onended=null;try{event.source.stop()}catch{}event.source.disconnect();event.level.disconnect()}
   old.nodes.forEach(node=>node.disconnect());old.context.close().catch(()=>{});
  }
 };
}
