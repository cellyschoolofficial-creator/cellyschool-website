/* Talk to Celly · 7Aa Life processes · "Dr Celly's Clinic" — Celly School
   Story: Bolt the robot thinks he is alive. Dr Celly and the learner run the tests. */
"use strict";
const $=s=>document.querySelector(s);
const card=$("#card");
const SR=window.SpeechRecognition||window.webkitSpeechRecognition;
const S={mode:SR?"talk":"tap",mute:false,results:[],last:[],speaking:false,praise:0,token:0};
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
function rec(act,item,first,said){S.results.push({act,item,first,said});try{sessionStorage.setItem("cs7aa_res",JSON.stringify(S.results));}catch(e){}}
try{const r=JSON.parse(sessionStorage.getItem("cs7aa_res")||"[]");if(new URLSearchParams(location.search).get("room"))S.results=r;else sessionStorage.removeItem("cs7aa_res");}catch(e){}

/* ================= Celly and Very Wobbly Cabbage ================= */
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
const TRAIL=["Doctor! Doctor!","Clue detective","Build the words","Mrs Gren","Brain break","Test Bolt and Zoom","Waiting room","Clinic lab","Teach Dr Celly","Certificate"];
function trail(n){S.room=n;$("#trail").innerHTML=`<button class="step nav" data-go="${n-1}" ${n<=0?"disabled":""} aria-label="Previous room">◀ back</button>`+
  TRAIL.map((t,i)=>`<button class="step ${i<n?"done":i===n?"now":""}" data-go="${i}" ${i===n?'aria-current="step"':""} title="Go to ${t}">${i<n?"✓ ":""}${t}</button>`).join("")+
  `<button class="step nav" data-go="${n+1}" ${n>=TRAIL.length-1?"disabled":""} aria-label="Next room">next ▶</button>`;}
/* jump to any room: reload the page at that room, so nothing from the old room keeps running */
function goRoom(i){i=Math.max(0,Math.min(TRAIL.length-1,i));if(i===S.room)return;
  try{sessionStorage.setItem("cs7aa_prefs",JSON.stringify({mode:S.mode,mute:S.mute}));}catch(e){}
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
/* ================= the patients: Bolt the robot, Zoom the car, a campfire ================= */
const BOLT_SVG=`<svg class="rig guest idle" viewBox="0 0 300 350" role="img" aria-label="Bolt the robot">
<ellipse cx="150" cy="338" rx="104" ry="10" fill="#1F2A44" opacity=".08"/>
<g class="whole">
 <line x1="150" y1="46" x2="150" y2="76" stroke="#2E3F6E" stroke-width="8"/><circle class="bulb" cx="150" cy="38" r="13" fill="#F27BA0" stroke="#2E3F6E" stroke-width="6"/>
 <rect x="40" y="200" width="30" height="74" rx="14" fill="#A9C4E8" stroke="#2E3F6E" stroke-width="7" transform="rotate(14 55 200)"/>
 <rect x="230" y="200" width="30" height="74" rx="14" fill="#A9C4E8" stroke="#2E3F6E" stroke-width="7" transform="rotate(-14 245 200)"/>
 <rect x="80" y="76" width="140" height="96" rx="24" fill="#CFD8E6" stroke="#2E3F6E" stroke-width="8"/>
 <rect x="98" y="94" width="104" height="60" rx="14" fill="#1F2A44"/>
 <circle cx="128" cy="118" r="10" fill="#7FE3F0"/><circle cx="172" cy="118" r="10" fill="#7FE3F0"/>
 <path class="bmouth" d="M132,136 Q150,148 168,136" fill="none" stroke="#7FE3F0" stroke-width="5" stroke-linecap="round"/>
 <rect x="136" y="170" width="28" height="14" fill="#56607A"/>
 <rect x="66" y="182" width="168" height="106" rx="26" fill="#A9C4E8" stroke="#2E3F6E" stroke-width="8"/>
 <circle cx="112" cy="222" r="11" fill="#F29E4C" stroke="#2E3F6E" stroke-width="4"/><circle cx="150" cy="222" r="11" fill="#81A63C" stroke="#2E3F6E" stroke-width="4"/><circle cx="188" cy="222" r="11" fill="#8E6CC9" stroke="#2E3F6E" stroke-width="4"/>
 <rect x="104" y="248" width="92" height="20" rx="8" fill="#EAF4FB" stroke="#2E3F6E" stroke-width="4"/>
 <circle cx="104" cy="300" r="28" fill="#56607A" stroke="#2E3F6E" stroke-width="7"/><circle cx="104" cy="300" r="9" fill="#CFD8E6"/>
 <circle cx="196" cy="300" r="28" fill="#56607A" stroke="#2E3F6E" stroke-width="7"/><circle cx="196" cy="300" r="9" fill="#CFD8E6"/>
<g class="hat" style="opacity:0;transition:opacity .4s,transform .6s;transform:translateY(-40px)"><rect x="106" y="-34" width="88" height="96" rx="8" fill="#1F2A44"/><rect x="106" y="40" width="88" height="14" fill="#E0455F"/><rect x="82" y="58" width="136" height="16" rx="8" fill="#1F2A44"/></g>
</g></svg>`;
const ZOOM_SVG=`<svg class="rig guest idle" viewBox="0 0 360 270" role="img" aria-label="Zoom the car">
<ellipse cx="180" cy="256" rx="150" ry="10" fill="#1F2A44" opacity=".08"/>
<g class="whole">
 <path d="M86,128 Q104,52 180,50 Q258,52 280,128Z" fill="#E0455F" stroke="#2E3F6E" stroke-width="8" stroke-linejoin="round"/>
 <rect x="18" y="122" width="324" height="86" rx="38" fill="#E0455F" stroke="#2E3F6E" stroke-width="8"/>
 <ellipse cx="146" cy="98" rx="26" ry="30" fill="#fff" stroke="#2E3F6E" stroke-width="6"/><circle cx="152" cy="104" r="13" fill="#1F2A44"/><circle cx="157" cy="98" r="4" fill="#fff"/>
 <ellipse cx="216" cy="98" rx="26" ry="30" fill="#fff" stroke="#2E3F6E" stroke-width="6"/><circle cx="222" cy="104" r="13" fill="#1F2A44"/><circle cx="227" cy="98" r="4" fill="#fff"/>
 <circle cx="318" cy="150" r="13" fill="#FBE7A1" stroke="#2E3F6E" stroke-width="5"/><circle cx="42" cy="150" r="10" fill="#F6B8C6" stroke="#2E3F6E" stroke-width="5"/>
 <path d="M150,166 Q182,190 214,166" fill="#7A3550" stroke="#2E3F6E" stroke-width="5" stroke-linejoin="round"/>
 <circle cx="96" cy="208" r="36" fill="#1F2A44"/><circle cx="96" cy="208" r="14" fill="#CFD8E6"/>
 <circle cx="266" cy="208" r="36" fill="#1F2A44"/><circle cx="266" cy="208" r="14" fill="#CFD8E6"/>
</g></svg>`;
const FIRE_SVG=`<svg class="rig guest idle" viewBox="0 0 300 330" role="img" aria-label="A campfire">
<ellipse cx="150" cy="316" rx="120" ry="10" fill="#1F2A44" opacity=".08"/>
<g class="whole">
 <g class="flame"><path d="M150,40 C200,110 236,150 226,214 C218,262 184,286 150,286 C112,286 80,262 74,214 C68,160 112,132 120,84 C134,110 140,126 150,40Z" fill="#F29E4C" stroke="#C8742A" stroke-width="6" stroke-linejoin="round"/>
 <path d="M150,130 C176,170 194,196 188,230 C182,262 166,276 150,276 C130,276 114,262 112,232 C110,204 134,186 150,130Z" fill="#FBE7A1"/></g>
 <rect x="40" y="270" width="220" height="30" rx="15" fill="#A9774A" stroke="#6B4A2E" stroke-width="6" transform="rotate(10 150 285)"/>
 <rect x="40" y="270" width="220" height="30" rx="15" fill="#B98858" stroke="#6B4A2E" stroke-width="6" transform="rotate(-10 150 285)"/>
</g></svg>`;
const Guest={kind:null,t:0,
  show(kind){this.kind=kind;$("#guestArt").innerHTML={bolt:BOLT_SVG,zoom:ZOOM_SVG,fire:FIRE_SVG}[kind];$("#actors").classList.add("withGuest");
    if(kind!=="fire")this.pose("drive",900);},
  hide(){this.kind=null;$("#actors").classList.remove("withGuest");$("#gsay").classList.remove("on");},
  el(){return $("#guestArt svg");},
  pose(p,ms){const g=this.el();if(!g)return;g.classList.remove("idle","beep","dance","sad","drive");g.classList.add(p);if(ms)setTimeout(()=>{const x=this.el();if(x&&x.classList.contains(p)){x.classList.remove(p);x.classList.add("idle");}},ms);},
  say(text,{sfx=true,ms=3200,pose="beep"}={}){if(!this.kind)return;const b=$("#gsay");b.textContent=text;b.classList.add("on");clearTimeout(this.t);this.t=setTimeout(()=>b.classList.remove("on"),ms);
    if(sfx){if(this.kind==="zoom")SFX.honk();else if(this.kind==="bolt")(pose==="sad"?SFX.sadbeep():SFX.beep());}
    if(pose)this.pose(pose,pose==="sad"?0:900);return sleep(Math.min(ms,1400));}
};
/* extra clinic sounds */
Object.assign(SFX,{
  beep(n=4){for(let i=0;i<n;i++)tone([880,1175,988,1320,1047][i%5],i*.11,.05,.05,"square");},
  sadbeep(){[660,550,440].forEach((f,i)=>tone(f,i*.32,.05,.12,"square"));},
  honk(){const c=ac();if(!c)return;const t=c.currentTime;[[311,0],[392,0],[311,.32],[392,.32]].forEach(([f,d])=>{const o=c.createOscillator(),g=c.createGain(),lp=c.createBiquadFilter();o.type="sawtooth";o.frequency.value=f;lp.type="lowpass";lp.frequency.value=1400;
    g.gain.setValueAtTime(0,t+d);g.gain.linearRampToValueAtTime(.07,t+d+.02);g.gain.setValueAtTime(.07,t+d+.2);g.gain.linearRampToValueAtTime(0,t+d+.26);o.connect(lp).connect(g).connect(c.destination);o.start(t+d);o.stop(t+d+.3);});},
  knock(){[0,.18,.36].forEach(d=>{tone(140,d,.25,.05,"triangle");tone(90,d,.2,.06);});},
  squelch(){const c=ac();if(!c)return;const t=c.currentTime,o=c.createOscillator(),g=c.createGain();o.type="triangle";o.frequency.setValueAtTime(260,t);o.frequency.exponentialRampToValueAtTime(70,t+.35);g.gain.setValueAtTime(.2,t);g.gain.exponentialRampToValueAtTime(.001,t+.4);o.connect(g).connect(c.destination);o.start(t);o.stop(t+.42);},
  tick(){SFX.kal(784,0,.12);SFX.kal(1047,.08,.08);},
  cross(){tone(196,0,.1,.08,"triangle");},
  crackle(){const c=ac();if(!c)return;const n=c.sampleRate*1.2,b=c.createBuffer(1,n,c.sampleRate),d=b.getChannelData(0);for(let i=0;i<n;i++)d[i]=Math.random()<.004?(Math.random()*2-1):(Math.random()*2-1)*.03;
    const s=c.createBufferSource(),g=c.createGain();s.buffer=b;g.gain.value=.5;s.connect(g).connect(c.destination);s.start();}
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
    else{wrongN++;b.classList.remove("wrong");void b.offsetWidth;b.classList.add("wrong");SFX.oops();if(o.no)await o.no();else await say(wrong,{face:"oops"});listen();}};
  btns.forEach((b,k)=>b.onclick=()=>pickK(k));
  const order=opts.map((o,k)=>k).sort((a,b)=>(opts[b].neg?1:0)-(opts[a].neg?1:0));
  const listen=async()=>{if(settled||!canHear()||!opts.some(o=>o.keys))return;
    const got=await hear(10000,a=>{for(const k of order)if(kmatch(a,opts[k].keys))return k+1;return null;});
    if(settled)return;if(got.ok)pickK(got.val-1);};
  if(ask)await say(ask,{face:"normal"});remember(S.last,btns,opts.map(o=>o.t));if(!settled)await readOpts(btns,opts.map(o=>o.t));listen();});}
const YES=["yes","yeah","yep","tick","it can","he can","definitely","of course"],NO=["no","nope","cross","can't","cannot","can not","never","not"];

/* ================= 0 · welcome to the clinic ================= */
function start(){
  trail(0);
  show(`<h1>Dr Celly's Clinic</h1><p>A robot called Bolt thinks he is alive. Help Dr Celly find out! Talk to her, or tap. It goes with the 7Aa Life processes video.</p>
  <div class="row"><button class="big go" id="go">Open the clinic</button></div>
  <details class="note"><summary>For the grown-up</summary><p>Use Chrome or Edge. When the browser asks for the microphone, choose “Allow while visiting the site”. It asks once.
  Your child's voice is turned into text by the browser (Google in Chrome, Microsoft in Edge). This page does not record or keep anything. It takes about 15 minutes, with a brain break in the middle.</p></details>`,0);
  $("#say").textContent="Hello, scientist! Press the button to open my clinic.";
  Celly.pose("wave",1800);
  $("#go").onclick=async()=>{ac();loadSprite();S.started=true;if(canHear())Mic.start();
    show(`<h2>Dr Celly's Clinic</h2><p class="muted">🩺 Open from 9 till 5. Robots welcome.</p>`,0);
    await say("hello",{face:"happy",pose:"talk wave"});
    SFX.knock();Celly.face("surprised");await sleep(700);await say("knock",{face:"surprised"});
    Guest.show("bolt");SFX.whoosh();await sleep(900);await Guest.say("BEEP! Doctor, I feel funny! Am I ALIVE?");
    await say("bolt_in",{face:"happy"});await say("bolt_alive",{face:"think"});await say("help",{face:"happy"});
    if(canHear()){
      show(`<h2>Mic check</h2><p>Say: <b>“Hello, Bolt!”</b></p>${micRow()}`,0);
      let noMic=false;const skip=new Promise(r=>$("#noMic").onclick=()=>{noMic=true;stopVoice();if(S.cancelHear)S.cancelHear();r();});
      await say("miccheck");
      const got=noMic?{ok:false}:await Promise.race([hear(7000,a=>a[0].length>0),skip.then(()=>({ok:false}))]);
      if(got&&got.ok){SFX.sparkle();Guest.say("BEEP BEEP! Hello!");await say("heardyou",{face:"happy"});}
      else await say("nohear",{face:"normal"});
    }else await say("tapmode",{face:"happy"});
    doctor();};
}

/* ================= 1 · Doctor! Doctor! ================= */
async function doctor(){
  show(`<h2>Doctor! Doctor!</h2><p>This is Dr Celly's <b>very old</b> medicine cupboard, from Ancient Egypt.</p>
   <div class="row"><button class="cupboard" id="cup" aria-label="open the cupboard">🗄️</button><span class="taphint" id="cuphint">👆 Tap to open it</span></div><div id="inside"></div>`,0);
  await say("cupboard",{face:"happy"});
  await new Promise(r=>$("#cup").onclick=()=>{ac();r();});
  $("#cup").textContent="🏺";$("#cuphint").remove();
  $("#inside").innerHTML=`<div class="patient"><span class="e">💩</span><div><b>Animal dung</b><br><span class="muted">Ancient Egyptian doctors put it in medicines!</span></div></div>`;
  SFX.squelch();Celly.face("oops");Celly.setPose("shiver");
  await say("dung",{face:"oops",pose:"shiver"});Guest.say("BEEP! Yuck! Yuck!");await say("nottry",{face:"normal"});
  show(`<h2>Pick today's doctor tools</h2><p>Find the <b>3</b> things a doctor really uses. <span class="muted">${canHear()?"Tap, or say its name.":""}</span></p><div id="opts"></div>${micRow()}`,0);
  const T=[{t:"stethoscope",e:"🩺",ok:1,keys:["stethoscope","stetho","heart","listen"],line:"t_steth"},
    {t:"jar of dung",e:"💩",keys:["dung","poo","poop","jar"],no:async()=>{Guest.say("BEEP! Not the dung!");await say("lab_wrong",{face:"oops"});}},
    {t:"thermometer",e:"🌡️",ok:1,keys:["thermometer","temperature"],line:"t_thermo"},
    {t:"magic wand",e:"🪄",keys:["wand","magic"],no:async()=>{Guest.say("BEEP? Magic isn't science!");await say("lab_wrong",{face:"oops"});}},
    {t:"blood and urine tests",e:"🧪",ok:1,keys:["test","tests","blood","urine","wee","tube"],line:"t_tests"}];
  let left=T.filter(t=>t.ok).length,wrongN=0;
  $("#opts").innerHTML=`<div class="pick">${T.map((o,k)=>`<button data-k="${k}"><span class="e">${o.e}</span>${o.t}</button>`).join("")}</div>`;
  const btns=[...$("#opts").querySelectorAll("button")];
  await new Promise(async done=>{let busy=false,fin=false;
    const pickK=async k=>{const o=T[k],b=btns[k];if(busy||fin||b.classList.contains("right"))return;busy=true;ac();
      if(o.ok){b.classList.add("right");SFX.sparkle();confetti(centre(b).x,centre(b).y,25);await say(o.line,{face:"happy"});left--;}
      else{wrongN++;b.classList.remove("wrong");void b.offsetWidth;b.classList.add("wrong");SFX.oops();await o.no();}
      busy=false;if(left===0){fin=true;if(S.cancelHear)S.cancelHear();done();}else listen();};
    btns.forEach((b,k)=>b.onclick=()=>pickK(k));
    if($("#noMic"))$("#noMic").onclick=()=>{if(S.cancelHear)S.cancelHear();setMode("tap");};
    const listen=async()=>{if(fin||!canHear())return;const got=await hear(12000,a=>{for(let k=0;k<T.length;k++)if(!btns[k].classList.contains("right")&&kmatch(a,T[k].keys))return k+1;return null;});
      if(!fin&&got.ok)pickK(got.val-1);};
    await say("tools_intro",{face:"normal"});listen();});
  rec("Doctor's tools","stethoscope, thermometer, blood and urine tests",wrongN===0,null);
  await say(praise(),{face:"happy",pose:"dance"});Celly.setPose("idle");
  clue();
}

/* ================= 2 · clue detective ================= */
const PATIENTS=[
  {e:"🤧",q:"pt1",a:"pt1_ans",sym:"a sore throat and a runny nose",item:"cold symptoms",opts:[{t:"a broken leg",e:"🦵",keys:["broken","leg"]},{t:"a cold",e:"🤧",ok:1,keys:["cold"]},{t:"toothache",e:"🦷",keys:["tooth","teeth"]}]},
  {e:"🔴",q:"pt2",a:"pt2_ans",sym:"lots of spots on their skin",item:"spots as a symptom",opts:[{t:"a sprained ankle",e:"🦶",keys:["ankle","sprain"]},{t:"hiccups",e:"😮",keys:["hiccup","hiccups"]},{t:"an illness with spots, like chickenpox",e:"🔴",ok:1,keys:["spot","spots","chicken","pox","measles","rash"]}]},
  {e:"🥵",q:"pt3",a:"pt3_ans",sym:"hot, shivery and achy all over",item:"flu symptoms",opts:[{t:"flu",e:"🤒",ok:1,keys:["flu","influenza"]},{t:"a splinter",e:"🪵",keys:["splinter"]},{t:"a bee sting",e:"🐝",keys:["bee","sting"]}]}
];
async function clue(){
  show(`<h2>Clue detective</h2><div class="patient"><span class="e">🔍</span><div><b>symptoms</b> = clues<br><span class="muted">changes in the way your body works</span></div></div>`,1);
  await say("clue_intro",{face:"think"});await say("symptoms_mean",{face:"normal"});await say("clue_play",{face:"happy"});
  for(let i=0;i<PATIENTS.length;i++){const P=PATIENTS[i];
    show(`<h2>Patient ${i+1} of 3</h2><div class="patient"><span class="e">${P.e}</span><div>Symptoms: <b>${P.sym}</b></div></div><p>What is the illness? <span class="muted">${canHear()?"Say it, or tap.":"Tap it."}</span></p><div id="opts"></div>`,1);
    const first=await choose(shuffle(P.opts),{ask:[P.q],wrong:"lab_wrong"});
    await say([praise(),P.a],{face:"happy"});rec("Clue detective",P.item,first,null);}
  show(`<h2>Clues become evidence</h2><div class="patient"><span class="e">🧾</span><div><b>evidence</b> = information that helps us say if something is right or wrong</div></div>`,1);
  await say("evidence",{face:"normal"});await say("evidence_mean",{face:"normal"});
  Guest.say("BEEP! You're a great detective!");await say("clue_done",{face:"happy",pose:"dance"});Celly.setPose("idle");
  words();
}

/* ================= 3 · build the words ================= */
const WORDS=[
  {w:"organism",syl:["or","gan","is","m"],mean:"w_organism",col:"var(--bio)",ok:["organism","organisms","organ is","organ isn't","orgasm","or gonna some"]},
  {w:"sensitivity",syl:["sen","si","tiv","i","ty"],mean:"w_sensitivity",col:"var(--membrane)",after:"sense_means",ok:["sensitivity","sensitive","sensitivities","sense ativity","sensativity"]},
  {w:"respiration",syl:["res","pi","ra","tion"],mean:"w_respiration",col:"var(--mito)",ok:["respiration","respiration","restoration","perspiration","respiratory","resp iration"]},
  {w:"excretion",syl:["ex","cre","tion"],mean:"w_excretion",col:"var(--vacuole)",after:"ex_means",ok:["excretion","excretions","ex creation","excretion","secretion","ex cretion"]}
];
async function words(){
  show(`<h2>Build the words</h2><p class="muted">Doctors need the right words.</p>`,2);
  await watch("media/clip_gren.mp4","Meet Mrs Gren, from the Life processes video");
  await say("organism",{face:"normal"});Guest.say("BEEP BOOP? Am I an organism?");await say("question",{face:"think"});
  await say("buildintro",{face:"happy"});
  for(let i=0;i<WORDS.length;i++)await buildWord(WORDS[i],i);
  await say("wordsdone",{face:"happy",pose:"dance"});Celly.setPose("idle");
  gren();
}
async function buildWord(W,i){
  let order;do{order=W.syl.map((s,k)=>k).sort(()=>Math.random()-.5);}while(order.every((v,k)=>v===k));
  show(`<h2>Build the word · ${i+1} of ${WORDS.length}</h2>
   <div class="meaning"><span class="swatch" style="background:${W.col}"></span><p>${window.LINES[W.mean]}</p></div>
   <div class="slots" id="slots">${W.syl.map(()=>'<div class="slot"></div>').join("")}</div>
   <div class="tiles" id="tiles">${order.map(k=>`<button class="tile" data-k="${k}">${W.syl[k]}</button>`).join("")}</div><div id="more"></div>`,2);
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
  if(W.after)await say(W.after,{face:"happy"});
  rec("Build the word",W.w,mistakes===0,said);
}

/* ================= 4 · Mrs Gren's checklist ================= */
const GREN=[
  {l:"M",p:"movement",g:"g_m",d:"d_move",m:"changing position"},
  {l:"R",p:"reproduction",g:"g_r1",d:"d_repro",m:"making copies of yourself: new living things"},
  {l:"S",p:"sensitivity",g:"g_s",d:"d_sense",m:"detecting changes in the things around you"},
  {l:"G",p:"growth",g:"g_g",d:"d_grow",m:"increasing in size"},
  {l:"R",p:"respiration",g:"g_r2",d:"d_resp",m:"releasing energy (needs food and oxygen)"},
  {l:"E",p:"excretion",g:"g_e",d:"d_excr",m:"getting rid of waste"},
  {l:"N",p:"nutrition",g:"g_n",d:"d_nutr",m:"getting the substances you need to live"}
];
async function gren(){
  show(`<h2>Meet Mrs Gren</h2><div class="patient"><span class="e">👵</span><div><b>MRS GREN</b> is a <b>mnemonic</b>: a pattern of letters that helps you remember something.</div></div>`,3);
  await say("meetgren",{face:"happy"});await say("mnemonic",{face:"normal"});await say("gren_job",{face:"normal"});
  let order;do{order=shuffle(GREN.map((g,k)=>k));}while(order.every((v,k)=>GREN[v].l===GREN[k].l));
  show(`<h2>Put Mrs Gren in order</h2>
   <div class="slots gren" id="slots">${GREN.map(()=>'<div class="slot"></div>').join("")}</div>
   <div class="tiles" id="tiles">${order.map(k=>`<button class="tile" data-k="${k}">${GREN[k].l}</button>`).join("")}</div>
   <div class="labels" id="labels"></div>`,3);
  say("ordertiles",{face:"normal"});
  let pos=0,mistakes=0;
  await new Promise(done=>card.querySelectorAll(".tile").forEach(b=>b.onclick=async()=>{ac();const k=+b.dataset.k;
    if(GREN[k].l===GREN[pos].l&&!b.classList.contains("used")){b.classList.add("used");const G=GREN[pos];const s=$("#slots").children[pos];s.textContent=G.l;s.classList.add("filled");SFX.tap();
      $("#labels").insertAdjacentHTML("beforeend",`<span class="lab"><b>${G.l}</b>&nbsp;${G.p}</span>`);pos++;
      await say(G.g,{face:"happy"});if(pos===GREN.length)done();}
    else{mistakes++;b.classList.remove("shake");void b.offsetWidth;b.classList.add("shake");SFX.oops();say("tilewrong",{face:"oops"});}}));
  rec("Mrs Gren","the order M R S G R E N",mistakes===0,null);
  SFX.chime();confetti();
  await say("match_intro",{face:"normal"});
  for(const G of shuffle(GREN)){
    const others=shuffle(GREN.filter(x=>x!==G)).slice(0,2);
    show(`<h2>What does it mean?</h2><div class="sortcard"><b>${G.l}</b>&nbsp;${G.p}</div><div id="opts"></div>`,3);
    const first=await choose(shuffle([{t:G.m,ok:1},...others.map(o=>({t:o.m}))]),{wrong:"match_wrong",ask:"n_"+G.p in window.LINES?["n_"+G.p]:null});
    await say(G.d,{face:"happy"});rec("Mrs Gren meanings","what "+G.p+" means",first,null);}
  show(`<h2>Mrs Gren is complete!</h2><div class="labels">${GREN.map(G=>`<span class="lab"><b>${G.l}</b>&nbsp;${G.p}</span>`).join("")}</div><div class="move">An organism does <b>all 7</b>.</div>`,3);
  SFX.chime();confetti(undefined,undefined,90);
  await say("grendone",{face:"happy",pose:"dance"});await say("allseven",{face:"normal"});await say("breaktime",{face:"happy"});
  brainBreak();
}

/* ================= 5 · brain break: Mrs Gren says ================= */
async function brainBreak(){
  show(`<h2>Brain break: Mrs Gren says…</h2><div class="move" id="move">Stand up!</div><div class="row"><button class="tbtn" id="skipBB">skip the brain break</button></div>`,4);
  let skipped=false;$("#skipBB").onclick=()=>{skipped=true;stopVoice();};
  await say("bb_intro",{face:"happy",pose:"wave"});
  const moves=[["bb_move","🖐 Wiggle your fingers: movement!","wiggle",2200],["bb_grow","🌱 Crouch small… grow up tall: growth!","breath",3200],["bb_breathe","😮‍💨 Breathe in… and out: respiration!","breath",3600],["bb_bite","🍎 CRUNCH! Nutrition!","pump",2000],["bb_sense","👂 Close your eyes and listen: sensitivity!","idle",3600]];
  for(const [id,text,pose,ms] of moves){if(skipped)break;$("#move").textContent=text;
    await say(id,{face:"happy",pose});Celly.setPose(pose);if(id==="bb_bite")SFX.squelch();await sleep(ms);Celly.setPose("idle");}
  if(!skipped){$("#move").textContent="👃 Touch your nose!";await say("bb_trick",{face:"happy"});await sleep(2000);
    if(!skipped){$("#move").textContent="😜 Mrs Gren didn't say!";SFX.tickle();Guest.say("BEEP BEEP! Ha ha!");await say("bb_caught",{face:"happy",pose:"dance"});}}
  if(!skipped){$("#move").textContent="🙂 Sit down. Ready!";await say("bb_done",{face:"happy"});}
  Celly.setPose("idle");await say("bb_back",{face:"normal"});
  testBolt();
}

/* ================= 6 · test Bolt, Zoom and a campfire ================= */
function checkTable(id){return `<table class="check" id="${id}">${GREN.map((G,k)=>`<tr data-k="${k}"><td>${G.l}</td><td>${G.p}</td><td class="res">?</td></tr>`).join("")}</table>`;}
function mark(tab,p,ok){const r=[...document.querySelectorAll(`#${tab} tr`)].find(r=>GREN[+r.dataset.k].p===p);if(!r)return;r.classList.remove("ask");r.querySelector(".res").textContent=ok?"✅":"❌";(ok?SFX.tick:SFX.cross)();}
function asking(tab,p){document.querySelectorAll(`#${tab} tr`).forEach(r=>r.classList.toggle("ask",GREN[+r.dataset.k].p===p));}
async function yesNo(q,isYes,{wrong="lab_wrong",yesT="✅ Yes, tick",noT="❌ No, cross"}={}){
  return choose([{t:yesT,ok:isYes,keys:YES},{t:noT,ok:!isYes,keys:NO,neg:true}],{ask:q,wrong});}
async function testBolt(){
  Guest.show("bolt");
  show(`<h2>Patient: Bolt the robot 🤖</h2>${checkTable("tb")}<div id="opts"></div>`,5);
  await say("test_intro",{face:"normal"});
  const Q=[["movement","b_move",true,"b_move_y"],["sensitivity","b_sense",true,"b_sense_y"],["growth","b_grow",false,"b_grow_n"],["reproduction","b_repro",false,"b_repro_n"]];
  const hat=on=>{const h=$("#guestArt .hat");if(h){h.style.opacity=on?1:0;h.style.transform=on?"none":"translateY(-40px)";}};
  for(const [p,q,yes,ans] of Q){asking("tb",p);if(p==="growth"){hat(true);SFX.pop();await Guest.say("BEEP! Look how TALL I am!");}const first=await yesNo([q],yes);mark("tb",p,yes);$("#opts").innerHTML="";
    await say(ans,{face:yes?"happy":"think"});if(p==="growth"){hat(false);SFX.whoosh();}
    if(yes)await Guest.say("BEEP BOOP? Does that mean I'm alive?");else await Guest.say("Beep…?",{pose:"sad"});
    rec("Test Bolt",`Bolt: ${p}`,first,null);}
  await say("b_verdict",{face:"normal"});
  /* Zoom the car */
  show(`<h2>A new patient…</h2>`,5);
  await watch("media/clip_car.mp4","Is a car an organism? From the Life processes video");
  SFX.honk();await sleep(600);Guest.show("zoom");await Guest.say("HONK! I'm totally alive!");
  await say("zoom_in",{face:"surprised"});await say("zoom_alive",{face:"happy"});
  show(`<h2>Patient: Zoom the car 🚗</h2>${checkTable("tz")}<div id="opts"></div>`,5);
  for(const [p,l] of [["movement","z_move"],["sensitivity","z_sense"],["respiration","z_resp"],["excretion","z_excr"],["nutrition","z_nutr"]]){asking("tz",p);await say(l,{face:"normal"});mark("tz",p,true);}
  Guest.say("HONK HONK! Told you!");await say("z_five",{face:"surprised"});
  asking("tz","growth");let first=await yesNo(["z_grow"],false);mark("tz","growth",false);$("#opts").innerHTML="";rec("Test Zoom","a car can't grow",first,null);
  asking("tz","reproduction");Guest.say("HONK?!");
  first=await yesNo(["z_babycar"],false,{yesT:"🚗👶 Yes, lots!",noT:"😂 No, never!"});mark("tz","reproduction",false);$("#opts").innerHTML="";rec("Test Zoom","a car can't reproduce",first,null);
  SFX.tickle();await say("z_verdict",{face:"normal"});await Guest.say("Honk… fair enough.",{pose:"sad"});
  /* the campfire */
  Guest.show("fire");SFX.crackle();
  show(`<h2>Patient: a campfire 🔥</h2>${checkTable("tf")}<div id="opts"></div>`,5);
  await say("fire_in",{face:"surprised"});["movement","growth","respiration"].forEach((p,i)=>setTimeout(()=>mark("tf",p,true),i*500));await sleep(1600);
  await say("fire_check",{face:"think"});
  asking("tf","sensitivity");first=await yesNo(null,false,{yesT:"✅ Yes, fire can sense",noT:"❌ No, fire can't sense"});mark("tf","sensitivity",false);
  asking("tf","reproduction");const f2=await yesNo(null,false,{yesT:"✅ Yes, fire has baby fires",noT:"❌ No, fire can't reproduce"});mark("tf","reproduction",false);$("#opts").innerHTML="";
  rec("Test the campfire","fire can't sense or reproduce",first&&f2,null);
  await say("fire_verdict",{face:"normal"});
  show(`<h2>Dr Celly's secret</h2><div class="move">🔑 <b>Reproduction</b><br>No non-living thing can do it.</div>`,5);
  SFX.chime();await say("repro_rule",{face:"happy"});
  Guest.show("bolt");await sleep(900);Guest.pose("sad");Guest.say("Beep… beep…",{pose:"sad",ms:3000});await say("bolt_sad",{face:"worried"});
  await say("bolt_ok",{face:"happy",pose:"dance"});Guest.say("BEEP BEEP! Best friend ever!",{pose:"dance"});Guest.pose("dance",2400);confetti();await sleep(1200);Celly.setPose("idle");
  waiting();
}

/* ================= 7 · the waiting room ================= */
const ROOM=[["cow","🐄",1],["car","🚗",0],["daffodil","🌼",1],["chair","🪑",0],["goldfish","🐠",1],["coal","⬛",0],["mouse","🐭",1],["robot","🤖",0],
  ["octopus","🐙",1],["rock","🪨",0],["snake","🐍",1],["Sun","☀️",0],["cactus","🌵",1],["gerbil","🐹",1],["cloud","☁️",0],["river","🏞️",0]];
async function waiting(){
  Guest.hide();
  show(`<h2>The waiting room</h2><div class="sortcard" id="sc"></div>
   <div class="bins">
    <button class="bin" id="b-yes">🌱 organism<small>say “organism” or “alive”</small><span class="got" id="g-yes"></span></button>
    <button class="bin" id="b-no">🪨 not an organism<small>say “not”</small><span class="got" id="g-no"></span></button>
   </div>`,6);
  await say("wait_intro",{face:"surprised"});await say("wait_how",{face:"normal"});
  for(const [n,e,alive] of ROOM){
    $("#sc").innerHTML=`<span style="font-size:48px">${e}</span>${n==="Sun"?"the Sun":n==="coal"?"a lump of coal":n}`;$("#sc").style.animation="none";void $("#sc").offsetWidth;$("#sc").style.animation="";
    const want=alive?"yes":"no";let wrong=0,settled=false;
    const ans=await new Promise(async done=>{
      const tryBin=async b=>{if(settled)return;ac();
        if(b===want){settled=true;if(S.cancelHear)S.cancelHear();done(b);}
        else{wrong++;SFX.oops();const el=$("#b-"+b);el.classList.remove("wrong");void el.offsetWidth;el.classList.add("wrong");await say("sort_wrong",{face:"oops"});listenLoop();}};
      $("#b-yes").onclick=()=>tryBin("yes");$("#b-no").onclick=()=>tryBin("no");
      const listenLoop=async()=>{if(settled||!canHear())return;
        const got=await hear(9000,a=>kmatch(a,["not","no","isn't","isnt","non","nonliving","dead"])?"no":kmatch(a,["organism","alive","living","yes","it is"])?"yes":null);
        if(settled)return;if(got.ok)tryBin(got.val);};
      listenLoop();});
    $("#g-"+ans).insertAdjacentHTML("beforeend",`<span>${e} ${n}</span>`);
    alive?SFX.sparkle():SFX.pop();
    await say("c_"+n.toLowerCase(),{face:"happy"});
    rec("Waiting room",n,wrong===0,null);
  }
  confetti(undefined,undefined,100);await say("sort_done",{face:"happy",pose:"dance"});Celly.setPose("idle");await say("lab_next",{face:"normal"});
  lab();
}

/* ================= 8 · the clinic lab ================= */
const JAR_SVG=`<svg viewBox="0 0 320 300" role="img" aria-label="Seedlings in a jar above limewater">
 <rect x="70" y="30" width="180" height="250" rx="26" fill="#F4FAFD" stroke="#2E3F6E" stroke-width="7"/>
 <rect x="62" y="18" width="196" height="26" rx="10" fill="#CFD8E6" stroke="#2E3F6E" stroke-width="6"/>
 <rect id="lime" x="78" y="196" width="164" height="76" rx="18" fill="#E3F2FA"/>
 <text x="160" y="244" text-anchor="middle" font-size="18" font-family="Lexend,Arial" fill="#2E3F6E">limewater</text>
 <line x1="74" y1="170" x2="246" y2="170" stroke="#56607A" stroke-width="6" stroke-dasharray="10 6"/>
 <g id="seeds" fill="#81A63C" stroke="#3E7E33" stroke-width="3">
  <path d="M110,168 q-2,-30 4,-48 M114,124 q-18,-8 -22,4 q14,6 22,-4 M114,124 q14,-14 24,-6 q-12,12 -24,6" fill="none" stroke-width="5"/>
  <path d="M160,168 q-2,-36 2,-56 M162,116 q-18,-8 -22,4 q14,6 22,-4 M162,116 q14,-14 24,-6 q-12,12 -24,6" fill="none" stroke-width="5"/>
  <path d="M208,168 q-2,-28 4,-44 M212,128 q-18,-8 -22,4 q14,6 22,-4 M212,128 q14,-14 24,-6 q-12,12 -24,6" fill="none" stroke-width="5"/></g>
</svg>`;
const RINGS=[18,30,40,62,72,84,96];  /* ring 4 (40→62) is the wide one */
const TREE_SVG=`<svg viewBox="0 0 240 240" role="img" aria-label="Tree rings">
 <circle cx="120" cy="120" r="110" fill="#8B5E3C"/>
 ${RINGS.slice().reverse().map((r,i)=>`<circle class="ring" data-r="${r}" cx="120" cy="120" r="${r}" fill="${i%2?"#E8C99A":"#F2DCB4"}" stroke="#A9774A" stroke-width="4"/>`).join("")}
 <circle cx="120" cy="120" r="5" fill="#A9774A"/></svg>`;
const EYE_SVG=`<svg viewBox="0 0 360 200" role="img" aria-label="An eye">
 <path d="M20,100 Q180,-20 340,100 Q180,220 20,100Z" fill="#fff" stroke="#2E3F6E" stroke-width="8"/>
 <circle cx="180" cy="100" r="62" fill="#6FA8DC" stroke="#2E3F6E" stroke-width="6"/>
 <circle id="pupil" cx="180" cy="100" r="40" fill="#1F2A44" style="transition:r 1.2s"/>
 <circle cx="200" cy="80" r="10" fill="#fff"/>
 <path id="beam" d="M360,0 L230,80 L230,120 L360,200Z" fill="#FBE7A1" opacity="0" style="transition:opacity .4s"/></svg>`;
async function lab(){
  /* case 1: do plants respire? */
  show(`<h2>Case 1 · Do plants respire?</h2><div class="labbox">${JAR_SVG}</div><div class="row" id="ff"></div><div id="opts"></div>`,7);
  await say("lab_a",{face:"think"});await say("lab_a_set",{face:"normal"});
  $("#ff").innerHTML=`<button class="big" id="go">⏩ Fast forward a few days</button>`;await waitClick("#go");$("#ff").innerHTML="";
  say("lab_a_wait",{face:"happy"});SFX.whoosh();
  const lime=$("#lime");lime.style.transition="fill 2.5s";lime.setAttribute("fill","#FBFBF7");lime.style.fill="#F4F4EE";$("#seeds").style.transition="transform 2.5s";$("#seeds").style.transformOrigin="50% 100%";$("#seeds").style.transformBox="fill-box";$("#seeds").style.transform="scaleY(1.25)";
  await sleep(2800);
  let first=await choose([{t:"It went milky",e:"🥛",ok:1,keys:["milky","milk","cloudy","white"]},{t:"It turned bright blue",e:"🔵",keys:["blue"]},{t:"Nothing happened",e:"🤷",keys:["nothing","same"]}],{ask:["lab_a_q"]});
  await say("lab_a_ans",{face:"happy"});await say("lab_a_end",{face:"normal"});rec("Clinic lab","plants respire (limewater)",first,null);
  /* case 2: tree rings */
  show(`<h2>Case 2 · How old is this tree?</h2><div class="labbox">${TREE_SVG}</div><p>Count the rings. 🌳</p><div id="opts"></div>`,7);
  await say("lab_b",{face:"happy"});await say("lab_b_ring",{face:"normal"});
  first=await choose([{t:"4 years",keys:["four","4"]},{t:"7 years",ok:1,keys:["seven","7"]},{t:"10 years",keys:["ten","10"]}],{wrong:"lab_wrong"});
  await say(praise(),{face:"happy"});rec("Clinic lab","tree rings show age",first,null);
  $("#opts").innerHTML=`<p class="taphint">👆 Tap the <b>widest</b> ring: the best growing year.</p>`;
  await say("lab_b_wide",{face:"normal"});
  let wr=0;await new Promise(done=>document.querySelectorAll(".ring").forEach(c=>c.onclick=async e=>{e.stopPropagation();ac();
    if(+c.dataset.r===62){document.querySelectorAll(".ring").forEach(x=>x.onclick=null);c.setAttribute("fill","#B5D27E");SFX.sparkle();done();}
    else{wr++;SFX.oops();await say("lab_wrong",{face:"oops"});}}));
  rec("Clinic lab","wide ring = good growing year",wr===0,null);
  await say(praise(),{face:"happy"});await say("lab_b_keep",{face:"normal"});await say("lab_b_joke",{face:"happy"});
  /* case 3: sensitivity */
  show(`<h2>Case 3 · Sensitivity</h2><div class="labbox">${EYE_SVG}</div><div class="row" id="ff"></div><div id="opts"></div>`,7);
  await say("lab_c",{face:"happy"});await say("lab_c_eye",{face:"normal"});
  $("#ff").innerHTML=`<button class="big" id="go">🔦 Shine the torch</button>`;await waitClick("#go");$("#ff").innerHTML="";
  $("#beam").setAttribute("opacity",".8");$("#pupil").setAttribute("r","14");$("#pupil").style.r="14px";SFX.sparkle();await sleep(1300);
  await say("lab_c_eye_a",{face:"happy"});
  $("#ff").innerHTML=`<div class="patient"><span class="e">🍳🔥✋</span><div>A <b>hot pan</b>!</div></div>`;
  first=await choose([{t:"It moves away, fast!",e:"💨",ok:1,keys:["away","move","pull","fast","quick","off"]},{t:"It stays on the pan",e:"🫳",keys:["stay","stays","keep"]},{t:"It goes to sleep",e:"😴",keys:["sleep"]}],{ask:["lab_c_hot"]});
  await say("lab_c_hot_a",{face:"happy"});rec("Clinic lab","sensitivity: pupils and hot pan",first,null);
  /* quick questions */
  const QQ=[
    {h:"🐟 Fish",q:"lab_d",a:"lab_d_ans",item:"fish: gills and water",opts:[{t:"From water, using gills",ok:1,keys:["gill","gills","water"]},{t:"From air, using lungs, like us",keys:["lung","lungs","air"]},{t:"Fish don't need oxygen",keys:["don't","dont","need"]}]},
    {h:"🌻 Plants",q:"lab_e",a:"lab_e_ans",item:"how plants reproduce",opts:[{t:"Flowers make seeds and fruit",ok:1,keys:["flower","flowers","seed","seeds","fruit","insect"]},{t:"They lay eggs",keys:["egg","eggs"]},{t:"They don't reproduce",keys:["don't","dont"]}]},
    {h:"🌻 Plants",q:"lab_f",a:"lab_f_ans",item:"plants move parts slowly",opts:[{t:"Yes, they move parts of themselves, slowly",ok:1,keys:["yes","slow","slowly","part","parts","sun"]},{t:"No, plants never move",neg:1,keys:["no","never","don't"]}]}];
  for(const Q of QQ){show(`<h2>Quick question · ${Q.h}</h2><div id="opts"></div>`,7);
    first=await choose(shuffle(Q.opts),{ask:[Q.q]});await say(Q.a,{face:"happy"});rec("Clinic lab",Q.item,first,null);}
  confetti();await say("lab_done",{face:"happy",pose:"dance"});Celly.setPose("idle");
  teach();
}

/* ================= 9 · teach Dr Celly (she gets muddled) ================= */
const MUDDLE=[
  {m:"m1",f:"m1_fix",item:"plants do move",fix:"No! Plants move parts of themselves, slowly."},
  {m:"m2",f:"m2_fix",item:"respiration is not breathing",fix:"No! Respiration releases energy inside cells. Breathing just brings air in.",clip:"media/clip_resp.mp4"},
  {m:"m3",f:"m3_fix",item:"fire is not alive",fix:"No! Fire can't sense or reproduce."},
  {m:"m4",f:"m4_fix",item:"plants respire too",fix:"No! The seedlings made the limewater milky."},
  {m:"m5",f:"m5_fix",item:"trees keep growing",fix:"No! Trees keep growing. People stop."}];
async function teach(){
  show(`<h2>Teach Dr Celly</h2><p>Oh dear. Dr Celly is muddled. Help her!</p>`,8);
  Celly.face("worried");await say("teach_intro",{face:"worried",pose:"shiver"});Celly.setPose("idle");
  for(let i=0;i<MUDDLE.length;i++){const M=MUDDLE[i];
    show(`<h2>Teach Dr Celly · ${i+1} of ${MUDDLE.length}</h2><div class="patient"><span class="e">🤔</span><div>“${window.LINES[M.m]}”</div></div><p class="muted">${canHear()?"Say “no” or “yes”, or tap.":"Tap your answer."}</p><div id="opts"></div>`,8);
    const first=await choose([{t:"Yes, that's right.",keys:["yes","yeah","right","correct"]},{t:M.fix,ok:1,neg:1,keys:["no","nope","wrong","not","never"]}],{ask:[M.m],wrong:"teach_wrong"});
    Celly.face("happy");await say(M.f,{face:"happy",pose:"happy"});
    if(M.clip)await watch(M.clip,"Respiration is not breathing, from the Life processes video");
    rec("Teach Dr Celly",M.item,first,null);}
  await say("teach_done",{face:"happy",pose:"dance"});Celly.setPose("idle");
  finish();
}

/* ================= the end: certificate and grown-up summary ================= */
async function finish(){
  const total=S.results.length,first=S.results.filter(r=>r.first).length;
  const again=[...new Set(S.results.filter(r=>!r.first||r.said===false).map(r=>r.item))];
  const acts=[...new Set(S.results.map(r=>r.act))];
  const rows=acts.map(a=>`<tr><th>${a}</th><td>${S.results.filter(r=>r.act===a).map(r=>`<div>${r.item} ${r.first&&r.said!==false?'<span class="tag ok">secure</span>':'<span class="tag help">needs another go</span>'}</div>`).join("")}</td></tr>`).join("");
  const date=new Date().toLocaleDateString("en-GB",{day:"numeric",month:"long",year:"numeric"});
  show(`<div class="cert" id="cert"><div class="t">Celly School certificate</div><h1>Life Process Detective</h1>
   <p>This is to say that</p><div class="n" id="certName">a brilliant scientist</div>
   <p>helped every patient at Dr Celly's Clinic.<br>7Aa Life processes · ${date}</p>
   <label class="muted" for="nameIn">Your name (a grown-up can help):</label><input id="nameIn" autocomplete="off" maxlength="30">
   <div class="row"><button class="big" id="saveCert">Save my certificate</button></div></div>
   <details class="note"><summary>For the grown-up: how it went</summary>
   <p>${first} of ${total} right first time. “Needs another go” means your child got there with help, or Celly couldn't hear the word clearly. It is not a mark.
   ${again.length?`Practise these next, with the 7Aa workbook pages: <b>${again.join(", ")}</b>.`:"Everything looks secure. Next: the 7Ab Organs video."}</p>
   <div class="tablebox"><table>${rows}</table></div></details>
   <div class="row"><button class="big plain" id="restart">Play again</button></div>`,9);
  $("#nameIn").oninput=e=>{$("#certName").textContent=e.target.value.trim()||"a brilliant scientist";};
  $("#saveCert").onclick=saveCert;$("#restart").onclick=()=>location.reload();
  Celly.face("happy");Celly.setPose("dance");SFX.chime();confetti(undefined,undefined,120);setTimeout(()=>{SFX.sparkle();confetti(undefined,undefined,80);},700);
  await say("finish",{face:"happy",pose:"dance"});await say("bigideas",{face:"normal"});
  Guest.show("bolt");await sleep(900);Guest.say("BEEP BEEP! Thank you, doctor!",{pose:"dance"});await say("bolt_bye",{face:"happy"});
  await say("cert",{face:"happy"});await say("next",{face:"happy",pose:"wave"});Celly.setPose("idle");Mic.stop();
}
function saveCert(){
  const W=1400,H=990,c=document.createElement("canvas");c.width=W;c.height=H;const g=c.getContext("2d");
  g.fillStyle="#FAF6E9";g.fillRect(0,0,W,H);g.strokeStyle="#81A63C";g.lineWidth=16;g.strokeRect(30,30,W-60,H-60);g.lineWidth=4;g.strokeRect(58,58,W-116,H-116);
  const F='"Lexend", "Segoe UI", Arial, sans-serif';g.fillStyle="#1F2A44";g.textAlign="center";
  g.font=`600 30px ${F}`;g.fillText("CELLY SCHOOL CERTIFICATE",W/2,150);g.font=`600 80px ${F}`;g.fillText("Life Process Detective",W/2,260);
  g.font=`400 34px ${F}`;g.fillText("This is to say that",W/2,340);g.font=`600 64px ${F}`;g.fillText($("#certName").textContent,W/2,430);
  g.font=`400 34px ${F}`;g.fillText("helped every patient at Dr Celly's Clinic.",W/2,500);g.fillStyle="#56607A";g.fillText("7Aa Life processes · "+new Date().toLocaleDateString("en-GB",{day:"numeric",month:"long",year:"numeric"}),W/2,556);
  g.font=`400 26px ${F}`;g.fillText("www.cellyschool.com",W/2,H-80);
  const name="Celly School certificate - Life Process Detective.png";
  const save=()=>{const a=document.createElement("a");a.download=name;a.href=c.toDataURL("image/png");document.body.appendChild(a);a.click();a.remove();};
  const svg=new XMLSerializer().serializeToString(rig).replace(/class="rig[^"]*"/,'class="rig"');
  const img=new Image();img.onload=()=>{g.drawImage(img,W/2-140,578,280,280);save();};img.onerror=save;
  img.src="data:image/svg+xml;charset=utf-8,"+encodeURIComponent(svg.includes("xmlns=")?svg:svg.replace("<svg",'<svg xmlns="http://www.w3.org/2000/svg"'));
}

/* ================= go ================= */
const STEPS=[start,clue,words,gren,brainBreak,testBolt,waiting,lab,teach,finish];
try{const pr=JSON.parse(sessionStorage.getItem("cs7aa_prefs")||"null");if(pr){S.mode=(pr.mode==="tap"||!SR)?"tap":"talk";if(pr.mute)$("#muteBtn").click();}}catch(e){}
setMode(S.mode);
const R0=+(new URLSearchParams(location.search).get("room")||0);
if(R0>0&&R0<STEPS.length){trail(R0);
  show(`<h2>${TRAIL[R0]}</h2><p>Ready when you are.</p><div class="row"><button class="big go" id="go">Go to ${TRAIL[R0]}</button></div>`,R0);
  $("#say").textContent="Let's go to "+TRAIL[R0]+"!";
  $("#go").onclick=()=>{ac();loadSprite();S.started=true;if(canHear())Mic.start();STEPS[R0]();};
}else{trail(0);start();}
