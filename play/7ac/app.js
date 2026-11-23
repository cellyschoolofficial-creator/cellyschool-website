/* Talk to Celly · 7Ac Tissues · "The Tissue Lab" — Celly School
   Story: Celly is a pathologist today. Hanky, a proud paper tissue, pops out of the sample box. */
"use strict";
const $=s=>document.querySelector(s);
const card=$("#card");
const SR=window.SpeechRecognition||window.webkitSpeechRecognition;
const S={mode:SR?"talk":"tap",mute:false,results:[],last:[],speaking:false,praise:0,token:0};
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
function rec(act,item,first,said){S.results.push({act,item,first,said});try{sessionStorage.setItem("cs7ac_res",JSON.stringify(S.results));}catch(e){}}
try{const r=JSON.parse(sessionStorage.getItem("cs7ac_res")||"[]");if(new URLSearchParams(location.search).get("room"))S.results=r;else sessionStorage.removeItem("cs7ac_res");}catch(e){}

/* ================= Celly ================= */
const BODY="M200,64 C280,60 352,112 356,206 C360,296 290,362 200,362 C110,364 42,298 44,208 C46,114 120,68 200,64Z";
const CELLY_SVG=`<svg class="rig idle" id="cellyRig" viewBox="0 0 400 400" role="img" aria-label="Celly the cell">
<ellipse cx="200" cy="384" rx="120" ry="12" fill="#1F2A44" opacity=".08"/>
<g class="whole">
 <g class="armL"><ellipse cx="54" cy="268" rx="21" ry="44" transform="rotate(38 54 268)" class="limb" fill="#FBE7A1" stroke="#2E3F6E" stroke-width="10"/></g>
 <g class="armR"><ellipse cx="346" cy="268" rx="21" ry="44" transform="rotate(-38 346 268)" class="limb" fill="#FBE7A1" stroke="#2E3F6E" stroke-width="10"/></g>
 <path id="cBody" class="tgt" data-part="cytoplasm" d="${BODY}" fill="#FBE7A1"/>
 <path id="cMem" d="${BODY}" fill="none" stroke="#2E3F6E" stroke-width="12" stroke-linejoin="round" pointer-events="none"/>
 <path class="tgt" data-part="membrane" d="${BODY}" fill="none" stroke="transparent" stroke-width="36" pointer-events="stroke"/>
 <path d="M110,190 q8,-78 72,-98 q-48,32 -60,98z" fill="#fff" opacity=".45" pointer-events="none"/>
 <g class="part nuc tgt" id="cNuc" data-part="nucleus"><circle cx="122" cy="140" r="36" fill="#8E6CC9" stroke="#6B4FA6" stroke-width="8"/><circle cx="130" cy="133" r="12" fill="#6B4FA6"/></g>
 <g class="part mito tgt" data-part="mito" transform="translate(292,128) rotate(30)"><rect x="-30" y="-14" width="60" height="28" rx="14" fill="#F29E4C" stroke="#C8742A" stroke-width="6"/><path d="M-17,0 L-10,-6 L-3,6 L3,-6 L10,6 L17,-6" fill="none" stroke="#C8742A" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round"/></g>
 <g class="part mito tgt" data-part="mito" transform="translate(118,300) rotate(-20)"><rect x="-28" y="-13" width="56" height="26" rx="13" fill="#F29E4C" stroke="#C8742A" stroke-width="6"/><path d="M-16,0 L-9,-6 L-2,6 L4,-6 L11,6 L17,-5" fill="none" stroke="#C8742A" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round"/></g>
  <g class="mirror"><path d="M98,124 Q200,22 302,124" fill="none" stroke="#6FA8DC" stroke-width="12" stroke-linecap="round"/><circle cx="200" cy="66" r="28" fill="#EAF4FB" stroke="#2E3F6E" stroke-width="7"/><circle cx="200" cy="66" r="9" fill="#2E3F6E"/><path d="M184,56 q6,-8 14,-8" stroke="#fff" stroke-width="5" fill="none" stroke-linecap="round"/></g>
 <g pointer-events="none">
  <g class="eye" id="eyeL"><ellipse cx="166" cy="206" rx="23" ry="27" fill="#fff" stroke="#2E3F6E" stroke-width="6"/><g class="pupil"><circle cx="169" cy="210" r="14" fill="#1F2A44"/><circle cx="174" cy="203" r="5" fill="#fff"/></g></g>
  <g class="eye" id="eyeR"><ellipse cx="236" cy="206" rx="23" ry="27" fill="#fff" stroke="#2E3F6E" stroke-width="6"/><g class="pupil"><circle cx="239" cy="210" r="14" fill="#1F2A44"/><circle cx="244" cy="203" r="5" fill="#fff"/></g></g>
  <path id="browL" d="" fill="none" stroke="#2E3F6E" stroke-width="6" stroke-linecap="round"/>
  <path id="browR" d="" fill="none" stroke="#2E3F6E" stroke-width="6" stroke-linecap="round"/>
  <ellipse cx="136" cy="252" rx="19" ry="12" fill="#F6B8C6"/><ellipse cx="266" cy="252" rx="19" ry="12" fill="#F6B8C6"/>
  <path id="mouth" d="" fill="#7A3550" stroke="#2E3F6E" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"/>
 </g>
</g></svg>`;
$("#celly").innerHTML=CELLY_SVG;
const rig=$("#cellyRig");
const Celly={
  have:{nucleus:true,cytoplasm:true,membrane:true,mito:true},
  setPose(p){rig.classList.remove("idle","talk","happy","dance","shiver","spin","wiggle","breath","wave","pump");if(p)p.split(" ").forEach(c=>rig.classList.add(c));},
  pose(p,ms){this.setPose(p);if(ms)setTimeout(()=>{if(!S.speaking)this.setPose("idle")},ms);},
  mouthOpen:0,expr:"smile",
  mouth(open){this.mouthOpen=open;const m=$("#mouth");const e=this.expr;
    m.setAttribute("fill",e==="wavy"||e==="flat"?"none":"#7A3550");
    if(e==="wavy")m.setAttribute("d","M176,262 q8,-9 16,0 t16,0 t16,0");
    else if(e==="flat"&&open<.15)m.setAttribute("d","M184,262 Q200,266 216,259");
    else if(e==="o"){const r=9+open*9;m.setAttribute("d",`M${200-r},260 a${r},${r+2} 0 1,0 ${2*r},0 a${r},${r+2} 0 1,0 ${-2*r},0Z`);}
    else m.setAttribute("d",`M170,250 Q200,${270+open*26} 230,250 Q200,${256+open*6} 170,250Z`);},
  face(e){this.expr=e==="happy"||e==="normal"?"smile":e==="worried"||e==="surprised"?"o":e==="oops"?"wavy":e==="think"?"flat":"smile";
    const bl=$("#browL"),br=$("#browR");
    const B={worried:["M146,172 L182,164","M218,164 L254,172"],oops:["M148,168 L182,170","M218,170 L252,168"],think:["M148,172 L182,172","M220,160 L252,166"],surprised:["M146,162 Q164,152 184,160","M216,160 Q236,152 254,162"]}[e];
    bl.setAttribute("d",B?B[0]:"");br.setAttribute("d",B?B[1]:"");
    if(e==="think")this.look(5,-6);else if(e!=="keep")this.look(0,0);
    this.mouth(0);},
  look(dx,dy){document.querySelectorAll("#cellyRig .pupil").forEach(p=>p.setAttribute("transform",`translate(${dx},${dy})`));},
  part(name,on){const el=name==="nucleus"?[$("#cNuc")]:name==="mito"?[...document.querySelectorAll("#cellyRig .mito")]:[];
    el.forEach(x=>x.classList.toggle("gone",!on));
    if(name==="cytoplasm"){$("#cBody").setAttribute("fill",on?"#FBE7A1":"#F4F0E4");document.querySelectorAll("#cellyRig .limb").forEach(l=>l.setAttribute("fill",on?"#FBE7A1":"#F4F0E4"));}
    if(name==="membrane"){const m=$("#cMem");m.setAttribute("stroke",on?"#2E3F6E":"#BDB6A6");m.setAttribute("stroke-width",on?"12":"5");m.setAttribute("stroke-dasharray",on?"":"14 10");}
    this.have[name]=on;},
  target(name){return name==="nucleus"?$("#cNuc"):name==="mito"?document.querySelector("#cellyRig .mito"):$("#cBody");}
};
Celly.face("normal");
(function blink(){document.querySelectorAll("#cellyRig .eye").forEach(e=>{e.classList.remove("blink");void e.getBBox;requestAnimationFrame(()=>e.classList.add("blink"));});setTimeout(blink,2600+Math.random()*2600);})();
/* ================= sounds: the same warm kalimba as the videos ================= */
let AC=null;
function ac(){try{if(!AC)AC=new(window.AudioContext||window.webkitAudioContext)();if(AC.state==="suspended")AC.resume();}catch(e){}return AC;}
function tone(f,t0,amp,dec,type="sine"){const c=ac();if(!c)return;const t=c.currentTime+t0,o=c.createOscillator(),g=c.createGain();o.type=type;o.frequency.value=f;g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(amp,t+.018);g.gain.exponentialRampToValueAtTime(.0001,t+dec*4);o.connect(g).connect(c.destination);o.start(t);o.stop(t+dec*4+.05);}
const SFX={
  kal(f=440,t=0,a=.16){tone(f,t,a,.45);tone(2*f,t,a*.06,.12);tone(f/2,t,a*.15,.36);},
  chime(){[392,493.9,587.3].forEach((f,i)=>SFX.kal(f,i*.1,.14));},
  sparkle(){[1568,1976,2349,3136].forEach((f,i)=>{tone(f,i*.07,.04,.4);tone(f*2.01,i*.07,.015,.12);});},
  tap(){SFX.kal(440,0,.12);},
  drum(){SFX.kal(220,0,.22);tone(110,0,.12,.12,"triangle");},
  oops(){SFX.kal(330,0,.1);SFX.kal(294,.12,.1);},
  pop(){const c=ac();if(!c)return;const t=c.currentTime,o=c.createOscillator(),g=c.createGain();o.frequency.setValueAtTime(320,t);o.frequency.exponentialRampToValueAtTime(960,t+.09);g.gain.setValueAtTime(.12,t);g.gain.exponentialRampToValueAtTime(.001,t+.14);o.connect(g).connect(c.destination);o.start(t);o.stop(t+.16);},
  tickle(){[0,.55,1.1].forEach((t,i)=>{const f=[523.3,659.3,784][i];SFX.kal(f,t,.12);tone(f*1.5,t+.08,.05,.18);tone(f*2,t+.16,.03,.12);});},
  whoosh(){const c=ac();if(!c)return;const n=c.sampleRate*.6,b=c.createBuffer(1,n,c.sampleRate),d=b.getChannelData(0);for(let i=0;i<n;i++)d[i]=(Math.random()*2-1)*(1-i/n);
    const s=c.createBufferSource(),f=c.createBiquadFilter(),g=c.createGain();s.buffer=b;f.type="bandpass";f.frequency.setValueAtTime(400,c.currentTime);f.frequency.exponentialRampToValueAtTime(2400,c.currentTime+.5);g.gain.value=.25;s.connect(f).connect(g).connect(c.destination);s.start();}
};

/* ================= confetti and flying parts ================= */
const fx=$("#fx"),fxc=fx.getContext("2d");let bits=[],fxOn=false;
function confetti(x,y,n=60){const W=innerWidth,H=innerHeight;fx.width=W;fx.height=H;const cols=["#8E6CC9","#FBE7A1","#F27BA0","#F29E4C","#81A63C","#6FA8DC"];
  for(let i=0;i<n;i++)bits.push({x:x??W/2,y:y??H/3,vx:(Math.random()-.5)*12,vy:-Math.random()*12-3,r:4+Math.random()*6,c:cols[i%cols.length],a:Math.random()*6,life:90+Math.random()*40});
  if(!fxOn){fxOn=true;requestAnimationFrame(fxLoop);}}
function fxLoop(){fxc.clearRect(0,0,fx.width,fx.height);bits=bits.filter(b=>b.life-->0);
  for(const b of bits){b.vy+=.35;b.x+=b.vx;b.y+=b.vy;b.a+=.2;fxc.save();fxc.translate(b.x,b.y);fxc.rotate(b.a);fxc.fillStyle=b.c;fxc.fillRect(-b.r/2,-b.r/4,b.r,b.r/2);fxc.restore();}
  if(bits.length)requestAnimationFrame(fxLoop);else{fxOn=false;fxc.clearRect(0,0,fx.width,fx.height);}}
function centre(el){const r=el.getBoundingClientRect();return{x:r.left+r.width/2,y:r.top+r.height/2};}
/* ================= Celly's voice ================= */
let voice=null;
function pickVoice(){if(!("speechSynthesis" in window))return null;const vs=speechSynthesis.getVoices();
  return vs.find(v=>/natural/i.test(v.name)&&/en[-_]GB/i.test(v.lang)&&/sonia|libby|maisie|female/i.test(v.name))||vs.find(v=>/natural/i.test(v.name)&&/en[-_]GB/i.test(v.lang))
   ||vs.find(v=>v.name.indexOf("Google UK English Female")===0)||vs.find(v=>/Libby|Sonia|Hazel|Susan|Serena|Kate|Stephanie/i.test(v.name)&&/en[-_]GB/i.test(v.lang))
   ||vs.find(v=>/en[-_]GB/i.test(v.lang))||vs.find(v=>/^en/i.test(v.lang))||null;}
if("speechSynthesis" in window){speechSynthesis.onvoiceschanged=()=>{voice=pickVoice();};voice=pickVoice();}
let curAudio=null;
function stopVoice(){S.token++;try{speechSynthesis.cancel();}catch(e){}if(curSrc){try{curSrc.stop();}catch(e){}curSrc=null;}curAudio=null;}
function ttsLine(text,tok){return new Promise(res=>{
  if(!("speechSynthesis" in window)){setTimeout(res,600+text.length*45);return;}
  const parts=text.split(/(?<=[.!?])\s+/).filter(Boolean);let i=0;
  const next=()=>{if(tok!==S.token||i>=parts.length){res();return;}
    const t=parts[i++];const u=new SpeechSynthesisUtterance(t);if(voice){u.voice=voice;u.lang=voice.lang;}else u.lang="en-GB";
    const q=/\?$/.test(t),ex=/!$/.test(t);u.rate=voice&&/natural/i.test(voice.name)?.92:.88;u.pitch=q?1.28:ex?1.22:1.08+Math.random()*.08;
    let done=false;const fin=()=>{if(!done){done=true;next();}};u.onend=fin;u.onerror=fin;setTimeout(fin,1800+t.split(/\s+/).length*560);
    speechSynthesis.speak(u);};
  next();});}
/* recorded voice: one sprite file, decoded once, each line played by its start and length */
let spriteBuf=null,spriteLoading=null,curSrc=null;
function loadSprite(){if(spriteBuf||spriteLoading||!window.VOICE.ready)return spriteLoading;const c=ac();if(!c)return null;
  spriteLoading=fetch(window.VOICE.sprite).then(r=>{if(!r.ok)throw 0;return r.arrayBuffer();}).then(b=>new Promise((ok,no)=>c.decodeAudioData(b,ok,no))).then(buf=>{spriteBuf=buf;return buf;}).catch(()=>{window.VOICE.ready=false;return null;});
  return spriteLoading;}
async function clipLine(id,tok){
  const seg=window.VOICE.seg[id];if(!seg)return false;
  if(!spriteBuf){await loadSprite();if(!spriteBuf)return false;}
  if(tok!==S.token)return true;
  const c=ac();return new Promise(res=>{const src=c.createBufferSource();src.buffer=spriteBuf;src.connect(c.destination);curSrc=src;curAudio=src;
    const env=window.VOICE.env[id]||[],t0=c.currentTime+.02;let raf=0,done=false;
    const step=()=>{const k=Math.floor((c.currentTime-t0)/.04);Celly.mouth(k>=0&&k<env.length?env[k]/9:0);if(!done)raf=requestAnimationFrame(step);};
    src.onended=()=>{done=true;cancelAnimationFrame(raf);Celly.mouth(0);curSrc=null;res(true);};
    src.start(t0,seg[0],seg[1]);raf=requestAnimationFrame(step);});}
function textOf(ids){return ids.map(i=>window.LINES[i]||i).join(" ");}
async function say(ids,{face=null,pose=null}={}){
  ids=[].concat(ids);stopVoice();const tok=S.token;S.last=ids;
  $("#say").textContent=textOf(ids);if(face)Celly.face(face);
  S.speaking=true;Mic.pause();Celly.setPose(pose||"talk");
  let flap=0;const flapper=()=>{if(!S.speaking)return;if(!curAudio){const t=performance.now()/1000;Celly.mouth(Math.max(0,.15+.55*Math.abs(Math.sin(t*13))*Math.abs(Math.sin(t*3.1))));}flap=requestAnimationFrame(flapper);};
  for(const id of ids){if(tok!==S.token)break;const text=window.LINES[id]||id;
    if(S.mute){await sleep(Math.min(2400,500+text.length*30));continue;}
    let ok=false;if(window.VOICE.ready&&window.LINES[id]){curAudio=null;ok=await clipLine(id,tok);curAudio=null;}
    if(!ok&&tok===S.token){cancelAnimationFrame(flap);flap=requestAnimationFrame(flapper);await ttsLine(text,tok);cancelAnimationFrame(flap);}
    await sleep(120);}
  if(tok===S.token){S.speaking=false;Mic.muteUntil=performance.now()+700;Mic.resume();Celly.mouth(0);if(!pose||pose==="talk")Celly.setPose("idle");}
}
function praise(){S.praise=(S.praise%7)+1;return "p"+S.praise;}
$("#again").onclick=async()=>{if(!S.last.length)return;const L=S.lastOpts,k=S.last.join("|");await say(S.last);if(L&&L.key===k&&L.btns[0]&&L.btns[0].isConnected)await readOpts(L.btns,L.texts);};

/* ================= Celly listens (one microphone session for the whole game) ================= */
const Mic={sr:null,want:false,blocked:false,cb:null,muteUntil:0,paused:false,rt:0};
Mic.start=function(){if(!SR||Mic.sr||Mic.blocked||Mic.paused)return;const r=new SR();r.lang="en-GB";r.continuous=true;r.interimResults=true;r.maxAlternatives=3;
  const echo=new Set();
  r.onresult=e=>{for(let i=e.resultIndex;i<e.results.length;i++){const res=e.results[i];
    // a phrase that started while Celly was talking is Celly's own voice (echo from the speakers): ignore it, even when it finishes later
    if(S.speaking||performance.now()<Mic.muteUntil){echo.add(i);continue;}
    if(echo.has(i))continue;
    const alts=[];for(let k=0;k<res.length;k++)alts.push(res[k].transcript.toLowerCase().trim());if(Mic.cb&&alts[0])Mic.cb(alts,res.isFinal);}};
  r.onerror=e=>{if(e.error==="not-allowed"||e.error==="service-not-allowed"){Mic.blocked=true;Mic.want=false;micBlocked();}};
  r.onend=()=>{Mic.sr=null;if(Mic.want&&!Mic.paused&&!Mic.blocked&&S.mode==="talk")setTimeout(()=>{if(!Mic.paused)Mic.start();},250);};
  r.onstart=()=>echo.clear();
  Mic.want=true;Mic.sr=r;try{r.start();}catch(e){Mic.sr=null;}};
// Celly's own voice must never be heard as the child's answer: the microphone is switched off while she talks (aborting throws away anything it already heard) and back on just after
Mic.pause=function(){if(Mic.paused)return;Mic.paused=true;clearTimeout(Mic.rt);if(Mic.sr)try{Mic.sr.abort();}catch(e){}};
Mic.resume=function(){if(!Mic.paused)return;Mic.paused=false;clearTimeout(Mic.rt);Mic.rt=setTimeout(()=>{if(!Mic.paused&&!Mic.sr&&Mic.want!==false&&canHear())Mic.start();},350);};
Mic.stop=function(){Mic.want=false;if(Mic.sr)try{Mic.sr.stop();}catch(e){}};
function micBlocked(){setMode("tap");$("#live").textContent="The microphone is off, so we'll tap. A grown-up can allow the microphone and switch talk mode back on.";}
function canHear(){return S.mode==="talk"&&!!SR&&!Mic.blocked;}
function hear(ms,test){return new Promise(res=>{
  if(!canHear()){res({ok:false,text:null,skipped:true});return;}
  if(!Mic.sr)Mic.start();document.body.classList.add("listening");$("#live").textContent="Your turn. Celly is listening…";
  let last=null,quiet=0,timer=0,done=false;
  const finish=v=>{if(done)return;done=true;clearTimeout(timer);clearTimeout(quiet);Mic.cb=null;document.body.classList.remove("listening");
    $("#live").textContent=v.text?`Celly heard: “${v.text}”`:"";res(v);};
  Mic.cb=(alts,fin)=>{last=alts[0];$("#live").textContent=`I hear: “${alts[0]}”`;const v=test(alts,fin);
    if(v!=null&&v!==false)finish({ok:true,val:v,text:alts[0]});else if(fin){clearTimeout(quiet);quiet=setTimeout(()=>finish({ok:false,text:last}),1300);}};
  timer=setTimeout(()=>finish({ok:false,text:last}),ms);
  S.cancelHear=()=>finish({ok:false,text:last,skipped:true});});}
const norm=s=>s.toLowerCase().replace(/[^a-z ]/g," ").replace(/\s+/g," ").trim();
function lev(a,b){const m=a.length,n=b.length;if(!m)return n;if(!n)return m;let p=Array.from({length:n+1},(_,i)=>i);
  for(let i=1;i<=m;i++){const c=[i];for(let j=1;j<=n;j++)c[j]=Math.min(p[j]+1,c[j-1]+1,p[j-1]+(a[i-1]===b[j-1]?0:1));p=c;}return p[n];}
function skel(w){return w.replace(/gh/g,"").replace(/ph/g,"f").replace(/ch/g,"k").replace(/c(?=[eiy])/g,"s").replace(/[cq]/g,"k").replace(/z/g,"s").replace(/[aeiouyhw]/g,"").replace(/(.)\1+/g,"$1");}
function heardWord(alts,word,extra=[]){
  if(!alts)return false;const target=norm(word).replace(/ /g,"");
  for(const a of alts){const t=norm(a);if(!t)continue;
    for(const v of [word,...extra])if(t.includes(norm(v)))return true;
    const ws=t.split(" ");
    for(let i=0;i<ws.length;i++)for(let k=1;k<=4&&i+k<=ws.length;k++){const chunk=ws.slice(i,i+k).join("");
      if(Math.abs(chunk.length-target.length)>4)continue;
      if(1-lev(chunk,target)/Math.max(chunk.length,target.length)>=.72)return true;
      const x=skel(chunk),y=skel(target);if(x.length>=3&&y.length>=3&&1-lev(x,y)/Math.max(x.length,y.length)>=.7)return true;}}
  return false;}
const heardAny=(alts,keys)=>!!alts&&alts.some(a=>{const t=" "+norm(a)+" ";return keys.some(k=>t.includes(" "+k));});

/* ================= shell ================= */
function setMode(m){S.mode=m;$("#modeTalk").setAttribute("aria-pressed",m==="talk");$("#modeTap").setAttribute("aria-pressed",m==="tap");if(m==="tap"){Mic.stop();if(S.cancelHear)S.cancelHear();}else if(S.started)Mic.start();}
$("#modeTalk").onclick=()=>{if(!SR){$("#live").textContent="This browser can't listen. Please use Chrome or Edge for talk mode.";return;}Mic.blocked=false;setMode("talk");};
$("#modeTap").onclick=()=>setMode("tap");
$("#muteBtn").onclick=()=>{S.mute=!S.mute;$("#muteBtn").setAttribute("aria-pressed",S.mute);$("#muteBtn").textContent=S.mute?"🔇 Celly's voice off":"🔈 Celly's voice on";if(S.mute)stopVoice();};
const TRAIL=["Tissue Lab","Team Tissue","Heart detective","Barry's carrot","Brain break","Meet the microscope","Make a slide","Focus!","Magnification Station","Teach Celly","Certificate"];
function trail(n){S.room=n;$("#trail").innerHTML=`<button class="step nav" data-go="${n-1}" ${n<=0?"disabled":""} aria-label="Previous room">◀ back</button>`+
  TRAIL.map((t,i)=>`<button class="step ${i<n?"done":i===n?"now":""}" data-go="${i}" ${i===n?'aria-current="step"':""} title="Go to ${t}">${i<n?"✓ ":""}${t}</button>`).join("")+
  `<button class="step nav" data-go="${n+1}" ${n>=TRAIL.length-1?"disabled":""} aria-label="Next room">next ▶</button>`;}
/* jump to any room: reload the page at that room, so nothing from the old room keeps running */
function goRoom(i){i=Math.max(0,Math.min(TRAIL.length-1,i));if(i===S.room)return;
  try{sessionStorage.setItem("cs7ac_prefs",JSON.stringify({mode:S.mode,mute:S.mute}));}catch(e){}
  stopVoice();location.href=location.pathname+(i?"?room="+i:"");}
$("#trail").addEventListener("click",e=>{const b=e.target.closest("[data-go]");if(b&&!b.disabled)goRoom(+b.dataset.go);});
function show(html,n){card.innerHTML=html;if(n!=null)trail(n);if(innerWidth<=820)$("#stage").scrollIntoView({behavior:"smooth",block:"start"});}
function waitClick(sel){return new Promise(r=>{const b=$(sel);if(b)b.onclick=()=>{ac();r();};});}
function bigStage(on){$("#stage").classList.toggle("bigstage",on);}
async function watch(src,label){
  card.insertAdjacentHTML("beforeend",`<video class="clip" id="clip" src="${src}" playsinline controls preload="auto" aria-label="${label}"></video><div class="row"><button class="tbtn" id="skipClip">skip the clip</button></div>`);
  const v=$("#clip");v.volume=1;let skipped=false;
  const ended=new Promise(r=>{let done=false;const fin=()=>{if(!done){done=true;r();}};v.onended=fin;v.onerror=fin;$("#skipClip").onclick=()=>{skipped=true;stopVoice();v.pause();fin();};});
  await say("watch",{face:"happy"});
  if(!skipped)v.play().catch(()=>{});
  await ended;
  v.remove();$("#skipClip").parentElement.remove();Celly.pose("happy",900);SFX.pop();}
/* ================= Hanky the paper tissue (on screen only: text + synthesised sounds) ================= */
const HANKY_DOTS=(()=>{let d="";for(let y=104;y<=290;y+=26)for(let x=78;x<=226;x+=26)if(!(y>140&&y<230&&x>90&&x<210))d+=`<circle cx="${x+(y/26%2?13:0)}" cy="${y}" r="3.2"/>`;return d;})();
const HANKY_SVG=`<svg class="rig guest hanky idle" viewBox="0 0 300 340" role="img" aria-label="Hanky the paper tissue">
<ellipse cx="150" cy="330" rx="96" ry="9" fill="#1F2A44" opacity=".08"/>
<g class="whole">
 <path d="M62,206 q-30,-4 -42,-34" stroke="#2E3F6E" stroke-width="8" fill="none" stroke-linecap="round"/>
 <path d="M238,206 q30,-4 42,-34" stroke="#2E3F6E" stroke-width="8" fill="none" stroke-linecap="round"/>
 <path d="M114,300 v22 h-16 M186,300 v22 h16" stroke="#2E3F6E" stroke-width="8" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
 <path d="M60,84 Q104,76 150,82 Q184,86 204,80 L240,118 Q236,160 242,204 Q236,252 240,302 Q192,308 150,302 Q104,296 60,304 Q66,252 58,204 Q64,142 60,84Z" fill="#FFFFFF" stroke="#2E3F6E" stroke-width="8" stroke-linejoin="round"/>
 <g fill="#CFE3F3" pointer-events="none">${HANKY_DOTS}</g>
 <path d="M204,80 L240,118 Q258,90 246,58 Q226,60 204,80Z" fill="#EAF4FB" stroke="#2E3F6E" stroke-width="7" stroke-linejoin="round"/>
 <path d="M76,96 q30,-8 60,-4" stroke="#EAF4FB" stroke-width="6" fill="none" stroke-linecap="round"/>
 <g class="hface">
  <ellipse cx="122" cy="168" rx="17" ry="20" fill="#fff" stroke="#2E3F6E" stroke-width="6"/><circle cx="125" cy="172" r="10" fill="#1F2A44"/><circle cx="129" cy="167" r="3.5" fill="#fff"/>
  <ellipse cx="178" cy="168" rx="17" ry="20" fill="#fff" stroke="#2E3F6E" stroke-width="6"/><circle cx="181" cy="172" r="10" fill="#1F2A44"/><circle cx="185" cy="167" r="3.5" fill="#fff"/>
  <ellipse cx="98" cy="206" rx="14" ry="9" fill="#F6B8C6"/><ellipse cx="202" cy="206" rx="14" ry="9" fill="#F6B8C6"/>
  <path d="M128,204 Q150,226 172,204 Q150,212 128,204Z" fill="#7A3550" stroke="#2E3F6E" stroke-width="4" stroke-linejoin="round"/>
 </g>
 <g pointer-events="none">
  <path d="M86,262 l-10,34 l14,-8 l8,12 l6,-32Z M110,262 l10,34 l-14,-8 l-8,12 l-6,-32Z" fill="#E0455F" stroke="#2E3F6E" stroke-width="3" stroke-linejoin="round"/>
  <circle cx="98" cy="254" r="21" fill="#F2C14E" stroke="#2E3F6E" stroke-width="5"/>
  <text x="98" y="259" text-anchor="middle" font-family="Lexend,Arial" font-size="13" font-weight="600" fill="#2E3F6E">3-ply</text>
 </g>
</g></svg>`;
const Guest={kind:null,t:0,
  show(kind="hanky"){this.kind=kind;$("#guestArt").innerHTML=HANKY_SVG;$("#actors").classList.add("withGuest");this.pose("popin",800);},
  hide(){this.kind=null;$("#actors").classList.remove("withGuest");$("#gsay").classList.remove("on");},
  el(){return $("#guestArt svg");},
  pose(p,ms){const g=this.el();if(!g)return;g.classList.remove("idle","flap","sulk","sneeze","popin");void g.getBoundingClientRect();g.classList.add(p);
    if(ms)setTimeout(()=>{const x=this.el();if(x&&x.classList.contains(p)){x.classList.remove(p);x.classList.add("idle");}},ms);},
  say(text,{sfx="rustle",ms=3200,pose="flap"}={}){if(!this.kind)return Promise.resolve();const b=$("#gsay");b.textContent=text;b.classList.add("on");clearTimeout(this.t);this.t=setTimeout(()=>b.classList.remove("on"),ms);
    if(sfx&&SFX[sfx])SFX[sfx]();if(pose)this.pose(pose,pose==="sulk"?2800:pose==="sneeze"?1100:900);return sleep(Math.min(ms,1400));}
};
/* Hanky's sounds and the lab sounds: all synthesised, no audio files */
function noise(t0,dur,{type="bandpass",f0=1000,f1=f0,q=1,g=.2,attack=.01}={}){const c=ac();if(!c)return;const n=Math.ceil(c.sampleRate*dur),b=c.createBuffer(1,n,c.sampleRate),d=b.getChannelData(0);for(let i=0;i<n;i++)d[i]=Math.random()*2-1;
  const s=c.createBufferSource(),f=c.createBiquadFilter(),gn=c.createGain(),t=c.currentTime+t0;s.buffer=b;f.type=type;f.Q.value=q;f.frequency.setValueAtTime(f0,t);f.frequency.exponentialRampToValueAtTime(f1,t+dur);
  gn.gain.setValueAtTime(.0001,t);gn.gain.exponentialRampToValueAtTime(g,t+attack);gn.gain.exponentialRampToValueAtTime(.0001,t+dur);s.connect(f).connect(gn).connect(c.destination);s.start(t);s.stop(t+dur+.02);}
Object.assign(SFX,{
  rustle(){[0,.11,.2,.34].forEach((t,i)=>noise(t,.09,{f0:2600+i*300,f1:3400,q:.7,g:.09}));},
  sneeze(){noise(0,.6,{f0:500,f1:2600,q:1.2,g:.16,attack:.5});noise(.56,.22,{type:"highpass",f0:1600,f1:4200,g:.32});tone(196,.56,.1,.07,"triangle");},
  flump(){const c=ac();if(!c)return;const t=c.currentTime,o=c.createOscillator(),g=c.createGain();o.type="triangle";o.frequency.setValueAtTime(190,t);o.frequency.exponentialRampToValueAtTime(70,t+.3);g.gain.setValueAtTime(.18,t);g.gain.exponentialRampToValueAtTime(.001,t+.34);o.connect(g).connect(c.destination);o.start(t);o.stop(t+.36);noise(0,.2,{type:"lowpass",f0:600,f1:200,g:.08});},
  chop(){noise(0,.06,{type:"highpass",f0:2200,f1:3000,g:.3});tone(110,0,.22,.06,"triangle");tone(80,.02,.15,.08);},
  crunch(){for(let i=0;i<9;i++)noise(i*.035+Math.random()*.02,.05,{f0:900+Math.random()*2400,q:.6,g:.22});tone(70,0,.25,.12,"triangle");},
  knock(){[0,.18,.36].forEach(d=>{tone(140,d,.25,.05,"triangle");tone(90,d,.2,.06);});},
  tick(){SFX.kal(784,0,.12);SFX.kal(1047,.08,.08);},
  cross(){tone(196,0,.1,.08,"triangle");}
});

/* ================= helpers ================= */
const shuffle=a=>{a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;};
function kmatch(alts,keys){if(!alts||!keys)return false;if(heardAny(alts,keys))return true;
  return alts.some(a=>keys.some(k=>/^\d+$/.test(k)&&new RegExp("(^|\\D)"+k+"(\\D|$)").test(a)));}
function micRow(){return canHear()?`<div class="row"><button class="tbtn" id="noMic">Celly can't hear me</button></div>`:"";}
/* one question, several answers. Tap, or say a key word. Returns true if right first time. */
/* Celly reads the answer choices aloud (recorded lines in window.OPTV), each button lights up as she reads it */
function optKey(h){const d=document.createElement("div");d.innerHTML=h;return d.textContent.replace(/^[^A-Za-z0-9]+/,"").replace(/\s+/g," ").trim();}
async function readOpts(btns,texts){if(S.mute||!window.OPTV)return;const tok=S.token;S.speaking=true;Mic.pause();Celly.setPose("talk");
  for(let k=0;k<btns.length;k++){if(tok!==S.token||!btns[k].isConnected||btns[k].onclick===null)break;const id=window.OPTV[optKey(texts[k])];if(!id)continue;
    btns[k].classList.add("reading");await clipLine(id,tok);btns[k].classList.remove("reading");if(tok===S.token)await sleep(250);}
  if(tok===S.token){S.speaking=false;Mic.muteUntil=performance.now()+700;Mic.resume();Celly.mouth(0);Celly.setPose("idle");}}
function remember(ask,btns,texts){S.lastOpts={key:[].concat(ask||[]).join("|"),btns,texts};}
function choose(opts,{ask=null,wrong="lab_wrong",into="#opts",grid=false,onRight=null}={}){return new Promise(async res=>{
  const box=$(into);box.innerHTML=grid?`<div class="pick">${opts.map((o,k)=>`<button data-k="${k}"><span class="e">${o.e||""}</span>${o.t}</button>`).join("")}</div>`
    :`<div class="opts">${opts.map((o,k)=>`<button class="opt" data-k="${k}">${o.e?o.e+" ":""}${o.t}</button>`).join("")}</div>`;
  const btns=[...box.querySelectorAll("button")];let wrongN=0,settled=false;
  const pickK=async k=>{if(settled)return;ac();const o=opts[k],b=btns[k];
    if(o.ok){settled=true;if(S.cancelHear)S.cancelHear();btns.forEach(x=>x.onclick=null);b.classList.add("right");SFX.sparkle();if(onRight)await onRight(o);res(wrongN===0);}
    else{wrongN++;b.classList.remove("wrong");void b.offsetWidth;b.classList.add("wrong");SFX.oops();if(o.no)await o.no(wrongN);else await say(wrong,{face:"oops"});listen();}};
  btns.forEach((b,k)=>b.onclick=()=>pickK(k));
  const order=opts.map((o,k)=>k).sort((a,b)=>(opts[b].neg?1:0)-(opts[a].neg?1:0));
  const listen=async()=>{if(settled||!canHear()||!opts.some(o=>o.keys))return;
    const got=await hear(10000,a=>{for(const k of order)if(kmatch(a,opts[k].keys))return k+1;return null;});
    if(settled)return;if(got.ok)pickK(got.val-1);};
  if(ask)await say(ask,{face:"normal"});remember(S.last,btns,opts.map(o=>o.t));if(!settled)await readOpts(btns,opts.map(o=>o.t));listen();});}
const YES=["yes","yeah","yep","tick","right","correct","of course"],NO=["no","nope","cross","wrong","not","never","don't","dont"];
async function yesNo(q,isYes,{wrong="lab_wrong",yesT="✅ Tick: that's right",noT="❌ Cross: that's wrong"}={}){
  return choose([{t:yesT,ok:isYes,keys:YES},{t:noT,ok:!isYes,keys:NO,neg:true}],{ask:q,wrong});}
/* one big button the child taps (or a key phrase they say) to move on */
function act(sel,keys=null,ms=8000){return new Promise(res=>{let done=false;const fin=v=>{if(done)return;done=true;if(S.cancelHear)S.cancelHear();res(v);};
  const b=$(sel);if(b)b.onclick=()=>{ac();fin("tap");};
  if(keys&&canHear())hear(ms,a=>kmatch(a,keys)||null).then(g=>{if(g.ok)fin("said");});});}
/* tap the right part of a picture. Each tappable group has data-part. Wrong taps shake. */
function tapPart(box,want,{wrong="tap_wrong",mark=true}={}){return new Promise(res=>{
  const wants=[].concat(want);let mistakes=0,busy=false;const els=[...box.querySelectorAll("[data-part]")];
  const off=()=>els.forEach(e=>e.onclick=null);
  els.forEach(e=>e.onclick=async ev=>{ev.stopPropagation();ac();const p=e.dataset.part;
    if(wants.includes(p)){off();if(mark)box.querySelectorAll(`[data-part="${p}"]`).forEach(x=>x.classList.add("found"));SFX.sparkle();res({mistakes,part:p});}
    else{mistakes++;e.classList.remove("nope");void e.getBoundingClientRect();e.classList.add("nope");SFX.oops();
      if(!busy){busy=true;await say(wrong,{face:"oops"});busy=false;}}});});}
function chip(into,text,col){$(into).insertAdjacentHTML("beforeend",`<span class="lab"><i style="background:${col}"></i>${text}</span>`);}
/* put wide step cards in order (like Mrs Gren's tiles). Returns the number of wrong taps. */
async function orderCards(C,{labels,wrong,onPlace,fingers=false}){
  let order;do{order=shuffle(C.map((c,k)=>k));}while(order.every((v,k)=>v===k));
  $("#order").innerHTML=`${fingers?`<div class="row fingers"><span aria-hidden="true">✋</span><div class="beats" id="fing">${C.map(()=>"<i></i>").join("")}</div></div>`:""}
   <ol class="oslots" id="oslots">${C.map((c,k)=>`<li class="oslot"><span class="on">${labels[k]}</span><span class="ot"></span></li>`).join("")}</ol>
   <div class="ocards" id="ocards">${order.map(k=>`<button class="ocard" data-k="${k}"><span class="oi">${C[k].ic}</span><span>${C[k].t}</span></button>`).join("")}</div>`;
  let pos=0,mistakes=0,busy=false;
  await new Promise(done=>$("#ocards").querySelectorAll(".ocard").forEach(b=>b.onclick=async()=>{if(busy||b.classList.contains("used"))return;ac();const k=+b.dataset.k;
    if(k===pos){busy=true;b.classList.add("used");const s=$("#oslots").children[pos];s.querySelector(".ot").innerHTML=`<span class="oi">${C[k].ic}</span><span>${C[k].t}</span>`;s.classList.add("filled");SFX.tap();
      if(fingers)$("#fing").children[pos].classList.add("on");
      pos++;await onPlace(k);busy=false;if(pos===C.length)done();}
    else{mistakes++;b.classList.remove("shake");void b.offsetWidth;b.classList.add("shake");SFX.oops();say(wrong,{face:"oops"});}}));
  return mistakes;}
function crying(on){const w=$("#cellyRig .whole");if(!w)return;const t=$("#tears");if(t)t.remove();
  if(on)w.insertAdjacentHTML("beforeend",`<g id="tears" pointer-events="none"><path class="tear" d="M160,232 q-9,16 0,26 q9,-10 0,-26z" fill="#6FA8DC" stroke="#2E3F6E" stroke-width="3"/><path class="tear t2" d="M244,232 q-9,16 0,26 q9,-10 0,-26z" fill="#6FA8DC" stroke="#2E3F6E" stroke-width="3"/></g>`);}

/* ================= pictures (inline SVG, same pastel style) ================= */
const BOX_SVG=open=>`<svg viewBox="0 0 320 240" role="img" aria-label="${open?"An open":"A"} delivery box: tissue samples, fragile">
 <ellipse cx="160" cy="226" rx="130" ry="9" fill="#1F2A44" opacity=".08"/>
 ${open?`<path d="M40,80 L8,40 L120,40 L150,80Z" fill="#E7BC85" stroke="#2E3F6E" stroke-width="6" stroke-linejoin="round"/><path d="M280,80 L312,40 L200,40 L170,80Z" fill="#E7BC85" stroke="#2E3F6E" stroke-width="6" stroke-linejoin="round"/>
   <rect x="40" y="80" width="240" height="10" fill="#8A6A4A"/>`
  :`<rect x="34" y="60" width="252" height="30" rx="8" fill="#E7BC85" stroke="#2E3F6E" stroke-width="6"/><rect x="148" y="60" width="24" height="30" fill="#C8956B"/>`}
 <rect x="40" y="86" width="240" height="132" rx="10" fill="#D9A86C" stroke="#2E3F6E" stroke-width="7"/>
 <rect x="62" y="116" width="196" height="76" rx="10" fill="#fff" stroke="#2E3F6E" stroke-width="4"/>
 <text x="160" y="148" text-anchor="middle" font-family="Lexend,Arial" font-size="21" font-weight="600" fill="#1F2A44">TISSUE SAMPLES</text>
 <text x="160" y="178" text-anchor="middle" font-family="Lexend,Arial" font-size="19" font-weight="600" fill="#C0392B">FRAGILE</text>
</svg>`;
const CELL=(x,y,w,h,fill,nuc="#8E6CC9",r=8)=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="${fill}" stroke="#2E3F6E" stroke-width="3"/><circle cx="${x+w/2}" cy="${y+h/2}" r="${Math.min(w,h)/5}" fill="${nuc}"/>`;
const PIC_SAME=`<svg viewBox="0 0 160 120" role="img" aria-label="Lots of cells that are all the same">${[0,1,2].map(r=>[0,1,2,3].map(c=>CELL(10+c*36,12+r*34,32,26,"#F6B8C6")).join("")).join("")}</svg>`;
const PIC_MIX=`<svg viewBox="0 0 160 120" role="img" aria-label="Lots of different cells">
 <circle cx="34" cy="34" r="20" fill="#B5D27E" stroke="#2E3F6E" stroke-width="3"/><circle cx="34" cy="34" r="6" fill="#8E6CC9"/>
 ${CELL(66,14,64,16,"#FBE7A1")}${CELL(98,60,34,44,"#A9C4E8","#8E6CC9",4)}
 <path d="M30,70 l10,14 l16,-4 l-6,16 l10,12 l-16,2 l-6,14 l-8,-14 l-16,-2 l10,-12 l-6,-16 l16,4Z" fill="#F29E4C" stroke="#2E3F6E" stroke-width="3" stroke-linejoin="round"/>
 <ellipse cx="76" cy="82" rx="12" ry="22" fill="#F6B8C6" stroke="#2E3F6E" stroke-width="3"/><circle cx="76" cy="82" r="5" fill="#8E6CC9"/></svg>`;
const PIC_ONE=`<svg viewBox="0 0 160 120" role="img" aria-label="Just one cell">${CELL(62,46,36,28,"#F6B8C6")}</svg>`;
const HEART_PATH="M160,276 C96,236 36,186 40,124 C44,74 92,50 132,70 C146,77 155,88 160,98 C166,88 176,78 190,71 C230,52 280,76 280,126 C280,188 222,238 160,276Z";
const FAT_DOTS=[[52,134,15],[74,126,17],[98,122,15],[122,124,17],[146,116,15],[170,112,17],[194,112,15],[218,114,17],[242,118,15],[266,126,16],[178,136,16],[184,160,17],[189,184,15],[192,206,17],[192,228,15],[186,248,14]];
const HEART_SVG=`<svg viewBox="0 0 320 300" role="img" aria-label="A heart, with muscle tissue and fat tissue">
 <defs><clipPath id="hclip"><path d="${HEART_PATH}"/></clipPath></defs>
 <g pointer-events="none"><path d="M150,96 C144,44 176,20 206,28 C228,34 236,58 228,80" fill="none" stroke="#2E3F6E" stroke-width="34" stroke-linecap="round"/><path d="M150,96 C144,44 176,20 206,28 C228,34 236,58 228,80" fill="none" stroke="#F09AA5" stroke-width="22" stroke-linecap="round"/>
  <path d="M184,90 C190,62 168,44 128,46" fill="none" stroke="#2E3F6E" stroke-width="30" stroke-linecap="round"/><path d="M184,90 C190,62 168,44 128,46" fill="none" stroke="#A9C4E8" stroke-width="18" stroke-linecap="round"/></g>
 <g class="hit" data-part="muscle"><path d="${HEART_PATH}" fill="#E07A78"/>
  <g clip-path="url(#hclip)" stroke="#B9474D" stroke-width="5" fill="none" opacity=".7" stroke-linecap="round">${[...Array(15)].map((_,i)=>{const x=30+i*18;return `<path d="M${x},50 C${x+34},120 ${x-22},200 ${x+12},292"/>`;}).join("")}</g></g>
 <g class="hit" data-part="fat" clip-path="url(#hclip)">${FAT_DOTS.map(([x,y,r])=>`<circle cx="${x}" cy="${y}" r="${r}" fill="#FFF3D4" stroke="#C9A46A" stroke-width="3"/><circle cx="${x-r/3}" cy="${y-r/3}" r="${r/4}" fill="#fff"/>`).join("")}</g>
 <path d="${HEART_PATH}" fill="none" stroke="#2E3F6E" stroke-width="8" stroke-linejoin="round" pointer-events="none"/>
</svg>`;
const LIVER_PATH="M14,56 C20,22 80,14 130,20 C170,24 194,40 186,64 C178,94 120,120 70,124 C36,126 8,96 14,56Z";
const LIVER=(x,label,spots,part)=>`<g class="hit" data-part="${part}"><g transform="translate(${x},8)">
 <path d="${LIVER_PATH}" fill="#A9524B" stroke="#2E3F6E" stroke-width="7" stroke-linejoin="round"/><path d="M40,44 q30,-18 70,-16" stroke="#C97A6E" stroke-width="7" fill="none" stroke-linecap="round"/>
 ${spots?[[52,72,10],[86,58,8],[118,80,11],[146,52,8],[76,98,8],[150,82,7],[104,40,6],[36,88,7]].map(([a,b,r])=>`<circle cx="${a}" cy="${b}" r="${r}" fill="#F6E3B8" stroke="#C9A46A" stroke-width="2.5"/>`).join(""):""}
 </g><text x="${x+100}" y="172" text-anchor="middle" font-family="Lexend,Arial" font-size="20" fill="#1F2A44">${label}</text></g>`;
const LIVERS_SVG=fattyLeft=>`<svg viewBox="0 0 440 182" role="img" aria-label="Two livers">${LIVER(14,"liver 1",fattyLeft,fattyLeft?"fatty":"healthy")}${LIVER(226,"liver 2",!fattyLeft,fattyLeft?"healthy":"fatty")}</svg>`;
const CARROT_SVG=`<svg viewBox="0 0 320 160" role="img" aria-label="A carrot">
 <g fill="#81A63C" stroke="#3E7E33" stroke-width="4" stroke-linejoin="round"><path d="M74,74 C50,50 30,40 10,44 C26,60 48,72 74,78Z"/><path d="M74,80 C44,80 22,92 8,110 C34,108 54,98 74,86Z"/><path d="M76,76 C66,46 54,26 36,16 C40,42 54,62 72,80Z"/></g>
 <path d="M70,50 Q58,82 70,114 L298,88 Q304,82 298,76Z" fill="#F29E4C" stroke="#2E3F6E" stroke-width="7" stroke-linejoin="round"/>
 <g stroke="#C8742A" stroke-width="4" stroke-linecap="round"><path d="M110,62 l12,4 M150,96 l14,-3 M190,70 l12,3 M232,90 l12,-2 M126,100 l10,-2"/></g></svg>`;
const SLICE_SVG=`<svg viewBox="0 0 260 260" role="img" aria-label="A slice of carrot">
 <g class="hit" data-part="skin"><circle cx="130" cy="130" r="118" fill="#C9572A" stroke="#2E3F6E" stroke-width="6"/><circle cx="130" cy="130" r="108" fill="none" stroke="#F6C9A0" stroke-width="3" stroke-dasharray="4 9"/></g>
 <g class="hit" data-part="outer"><circle cx="130" cy="130" r="96" fill="#F29E4C" stroke="#C8742A" stroke-width="3"/></g>
 <g class="hit" data-part="core"><circle cx="130" cy="130" r="50" fill="#FBDDA6" stroke="#C8742A" stroke-width="3"/>
  <g stroke="#D9A85A" stroke-width="3" stroke-linecap="round">${[...Array(8)].map((_,i)=>{const a=i*Math.PI/4;return `<line x1="${130+12*Math.cos(a)}" y1="${130+12*Math.sin(a)}" x2="${130+42*Math.cos(a)}" y2="${130+42*Math.sin(a)}"/>`;}).join("")}</g>
  <g fill="#D9A85A">${[...Array(8)].map((_,i)=>{const a=i*Math.PI/4+Math.PI/8;return `<circle cx="${130+30*Math.cos(a)}" cy="${130+30*Math.sin(a)}" r="3.5"/>`;}).join("")}</g></g>
</svg>`;
const SEEDLING_SVG=`<svg viewBox="0 0 260 300" role="img" aria-label="A baby carrot plant with its root in the soil">
 <rect x="0" y="112" width="260" height="188" rx="16" fill="#E7D3B5"/><g fill="#C9A27A">${[[30,150],[214,140],[60,240],[200,230],[40,286],[226,284],[96,170],[176,266]].map(([x,y])=>`<circle cx="${x}" cy="${y}" r="5"/>`).join("")}</g>
 <g class="hit" data-part="leaf" fill="#81A63C" stroke="#3E7E33" stroke-width="4" stroke-linejoin="round">
  <path d="M128,114 C120,80 104,52 84,34 C96,62 110,88 124,116Z"/><path d="M130,114 C132,76 132,48 130,18 C140,48 140,80 134,116Z"/><path d="M134,116 C146,86 162,62 184,46 C170,74 152,96 138,118Z"/>
  <circle cx="84" cy="34" r="10"/><circle cx="130" cy="18" r="10"/><circle cx="184" cy="46" r="10"/></g>
 <g class="hit" data-part="roothair">${[...Array(9)].map((_,i)=>{const y=150+i*13,w=7-i*.45;return `<path d="M${130-w},${y} l-30,${6+i%2*4} M${130+w},${y+6} l30,${6+i%2*4}" stroke="#fff" stroke-opacity="0" stroke-width="16"/><path d="M${130-w},${y} l-26,${6+i%2*4} M${130+w},${y+6} l26,${6+i%2*4}" stroke="#7A5A3A" stroke-width="3" stroke-linecap="round"/>`;}).join("")}</g>
 <g class="hit" data-part="root"><path d="M120,112 Q124,200 130,284 Q136,200 140,112Z" fill="#F29E4C" stroke="#2E3F6E" stroke-width="5" stroke-linejoin="round"/></g>
</svg>`;
/* the light microscope: every part a separate tappable group, drawn without transforms on the groups */
function MICRO_SVG({tap=false,problem=null}={}){
  const P=n=>tap?` class="hit" data-part="${n}"`:"";
  const lightOK=!problem;
  const bulbFill=problem==="light"?"#CFD8E6":"#FBE7A1";
  const lens=`<rect x="226" y="240" width="20" height="34" rx="4" fill="#F7C7A3" stroke="#2E3F6E" stroke-width="5"/><rect x="226" y="262" width="20" height="5" fill="#E0455F"/>
    <rect x="198" y="236" width="16" height="26" rx="4" fill="#F7C7A3" stroke="#2E3F6E" stroke-width="5" transform="rotate(24 206 236)"/>
    <rect x="258" y="236" width="16" height="30" rx="4" fill="#F7C7A3" stroke="#2E3F6E" stroke-width="5" transform="rotate(-24 266 236)"/>`;
  return `<svg viewBox="0 0 360 430" role="img" aria-label="A light microscope">
 ${lightOK?`<path d="M228,330 L244,330 L240,300 L232,300Z" fill="#FBE7A1" opacity=".8" pointer-events="none"/>`:""}
 <g${P("base")}><rect x="60" y="372" width="250" height="40" rx="18" fill="#A9C4E8" stroke="#2E3F6E" stroke-width="7"/></g>
 <g${P("arm")}><path d="M112,374 C98,300 110,222 150,164 C168,138 190,116 214,100" fill="none" stroke="#2E3F6E" stroke-width="46" stroke-linecap="round"/><path d="M112,374 C98,300 110,222 150,164 C168,138 190,116 214,100" fill="none" stroke="#A9C4E8" stroke-width="32" stroke-linecap="round"/></g>
 <g${P("light")}>${tap?`<circle cx="236" cy="344" r="32" fill="#fff" fill-opacity="0"/>`:""}<rect x="212" y="330" width="48" height="42" rx="10" fill="#CFD8E6" stroke="#2E3F6E" stroke-width="5"/>
  ${problem==="mirror"?`<ellipse cx="236" cy="346" rx="22" ry="7" fill="#EAF4FB" stroke="#2E3F6E" stroke-width="5" transform="rotate(35 236 346)"/><path d="M262,362 l40,22" stroke="#F2C14E" stroke-width="6" stroke-linecap="round" stroke-dasharray="8 8"/>`
   :`<circle cx="236" cy="344" r="16" fill="${bulbFill}" stroke="#2E3F6E" stroke-width="5"/>${problem==="light"?`<text x="236" y="349" text-anchor="middle" font-family="Lexend,Arial" font-size="12" font-weight="600" fill="#2E3F6E">off</text>`:`<path d="M236,318 v-6 M214,330 l-5,-4 M258,330 l5,-4" stroke="#F2C14E" stroke-width="4" stroke-linecap="round"/>`}`}</g>
 <g${P("stage")}><rect x="126" y="294" width="34" height="14" fill="#8FB3E0" stroke="#2E3F6E" stroke-width="5"/><rect x="150" y="292" width="190" height="18" rx="6" fill="#8FB3E0" stroke="#2E3F6E" stroke-width="6"/><ellipse cx="236" cy="301" rx="12" ry="5" fill="#1F2A44"/>
  <rect x="194" y="283" width="84" height="9" rx="2" fill="#EAF4FB" stroke="#6FA8DC" stroke-width="3"/>${problem==="thick"?`<rect x="214" y="256" width="44" height="30" rx="6" fill="#F29E4C" stroke="#2E3F6E" stroke-width="4"/>`:`<ellipse cx="236" cy="286" rx="10" ry="3" fill="#C9A0D6"/>`}</g>
 <g${P("clips")}>${tap?`<rect x="164" y="268" width="44" height="26" fill="#fff" fill-opacity="0"/><rect x="264" y="268" width="44" height="26" fill="#fff" fill-opacity="0"/>`:""}<path d="M174,282 L204,288 M298,282 L268,288" stroke="#56607A" stroke-width="7" stroke-linecap="round"/><circle cx="174" cy="284" r="6" fill="#56607A"/><circle cx="298" cy="284" r="6" fill="#56607A"/></g>
 <g${P("tube")}><rect x="214" y="90" width="44" height="136" rx="8" fill="#CFE0F5" stroke="#2E3F6E" stroke-width="7"/><path d="M204,224 L268,224 L262,242 L210,242Z" fill="#8FB3E0" stroke="#2E3F6E" stroke-width="6" stroke-linejoin="round"/></g>
 <g${P("objective")}>${tap?`<rect x="194" y="240" width="84" height="38" fill="#fff" fill-opacity="0"/>`:""}${problem==="lens"?`<g transform="rotate(48 236 236)">${lens}</g>`:lens}</g>
 <g${P("eyepiece")}>${tap?`<rect x="204" y="22" width="64" height="72" fill="#fff" fill-opacity="0"/>`:""}<rect x="220" y="38" width="32" height="56" rx="6" fill="#D9C8F0" stroke="#2E3F6E" stroke-width="7"/><ellipse cx="236" cy="38" rx="17" ry="6" fill="#EAF4FB" stroke="#2E3F6E" stroke-width="5"/>
  ${problem==="cap"?`<rect x="214" y="22" width="44" height="24" rx="8" fill="#E0455F" stroke="#2E3F6E" stroke-width="5"/>`:""}</g>
 <g${P("coarse")}>${tap?`<circle cx="124" cy="212" r="38" fill="#fff" fill-opacity="0"/>`:""}<circle cx="124" cy="212" r="30" fill="#8FB3E0" stroke="#2E3F6E" stroke-width="6"/><circle cx="124" cy="212" r="20" fill="none" stroke="#2E3F6E" stroke-width="3" stroke-dasharray="5 6"/><circle cx="124" cy="212" r="8" fill="#2E3F6E"/></g>
 <g${P("fine")}>${tap?`<circle cx="112" cy="276" r="25" fill="#fff" fill-opacity="0"/>`:""}<circle cx="112" cy="276" r="16" fill="#B5D27E" stroke="#2E3F6E" stroke-width="5"/><circle cx="112" cy="276" r="5" fill="#2E3F6E"/></g>
</svg>`;}
const SLIDE_SVG=({drop=true,piece=true,cover=true,bubble=false}={})=>`<svg viewBox="0 0 320 150" role="img" aria-label="An onion slide${bubble?", with an air bubble":""}">
 <rect x="10" y="26" width="300" height="98" rx="6" fill="#EAF4FB" stroke="#6FA8DC" stroke-width="4"/>
 ${drop?`<ellipse cx="160" cy="75" rx="46" ry="30" fill="#BFDDF2" opacity=".85"/>`:""}
 ${piece?`<path d="M128,58 q16,-6 32,0 t32,0 v34 q-16,6 -32,0 t-32,0Z" fill="#F3D9EC" stroke="#B57BA6" stroke-width="2.5"/><g stroke="#B57BA6" stroke-width="1.6"><path d="M130,70 h60 M130,81 h60 M146,58 v12 M170,58 v12 M138,70 v11 M160,70 v11 M182,70 v11 M150,81 v11 M174,81 v11"/></g>`:""}
 ${cover?`<rect x="108" y="30" width="104" height="90" rx="3" fill="#DCEEFA" fill-opacity=".55" stroke="#6FA8DC" stroke-width="3"/>`:""}
 ${bubble?`<g class="bub"><circle cx="186" cy="62" r="13" fill="#fff" fill-opacity=".85" stroke="#2E3F6E" stroke-width="3"/><path d="M180,56 q4,-4 9,-3" stroke="#6FA8DC" stroke-width="3" fill="none" stroke-linecap="round"/></g>`:""}
</svg>`;
const IC=inner=>`<svg viewBox="0 0 52 52" aria-hidden="true">${inner}</svg>`;
const ICONS={
  goggles:IC(`<path d="M4,26 h44" stroke="#2E3F6E" stroke-width="4"/><rect x="6" y="16" width="40" height="20" rx="10" fill="#A9C4E8" stroke="#2E3F6E" stroke-width="3"/><circle cx="17" cy="26" r="6" fill="#EAF4FB" stroke="#2E3F6E" stroke-width="2.5"/><circle cx="35" cy="26" r="6" fill="#EAF4FB" stroke="#2E3F6E" stroke-width="2.5"/>`),
  pipette:IC(`<ellipse cx="26" cy="10" rx="8" ry="8" fill="#F27BA0" stroke="#2E3F6E" stroke-width="3"/><path d="M23,17 h6 v18 l-3,6 l-3,-6Z" fill="#EAF4FB" stroke="#2E3F6E" stroke-width="3" stroke-linejoin="round"/><path d="M26,44 q-4,5 0,7 q4,-2 0,-7z" fill="#6FA8DC"/>`),
  peel:IC(`<path d="M16,46 C4,40 4,22 16,14 C18,8 20,6 20,4 C22,8 24,10 26,14 C36,22 34,40 22,46Z" fill="#E3C3E8" stroke="#2E3F6E" stroke-width="3" stroke-linejoin="round"/><path d="M30,6 L46,38 M40,4 L48,36" stroke="#56607A" stroke-width="3" stroke-linecap="round"/>`),
  place:IC(`<rect x="2" y="30" width="48" height="12" rx="2" fill="#EAF4FB" stroke="#6FA8DC" stroke-width="3"/><ellipse cx="26" cy="32" rx="12" ry="4" fill="#BFDDF2"/><rect x="18" y="12" width="16" height="10" rx="2" fill="#F3D9EC" stroke="#B57BA6" stroke-width="2.5"/><path d="M26,22 v5" stroke="#2E3F6E" stroke-width="3" stroke-linecap="round"/>`),
  cover:IC(`<rect x="2" y="36" width="48" height="10" rx="2" fill="#EAF4FB" stroke="#6FA8DC" stroke-width="3"/><path d="M12,34 L40,18" stroke="#6FA8DC" stroke-width="5" stroke-linecap="round"/><path d="M42,8 v12 l-4,-4 M42,20 l4,-4" stroke="#2E3F6E" stroke-width="3" fill="none" stroke-linecap="round"/>`)
};
function tapBox(svg,small=false){return `<div class="labbox tapzone${small?" small":""}">${svg}</div>`;}

/* ================= 0 · welcome to the Tissue Lab ================= */
function start(){
  trail(0);
  show(`<h1>The Tissue Lab</h1><p>Celly is a pathologist today. A box of samples has arrived… and something else! Talk to her, or tap. It goes with the 7Ac Tissues video.</p>
  <div class="row"><button class="big go" id="go">Open the lab</button></div>
  <details class="note"><summary>For the grown-up</summary><p>Use Chrome or Edge. When the browser asks for the microphone, choose “Allow while visiting the site”. It asks once.
  Your child's voice is turned into text by the browser (Google in Chrome, Microsoft in Edge). This page does not record or keep anything. It takes about 15 to 17 minutes, with a brain break in the middle.</p></details>`,0);
  $("#say").textContent="Hello, scientist! Press the button to open my Tissue Lab.";
  Celly.pose("wave",1800);
  $("#go").onclick=async()=>{ac();loadSprite();S.started=true;if(canHear())Mic.start();
    show(`<h2>The Tissue Lab</h2><p class="muted">🔬 Museum laboratory. Tiny samples only.</p>`,0);
    await say("hello",{face:"happy",pose:"talk wave"});
    await say("pathologist",{face:"normal"});
    SFX.knock();Celly.face("surprised");await sleep(500);
    show(`<h2>A delivery!</h2>${tapBox(BOX_SVG(false))}<div class="row"><button class="big act" id="openBox">📦 Open the box</button></div>`,0);
    await say("box",{face:"surprised"});
    await act("#openBox");
    $(".labbox").innerHTML=BOX_SVG(true);$("#openBox").parentElement.remove();SFX.pop();
    Guest.show("hanky");SFX.whoosh();await sleep(700);await Guest.say("Ta-daa! I'm a TISSUE! I must be the star today!",{ms:3600});
    await say("hanky_pop",{face:"surprised"});await say("hanky_name",{face:"happy"});
    await say("notkind",{face:"happy"});await Guest.say("…What OTHER kind is there?!");
    await say("help",{face:"happy"});
    if(canHear()){
      show(`<h2>Mic check</h2><p>Say: <b>“Hello, Hanky!”</b></p>${micRow()}`,0);
      let noMic=false;const skip=new Promise(r=>$("#noMic").onclick=()=>{noMic=true;stopVoice();if(S.cancelHear)S.cancelHear();r();});
      await say("miccheck");
      const got=noMic?{ok:false}:await Promise.race([hear(7000,a=>a[0].length>0),skip.then(()=>({ok:false}))]);
      if(got&&got.ok){SFX.sparkle();Guest.say("Hello! *rustle rustle*");await say("heardyou",{face:"happy"});}
      else await say("nohear",{face:"normal"});
    }else await say("tapmode",{face:"happy"});
    show(`<h2>A pathologist's tool</h2><div class="patient"><span class="e">🔬</span><div>Pathologists use a <b>microscope</b>.</div></div><p>What does a microscope do?</p><div id="opts"></div>`,0);
    const first=await choose(shuffle([{t:"It makes things look bigger",e:"🔍",ok:1,keys:["bigger","big","magnif","larger","zoom"]},{t:"It makes things hot",e:"🔥",keys:["hot","heat","warm"]},{t:"It takes photos of the Sun",e:"☀️",keys:["photo","sun","picture","camera"]}]),{ask:["micro_q"]});
    await say("micro_a",{face:"happy"});rec("Tissue Lab","a microscope magnifies",first,null);
    show(`<h2>Today's big question</h2><div class="move">❓ Why are <b>tissues</b> important?</div>`,0);
    await say("bigq",{face:"think"});
    team();};
}

/* ================= 1 · Team Tissue ================= */
const WORDS={
  tissue:{w:"tissue",syl:["tis","sue"],mean:"w_tissue",col:"var(--membrane)",after:["tissue_def","team"],ok:["tissue","tissues","tishoo","tish you","tissue s"]},
  xylem:{w:"xylem",syl:["xy","lem"],mean:"w_xylem",col:"var(--vacuole)",after:["xy_sound","xyl_means"],ok:["xylem","zylem","zy lem","xylum","zylum","silem","zylam","xy lem","sigh lem","zylon"]},
  microscope:{w:"microscope",syl:["mi","cro","scope"],mean:"w_microscope",col:"var(--nucleus)",after:["micro_means"],ok:["microscope","microscopes","micro scope","micro scopes"]},
  specimen:{w:"specimen",syl:["spec","i","men"],mean:"w_specimen",col:"var(--mito)",after:["spec_means"],ok:["specimen","specimens","speciman","specie men","species men","spacemen"]},
  magnification:{w:"magnification",syl:["mag","ni","fi","ca","tion"],mean:"w_magnification",col:"var(--bio)",after:["magni_means"],ok:["magnification","magnifications","magnifcation","magnification s"]}
};
let wordN=0;
async function buildWord(W,step){wordN++;
  let order;do{order=W.syl.map((s,k)=>k).sort(()=>Math.random()-.5);}while(order.every((v,k)=>v===k));
  show(`<h2>Build the word · ${wordN} of 5</h2>
   <div class="meaning"><span class="swatch" style="background:${W.col}"></span><p>${window.LINES[W.mean]}</p></div>
   <div class="slots" id="slots">${W.syl.map(()=>'<div class="slot"></div>').join("")}</div>
   <div class="tiles" id="tiles">${order.map(k=>`<button class="tile" data-k="${k}">${W.syl[k]}</button>`).join("")}</div><div id="more"></div>`,step);
  say([W.mean,"tapbeats"],{face:"normal"});
  let pos=0,mistakes=0;
  await new Promise(done=>card.querySelectorAll(".tile").forEach(b=>b.onclick=()=>{ac();const k=+b.dataset.k;
    if(W.syl[k]===W.syl[pos]&&!b.classList.contains("used")){b.classList.add("used");const s=$("#slots").children[pos];s.textContent=W.syl[pos];s.classList.add("filled");SFX.tap();say("s_"+W.syl[pos],{face:"keep"});pos++;if(pos===W.syl.length)done();}
    else{mistakes++;b.classList.remove("shake");void b.offsetWidth;b.classList.add("shake");SFX.oops();say("notyet",{face:"oops"});}}));
  Celly.face("happy");Celly.pose("happy",900);SFX.chime();
  $("#tiles").outerHTML=`<div class="wordshow">${W.w}</div>`;
  await say(["built","n_"+W.w],{face:"happy"});
  $("#more").innerHTML=`<div class="row"><button class="drum" id="drum">tap!</button><div class="beats" id="beats">${W.syl.map(()=>"<i></i>").join("")}</div></div>`;
  const drummed=new Promise(done=>{let n=0;$("#drum").onclick=()=>{ac();const d=$("#beats").children;if(n<d.length){d[n].classList.add("on");SFX.drum();say("s_"+W.syl[n],{face:"keep"});n++;if(n===d.length)setTimeout(done,800);}};});
  say("drum");await drummed;
  let said=null;
  if(canHear()){
    $("#more").innerHTML=micRow();
    const test=a=>heardWord(a,W.w,W.ok);
    for(let attempt=0;attempt<2&&said===null;attempt++){
      await say(attempt===0?"sayword":["again",...W.syl.map(s=>"s_"+s),"n_"+W.w,"yousay"],{face:"normal"});
      const skip=new Promise(r=>$("#noMic").onclick=()=>{if(S.cancelHear)S.cancelHear();r({skip:true});});
      const got=await Promise.race([hear(7000,test),skip]);
      if(got.skip){said=undefined;break;}
      if(got.ok)said=true;else if(attempt===1)said=false;
    }
    if(said===true){SFX.sparkle();await say(praise(),{face:"happy"});}
    else if(said===false)await say("goodtry",{face:"normal"});
    if(said===undefined)said=null;
  }else{
    $("#more").innerHTML=`<div class="row"><button class="big" id="saidIt">I said it out loud</button></div>`;
    const saidC=waitClick("#saidIt");await say("sayword");await saidC;await say(praise(),{face:"happy"});
  }
  const c=centre($(".wordshow"));confetti(c.x,c.y,40);
  for(const a of W.after||[])await say(a,{face:"happy"});
  rec("Build the words",W.w,mistakes===0,said);
}
async function team(){
  show(`<h2>Team Tissue</h2><p class="muted">What is a tissue, in science?</p>`,1);
  await watch("media/clip_tissue.mp4","Word workshop: tissue, from the Tissues video");
  await buildWord(WORDS.tissue,1);
  show(`<h2>Find the tissue</h2><p>Which picture shows a <b>tissue</b>?</p><div id="opts"></div>`,1);
  const first=await choose(shuffle([
    {e:PIC_SAME,ok:1,keys:["same","team","all the same"]},
    {e:PIC_MIX,keys:["different","mixed","mix"],no:async()=>say("pick_mixed",{face:"oops"})},
    {e:PIC_ONE,keys:["one cell","lonely","alone","just one"],neg:1,no:async()=>say("nearly",{face:"oops"})}]).map((o,i)=>({...o,t:"picture "+(i+1)})),{grid:true,ask:["pick_tissue"]});
  await say("pick_tissue_a",{face:"happy"});rec("Team Tissue","a tissue = the same cells",first,null);
  await Guest.say("Can I join Team Tissue? I've got three layers!");
  await say("hanky_team",{face:"happy"});
  show(`<h2>Tell Hanky!</h2><div class="move">🗣 “Not that kind of tissue!”</div><div class="row"><button class="big act" id="shout">🗣 I said it!</button></div>`,1);
  const shouted=act("#shout",["not that","kind of tissue","that kind","not the","wrong kind"],9000);
  await say("shout",{face:"happy"});await shouted;
  SFX.tickle();Guest.say("Hmph.",{sfx:"flump",pose:"sulk",ms:2400});
  await say("shout_yes",{face:"happy",pose:"happy"});
  show(`<h2>Tissues make organs</h2><div class="patient"><span class="e">🫀</span><div>An <b>organ</b> = <b>different tissues</b> working together on an important job.</div></div>`,1);
  await say("organ_def",{face:"normal"});Guest.pose("idle");
  heart();
}

/* ================= 2 · Heart detective ================= */
async function heart(){
  show(`<h2>Heart detective</h2><div class="patient"><span class="e">🫀</span><div>Sample 1: a <b>heart</b>.<br><span class="muted">Its job: pump blood.</span></div></div>`,2);
  await say("heart_intro",{face:"happy"});await say("blood",{face:"normal"});
  await watch("media/clip_heart.mp4","Inside a heart, from the Tissues video");
  show(`<h2>Heart detective</h2>${tapBox(HEART_SVG)}<div class="labels" id="labs"></div><div id="opts"></div>`,2);
  await say("colours",{face:"think"});
  const box=$(".tapzone");
  say("tap_muscle",{face:"normal"});let r=await tapPart(box,"muscle");
  chip("#labs","<b>muscle tissue</b>: reddish, stripy · it moves","#E07A78");
  await say("is_muscle",{face:"happy"});rec("Heart detective","find the muscle tissue",r.mistakes===0,null);
  say("tap_fat",{face:"normal"});r=await tapPart(box,"fat");
  chip("#labs","<b>fat tissue</b>: whiter, bumpy · stores fat, protects","#FFF3D4");
  await say("is_fat",{face:"happy"});rec("Heart detective","find the fat tissue",r.mistakes===0,null);
  await Guest.say("Ooh, I'm good at protecting things too!");
  await say("alltissues",{face:"normal"});
  const T=(okMuscle)=>shuffle([{t:"muscle tissue",e:"💪",ok:okMuscle,keys:["muscle","muscles"]},{t:"fat tissue",e:"🧈",ok:!okMuscle,keys:["fat"]}]);
  let first=await choose(T(true),{ask:["job_moves"]});await say(praise(),{face:"happy"});rec("Heart detective","muscle tissue moves the heart",first,null);
  first=await choose(T(false),{ask:["job_protects"]});await say(praise(),{face:"happy"});rec("Heart detective","fat tissue protects the heart",first,null);
  show(`<h2>Feel it!</h2><div class="move">✋ Hand on your chest.</div>`,2);
  await say("handchest",{face:"happy",pose:"breath"});await sleep(1500);
  show(`<h2>Inside your intestines</h2><div class="patient"><span class="e">🍝</span><div>Food travels through your intestines.</div></div><div id="opts"></div>`,2);
  first=await choose(shuffle([{t:"muscle tissue",e:"💪",ok:1,keys:["muscle","muscles"]},{t:"fat tissue",e:"🧈",keys:["fat"]},{t:"root hair tissue",e:"🌱",keys:["root","hair"]}]),{ask:["gut_q"]});
  await say("gut_a",{face:"happy"});rec("Heart detective","muscle pushes food along the intestines",first,null);
  await say("muscle_def",{face:"normal"});
  show(`<h2>Wiggle!</h2><div class="move">😛 Wiggle your tongue!</div>`,2);
  await say("tongue",{face:"happy",pose:"wiggle"});Celly.setPose("idle");await Guest.say("Wiggle my… what?");
  const fattyLeft=Math.random()<.5;
  show(`<h2>Two livers</h2>${tapBox(LIVERS_SVG(fattyLeft))}<p class="taphint">👆 Tap the liver with <b>pale spots</b>.</p><div class="labels" id="labs"></div>`,2);
  await say("liver_intro",{face:"think"});
  say("liver_q",{face:"normal"});r=await tapPart($(".tapzone"),"fatty",{wrong:"lab_wrong"});
  $(".taphint").remove();
  await say("liver_a",{face:"happy"});await Guest.say("Spotty! Like my pyjamas.");
  chip("#labs","<b>fatty liver</b>: pale spots, like fat tissue","#F6E3B8");
  await say("fatty",{face:"normal"});rec("Heart detective","spot the fatty liver (evidence)",r.mistakes===0,null);
  carrot();
}

/* ================= 3 · Barry's carrot ================= */
async function carrot(){
  show(`<h2>Barry's carrot</h2>${tapBox(CARROT_SVG)}<div id="opts"></div>`,3);
  await say("carrot_in",{face:"surprised"});await say("barry",{face:"happy"});await Guest.say("Barry will be SO cross.");
  let first=await choose(shuffle([{t:"a storage organ",e:"🥕",ok:1,keys:["storage","store","stores"]},{t:"a muscle",e:"💪",keys:["muscle"]},{t:"a leaf",e:"🍃",keys:["leaf","leaves"]}]),{ask:["storage_q"]});
  await say("storage_a",{face:"happy"});rec("Barry's carrot","a carrot is a storage organ",first,null);
  $("#opts").innerHTML=`<div class="row"><button class="big act" id="chop">🔪 Chop!</button></div>`;
  await act("#chop",["chop"]);
  SFX.chop();
  show(`<h2>Inside the carrot</h2>${tapBox(SLICE_SVG)}<p class="taphint">👆 Tap each part with a <b>different colour</b>.</p><div class="labels" id="labs"></div>`,3);
  await say("tap_rings",{face:"happy"});
  const names={skin:["thin outer skin (dark, with dashes)","#C9572A"],outer:["orange outer ring (smooth)","#F29E4C"],core:["pale core (with lines and dots)","#FBDDA6"]};
  let left=["skin","outer","core"];
  while(left.length){const r=await tapPart($(".tapzone"),left);left=left.filter(p=>p!==r.part);chip("#labs",names[r.part][0],names[r.part][1]);SFX.tap();}
  $(".taphint").remove();
  await say("rings_a",{face:"happy"});rec("Barry's carrot","different colours = different tissues",true,null);
  show(`<h2>A plant tissue</h2><p class="muted">The pale core of the carrot is special.</p>`,3);
  await watch("media/clip_xylem.mp4","Word workshop: xylem, from the Tissues video");
  await buildWord(WORDS.xylem,3);
  await Guest.say("Paper is made from wood! So I'm basically xylem!",{ms:3600});
  await say("notkind",{face:"happy"});Guest.say("Hmph.",{sfx:"flump",pose:"sulk",ms:1800});
  show(`<h2>Xylem in the carrot</h2>${tapBox(SLICE_SVG)}<div class="patient"><span class="e">🥤</span><div><b>xylem</b> = the pale core. Xylem cells join end to end, like a straw. It carries <b>water</b>.</div></div>`,3);
  $(".tapzone [data-part=core]").classList.add("found");
  await say("core",{face:"normal"});await say("straw",{face:"happy"});Guest.pose("idle");
  show(`<h2>A baby carrot</h2>${tapBox(SEEDLING_SVG)}<p class="taphint">👆 Tap the tiny <b>hairs</b> on the root.</p><div class="labels" id="labs"></div>`,3);
  say("roothair_in",{face:"happy"});
  const r=await tapPart($(".tapzone"),"roothair");$(".taphint").remove();chip("#labs","<b>root hair tissue</b>: takes in water","#7A5A3A");
  await say("roothair_job",{face:"normal"});rec("Barry's carrot","find the root hairs",r.mistakes===0,null);
  show(`<h2>Water in plants</h2><div id="opts"></div>`,3);
  first=await choose(shuffle([{t:"root hair tissue",e:"🌱",ok:1,keys:["root","hair","hairs"]},{t:"xylem tissue",e:"🥤",keys:["xylem","zylem","silem"]},{t:"fat tissue",e:"🧈",keys:["fat"]}]),{ask:["roothair_q"]});
  await say(praise(),{face:"happy"});rec("Barry's carrot","root hair tissue takes in water",first,null);
  first=await choose(shuffle([{t:"xylem tissue",e:"🥤",ok:1,keys:["xylem","zylem","silem","zylam"]},{t:"root hair tissue",e:"🌱",keys:["root","hair","hairs"]},{t:"muscle tissue",e:"💪",keys:["muscle"]}]),{ask:["xylem_q"]});
  await say(praise(),{face:"happy"});rec("Barry's carrot","xylem carries water up the plant",first,null);
  first=await choose(shuffle([{t:"in the stem and the leaves",e:"🌿",ok:1,keys:["stem","stems","leaf","leaves"]},{t:"in the heart",e:"🫀",keys:["heart"]},{t:"in fat tissue",e:"🧈",keys:["fat"]}]),{ask:["where_q"]});
  await say("where_a",{face:"happy"});rec("Barry's carrot","xylem is in stems and leaves too",first,null);
  first=await choose(shuffle([{t:"nutrition",e:"🍎",ok:1,keys:["nutrition","nutrient","food"]},{t:"movement",e:"🏃",keys:["movement","move"]},{t:"excretion",e:"🚽",keys:["excretion","waste"]}]),{ask:["nutr_q"]});
  await say("nutr_a",{face:"happy"});rec("Barry's carrot","taking in water is nutrition",first,null);
  await sortCards();
  await say("breaktime",{face:"happy"});
  brainBreak();
}
const SORT=[["heart","🫀","organ"],["muscle","💪","tissue"],["root hair","🌱","tissue"],["leaf","🍃","organ"],["fat","🧈","tissue"],["liver","🟤","organ"],["xylem","🥤","tissue"],["carrot (a root)","🥕","organ"]];
async function sortCards(){
  show(`<h2>Organ or tissue?</h2><div class="sortcard" id="sc"></div>
   <div class="bins">
    <button class="bin" id="b-organ">🫀 organ<small>different tissues working together · say “organ”</small><span class="got" id="g-organ"></span></button>
    <button class="bin" id="b-tissue">🧩 tissue<small>a team of the same cells · say “tissue”</small><span class="got" id="g-tissue"></span></button>
   </div>`,3);
  await say("sort_intro",{face:"normal"});
  let n=0;
  for(const [name,e,kind] of SORT){n++;
    $("#sc").innerHTML=`<span style="font-size:48px">${e}</span>${name}`;$("#sc").style.animation="none";void $("#sc").offsetWidth;$("#sc").style.animation="";
    let wrong=0,settled=false;
    const ans=await new Promise(async done=>{
      const tryBin=async b=>{if(settled)return;ac();
        if(b===kind){settled=true;if(S.cancelHear)S.cancelHear();done(b);}
        else{wrong++;SFX.oops();const el=$("#b-"+b);el.classList.remove("wrong");void el.offsetWidth;el.classList.add("wrong");await say("sort_wrong",{face:"oops"});listenLoop();}};
      $("#b-organ").onclick=()=>tryBin("organ");$("#b-tissue").onclick=()=>tryBin("tissue");
      const listenLoop=async()=>{if(settled||!canHear())return;
        const got=await hear(9000,a=>kmatch(a,["organ","organs","oregon"])?"organ":kmatch(a,["tissue","tissues","tishoo"])?"tissue":null);
        if(settled)return;if(got.ok)tryBin(got.val);};
      listenLoop();});
    $("#g-"+ans).insertAdjacentHTML("beforeend",`<span>${e} ${name}</span>`);SFX.sparkle();
    if(n%3===0)await say(praise(),{face:"happy"});else await sleep(500);
    rec("Organ or tissue",`${name}: ${kind}`,wrong===0,null);
  }
  confetti(undefined,undefined,100);await say("sort_done",{face:"happy",pose:"dance"});Celly.setPose("idle");
}

/* ================= 4 · brain break: Tissue Team workout ================= */
async function brainBreak(){
  show(`<h2>Brain break: Tissue Team workout</h2><div class="move" id="move">Stand up!</div><div class="row" id="bbrow"><button class="tbtn" id="skipBB">skip the brain break</button></div>`,4);
  let skipped=false;$("#skipBB").onclick=()=>{skipped=true;stopVoice();if(S.cancelHear)S.cancelHear();};
  await say("bb_intro",{face:"happy",pose:"wave"});
  const moves=[["bb_muscle","✊ Squeeze your fist tight… let go: muscle tissue!","pump",2400],["bb_roots","🙆 Arms out wide, long and thin: root hairs!","breath",2600],["bb_xylem","☝️ Floor… all the way to the sky: xylem!","breath",2800],["bb_tongue","😛 Wiggle your tongue: muscle tissue!","wiggle",2000]];
  for(const [id,text,pose,ms] of moves){if(skipped)break;$("#move").textContent=text;
    await say(id,{face:"happy",pose});Celly.setPose(pose);await sleep(ms);Celly.setPose("idle");}
  if(!skipped){$("#move").textContent="👃 Hanky's nose is twitching…";await say("bb_sneeze",{face:"surprised"});
    await Guest.say("A… a… A-TISH-OO!",{sfx:"sneeze",pose:"sneeze"});await sleep(500);
    $("#move").innerHTML="🤧 Say: <b>“Bless you!”</b>";$("#bbrow").insertAdjacentHTML("afterbegin",`<button class="big act" id="bless">🤧 Bless you!</button>`);
    const blessed=act("#bless",["bless"],8000);await say("bb_bless",{face:"happy"});
    if(!skipped)await Promise.race([blessed,new Promise(r=>{const t=setInterval(()=>{if(skipped){clearInterval(t);r();}},300);})]);
    if(!skipped){SFX.sparkle();await Guest.say("Thank you! *sniff*");}}
  if(!skipped){$("#move").textContent="🙂 Sit down. Ready!";await say("bb_done",{face:"happy"});}
  Celly.setPose("idle");await say("bb_back",{face:"normal"});
  scope();
}

/* ================= 5 · meet the microscope ================= */
const PARTS=[
  {p:"eyepiece",ask:"tap_eyepiece",lab:"eyepiece lens: you look through it",col:"#D9C8F0"},
  {p:"objective",ask:"tap_objective",lab:"objective lenses: closest to the specimen",col:"#F7C7A3",after:"twolenses"},
  {p:"stage",ask:"tap_stage",lab:"stage: holds the slide, with a hole for light",col:"#8FB3E0"},
  {p:"clips",ask:"tap_clips",lab:"clips: hold the slide still",col:"#56607A"},
  {p:"coarse",ask:"tap_coarse",lab:"coarse wheel (big): big changes",col:"#8FB3E0"},
  {p:"fine",ask:"tap_fine",lab:"fine wheel (small): tiny changes",col:"#B5D27E"},
  {p:"light",ask:"tap_light",lab:"light or mirror: sends light up",col:"#FBE7A1"}];
async function scope(){
  show(`<h2>Meet the microscope</h2><div class="patient"><span class="e">🔬</span><div>A <b>light microscope</b>. A <b>biopsy</b> is a tiny piece of tissue from an organ.</div></div>`,5);
  await say("scope_intro",{face:"happy"});await say("biopsy",{face:"normal"});await say("biopsy_means",{face:"normal"});
  await buildWord(WORDS.microscope,5);
  show(`<h2>Meet the microscope</h2><p class="muted">You've seen one in the Cells video!</p>`,5);
  await watch("media/clip_scope.mp4","Parts of a microscope, from the Cells video");
  show(`<h2>Parts of the microscope</h2>${tapBox(MICRO_SVG({tap:true}))}<p class="taphint" id="hint">👆 Tap the part Celly names.</p><ol class="partlist" id="plist"></ol>`,5);
  await say("parts_intro",{face:"happy"});
  const box=$(".tapzone");let miss=0;
  for(const P of PARTS){$("#hint").innerHTML=`👆 Tap: <b>${P.lab.split(":")[0]}</b>`;
    say(P.ask,{face:"normal"});const r=await tapPart(box,P.p);miss+=r.mistakes;
    $("#plist").insertAdjacentHTML("beforeend",`<li><i style="background:${P.col}"></i>${P.lab}</li>`);
    if(P.after)await say(P.after,{face:"happy"});else await sleep(300);
    rec("Microscope parts",P.p.replace("coarse","coarse wheel").replace("fine","fine wheel"),r.mistakes===0,null);}
  $("#hint").remove();SFX.chime();confetti(undefined,undefined,60);
  await Guest.say("I can't see a thing!",{pose:"flap"});
  show(`<h2>Hanky is looking…</h2><div class="patient"><span class="e">🙃</span><div>Hanky is looking into the <b>bottom</b> of the objective lens!</div></div><div id="opts"></div>`,5);
  await Guest.say("Wrong end? Ohhh.",{sfx:"flump",pose:"sulk",ms:2600});
  const first=await choose(shuffle([{t:"the eyepiece lens",e:"👁️",ok:1,keys:["eyepiece","eye piece","eye","top"]},{t:"the objective lens",e:"🔽",keys:["objective"]},{t:"the stage",e:"🟦",keys:["stage"]}]),{ask:["parts_quiz"]});
  Guest.pose("idle");await say(praise(),{face:"happy"});rec("Microscope parts","you look through the eyepiece",first,null);
  slide();
}

/* ================= 6 · make a slide ================= */
const SLIDE_STEPS=[
  {ic:ICONS.goggles,t:"Put on eye protection.",line:"sl_goggles"},
  {ic:ICONS.pipette,t:"Put one drop of water on the slide, with a pipette.",line:"sl_drop"},
  {ic:ICONS.peel,t:"Peel the thin layer inside the onion, with forceps.",line:"sl_peel"},
  {ic:ICONS.place,t:"Put a small piece on the drop.",line:"sl_place"},
  {ic:ICONS.cover,t:"Lower the coverslip slowly, one edge first.",line:"sl_cover"}];
async function slide(){
  show(`<h2>Make a slide</h2><div class="patient"><span class="e">🧅</span><div>Today's specimen: an <b>onion</b>.</div></div>`,6);
  await say("slide_intro",{face:"happy"});
  await buildWord(WORDS.specimen,6);
  show(`<h2>Make an onion slide</h2><p>Tap the steps in order.</p><div id="order"></div>`,6);
  say("order_slide",{face:"normal"});
  const miss=await orderCards(SLIDE_STEPS,{labels:["1","2","3","4","5"],wrong:"sl_wrong",onPlace:async k=>{
    await say(SLIDE_STEPS[k].line,{face:"happy"});
    if(SLIDE_STEPS[k].line==="sl_peel"){crying(true);Celly.setPose("shiver");await say("onion_cry",{face:"worried",pose:"shiver"});
      await Guest.say("This is my moment! *dab dab*",{pose:"flap"});crying(false);Celly.setPose("idle");
      await say("hanky_hero",{face:"happy",pose:"happy"});await Guest.say("Finally! The right kind of tissue!",{pose:"flap"});}}});
  rec("Make a slide","onion slide steps in order",miss===0,null);
  show(`<h2>The coverslip…</h2><div class="labbox slidebox" id="sl">${SLIDE_SVG({cover:false})}</div><div id="opts"></div>`,6);
  await Guest.say("A-TISH-OO! …Was that the coverslip?",{sfx:"sneeze",pose:"sneeze",ms:3400});
  $("#sl").innerHTML=SLIDE_SVG({bubble:true});SFX.pop();
  await say("bubble",{face:"oops"});await Guest.say("Sorry about the bubble!",{sfx:"flump",pose:"sulk"});
  let first=await choose(shuffle([{t:"Lower the coverslip slowly and carefully",e:"🐢",ok:1,keys:["slow","slowly","careful","carefully","gently"]},{t:"Drop it fast",e:"💨",keys:["fast","drop","quick"]},{t:"Add more onion",e:"🧅",keys:["onion","more"]}]),{ask:["bubble_q"]});
  Guest.pose("idle");$("#sl").innerHTML=SLIDE_SVG({});
  await say("bubble_a",{face:"happy"});rec("Make a slide","stop air bubbles: lower the coverslip slowly",first,null);
  first=await choose(shuffle([{t:"Keeps the specimen flat, holds it in place, stops it drying out",e:"🪟",ok:1,keys:["flat","place","drying","dry","hold","holds"]},{t:"Makes it look bigger",e:"🔍",keys:["bigger","big","magnif"]},{t:"Makes it colourful",e:"🌈",keys:["colour","color","colourful","colorful"]}]),{ask:["cover_q"]});
  await say("cover_a",{face:"happy"});rec("Make a slide","what the coverslip does",first,null);
  first=await choose(shuffle([{t:"Makes parts of the specimen stand out",e:"🎨",ok:1,keys:["stand out","see","parts","colour","color","easier"]},{t:"Makes the specimen thicker",e:"🧱",keys:["thick","thicker"]},{t:"Keeps it warm",e:"🧣",keys:["warm","hot"]}]),{ask:["stain_q"]});
  await say("stain_a",{face:"happy"});rec("Make a slide","what a stain does",first,null);
  await Guest.say("Put ME on the slide! I'm three-ply luxury!",{ms:3600});
  await say("thin_hanky",{face:"happy"});
  first=await choose(shuffle([{t:"So light can pass through it",e:"💡",ok:1,keys:["light","through","see"]},{t:"So it doesn't smell",e:"👃",keys:["smell"]},{t:"So it's lighter to carry",e:"🎒",keys:["carry","heavy","lighter to"]}]),{ask:["thin_q"]});
  await say("thin_a",{face:"happy"});await Guest.say("Hmph. Too fabulous for science.",{sfx:"flump",pose:"sulk"});
  rec("Make a slide","a specimen must be thin",first,null);
  focusStep();
}

/* ================= 7 · Focus! ================= */
const FOCUS_STEPS=[
  {ic:"🔽",t:"Smallest objective lens over the hole. Coarse wheel: make the gap small.",line:"st_a"},
  {ic:"💡",t:"Slide under the clips. Light shining up through the hole.",line:"st_b"},
  {ic:"👁️",t:"Look in the eyepiece. Turn the coarse wheel slowly, until it's clear.",line:"st_c"},
  {ic:"🔄",t:"For a bigger image, turn to the next objective lens.",line:"st_d"},
  {ic:"🎯",t:"Use only the fine wheel to focus again.",line:"st_e"}];
const HELP=[
  {p:"light",fix:"Switch the light on",e:"💡",keys:["light","switch"],line:"h_light",clue:"Look at the light.",hanky:"Ooh, light!"},
  {p:"mirror",fix:"Tilt the mirror, so light goes up the hole",e:"🪞",keys:["mirror","tilt"],line:"h_mirror",clue:"Look at the mirror.",hanky:"Ooh, light!"},
  {p:"cap",fix:"Take the cap off the lens",e:"🧢",keys:["cap","hat","lid"],line:"h_cap",clue:"Look at the top lens.",hanky:"Ohhh, the cap."},
  {p:"lens",fix:"Click the objective lens over the hole",e:"🔄",keys:["click","objective","over the hole","turn"],line:"h_lens",clue:"Look at the lens over the hole.",hanky:"Click!"},
  {p:"thick",fix:"Cut the specimen thinner",e:"🔪",keys:["thin","thinner","cut","slice"],line:"h_thick",clue:"Look at the specimen.",hanky:"Ooh, light!"}];
async function focusStep(){
  show(`<h2>Focus!</h2><p>Use the microscope: steps <b>A to E</b>. Hold up a finger for each step.</p><div id="order"></div>`,7);
  await say("focus_intro",{face:"happy"});
  say("order_steps",{face:"normal"});
  const miss=await orderCards(FOCUS_STEPS,{labels:["A","B","C","D","E"],wrong:"st_wrong",fingers:true,onPlace:async k=>{await say(FOCUS_STEPS[k].line,{face:"happy"});}});
  rec("Focus!","microscope steps A to E",miss===0,null);
  SFX.chime();confetti();await say("botheyes",{face:"happy"});
  show(`<h2>Blurry!</h2><div class="patient"><span class="e">🔬</span><div>You're on a <b>big</b> objective lens. The picture is blurry.</div></div><div id="opts"></div>`,7);
  let first=await choose(shuffle([{t:"the fine wheel",e:"🟢",ok:1,keys:["fine","small","little"]},{t:"the coarse wheel",e:"⚙️",keys:["coarse","course","big"],no:async()=>{SFX.crunch();Celly.setPose("shiver");await say("crunch",{face:"surprised",pose:"shiver"});Celly.setPose("idle");await say("coarse_why",{face:"normal"});}}]),{ask:["focus_q"]});
  await say("fine_a",{face:"happy"});await say("goback",{face:"normal"});rec("Focus!","fine wheel only at high power",first,null);
  show(`<h2>Blurry again!</h2><div class="patient"><span class="e">🔬</span><div>Now you're on the <b>smallest</b> objective lens. It's blurry.</div></div><div id="opts"></div>`,7);
  first=await choose(shuffle([{t:"the coarse wheel, slowly, to make the gap bigger",e:"⚙️",ok:1,keys:["coarse","course","big","bigger","gap"]},{t:"take the slide off",e:"✋",keys:["take","off","slide"]},{t:"switch off the light",e:"🌑",keys:["light","switch","dark"]}]),{ask:["blurry_low"]});
  await say("blurry_low_a",{face:"happy"});rec("Focus!","coarse wheel at low power: widen the gap",first,null);
  /* Hanky's helpdesk */
  show(`<h2>Hanky's helpdesk</h2><div class="patient"><span class="e">☎️</span><div>Hanky can't see anything!</div></div>`,7);
  await Guest.say("I can't see ANYTHING!",{ms:3000});await say("help_intro",{face:"surprised"});
  let i=0;
  for(const H of HELP){i++;
    const others=shuffle(HELP.filter(x=>x!==H)).slice(0,2);
    show(`<h2>Hanky's helpdesk · ${i} of 5</h2>${tapBox(MICRO_SVG({problem:H.p}),true)}<p class="muted">🔎 Clue: ${H.clue} What's the fix?</p><div id="opts"></div>`,7);
    first=await choose(shuffle([{t:H.fix,e:H.e,ok:1,keys:H.keys},...others.map(o=>({t:o.fix,e:o.e,keys:o.keys}))]),{wrong:"nearly"});
    $(".tapzone").innerHTML=MICRO_SVG({});
    await say(H.line,{face:"happy"});await Guest.say(H.hanky,{pose:"flap"});rec("Hanky's helpdesk",`can't see: ${H.p==="lens"?"objective not over the hole":H.p==="thick"?"specimen too thick":H.p==="cap"?"lens cap":H.p==="mirror"?"mirror the wrong way":"light off"}`,first,null);}
  confetti();await say("help_done",{face:"happy",pose:"dance"});await Guest.say("I CAN SEE AN ONION!",{pose:"flap"});Celly.setPose("idle");
  /* safety */
  show(`<h2>Microscope safety</h2><div class="sortcard" id="rule"></div><div id="opts"></div>`,7);
  await say("safe_intro",{face:"normal"});
  const RULES=[["s_carry",true,"s_carry_a","🙌 Carry it with two hands, and walk.","carry with two hands and walk"],["s_sun",false,"s_sun_a","☀️ Point the mirror at the Sun, for lots of light.","never point the mirror at the Sun"],["s_coarse",false,"coarse_why","⚙️ Use the coarse wheel when the lens is close to the slide.","no coarse wheel near the slide"]];
  for(const [q,yes,a,text,item] of RULES){$("#rule").innerHTML=text;$("#rule").style.animation="none";void $("#rule").offsetWidth;$("#rule").style.animation="";
    first=await yesNo([q],yes,{yesT:"✅ Tick: safe",noT:"❌ Cross: not safe"});(yes?SFX.tick:SFX.cross)();$("#opts").innerHTML="";
    await say(a,{face:yes?"happy":"normal"});rec("Microscope safety",item,first,null);}
  magStation();
}

/* ================= 8 · Magnification Station ================= */
function pvBox(digits){return `<div class="pv" id="pv"><div class="pvh"><span>H</span><span>T</span><span>O</span></div>
  <div class="pvd">${digits.map((d,k)=>`<span class="dg" style="--c:${3-digits.length+k}">${d}</span>`).join("")}<span class="dg z" style="--c:2">0</span></div>
  <p class="muted">× 10: the digits move <b>one place</b>. A 0 fills the gap.</p></div>`;}
function slidePV(){const p=$("#pv");if(p&&!p.classList.contains("slid")){p.classList.add("slid");SFX.whoosh();setTimeout(()=>SFX.pop(),950);return sleep(1500);}return sleep(0);}
function lensRow(e,o,t,mystery){return `<div class="lenses">
   <div class="lens eye"><span class="li">👁️</span><small>eyepiece</small><b>×${e}</b></div>
   <div class="op" aria-label="times">×<small>times</small></div>
   <div class="lens obj${mystery?" myst":""}"><span class="li">🔽</span><small>objective</small><b id="objV">×${mystery?"?":o}</b></div>
   <div class="op" aria-label="equals">=<small>total</small></div>
   <div class="lens tot"><span class="li">🔎</span><small>total</small><b id="totV">${mystery?"×"+t:"?"}</b></div></div>`;}
const MAG=[
  {e:10,o:15,t:150,q:"q1",a:"a1",pv:["1","5"],opts:[{n:150,ok:1,keys:["150","hundred and fifty","hundred fifty","one fifty"]},{n:25,add:1,keys:["25","twenty five"]},{n:1500,keys:["1500","thousand","fifteen hundred"]}]},
  {e:10,o:5,t:50,q:"q2",a:"a2",pv:["5"],opts:[{n:50,ok:1,keys:["50","fifty"]},{n:15,add:1,keys:["15","fifteen"]},{n:500,keys:["500","five hundred"]}]},
  {e:10,o:20,t:200,q:"q3",a:"a3",pv:["2","0"],opts:[{n:200,ok:1,keys:["200","two hundred"]},{n:30,add:1,keys:["30","thirty"]},{n:2000,keys:["2000","two thousand"]}]},
  {e:5,o:3,t:15,q:"q4",a:"a4",dots:1,opts:[{n:15,ok:1,keys:["15","fifteen"]},{n:8,add:1,keys:["8","eight"]},{n:35,keys:["35","thirty five"]}]},
  {e:10,o:40,t:400,q:"q5",a:"a5",pv:["4","0"],mystery:1,opts:[{n:40,ok:1,keys:["40","forty","fourty"]},{n:390,add:1,keys:["390","three hundred and ninety","three ninety"]},{n:4,keys:["4"]}]}];
async function magStation(){
  show(`<h2>Magnification Station</h2><div class="patient"><span class="e">🔍</span><div>How much bigger does our onion look?</div></div>`,8);
  await say("mag_intro",{face:"happy"});
  await buildWord(WORDS.magnification,8);
  show(`<h2>Two lenses</h2>${lensRow("10","4","40",false).replace('id="objV"','').replace('id="totV">?','>×40')}
   <div class="move rule">total magnification = <b>eyepiece</b> × <b>objective</b><br><span class="muted">We multiply. We don't add.</span></div>`,8);
  await say("mag_two",{face:"normal"});await say("mag_rule",{face:"normal"});
  $("#card").insertAdjacentHTML("beforeend",pvBox(["4"]));
  await say("times10",{face:"happy"});await slidePV();
  let qn=0;
  for(const Q of MAG){qn++;
    show(`<h2>Magnification Station · ${qn} of 5</h2>${lensRow(Q.e,Q.o,Q.t,Q.mystery)}
      <div id="pvbox">${Q.pv&&!Q.mystery?pvBox(Q.pv):""}</div>${Q.dots?`<div class="dots" id="dots">${[0,1,2].map(r=>`<div class="drow">${"<i></i>".repeat(5)}<span class="dn">${(r+1)*5}</span></div>`).join("")}</div>`:""}
      <p>${Q.mystery?"What is the objective lens?":"What is the total magnification?"}</p><div id="opts" class="mathopts"></div>`,8);
    let hinted=false;
    const opts=shuffle(Q.opts).map(o=>({t:"×"+o.n,ok:!!o.ok,keys:o.keys,no:async n=>{
      if(o.add){await say("add_wrong",{face:"oops"});return;}
      if(Q.mystery&&!hinted){hinted=true;await say("q5_hint",{face:"think"});return;}
      if(Q.pv&&!Q.mystery){await slidePV();}
      await say("calc_wrong",{face:"oops"});}}));
    let first;
    if(Q.dots){await say(Q.q,{face:"normal"});
      Guest.say("One, two, three, four… I've run out of corners.",{ms:3600});
      const rows=[...$("#dots").children];for(let r=0;r<3;r++){rows[r].classList.add("on");SFX.kal([523.3,659.3,784][r],0,.14);await sleep(900);}
      first=await choose(opts,{grid:true});}
    else first=await choose(opts,{grid:true,ask:[Q.q]});
    if(Q.mystery){$("#objV").textContent="×"+Q.o;$("#objV").parentElement.classList.remove("myst");}else $("#totV").textContent="×"+Q.t;
    const tb=(Q.mystery?$("#objV"):$("#totV")).parentElement;tb.classList.add("done");
    if(Q.mystery)$("#pvbox").innerHTML=pvBox(Q.pv);
    if(Q.pv)await slidePV();
    const c=centre(tb);confetti(c.x,c.y,30);
    await say(Q.a,{face:"happy"});rec("Magnification Station",`×${Q.e} × ×${Q.mystery?"?":Q.o} = ×${Q.mystery?Q.t+" (×"+Q.o+")":Q.t}`,first,null);
  }
  SFX.chime();confetti(undefined,undefined,100);await say("mag_done",{face:"happy",pose:"dance"});Celly.setPose("idle");
  teach();
}

/* ================= 9 · teach Celly (she gets muddled) ================= */
const MUDDLE=[
  {m:"m1",f:"m1_fix",item:"a science tissue is not a hanky",fix:"No! In science, a tissue is a team of the same cells."},
  {m:"m2",f:"m2_fix",item:"a tissue has cells that are the same",fix:"No! A tissue has cells that are all the same."},
  {m:"m3",f:"m3_fix",item:"xylem carries water",fix:"No! Xylem carries water."},
  {m:"m4",f:"m4_fix",item:"multiply the two lenses",fix:"No! We multiply: 10 × 15 = ×150."},
  {m:"m5",f:"m5_fix",item:"only the fine wheel at high power",fix:"No! Only the fine wheel at high power."},
  {m:"m6",f:"m6_fix",item:"a specimen must be thin",fix:"No! It must be thin, so light can pass through."}];
async function teach(){
  show(`<h2>Teach Celly</h2><p>Oh dear. Celly is muddled. Help her!</p>`,9);
  Celly.face("worried");await say("teach_intro",{face:"worried",pose:"shiver"});Celly.setPose("idle");
  for(let i=0;i<MUDDLE.length;i++){const M=MUDDLE[i];
    show(`<h2>Teach Celly · ${i+1} of ${MUDDLE.length}</h2><div class="patient"><span class="e">🤔</span><div>“${window.LINES[M.m]}”</div></div><p class="muted">${canHear()?"Say “no” or “yes”, or tap.":"Tap your answer."}</p><div id="opts"></div>`,9);
    const first=await choose([{t:"Yes, that's right.",keys:["yes","yeah","right","correct"]},{t:M.fix,ok:1,neg:1,keys:["no","nope","wrong","not","never"]}],{ask:[M.m],wrong:"teach_wrong"});
    Celly.face("happy");await say(M.f,{face:"happy",pose:"happy"});
    rec("Teach Celly",M.item,first,null);}
  await say("teach_done",{face:"happy",pose:"dance"});Celly.setPose("idle");
  finish();
}

/* ================= the end: certificate and grown-up summary ================= */
const CERT_T="Junior Pathologist";
async function finish(){
  const total=S.results.length,first=S.results.filter(r=>r.first).length;
  const again=[...new Set(S.results.filter(r=>!r.first||r.said===false).map(r=>r.item))];
  const acts=[...new Set(S.results.map(r=>r.act))];
  const rows=acts.map(a=>`<tr><th>${a}</th><td>${S.results.filter(r=>r.act===a).map(r=>`<div>${r.item} ${r.first&&r.said!==false?'<span class="tag ok">secure</span>':'<span class="tag help">needs another go</span>'}</div>`).join("")}</td></tr>`).join("");
  const date=new Date().toLocaleDateString("en-GB",{day:"numeric",month:"long",year:"numeric"});
  show(`<div class="cert" id="cert"><div class="t">Celly School certificate</div><h1>${CERT_T}</h1>
   <p>This is to say that</p><div class="n" id="certName">a brilliant scientist</div>
   <p>solved every case in Celly's Tissue Lab.<br>7Ac Tissues · ${date}</p>
   <label class="muted" for="nameIn">Your name (a grown-up can help):</label><input id="nameIn" autocomplete="off" maxlength="30">
   <div class="row"><button class="big" id="saveCert">Save my certificate</button></div></div>
   <div class="move rule">❓ Why are tissues important?<br><span class="muted">Every organ is made of different tissues. Each tissue does a job.</span></div>
   <details class="note"><summary>For the grown-up: how it went</summary>
   <p>${first} of ${total} right first time. “Needs another go” means your child got there with help, or Celly couldn't hear the word clearly. It is not a mark.
   ${again.length?`Practise these next, with the 7Ac workbook pages: <b>${again.join(", ")}</b>.`:"Everything looks secure. Next: the 7Ad Cells video."}</p>
   <div class="tablebox"><table>${rows}</table></div></details>
   <div class="row"><button class="big plain" id="restart">Play again</button></div>`,10);
  $("#nameIn").oninput=e=>{$("#certName").textContent=e.target.value.trim()||"a brilliant scientist";};
  $("#saveCert").onclick=saveCert;$("#restart").onclick=()=>location.reload();
  Celly.face("happy");Celly.setPose("dance");SFX.chime();confetti(undefined,undefined,120);setTimeout(()=>{SFX.sparkle();confetti(undefined,undefined,80);},700);
  await say("finish",{face:"happy",pose:"dance"});await say("answer_bigq",{face:"normal"});await say("bigideas",{face:"normal"});
  await say("barry_bye",{face:"happy"});
  await say("cert",{face:"happy"});Guest.say("Bye! Call me if anyone cries! *sniff*",{pose:"flap",ms:3600});await say("next",{face:"happy",pose:"wave"});Celly.setPose("idle");Mic.stop();
}
function saveCert(){
  const W=1400,H=990,c=document.createElement("canvas");c.width=W;c.height=H;const g=c.getContext("2d");
  g.fillStyle="#FAF6E9";g.fillRect(0,0,W,H);g.strokeStyle="#81A63C";g.lineWidth=16;g.strokeRect(30,30,W-60,H-60);g.lineWidth=4;g.strokeRect(58,58,W-116,H-116);
  const F='"Lexend", "Segoe UI", Arial, sans-serif';g.fillStyle="#1F2A44";g.textAlign="center";
  g.font=`600 30px ${F}`;g.fillText("CELLY SCHOOL CERTIFICATE",W/2,150);g.font=`600 80px ${F}`;g.fillText(CERT_T,W/2,260);
  g.font=`400 34px ${F}`;g.fillText("This is to say that",W/2,340);g.font=`600 64px ${F}`;g.fillText($("#certName").textContent,W/2,430);
  g.font=`400 34px ${F}`;g.fillText("solved every case in Celly's Tissue Lab.",W/2,500);g.fillStyle="#56607A";g.fillText("7Ac Tissues · "+new Date().toLocaleDateString("en-GB",{day:"numeric",month:"long",year:"numeric"}),W/2,556);
  g.font=`400 26px ${F}`;g.fillText("www.cellyschool.com",W/2,H-90);
  const name="Celly School certificate - "+CERT_T+".png";
  const save=()=>{const a=document.createElement("a");a.download=name;a.href=c.toDataURL("image/png");document.body.appendChild(a);a.click();a.remove();};
  const svg=new XMLSerializer().serializeToString(rig).replace(/class="rig[^"]*"/,'class="rig"');
  const img=new Image();img.onload=()=>{g.drawImage(img,W/2-170,590,340,340);save();};img.onerror=save;
  img.src="data:image/svg+xml;charset=utf-8,"+encodeURIComponent(svg.includes("xmlns=")?svg:svg.replace("<svg",'<svg xmlns="http://www.w3.org/2000/svg"'));
}

/* ================= go ================= */
const STEPS=[start,team,heart,carrot,brainBreak,scope,slide,focusStep,magStation,teach,finish];
try{const pr=JSON.parse(sessionStorage.getItem("cs7ac_prefs")||"null");if(pr){S.mode=(pr.mode==="tap"||!SR)?"tap":"talk";if(pr.mute)$("#muteBtn").click();}}catch(e){}
setMode(S.mode);
const R0=+(new URLSearchParams(location.search).get("room")||0);
if(R0>0&&R0<STEPS.length){trail(R0);
  show(`<h2>${TRAIL[R0]}</h2><p>Ready when you are.</p><div class="row"><button class="big go" id="go">Go to ${TRAIL[R0]}</button></div>`,R0);
  $("#say").textContent="Let's go to "+TRAIL[R0]+"!";
  $("#go").onclick=()=>{ac();loadSprite();S.started=true;if(canHear())Mic.start();STEPS[R0]();};
}else{trail(0);start();}
