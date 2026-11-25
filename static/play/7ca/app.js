/* Talk to Celly · 7Ca Fitness and breathing · "The Case of the Moving Chest" — Celly School
   Story: Celly is a sports scientist and a detective. Puff, a very floppy lung, cannot breathe on his own. */
"use strict";
const $=s=>document.querySelector(s);
const card=$("#card");
const SR=window.SpeechRecognition||window.webkitSpeechRecognition;
const S={mode:SR?"talk":"tap",mute:false,results:[],last:[],speaking:false,praise:0,token:0};
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
function rec(act,item,first,said){S.results.push({act,item,first,said});try{sessionStorage.setItem("cs7ca_res",JSON.stringify(S.results));}catch(e){}}
try{const r=JSON.parse(sessionStorage.getItem("cs7ca_res")||"[]");if(new URLSearchParams(location.search).get("room"))S.results=r;else sessionStorage.removeItem("cs7ca_res");}catch(e){}

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
  <g class="band"><path d="M86,126 Q200,22 314,126" fill="none" stroke="#2E3F6E" stroke-width="26" stroke-linecap="round"/><path d="M86,126 Q200,22 314,126" fill="none" stroke="#E0455F" stroke-width="18" stroke-linecap="round"/><path d="M92,121 Q200,26 308,121" fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round" stroke-dasharray="1 0"/></g>
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
const TRAIL=["The moving chest","Fitness lab","Build the words","Oxygen lab","Muscle lab","Brain break","Chest model","Breathing rate","Teach Celly","Certificate"];
function trail(n){S.room=n;$("#trail").innerHTML=`<button class="step nav" data-go="${n-1}" ${n<=0?"disabled":""} aria-label="Previous room">◀ back</button>`+
  TRAIL.map((t,i)=>`<button class="step ${i<n?"done":i===n?"now":""}" data-go="${i}" ${i===n?'aria-current="step"':""} title="Go to ${t}">${i<n?"✓ ":""}${t}</button>`).join("")+
  `<button class="step nav" data-go="${n+1}" ${n>=TRAIL.length-1?"disabled":""} aria-label="Next room">next ▶</button>`;}
/* jump to any room: reload the page at that room, so nothing from the old room keeps running */
function goRoom(i){i=Math.max(0,Math.min(TRAIL.length-1,i));if(i===S.room)return;
  try{sessionStorage.setItem("cs7ca_prefs",JSON.stringify({mode:S.mode,mute:S.mute}));}catch(e){}
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
/* ================= lab sounds: all synthesised, no audio files ================= */
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
function choose(opts,{ask=null,wrong="wrong",into="#opts",grid=false,onRight=null}={}){return new Promise(async res=>{
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
async function yesNo(q,isYes,{wrong="wrong",yesT="✅ Tick: that's right",noT="❌ Cross: that's wrong"}={}){
  return choose([{t:yesT,ok:isYes,keys:YES},{t:noT,ok:!isYes,keys:NO,neg:true}],{ask:q,wrong});}
/* one big button the child taps (or a key phrase they say) to move on */
function act(sel,keys=null,ms=8000){return new Promise(res=>{let done=false;const fin=v=>{if(done)return;done=true;if(S.cancelHear)S.cancelHear();res(v);};
  const b=$(sel);if(b)b.onclick=()=>{ac();fin("tap");};
  if(keys&&canHear())hear(ms,a=>kmatch(a,keys)||null).then(g=>{if(g.ok)fin("said");});});}
/* tap the right part of a picture. Each tappable group has data-part. Wrong taps shake. */
function tapPart(box,want,{wrong="wrong",mark=true}={}){return new Promise(res=>{
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
/* ================= Puff the floppy lung (on screen only: text + synthesised balloon sounds) ================= */
const PUFF_SVG=`<svg class="rig guest puff idle" viewBox="0 0 300 330" role="img" aria-label="Puff the lung">
<ellipse cx="150" cy="318" rx="92" ry="9" fill="#1F2A44" opacity=".08"/>
<g class="whole">
 <path d="M150,20 v44" stroke="#2E3F6E" stroke-width="22" stroke-linecap="round"/><path d="M150,20 v44" stroke="#F6C9D3" stroke-width="10" stroke-linecap="round"/>
 <g class="blob">
  <path d="M150,60 C214,52 262,108 258,186 C254,262 206,306 150,302 C94,306 46,262 42,186 C38,108 86,52 150,60Z" fill="#F4A7B9" stroke="#2E3F6E" stroke-width="8" stroke-linejoin="round"/>
  <path d="M150,96 v80 M150,140 l-34,34 M150,140 l34,34 M150,176 l-22,30 M150,176 l22,30" stroke="#E07C96" stroke-width="7" fill="none" stroke-linecap="round" opacity=".7"/>
  <path d="M80,130 q10,-40 50,-52" stroke="#fff" stroke-width="9" fill="none" stroke-linecap="round" opacity=".55"/>
  <g class="pface">
   <ellipse cx="112" cy="214" rx="17" ry="19" fill="#fff" stroke="#2E3F6E" stroke-width="6"/><circle cx="115" cy="218" r="9" fill="#1F2A44"/><circle cx="118" cy="214" r="3" fill="#fff"/>
   <ellipse cx="188" cy="214" rx="17" ry="19" fill="#fff" stroke="#2E3F6E" stroke-width="6"/><circle cx="191" cy="218" r="9" fill="#1F2A44"/><circle cx="194" cy="214" r="3" fill="#fff"/>
   <ellipse cx="88" cy="248" rx="13" ry="8" fill="#F27BA0" opacity=".7"/><ellipse cx="212" cy="248" rx="13" ry="8" fill="#F27BA0" opacity=".7"/>
   <path class="pmouth" d="M132,252 Q150,270 168,252 Q150,258 132,252Z" fill="#7A3550" stroke="#2E3F6E" stroke-width="4" stroke-linejoin="round"/>
  </g>
 </g>
</g></svg>`;
const Guest={kind:null,t:0,
  show(){this.kind="puff";$("#guestArt").innerHTML=PUFF_SVG;$("#actors").classList.add("withGuest");this.pose("popin",800);},
  hide(){this.kind=null;$("#actors").classList.remove("withGuest");$("#gsay").classList.remove("on");},
  el(){return $("#guestArt svg");},
  /* flop = flat and droopy, full = round and happy (stays until set again), wobble, popin */
  pose(p,ms){const g=this.el();if(!g)return;g.classList.remove("idle","flop","full","wobble","popin");void g.getBoundingClientRect();g.classList.add(p);
    if(ms)setTimeout(()=>{const x=this.el();if(x&&x.classList.contains(p)){x.classList.remove(p);x.classList.add("idle");}},ms);},
  say(text,{sfx="squeak",ms=3200,pose="wobble"}={}){if(!this.kind)return Promise.resolve();const b=$("#gsay");b.textContent=text;b.classList.add("on");clearTimeout(this.t);this.t=setTimeout(()=>b.classList.remove("on"),ms);
    if(sfx&&SFX[sfx])SFX[sfx]();if(pose)this.pose(pose,pose==="full"||pose==="flop"?2600:900);return sleep(Math.min(ms,1400));}
};
/* balloon sounds, synthesised */
function slide(f0,f1,dur,{type="sine",g=.12,t0=0}={}){const c=ac();if(!c)return;const t=c.currentTime+t0,o=c.createOscillator(),gn=c.createGain();o.type=type;o.frequency.setValueAtTime(f0,t);o.frequency.exponentialRampToValueAtTime(f1,t+dur);
  gn.gain.setValueAtTime(.0001,t);gn.gain.exponentialRampToValueAtTime(g,t+.03);gn.gain.exponentialRampToValueAtTime(.0001,t+dur);o.connect(gn).connect(c.destination);o.start(t);o.stop(t+dur+.05);}
Object.assign(SFX,{
  squeak(){slide(700,1100,.12,{type:"triangle",g:.1});slide(1000,760,.12,{type:"triangle",g:.08,t0:.13});},
  deflate(){noise(0,.75,{f0:900,f1:260,q:2.5,g:.16,attack:.04});slide(420,140,.7,{type:"sawtooth",g:.03});},
  wheee(){slide(300,1200,.9,{type:"triangle",g:.11});noise(0,.8,{f0:400,f1:1800,q:1.5,g:.05,attack:.2});},
  breath(){noise(0,1.1,{f0:500,f1:900,q:.8,g:.07,attack:.4});}
});

/* ================= pictures (inline SVG, same pastel style) ================= */
/* the air as a pie chart: three slices, only their sizes shown (her book: about one fifth is oxygen) */
function pieSlice(cx,cy,r,a0,a1){const p=a=>[cx+r*Math.sin(a*Math.PI/180),cy-r*Math.cos(a*Math.PI/180)];const [x0,y0]=p(a0),[x1,y1]=p(a1);
  return `M${cx},${cy} L${x0.toFixed(1)},${y0.toFixed(1)} A${r},${r} 0 ${a1-a0>180?1:0} 1 ${x1.toFixed(1)},${y1.toFixed(1)}Z`;}
const PIE_SVG=`<svg viewBox="0 0 280 260" role="img" aria-label="A pie chart of the air with three slices: a very big slice, a slice about one fifth of the circle, and a very thin slice">
 <g class="hit" data-part="big"><path d="${pieSlice(140,130,110,0,281)}" fill="#CFE3F3" stroke="#2E3F6E" stroke-width="4" stroke-linejoin="round"/><text x="96" y="150" font-family="Lexend,Arial" font-size="20" fill="#2E3F6E" pointer-events="none">A</text></g>
 <g class="hit" data-part="oxygen"><path d="${pieSlice(140,130,110,281,357)}" fill="#F7C7A3" stroke="#2E3F6E" stroke-width="4" stroke-linejoin="round"/><text x="104" y="66" font-family="Lexend,Arial" font-size="20" fill="#2E3F6E" pointer-events="none">B</text></g>
 <g class="hit" data-part="thin"><path d="${pieSlice(140,130,110,357,360)}" fill="#BDB6A6" stroke="#2E3F6E" stroke-width="4" stroke-linejoin="round"/><path d="${pieSlice(140,130,124,350,367)}" fill="transparent"/><text x="146" y="14" font-family="Lexend,Arial" font-size="16" fill="#2E3F6E" pointer-events="none">C</text></g>
</svg>`;
/* three cells: round (animal), packed with long strands (muscle), boxy with a cell wall (plant) */
const CELL_ROUND=`<svg viewBox="0 0 160 120" role="img" aria-label="A round cell"><ellipse cx="80" cy="60" rx="56" ry="44" fill="#FBE7A1" stroke="#2E3F6E" stroke-width="4"/><circle cx="66" cy="54" r="14" fill="#8E6CC9" stroke="#6B4FA6" stroke-width="3"/></svg>`;
const CELL_MUSCLE=`<svg viewBox="0 0 160 120" role="img" aria-label="A long cell packed with strands"><path d="M10,60 C30,28 130,28 150,60 C130,92 30,92 10,60Z" fill="#F6B8C6" stroke="#2E3F6E" stroke-width="4"/>
 ${[42,50,58,66,74].map(y=>`<path d="M28,${y} C60,${y-4} 100,${y-4} 132,${y}" stroke="#C0506A" stroke-width="3" fill="none"/>`).join("")}<ellipse cx="80" cy="60" rx="11" ry="7" fill="#8E6CC9" stroke="#6B4FA6" stroke-width="2"/></svg>`;
const CELL_PLANT=`<svg viewBox="0 0 160 120" role="img" aria-label="A box-shaped cell with a thick cell wall"><rect x="22" y="12" width="116" height="96" rx="8" fill="#D9EBC0" stroke="#3F7A2E" stroke-width="8"/><rect x="34" y="24" width="92" height="72" rx="6" fill="#EAF4DB" stroke="#2E3F6E" stroke-width="3"/><circle cx="58" cy="44" r="11" fill="#8E6CC9"/><circle cx="96" cy="74" r="6" fill="#81A63C"/><circle cx="108" cy="46" r="6" fill="#81A63C"/></svg>`;
/* the chest model: trachea, two lungs (Puff and his twin), ribs, intercostal muscles, diaphragm. Transforms only. */
const RIB_Y=[118,150,182,214];
const CHEST_SVG=`<svg viewBox="0 0 400 360" role="img" aria-label="A model of the chest: trachea, lungs, ribs, intercostal muscles and diaphragm" id="chest">
 <rect x="20" y="10" width="360" height="340" rx="40" fill="#FFF7EC" stroke="#E8DCC4" stroke-width="3"/>
 <g class="hit" data-part="trachea"><rect x="186" y="18" width="28" height="96" rx="12" fill="#F6C9D3" stroke="#2E3F6E" stroke-width="5"/>${[34,52,70,88].map(y=>`<path d="M190,${y} h20" stroke="#C0506A" stroke-width="4" stroke-linecap="round"/>`).join("")}
  <path d="M200,112 l-40,26 M200,112 l40,26" stroke="#2E3F6E" stroke-width="14" stroke-linecap="round"/><path d="M200,112 l-40,26 M200,112 l40,26" stroke="#F6C9D3" stroke-width="6" stroke-linecap="round"/></g>
 <g class="hit lungs" data-part="lungs">
  <g class="lung lungL"><path d="M172,140 C176,128 160,118 140,120 C102,124 84,170 86,220 C88,260 112,276 140,270 C160,266 172,252 172,232Z" fill="#F4A7B9" stroke="#2E3F6E" stroke-width="5" stroke-linejoin="round"/>
   <g class="lface"><circle cx="118" cy="200" r="7" fill="#fff" stroke="#2E3F6E" stroke-width="3"/><circle cx="119" cy="201" r="3.5" fill="#1F2A44"/><circle cx="144" cy="200" r="7" fill="#fff" stroke="#2E3F6E" stroke-width="3"/><circle cx="145" cy="201" r="3.5" fill="#1F2A44"/><path d="M122,222 q9,8 18,0" stroke="#7A3550" stroke-width="3.5" fill="none" stroke-linecap="round"/></g></g>
  <g class="lung lungR"><path d="M228,140 C224,128 240,118 260,120 C298,124 316,170 314,220 C312,260 288,276 260,270 C240,266 228,252 228,232Z" fill="#F4A7B9" stroke="#2E3F6E" stroke-width="5" stroke-linejoin="round"/></g>
 </g>
 <g class="ribs">
  <g class="hit" data-part="ribs">${RIB_Y.map(y=>`<path d="M196,${y-8} C150,${y-14} 74,${y-4} 58,${y+26}" stroke="#F3EEE2" stroke-width="12" fill="none" stroke-linecap="round"/><path d="M196,${y-8} C150,${y-14} 74,${y-4} 58,${y+26}" stroke="#2E3F6E" stroke-width="3" fill="none" opacity=".5"/>
   <path d="M204,${y-8} C250,${y-14} 326,${y-4} 342,${y+26}" stroke="#F3EEE2" stroke-width="12" fill="none" stroke-linecap="round"/><path d="M204,${y-8} C250,${y-14} 326,${y-4} 342,${y+26}" stroke="#2E3F6E" stroke-width="3" fill="none" opacity=".5"/>`).join("")}
   <rect x="194" y="138" width="12" height="98" rx="6" fill="#F3EEE2" stroke="#2E3F6E" stroke-width="3"/></g>
  <g class="hit inter" data-part="inter">${RIB_Y.slice(0,3).map(y=>[64,82,100,300,318,336].map(x=>`<path d="M${x},${y+(x<200?6:6)+(Math.abs(x-200)>120?14:0)} l${x<200?8:-8},${22}" stroke="#E0455F" stroke-width="5" stroke-linecap="round"/>`).join("")).join("")}</g>
 </g>
 <g class="hit diaph" data-part="diaph"><path d="M54,300 C90,214 310,214 346,300" stroke="#E07A78" stroke-width="16" fill="none" stroke-linecap="round"/><path d="M54,300 C90,214 310,214 346,300" stroke="#2E3F6E" stroke-width="3" fill="none" opacity=".45"/></g>
 <g class="air" pointer-events="none">${[0,1,2].map(i=>`<path class="arr a${i}" d="M200,0 v26 m-9,-10 l9,10 l9,-10" stroke="#3B82C4" stroke-width="5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`).join("")}</g>
</svg>`;
const chest={
  el(){return $("#chest");},
  set(state){const c=this.el();if(!c)return;c.classList.remove("ribsUp","diaphDown","full","out");state.split(" ").filter(Boolean).forEach(s=>c.classList.add(s));}
};
function tapBox(svg,small=false){return `<div class="labbox tapzone${small?" small":""}">${svg}</div>`;}

/* tap several right answers (each lights up). Returns true if no wrong taps. */
function pickMany(opts,{ask=null,need,wrong="wrong"}={}){return new Promise(async res=>{
  const box=$("#opts");box.innerHTML=`<div class="opts">${opts.map((o,k)=>`<button class="opt" data-k="${k}">${o.e?o.e+" ":""}${o.t}</button>`).join("")}</div>`;
  const btns=[...box.querySelectorAll("button")];let got=0,wrongN=0,settled=false;need=need||opts.filter(o=>o.ok).length;
  const pickK=async k=>{if(settled)return;ac();const o=opts[k],b=btns[k];
    if(o.ok){if(b.classList.contains("right"))return;b.classList.add("right");b.onclick=null;SFX.sparkle();got++;
      if(got>=need){settled=true;if(S.cancelHear)S.cancelHear();btns.forEach(x=>x.onclick=null);res(wrongN===0);}else listen();}
    else{wrongN++;b.classList.remove("wrong");void b.offsetWidth;b.classList.add("wrong");SFX.oops();if(o.no)await o.no(wrongN);else await say(wrongN%2?wrong:"wrong2",{face:"oops"});listen();}};
  btns.forEach((b,k)=>b.onclick=()=>pickK(k));
  const listen=async()=>{if(settled||!canHear())return;
    const g=await hear(10000,a=>{for(let k=0;k<opts.length;k++)if(!btns[k].classList.contains("right")&&opts[k].keys&&kmatch(a,opts[k].keys))return k+1;return null;});
    if(settled)return;if(g.ok)pickK(g.val-1);};
  if(ask)await say(ask,{face:"normal"});remember(S.last,btns,opts.map(o=>o.t));if(!settled)await readOpts(btns,opts.map(o=>o.t));listen();});}
/* a row of beats to drum (for a word we hear but don't build) */
async function drumBeats(syl,lead){
  $("#more").innerHTML=`<div class="wordtiles">${syl.map(s=>`<span class="tile used">${s}</span>`).join("")}</div><div class="row"><button class="drum" id="drum">tap!</button><div class="beats" id="beats">${syl.map(()=>"<i></i>").join("")}</div></div>`;
  const drummed=new Promise(done=>{let n=0;$("#drum").onclick=()=>{ac();const d=$("#beats").children;if(n<d.length){d[n].classList.add("on");SFX.drum();say("s_"+syl[n],{face:"keep"});n++;if(n===d.length)setTimeout(done,900);}};});
  if(lead)await say(lead);await drummed;}

/* ================= 0 · the moving chest ================= */
function start(){
  trail(0);
  show(`<h1>The Case of the Moving Chest</h1><p>Celly is a sports scientist and a detective today. Her guest, Puff, is a very floppy lung. Talk to her, or tap. It goes with the 7Ca Fitness and breathing video.</p>
  <div class="row"><button class="big go" id="go">Open the lab</button></div>
  <details class="note"><summary>For the grown-up</summary><p>Use Chrome or Edge. When the browser asks for the microphone, choose “Allow while visiting the site”. It asks once.
  Your child's voice is turned into text by the browser (Google in Chrome, Microsoft in Edge). This page does not record or keep anything. It takes about 15 to 17 minutes, with a brain break in the middle. There is some gentle moving: stretching, running on the spot and counting breaths.</p></details>`,0);
  $("#say").textContent="Hello, detective! Press the button to open my Sports Science Lab.";
  Celly.pose("wave",1800);
  $("#go").onclick=async()=>{ac();loadSprite();S.started=true;if(canHear())Mic.start();
    show(`<h2>The Sports Science Lab</h2><p class="muted">🏃 Athletes, muscles and lungs.</p>`,0);
    await say("hello",{face:"happy",pose:"talk wave"});
    Guest.show();SFX.squeak();Guest.pose("flop");await sleep(600);
    await say("puff_in",{face:"happy"});
    await Guest.say("Look, I'm breathing!",{sfx:"deflate",pose:"flop",ms:3000});
    await say("puff_flop",{face:"happy"});await Guest.say("I'm not floppy. I'm… relaxed.");
    if(canHear()){
      show(`<h2>Mic check</h2><p>Say: <b>“Hello, Puff!”</b></p>${micRow()}`,0);
      let noMic=false;const skip=new Promise(r=>$("#noMic").onclick=()=>{noMic=true;stopVoice();if(S.cancelHear)S.cancelHear();r();});
      await say("miccheck");
      const got=noMic?{ok:false}:await Promise.race([hear(7000,a=>a[0].length>0),skip.then(()=>({ok:false}))]);
      if(got&&got.ok){SFX.sparkle();Guest.say("Hello, detective!");await say("heardyou",{face:"happy"});}
      else await say("nohear",{face:"normal"});
    }else await say("tapmode",{face:"happy"});
    show(`<h2>A mystery</h2><div class="patient"><span class="e">🫁</span><div>You breathe about <b>20 000</b> times a day.<br>But lungs <b>cannot move</b> on their own.</div></div>`,0);
    await say("mystery",{face:"think"});await say("mystery2",{face:"think"});
    await say("case",{face:"happy"});
    show(`<h2>Today's big question</h2><div class="move">❓ How do <b>muscles</b> help with <b>gas exchange</b>?</div>`,0);
    await say("bigq",{face:"think"});
    rec("The moving chest","the mystery: lungs can't move on their own",true,null);
    fitness();};
}

/* ================= 1 · fitness lab ================= */
const SF={supple:{n:"suppleness",e:"🤸",small:"bending and stretching",keys:["supple","bend","stretch","suppleness","flexible"]},
  strength:{n:"strength",e:"💪",small:"using a big force",keys:["strength","strong","force"]},
  speed:{n:"speed",e:"⚡",small:"moving fast",keys:["speed","fast","quick"]},
  stamina:{n:"stamina",e:"🔋",small:"keeping going",keys:["stamina","long","keep going","tired"]}};
const ATHLETES=[
  {n:"a dancer",e:"💃",bin:"supple",line:"a_dancer"},{n:"a judo player",e:"🥋",bin:"strength",line:"a_judo"},
  {n:"a wheelchair racer",e:"👨‍🦽",bin:"speed",line:"a_wheel"},{n:"a bike rider",e:"🚴",bin:"stamina",line:"a_bike"},
  {n:"a gymnast",e:"🤸",bin:"supple",line:"a_gym"},{n:"a weightlifter",e:"🏋️",bin:"strength",line:"a_lifter"},
  {n:"a sprinter",e:"🏃",bin:"speed",line:"a_sprint"},{n:"a swimmer (2 hours)",e:"🏊",bin:"stamina",line:"a_swim"}];
async function sortCards(bins,cards,{act,wrongLine="wrong"}={}){
  $("#sort").innerHTML=`<div class="sortcard" id="sc"></div><div class="bins n${bins.length}">${bins.map(b=>`<button class="bin" id="b-${b.id}"><span class="bl"><span class="be">${b.e}</span> ${b.label}</span><small>${b.small}</small><span class="got" id="g-${b.id}"></span></button>`).join("")}</div>`;
  for(const C of cards){
    $("#sc").innerHTML=`<span class="ce">${C.e}</span><span>${C.n}</span>`;$("#sc").style.animation="none";void $("#sc").offsetWidth;$("#sc").style.animation="";
    let wrong=0,settled=false;
    const ans=await new Promise(done=>{
      const tryBin=async b=>{if(settled)return;ac();
        if(b===C.bin){settled=true;if(S.cancelHear)S.cancelHear();bins.forEach(x=>$("#b-"+x.id).onclick=null);done(b);}
        else{wrong++;SFX.oops();const el=$("#b-"+b);el.classList.remove("wrong");void el.offsetWidth;el.classList.add("wrong");await say(wrong%2?wrongLine:"wrong2",{face:"oops"});listenLoop();}};
      bins.forEach(x=>$("#b-"+x.id).onclick=()=>tryBin(x.id));
      const listenLoop=async()=>{if(settled||!canHear())return;
        const got=await hear(9000,a=>{for(const x of bins)if(kmatch(a,x.keys))return x.id;return null;});
        if(settled)return;if(got.ok)tryBin(got.val);};
      listenLoop();});
    $("#g-"+ans).insertAdjacentHTML("beforeend",`<span>${C.e} ${C.n}</span>`);
    const bb=$("#b-"+ans);bb.classList.remove("hit");void bb.offsetWidth;bb.classList.add("hit");SFX.sparkle();
    await say(C.line,{face:"happy"});
    rec(act,`${C.n}: ${SF[C.bin].n}`,wrong===0,null);
  }}
async function fitness(){
  show(`<h2>Fitness lab</h2><p class="muted">🏃 Sports scientists study how athletes' bodies work.</p>`,1);
  await say("lab",{face:"happy"});await say("puff_sport",{face:"happy"});await Guest.say("Look at my muscles! …Oh. I don't have any.");
  show(`<h2>Quick warm-up</h2><p>Smallest first.</p><div id="order"></div>`,1);
  say("ladder_order",{face:"normal"});
  const C=[{t:"cell",ic:"🟡"},{t:"tissue",ic:"🧩"},{t:"organ",ic:"🫀"},{t:"organ system",ic:"🧍"}];
  const mis=await orderCards(C,{labels:["1","2","3","4"],wrong:"ladder_wrong",onPlace:async()=>{}});
  await say("ladder_done",{face:"happy"});rec("Fitness lab","cell, tissue, organ, organ system",mis===0,null);
  show(`<h2>Being fit</h2><div id="opts"></div>`,1);
  let first=await choose(shuffle([{t:"Your body can do the things your life needs",e:"✅",ok:1,keys:["life","needs","things","body can"]},
    {t:"You can run faster than everyone",e:"🏃",keys:["faster","everyone","run"]},{t:"You never feel tired",e:"😴",keys:["never","tired"]}]),{ask:["fit_q"]});
  await say("fit_ans",{face:"happy"});await say("fit_diff",{face:"normal"});rec("Fitness lab","being fit means your body can do what your life needs",first,null);
  show(`<h2>The four S-factors</h2><p class="muted">Remember them from the video?</p>`,1);
  await say("s_intro",{face:"normal"});
  await watch("media/clip_sfactors.mp4","The four S-factors, from the Fitness and breathing video");
  show(`<h2>The four S-factors</h2><div class="sfs">${Object.values(SF).map((f,i)=>`<div class="sf" id="sf${i}"><span class="sfe">${f.e}</span><b>${f.n}</b><small>${f.small}</small></div>`).join("")}</div>`,1);
  await say("s_list",{face:"happy"});
  const ids=["sf_supple","sf_strength","sf_speed","sf_stamina"];
  for(let i=0;i<4;i++){$("#sf"+i).classList.add("lit");await say(ids[i],{face:"normal"});}
  await Guest.say("Floppiness? Is that an S-factor?");
  show(`<h2>Which S-factor?</h2><p class="muted">Which one does each athlete need most?</p><div id="sort"></div>`,1);
  await say("sort_intro",{face:"happy"});
  const bins=Object.entries(SF).map(([id,f])=>({id,label:f.n,e:f.e,small:f.small,keys:f.keys}));
  await sortCards(bins,ATHLETES.slice(0,4),{act:"Fitness lab",wrongLine:"sort_wrong"});
  await say(praise(),{face:"happy"});
  await sortCards(bins,shuffle(ATHLETES.slice(4)),{act:"Fitness lab",wrongLine:"sort_wrong"});
  confetti(undefined,undefined,80);await Guest.say("I'd be great at stamina. I never stop… lying down.",{ms:3600});
  show(`<h2>Criteria</h2><div class="patient"><span class="e">📏</span><div><b>criteria</b> = standards: the rules we use to judge something.</div></div><div id="opts"></div>`,1);
  await say("crit_intro",{face:"normal"});await say("crit_means",{face:"normal"});
  first=await choose(shuffle([{t:"How far she can run before she gets tired",e:"🏃‍♀️",ok:1,keys:["far","tired","distance","how far"]},
    {t:"How heavy a bar she can lift",e:"🏋️",keys:["heavy","lift","bar"]},{t:"How far she can bend and stretch",e:"🤸",keys:["bend","stretch"]}]),{ask:["runner_q"]});
  await say("runner_ans",{face:"happy"});rec("Fitness lab","a criterion for stamina",first,null);
  words();
}

/* ================= 2 · build the words ================= */
const WORDS={
  respiration:{w:"respiration",syl:["res","pi","ra","tion"],mean:"w_respiration",col:"var(--mito)",after:["resp_means"],ok:["respiration","restoration","perspiration","respiratory","resp iration"]},
  trachea:{w:"trachea",syl:["tra","che","a"],mean:"w_trachea",col:"var(--membrane)",after:["trachea_say"],ok:["trachea","tracheal","tray key a","trakia","trachia","tracheae","tray kia"]},
  intercostal:{w:"intercostal",syl:["in","ter","cos","tal"],mean:"w_intercostal",col:"var(--nucleus)",after:["inter_means"],ok:["intercostal","inter costal","intercostals","inter coastal","intercoastal"]},
  diaphragm:{w:"diaphragm",syl:["di","a","phragm"],mean:"w_diaphragm",col:"var(--vacuole)",after:["phragm_silent"],ok:["diaphragm","diaphragms","diaphram","dia fram","diafram","die a fram"]},
  contract:{w:"contract",syl:["con","tract"],mean:"w_contract",col:"#E07A78",after:["contract_means"],ok:["contract","contracts","contracting","con tract"]},
  inhalation:{w:"inhalation",syl:["in","ha","la","tion"],mean:"w_inhalation",col:"#6FA8DC",ok:["inhalation","inhale","inhalations","in halation"]},
  exhalation:{w:"exhalation",syl:["ex","ha","la","tion"],mean:"w_exhalation",col:"#81A63C",after:["ex_means"],ok:["exhalation","exhale","exhalations","ex halation"]}
};
let wordN=0;
async function buildWord(W,step,total){wordN++;
  let order;do{order=W.syl.map((s,k)=>k).sort(()=>Math.random()-.5);}while(order.every((v,k)=>v===k));
  show(`<h2>Build the word${total?` · ${wordN} of ${total}`:""}</h2>
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
  const drummed=new Promise(done=>{let n=0;$("#drum").onclick=()=>{ac();const d=$("#beats").children;if(n<d.length){d[n].classList.add("on");SFX.drum();say("s_"+W.syl[n],{face:"keep"});n++;if(n===d.length)setTimeout(done,900);}};});
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
async function words(){
  show(`<h2>Build the words</h2><p class="muted">🔎 Detective words, beat by beat.</p>`,2);
  await say("buildintro",{face:"happy"});
  await buildWord(WORDS.respiration,2,4);
  await buildWord(WORDS.trachea,2,4);
  await buildWord(WORDS.intercostal,2,4);
  await buildWord(WORDS.diaphragm,2,4);
  await Guest.say("Shh, g!");
  await say("wordsdone",{face:"happy"});
  oxygen();
}

/* ================= 3 · oxygen lab ================= */
async function oxygen(){
  show(`<h2>Oxygen lab</h2><div class="patient"><span class="e">⚡</span><div>Every cell needs <b>energy</b>.<br>Cells release energy from food: <b>respiration</b>. It needs <b>oxygen</b>.</div></div>`,3);
  await say("why_breathe",{face:"think"});await say("resp_what",{face:"normal"});
  show(`<h2>The air</h2>${tapBox(PIE_SVG,true)}<p class="taphint">👆 Tap the <b>oxygen</b> slice.</p><div class="labels" id="labs"></div>`,3);
  say("air_q",{face:"normal"});
  const r=await tapPart($(".tapzone"),"oxygen",{wrong:"air_wrong"});$(".taphint").remove();
  chip("#labs","<b>oxygen</b>: about one fifth of the air (20%)","#F7C7A3");
  await say("air_ans",{face:"happy"});rec("Oxygen lab","about one fifth of the air is oxygen",r.mistakes===0,null);
  show(`<h2>Oxygen for athletes</h2><div class="patient"><span class="e">🩹</span><div>Some injured athletes breathe <b>pure oxygen</b>, to help their cells recover.</div></div>`,3);
  await say("therapy",{face:"normal"});
  show(`<h2>A waste gas</h2><div class="patient"><span class="e">💨</span><div>Respiration also makes <b>carbon dioxide</b>.<br>Getting rid of waste = <b>excretion</b>.</div></div><div id="more"></div>`,3);
  await say("co2",{face:"normal"});await say("excrete",{face:"normal"});
  await drumBeats(["ex","cre","tion"],"drum");
  show(`<h2>Feel it!</h2><div class="move">✋ Hand in front of your mouth. Breathe out.</div>`,3);
  await say("hand_breath",{face:"happy",pose:"breath"});SFX.breath();await sleep(1500);
  show(`<h2>Gas exchange</h2><p class="muted">In the lungs, two gases swap places.</p>`,3);
  await say("gx_intro",{face:"normal"});
  await watch("media/clip_gas.mp4","Gas exchange, from the Fitness and breathing video");
  show(`<h2>Gas exchange</h2><div class="gx"><span class="g o2">O₂ oxygen</span><span class="g co2">CO₂ carbon dioxide</span></div><div id="opts"></div>`,3);
  let first=await choose(shuffle([{t:"Into the blood",e:"🩸",ok:1,keys:["blood","into the blood"]},{t:"Into the stomach",e:"🍽",keys:["stomach"]},{t:"Out of the body",e:"🚪",keys:["out","outside"]}]),{ask:["gx_o2_q"]});
  await say("gx_o2_a",{face:"happy"});rec("Oxygen lab","oxygen goes into the blood",first,null);
  first=await choose(shuffle([{t:"Out of the blood, into the lungs",e:"🫁",ok:1,keys:["lungs","out of the blood","breathe it out","out"]},{t:"Into the muscles",e:"💪",keys:["muscle","muscles"]},{t:"Into the stomach",e:"🍽",keys:["stomach"]}]),{ask:["gx_co2_q"]});
  await say("gx_co2_a",{face:"happy"});await say("gx_name",{face:"normal"});rec("Oxygen lab","carbon dioxide leaves the blood",first,null);
  await Guest.say("I swap gases all day. I'm a gas exchange expert!",{ms:3400});
  show(`<h2>Carried around the body</h2><div id="opts"></div>`,3);
  first=await choose(shuffle([{t:"In the blood",e:"🩸",ok:1,keys:["blood"]},{t:"In the bones",e:"🦴",keys:["bone","bones"]},{t:"In the air tubes only",e:"🌬",keys:["air","tubes"]}]),{ask:["carry_q"]});
  await say("carry_a",{face:"happy"});rec("Oxygen lab","gases are carried in the blood",first,null);
  show(`<h2>The circulatory system</h2><p class="muted">Tap <b>two</b> organs.</p><div id="opts"></div>`,3);
  first=await pickMany(shuffle([{t:"the heart",e:"🫀",ok:1,keys:["heart"]},{t:"the blood vessels",e:"🩸",ok:1,keys:["vessel","vessels","blood"]},{t:"the stomach",e:"🍽",keys:["stomach"]},{t:"the brain",e:"🧠",keys:["brain"]}]),{ask:["circ_q"],need:2});
  await say("circ_a",{face:"happy"});rec("Oxygen lab","the heart and blood vessels",first,null);
  show(`<h2>Fun fact!</h2><div class="facts"><div class="fact"><b>2400 km</b><small>of air tubes in your lungs</small></div><div class="fact"><b>1600 km</b><small>of tubes carrying blood</small></div></div>`,3);
  await say("tubes",{face:"surprised"});await say("tubes2",{face:"surprised"});
  show(`<h2>Three names, one system</h2><div class="names"><span>gas exchange system</span><span>breathing system</span><span class="trap">respiratory system</span></div>
   <div class="move rule small">breathing ≠ respiration<br><span class="muted">breathing moves air · respiration releases energy in cells</span></div>`,3);
  await say("names",{face:"normal"});await say("resp_trap",{face:"think"});
  await Guest.say("Respiratory? I'm a breathing organ, not a respiring one!",{ms:3600});
  await say("resp_why",{face:"normal"});
  muscle();
}

/* ================= 4 · muscle lab ================= */
async function muscle(){
  show(`<h2>Muscle lab</h2><div class="patient"><span class="e">💪</span><div>Lungs can't move. So what moves them? <b>Muscles!</b></div></div>`,4);
  await say("muscle_intro",{face:"surprised"});
  show(`<h2>Find the muscle cell</h2><p>Which one is a <b>muscle cell</b>?</p><div id="opts"></div>`,4);
  let first=await choose(shuffle([{e:CELL_MUSCLE,ok:1,keys:["strand","strands","long","stripe","middle"]},{e:CELL_ROUND,keys:["round","circle"]},{e:CELL_PLANT,keys:["box","wall","square","plant"],neg:1}]).map((o,i)=>({...o,t:"picture "+(i+1)})),{grid:true,ask:["cell_q"]});
  await say("cell_ans",{face:"happy"});rec("Muscle lab","muscle cells are packed with strands",first,null);
  await Guest.say("Strands? I want strands!");
  show(`<h2>Contract</h2><div class="cells2"><div class="mc"><span class="mcell"></span><small>relaxed</small></div><span class="arrow">→</span><div class="mc"><span class="mcell short"></span><small>contracted: shorter and fatter</small></div></div>`,4);
  await say("contract_what",{face:"normal"});
  await buildWord(WORDS.contract,4);
  show(`<h2>Relax</h2><div class="cells2"><div class="mc"><span class="mcell short"></span><small>contracted</small></div><span class="arrow">→</span><div class="mc"><span class="mcell"></span><small>relaxed: back to its first shape</small></div></div>`,4);
  await say("relax",{face:"normal"});
  show(`<h2>Try it!</h2><div class="move">✊ Squeeze your fist tight… now let it go.</div>`,4);
  await say("fist",{face:"happy",pose:"pump"});Celly.setPose("idle");await sleep(800);
  show(`<h2>Shape change</h2><div id="opts"></div>`,4);
  first=await choose(shuffle([{t:"It gets shorter and fatter",e:"➖",ok:1,keys:["shorter","fatter","short","fat"]},{t:"It gets longer and thinner",e:"➕",keys:["longer","thinner","long","thin"]},{t:"It stays the same",e:"🟰",keys:["same","stays"]}]),{ask:["shape_q"]});
  await say("shape_ans",{face:"happy"});rec("Muscle lab","contract = shorter and fatter",first,null);
  show(`<h2>A muscle is an organ</h2><p class="muted">Tap the <b>three</b> tissues in a muscle.</p><div id="opts"></div>`,4);
  first=await pickMany(shuffle([{t:"muscle tissue",e:"💪",ok:1,keys:["muscle"]},{t:"nerve tissue",e:"⚡",ok:1,keys:["nerve","nerves"]},{t:"wrapping tissue",e:"🎁",ok:1,keys:["wrapping","wrap"]},
    {t:"paper tissue",e:"🤧",keys:["paper","hanky","nose"],no:async()=>{await say("paper_trap",{face:"happy"});}}]),{ask:["organ_q"],need:3});
  await say("organ_ans",{face:"happy"});rec("Muscle lab","muscle, nerve and wrapping tissue",first,null);
  await say("breaktime",{face:"happy"});
  brainBreak();
}

/* ================= 5 · brain break: sports lab workout ================= */
async function brainBreak(){
  show(`<h2>Brain break: sports lab workout</h2><div class="move" id="move">Stand up!</div><div class="row" id="bbrow"><button class="tbtn" id="skipBB">skip the brain break</button></div>`,5);
  let skipped=false;$("#skipBB").onclick=()=>{skipped=true;stopVoice();if(S.cancelHear)S.cancelHear();};
  await say("bb_intro",{face:"happy",pose:"wave"});
  const moves=[["bb_stretch","🙆 Reach up high… touch your toes: suppleness!","breath",2600],["bb_push","🙏 Push your hands together, hard: strength!","pump",2400],
    ["bb_speed","🏃 Run on the spot, super fast: speed!","wiggle",3200],["bb_slow","🐢 Jog slowly… keep going: stamina!","breath",3600]];
  for(const [id,text,pose,ms] of moves){if(skipped)break;$("#move").textContent=text;
    await say(id,{face:"happy",pose});Celly.setPose(pose);await sleep(ms);Celly.setPose("idle");}
  if(!skipped){$("#move").textContent="✋ Stop. Hands on your chest.";await say("bb_breathe",{face:"normal",pose:"breath"});await sleep(1800);
    await say("bb_why",{face:"normal"});
    await Guest.say("Puff… puff… I'm out of breath. Wait, I AM the breath!",{sfx:"deflate",pose:"flop",ms:3800});}
  if(!skipped){$("#move").textContent="🙂 Sit down. Ready!";await say("bb_done",{face:"happy"});}
  Celly.setPose("idle");
  model();
}

/* ================= 6 · switch on the muscles (the chest model) ================= */
const LABELS=[{p:"trachea",ask:"l_trachea",lab:"trachea (windpipe)",col:"#F6C9D3"},{p:"lungs",ask:"l_lungs",lab:"lungs: gas exchange happens here",col:"#F4A7B9"},
  {p:"ribs",ask:"l_ribs",lab:"ribs: keep the lungs safe",col:"#F3EEE2"},{p:"inter",ask:"l_inter",lab:"intercostal muscles: between the ribs",col:"#E0455F"},
  {p:"diaph",ask:"l_diaph",lab:"diaphragm: a dome of muscle under the lungs",col:"#E07A78"}];
async function model(){
  show(`<h2>Switch on the muscles</h2>${tapBox(CHEST_SVG)}<div class="labels" id="labs"></div>`,6);
  await say("model_intro",{face:"happy"});await say("label_intro",{face:"normal"});
  for(const L of LABELS){say(L.ask,{face:"normal"});const r=await tapPart($(".tapzone"),L.p,{wrong:"label_wrong"});chip("#labs",L.lab,L.col);
    rec("Chest model","find the "+L.lab.split(":")[0].split(" (")[0],r.mistakes===0,null);}
  await say("label_done",{face:"happy"});
  await buildWord(WORDS.inhalation,6);
  await buildWord(WORDS.exhalation,6);
  /* breathe in */
  show(`<h2>Breathe in: inhalation</h2>${tapBox(CHEST_SVG)}<div class="labels" id="labs"></div>`,6);
  document.querySelectorAll(".tapzone .found").forEach(x=>x.classList.remove("found"));
  await say("in_intro",{face:"normal"});
  say("in_step1",{face:"normal"});await tapPart($(".tapzone"),"inter",{wrong:"label_wrong",mark:false});
  chest.set("ribsUp");SFX.pop();chip("#labs","intercostal muscles contract → ribs move <b>up and out</b>","#E0455F");
  await say("in_ribs",{face:"happy"});
  say("in_step2",{face:"normal"});await tapPart($(".tapzone"),"diaph",{wrong:"label_wrong",mark:false});
  chest.set("ribsUp diaphDown");SFX.pop();chip("#labs","diaphragm contracts → moves <b>down</b> and flattens","#E07A78");
  await say("in_diaph",{face:"happy"});
  chest.set("ribsUp diaphDown full");SFX.breath();chip("#labs","more space → lungs get bigger → <b>air in</b>","#6FA8DC");
  await say("in_space",{face:"normal"});
  Guest.pose("full");await Guest.say("WHEEE!",{sfx:"wheee",pose:"full",ms:2600});
  await say("puff_full",{face:"happy",pose:"happy"});
  await watch("media/clip_inhale.mp4","Breathing in, from the Fitness and breathing video");
  show(`<h2>The chant</h2><div class="move chant">⬆️ Ribs up and out.<br>⬇️ Diaphragm down.<br>🌬 Air in.</div><div class="row"><button class="big act" id="chantBtn">🗣 I said it!</button></div>`,6);
  await say("chant",{face:"happy"});
  const said=act("#chantBtn",["ribs","diaphragm","air in","up and out"],12000);
  await say("chant_say",{face:"happy"});await said;SFX.sparkle();
  await Guest.say("Ribs up and out! Diaphragm down! Air in! Again! Again!",{sfx:"wheee",pose:"full",ms:3600});
  /* breathe out */
  show(`<h2>Breathe out: exhalation</h2>${tapBox(CHEST_SVG)}<div class="row"><button class="big act" id="relaxBtn">😌 Relax</button></div><div class="labels" id="labs"></div>`,6);
  chest.set("ribsUp diaphDown full");
  await say("out_intro",{face:"normal"});
  const relaxed=act("#relaxBtn",["relax"],9000);await say("out_step",{face:"normal"});await relaxed;
  $("#relaxBtn").parentElement.remove();
  chest.set("out");SFX.deflate();Guest.pose("flop",2600);Guest.say("pfffft",{sfx:null,pose:"flop",ms:2200});
  chip("#labs","muscles relax → ribs move <b>down and in</b>","#E0455F");chip("#labs","diaphragm rises back into a <b>dome</b>","#E07A78");
  await say("out_move",{face:"normal"});
  chip("#labs","chest smaller → lungs smaller → <b>air out</b>","#6FA8DC");
  await say("out_space",{face:"normal"});
  await say("vent",{face:"normal"});setTimeout(()=>chest.set(""),1200);
  /* order */
  show(`<h2>Breathing in, in order</h2><div id="order"></div>`,6);
  say("order_in",{face:"normal"});
  const steps=[{t:"The breathing muscles contract",ic:"💪"},{t:"The ribs move up and out, the diaphragm moves down",ic:"⬆️"},{t:"The lungs get bigger",ic:"🫁"},{t:"Air flows in",ic:"🌬"}];
  const mis=await orderCards(steps,{labels:["1","2","3","4"],wrong:"order_wrong",onPlace:async()=>{}});
  await say("order_done",{face:"happy"});rec("Chest model","the order of breathing in",mis===0,null);
  show(`<h2>Quick question</h2><div id="opts"></div>`,6);
  let first=await choose(shuffle([{t:"It contracts, moves down and flattens",e:"⬇️",ok:1,keys:["down","flatten","contract","flat"]},{t:"It relaxes and moves up",e:"⬆️",keys:["up","relax"]},{t:"It stays still",e:"⏸",keys:["still","nothing"]}]),{ask:["diaph_q"]});
  await say("diaph_ans",{face:"happy"});rec("Chest model","breathing in: the diaphragm contracts and moves down",first,null);
  first=await choose(shuffle([{t:"They relax",e:"😌",ok:1,keys:["relax","relaxed"]},{t:"They contract",e:"💪",keys:["contract"]},{t:"They grow bigger",e:"📈",keys:["grow","bigger"]}]),{ask:["relax_q"]});
  await say("relax_ans",{face:"happy"});rec("Chest model","breathing out: the muscles relax",first,null);
  confetti(undefined,undefined,90);Guest.pose("full",2400);
  await say("model_done",{face:"happy",pose:"dance"});Celly.setPose("idle");
  rate();
}

/* ================= 7 · breathing rate lab ================= */
function counter(sec){return new Promise(res=>{
  $("#rate").innerHTML=`<div class="ring"><svg viewBox="0 0 120 120" aria-hidden="true"><circle cx="60" cy="60" r="52" fill="none" stroke="#E8DCC4" stroke-width="10"/><circle id="ringP" cx="60" cy="60" r="52" fill="none" stroke="#6FA8DC" stroke-width="10" stroke-linecap="round" stroke-dasharray="326.7" stroke-dashoffset="0" transform="rotate(-90 60 60)"/></svg><b id="ringT">${sec}</b></div>
   <div class="row"><button class="big act breathbtn" id="breathIn">🌬 I breathed in <span id="bn">0</span></button></div>`;
  let n=0,t0=performance.now();const tot=sec*1000;
  $("#breathIn").onclick=()=>{ac();n++;$("#bn").textContent=n;SFX.tap();if(n===1)Guest.say("Count me! In… out… that's one!",{sfx:"squeak",ms:2600});};
  const tick=()=>{const el=performance.now()-t0,left=Math.max(0,tot-el);$("#ringT").textContent=Math.ceil(left/1000);$("#ringP").setAttribute("stroke-dashoffset",(326.7*el/tot).toFixed(1));
    if(left>0)requestAnimationFrame(tick);else{$("#breathIn").onclick=null;$("#breathIn").disabled=true;res(n);}};
  requestAnimationFrame(tick);});}
async function rate(){
  show(`<h2>Breathing rate lab</h2><div class="patient"><span class="e">⏱</span><div><b>breathing rate</b> = how many breaths in <b>one minute</b>. In and out counts as one.</div></div>`,7);
  await say("rate_intro",{face:"happy"});await say("rate_what",{face:"normal"});
  show(`<h2>Sam's breathing rate</h2><div class="patient"><span class="e">🧒</span><div>Sam takes <b>7 breaths</b> in <b>30 seconds</b>.</div></div><div id="opts"></div>`,7);
  let first=await choose(shuffle([{t:"14 breaths per minute",e:"✅",ok:1,keys:["14","fourteen"]},{t:"7 breaths per minute",e:"7️⃣",keys:["7","seven"],no:async()=>say("sam_wrong",{face:"oops"})},{t:"30 breaths per minute",e:"🔢",keys:["30","thirty"],no:async()=>say("sam_wrong",{face:"oops"})}]),{ask:["sam_q"]});
  await say("sam_ans",{face:"happy"});rec("Breathing rate","7 breaths in 30 seconds = 14 per minute",first,null);
  show(`<h2>Your breathing rate</h2><p class="muted">Sit still. Tap once each time you breathe in.</p><div id="rate"><div class="row"><button class="big go" id="ready">Ready!</button><button class="tbtn" id="skipRate">skip</button></div></div>`,7);
  const skip=new Promise(r=>$("#skipRate").onclick=()=>{stopVoice();r("skip");});
  await say("count_intro",{face:"normal"});
  const go=await Promise.race([waitClick("#ready").then(()=>"go"),skip]);
  if(go==="go"){const n=await counter(30);SFX.chime();await say("count_stop",{face:"happy"});
    $("#rate").innerHTML=`<div class="facts"><div class="fact"><b>${n} × 2 = ${n*2}</b><small>your breathing rate: ${n*2} breaths per minute</small></div></div>`;
    await say("count_done",{face:"happy"});}
  show(`<h2>After exercise</h2><div id="opts"></div>`,7);
  first=await choose(shuffle([{t:"Working muscles need more oxygen",e:"💪",ok:1,keys:["oxygen","muscle","energy"]},{t:"To cool down the lungs",e:"🧊",keys:["cool","cold"]},{t:"Because the air gets thinner",e:"🌫",keys:["thinner","thin air"]}]),{ask:["ex_q"]});
  await say("ex_ans",{face:"happy"});rec("Breathing rate","exercise: muscles need more oxygen",first,null);
  show(`<h2>Weak breathing muscles</h2><div id="opts"></div>`,7);
  first=await choose(shuffle([{t:"The lungs can't get as big, so less oxygen gets in",e:"🫁",ok:1,keys:["less","can't","cannot","smaller","not as big"]},{t:"The lungs get extra big",e:"🎈",keys:["extra","bigger","big"]},{t:"Nothing changes",e:"🟰",keys:["nothing","same"]}]),{ask:["weak_q"]});
  await say("weak_ans",{face:"normal"});await say("weak_help",{face:"happy"});rec("Breathing rate","weak breathing muscles: less oxygen",first,null);
  teach();
}

/* ================= 8 · teach Celly (she gets muddled) ================= */
const MUDDLE=[
  {m:"m1",f:"m1_fix",item:"breathing is not respiration",fix:"No! Breathing moves air. Respiration releases energy in cells."},
  {m:"m2",f:"m2_fix",item:"muscles move the lungs",fix:"No! Muscles move the lungs."},
  {m:"m3",f:"m3_fix",item:"breathing in: the diaphragm moves down",fix:"No! The diaphragm moves down."},
  {m:"m4",f:"m4_fix",item:"breathing out: the muscles relax",fix:"No! They relax."},
  {m:"m5",f:"m5_fix",item:"about one fifth of the air is oxygen",fix:"No! Only about one fifth is oxygen."}];
async function teach(){
  show(`<h2>Teach Celly</h2><p>Oh dear. Celly is dizzy and muddled. Help her!</p>`,8);
  Celly.face("worried");await say("teach_intro",{face:"worried",pose:"shiver"});Celly.setPose("idle");
  for(let i=0;i<MUDDLE.length;i++){const M=MUDDLE[i];
    show(`<h2>Teach Celly · ${i+1} of ${MUDDLE.length}</h2><div class="patient"><span class="e">🤔</span><div>“${window.LINES[M.m]}”</div></div><p class="muted">${canHear()?"Say “no” or “yes”, or tap.":"Tap your answer."}</p><div id="opts"></div>`,8);
    const first=await choose([{t:"Yes, that's right.",keys:["yes","yeah","right","correct"]},{t:M.fix,ok:1,neg:1,keys:["no","nope","wrong","not","never"]}],{ask:[M.m],wrong:"teach_wrong"});
    Celly.face("happy");await say(M.f,{face:"happy",pose:"happy"});
    rec("Teach Celly",M.item,first,null);}
  await say("teach_done",{face:"happy",pose:"dance"});Celly.setPose("idle");
  finish();
}

/* ================= the end: certificate and grown-up summary ================= */
const CERT_T="Breathing Detective";
async function finish(){
  const total=S.results.length,first=S.results.filter(r=>r.first).length;
  const again=[...new Set(S.results.filter(r=>!r.first||r.said===false).map(r=>r.item))];
  const acts=[...new Set(S.results.map(r=>r.act))];
  const rows=acts.map(a=>`<tr><th>${a}</th><td>${S.results.filter(r=>r.act===a).map(r=>`<div>${r.item} ${r.first&&r.said!==false?'<span class="tag ok">secure</span>':'<span class="tag help">needs another go</span>'}</div>`).join("")}</td></tr>`).join("");
  const date=new Date().toLocaleDateString("en-GB",{day:"numeric",month:"long",year:"numeric"});
  show(`<div class="cert" id="cert"><div class="t">Celly School certificate</div><h1>${CERT_T}</h1>
   <p>This is to say that</p><div class="n" id="certName">a brilliant detective</div>
   <p>solved the case of the moving chest.<br>7C Muscles and bones · 7Ca Fitness, and muscles and breathing · ${date}</p>
   <label class="muted" for="nameIn">Your name (a grown-up can help):</label><input id="nameIn" autocomplete="off" maxlength="30">
   <div class="row"><button class="big" id="saveCert">Save my certificate</button></div></div>
   <div class="move rule">❓ How do muscles help with gas exchange?<br><span class="muted">The intercostal muscles and the diaphragm move the chest, so air flows in and out of the lungs.</span></div>
   <details class="note"><summary>For the grown-up: how it went</summary>
   <p>${first} of ${total} right first time. “Needs another go” means your child got there with help, or Celly couldn't hear the word clearly. It is not a mark.
   ${again.length?`Practise these next, with the 7Ca workbook pages: <b>${again.join(", ")}</b>.`:"Everything looks secure. Next: the 7Cb Muscles and blood video."}</p>
   <div class="tablebox"><table>${rows}</table></div></details>
   <div class="row"><button class="big plain" id="restart">Play again</button></div>`,9);
  $("#nameIn").oninput=e=>{$("#certName").textContent=e.target.value.trim()||"a brilliant detective";};
  $("#saveCert").onclick=saveCert;$("#restart").onclick=()=>location.reload();
  Celly.face("happy");Celly.setPose("dance");SFX.chime();confetti(undefined,undefined,120);setTimeout(()=>{SFX.sparkle();confetti(undefined,undefined,80);},700);Guest.pose("full");
  await say("case_solved",{face:"happy",pose:"dance"});
  await say("bigideas1",{face:"normal"});await say("bigideas2",{face:"normal"});await say("bigideas3",{face:"normal"});
  await Guest.say("I did it! Well… the muscles did it.",{sfx:"wheee",pose:"full",ms:3200});
  await say("puff_bye",{face:"happy"});
  await say("cert",{face:"happy"});Guest.say("Stamina, here I come!",{pose:"wobble",ms:3200});await say("next",{face:"happy",pose:"wave"});Celly.setPose("idle");Mic.stop();
}
function saveCert(){
  const W=1400,H=990,c=document.createElement("canvas");c.width=W;c.height=H;const g=c.getContext("2d");
  g.fillStyle="#FAF6E9";g.fillRect(0,0,W,H);g.strokeStyle="#81A63C";g.lineWidth=16;g.strokeRect(30,30,W-60,H-60);g.lineWidth=4;g.strokeRect(58,58,W-116,H-116);
  const F='"Lexend", "Segoe UI", Arial, sans-serif';g.fillStyle="#1F2A44";g.textAlign="center";
  g.font=`600 30px ${F}`;g.fillText("CELLY SCHOOL CERTIFICATE",W/2,150);g.font=`600 80px ${F}`;g.fillText(CERT_T,W/2,260);
  g.font=`400 34px ${F}`;g.fillText("This is to say that",W/2,340);g.font=`600 64px ${F}`;g.fillText($("#certName").textContent,W/2,430);
  g.font=`400 34px ${F}`;g.fillText("solved the case of the moving chest.",W/2,500);g.fillStyle="#56607A";g.font=`400 28px ${F}`;g.fillText("7Ca Fitness, and muscles and breathing · "+new Date().toLocaleDateString("en-GB",{day:"numeric",month:"long",year:"numeric"}),W/2,556);
  g.font=`400 26px ${F}`;g.fillText("www.cellyschool.com",W/2,H-80);
  const name="Celly School certificate - "+CERT_T+".png";
  const save=()=>{const a=document.createElement("a");a.download=name;a.href=c.toDataURL("image/png");document.body.appendChild(a);a.click();a.remove();};
  const toImg=(svgEl,x,y,w,h,next)=>{if(!svgEl){next();return;}const s=new XMLSerializer().serializeToString(svgEl).replace(/class="rig[^"]*"/,'class="rig"');
    const img=new Image();img.onload=()=>{g.drawImage(img,x,y,w,h);next();};img.onerror=next;img.src="data:image/svg+xml;charset=utf-8,"+encodeURIComponent(s.includes("xmlns=")?s:s.replace("<svg",'<svg xmlns="http://www.w3.org/2000/svg"'));};
  toImg(rig,W/2-250,590,260,260,()=>toImg(Guest.el(),W/2+30,598,220,242,save));
}

/* ================= go ================= */
const STEPS=[start,fitness,words,oxygen,muscle,brainBreak,model,rate,teach,finish];
try{const pr=JSON.parse(sessionStorage.getItem("cs7ca_prefs")||"null");if(pr){S.mode=(pr.mode==="tap"||!SR)?"tap":"talk";if(pr.mute)$("#muteBtn").click();}}catch(e){}
setMode(S.mode);
const R0=+(new URLSearchParams(location.search).get("room")||0);
if(R0>0&&R0<STEPS.length){trail(R0);
  show(`<h2>${TRAIL[R0]}</h2><p>Ready when you are.</p><div class="row"><button class="big go" id="go">Go to ${TRAIL[R0]}</button></div>`,R0);
  $("#say").textContent="Let's go to "+TRAIL[R0]+"!";
  $("#go").onclick=()=>{ac();loadSprite();S.started=true;if(canHear())Mic.start();Guest.show();STEPS[R0]();};
}else{trail(0);start();}
