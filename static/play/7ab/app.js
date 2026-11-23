/* Talk to Celly · 7Ab Organs · "The Body Town Tour" — Celly School
   Story: Celly guides the learner round Body Town. Mumbles, a friendly mummy from Ancient Egypt, joins the tour. */
"use strict";
const $=s=>document.querySelector(s);
const card=$("#card");
const SR=window.SpeechRecognition||window.webkitSpeechRecognition;
const S={mode:SR?"talk":"tap",mute:false,results:[],last:[],speaking:false,praise:0,token:0};
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
function rec(act,item,first,said){S.results.push({act,item,first,said});try{sessionStorage.setItem("cs7ab_res",JSON.stringify(S.results));}catch(e){}}
try{const r=JSON.parse(sessionStorage.getItem("cs7ab_res")||"[]");if(new URLSearchParams(location.search).get("room"))S.results=r;else sessionStorage.removeItem("cs7ab_res");}catch(e){}

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
  S.speaking=true;Celly.setPose(pose||"talk");
  let flap=0;const flapper=()=>{if(!S.speaking)return;if(!curAudio){const t=performance.now()/1000;Celly.mouth(Math.max(0,.15+.55*Math.abs(Math.sin(t*13))*Math.abs(Math.sin(t*3.1))));}flap=requestAnimationFrame(flapper);};
  for(const id of ids){if(tok!==S.token)break;(window.__said=window.__said||new Set()).add(id);const text=window.LINES[id]||id;
    if(S.mute){await sleep(Math.min(2400,500+text.length*30));continue;}
    let ok=false;if(window.VOICE.ready&&window.LINES[id]){curAudio=null;ok=await clipLine(id,tok);curAudio=null;}
    if(!ok&&tok===S.token){cancelAnimationFrame(flap);flap=requestAnimationFrame(flapper);await ttsLine(text,tok);cancelAnimationFrame(flap);}
    await sleep(120);}
  if(tok===S.token){S.speaking=false;Mic.muteUntil=performance.now()+450;Celly.mouth(0);if(!pose||pose==="talk")Celly.setPose("idle");}
}
function praise(){S.praise=(S.praise%7)+1;return "p"+S.praise;}
$("#again").onclick=async()=>{if(!S.last.length)return;const L=S.lastOpts,k=S.last.join("|");await say(S.last);if(L&&L.key===k&&L.btns[0]&&L.btns[0].isConnected)await readOpts(L.btns,L.texts);};

/* ================= Celly listens (one microphone session for the whole game) ================= */
const Mic={sr:null,want:false,blocked:false,cb:null,muteUntil:0};
Mic.start=function(){if(!SR||Mic.sr||Mic.blocked)return;const r=new SR();r.lang="en-GB";r.continuous=true;r.interimResults=true;r.maxAlternatives=3;
  const echo=new Set();
  r.onresult=e=>{for(let i=e.resultIndex;i<e.results.length;i++){const res=e.results[i];
    // a phrase that started while Celly was talking is Celly's own voice (echo from the speakers): ignore it, even when it finishes later
    if(S.speaking||performance.now()<Mic.muteUntil){echo.add(i);continue;}
    if(echo.has(i))continue;
    const alts=[];for(let k=0;k<res.length;k++)alts.push(res[k].transcript.toLowerCase().trim());if(Mic.cb&&alts[0])Mic.cb(alts,res.isFinal);}};
  r.onerror=e=>{if(e.error==="not-allowed"||e.error==="service-not-allowed"){Mic.blocked=true;Mic.want=false;micBlocked();}};
  r.onend=()=>{Mic.sr=null;if(Mic.want&&!Mic.blocked&&S.mode==="talk")setTimeout(()=>Mic.start(),250);};
  r.onstart=()=>echo.clear();
  Mic.want=true;Mic.sr=r;try{r.start();}catch(e){Mic.sr=null;}};
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
const TRAIL=["Wake up, Mumbles!","Word workshop","Map: upstairs","Follow your lunch","Brain break","Organ teams","Body Town Park","Body Town Hospital","Teach Celly","Certificate"];
function trail(n){S.room=n;$("#trail").innerHTML=`<button class="step nav" data-go="${n-1}" ${n<=0?"disabled":""} aria-label="Previous room">◀ back</button>`+
  TRAIL.map((t,i)=>`<button class="step ${i<n?"done":i===n?"now":""}" data-go="${i}" ${i===n?'aria-current="step"':""} title="Go to ${t}">${i<n?"✓ ":""}${t}</button>`).join("")+
  `<button class="step nav" data-go="${n+1}" ${n>=TRAIL.length-1?"disabled":""} aria-label="Next room">next ▶</button>`;}
/* jump to any room: reload the page at that room, so nothing from the old room keeps running */
function goRoom(i){i=Math.max(0,Math.min(TRAIL.length-1,i));if(i===S.room)return;
  try{sessionStorage.setItem("cs7ab_prefs",JSON.stringify({mode:S.mode,mute:S.mute}));}catch(e){}
  stopVoice();location.href=location.pathname+(i?"?room="+i:"");}
$("#trail").addEventListener("click",e=>{const b=e.target.closest("[data-go]");if(b&&!b.disabled)goRoom(+b.dataset.go);});
function show(html,n){card.innerHTML=html;if(n!=null)trail(n);if(innerWidth<=820)$("#stage").scrollIntoView({behavior:"smooth",block:"start"});}
function waitClick(sel){return new Promise(r=>{const b=$(sel);if(b)b.onclick=()=>{ac();r();};});}
function bigStage(on){$("#stage").classList.toggle("bigstage",on);}
async function watch(src,label,intro="watch"){
  card.insertAdjacentHTML("beforeend",`<video class="clip" id="clip" src="${src}" playsinline controls preload="auto" aria-label="${label}"></video><div class="row"><button class="tbtn" id="skipClip">skip the clip</button></div>`);
  const v=$("#clip");v.volume=1;let skipped=false;
  const ended=new Promise(r=>{let done=false;const fin=()=>{if(!done){done=true;r();}};v.onended=fin;v.onerror=fin;$("#skipClip").onclick=()=>{skipped=true;stopVoice();v.pause();fin();};});
  await say(intro,{face:"happy"});
  if(!skipped)v.play().catch(()=>{});
  await ended;
  v.remove();$("#skipClip").parentElement.remove();Celly.pose("happy",900);SFX.pop();}
/* ================= Mumbles, the friendly mummy ================= */
const MUMBLES_SVG=`<svg class="rig guest idle" viewBox="0 0 300 340" role="img" aria-label="Mumbles the friendly mummy">
<ellipse cx="150" cy="328" rx="100" ry="10" fill="#1F2A44" opacity=".08"/>
<g class="whole">
 <rect x="100" y="250" width="42" height="70" rx="20" fill="#F4EBD3" stroke="#2E3F6E" stroke-width="8"/>
 <rect x="158" y="250" width="42" height="70" rx="20" fill="#F4EBD3" stroke="#2E3F6E" stroke-width="8"/>
 <path d="M104,282 l34,-8 M104,302 l34,-8 M162,276 l34,8 M162,296 l34,8" stroke="#E3D5B5" stroke-width="4" stroke-linecap="round"/>
 <g class="loose"><path d="M226,196 C258,206 272,236 262,270 L246,266 C254,240 242,220 220,212Z" fill="#FBF3DF" stroke="#2E3F6E" stroke-width="6" stroke-linejoin="round"/></g>
 <path d="M150,26 C222,26 242,90 240,168 C238,248 212,282 150,282 C88,282 62,248 60,168 C58,90 78,26 150,26Z" fill="#F4EBD3" stroke="#2E3F6E" stroke-width="9"/>
 <g fill="none" stroke="#E3D5B5" stroke-width="5" stroke-linecap="round">
  <path d="M78,72 Q150,52 222,74"/><path d="M68,180 Q150,200 232,176"/><path d="M66,210 Q150,190 234,214"/><path d="M72,244 Q150,262 228,240"/><path d="M90,44 Q150,30 210,46"/></g>
 <rect x="86" y="88" width="128" height="70" rx="32" fill="#FBE3CF" stroke="#E3D5B5" stroke-width="4"/>
 <g class="eye"><ellipse cx="124" cy="122" rx="19" ry="22" fill="#fff" stroke="#2E3F6E" stroke-width="6"/><circle cx="127" cy="126" r="11" fill="#1F2A44"/><circle cx="131" cy="120" r="4" fill="#fff"/></g>
 <g class="eye"><ellipse cx="176" cy="122" rx="19" ry="22" fill="#fff" stroke="#2E3F6E" stroke-width="6"/><circle cx="179" cy="126" r="11" fill="#1F2A44"/><circle cx="183" cy="120" r="4" fill="#fff"/></g>
 <ellipse cx="100" cy="166" rx="15" ry="9" fill="#F6B8C6"/><ellipse cx="200" cy="166" rx="15" ry="9" fill="#F6B8C6"/>
 <path d="M134,170 Q150,184 166,170" fill="none" stroke="#2E3F6E" stroke-width="5" stroke-linecap="round"/>
 <g class="armL"><rect x="14" y="150" width="84" height="34" rx="17" fill="#F4EBD3" stroke="#2E3F6E" stroke-width="8"/><path d="M42,154 l-6,26 M64,154 l-6,26" stroke="#E3D5B5" stroke-width="4" stroke-linecap="round"/></g>
 <g class="armR"><rect x="202" y="150" width="84" height="34" rx="17" fill="#F4EBD3" stroke="#2E3F6E" stroke-width="8"/><path d="M236,154 l6,26 M258,154 l6,26" stroke="#E3D5B5" stroke-width="4" stroke-linecap="round"/></g>
</g></svg>`;
const Guest={kind:null,t:0,
  show(kind="mumbles"){this.kind=kind;$("#guestArt").innerHTML=MUMBLES_SVG;$("#actors").classList.add("withGuest");this.pose("rise",1000);},
  hide(){this.kind=null;$("#actors").classList.remove("withGuest");$("#gsay").classList.remove("on");},
  el(){return $("#guestArt svg");},
  pose(p,ms){const g=this.el();if(!g)return;g.classList.remove("idle","wave","dance","think","rise","sneeze","hop");g.classList.add(p);if(ms)setTimeout(()=>{const x=this.el();if(x&&x.classList.contains(p)){x.classList.remove(p);x.classList.add("idle");}},ms);},
  unravel(){const g=this.el();if(!g)return;SFX.fwip();g.classList.add("ravel");setTimeout(()=>{const x=this.el();if(x){x.classList.remove("ravel");SFX.tap();}},2600);},
  say(text,{sfx=true,ms=3400,pose="hop"}={}){if(!this.kind)return;const b=$("#gsay");b.textContent=text;b.classList.add("on");clearTimeout(this.t);this.t=setTimeout(()=>b.classList.remove("on"),ms);
    if(sfx)SFX.mmmf();if(pose)this.pose(pose,pose==="think"?2600:900);return sleep(Math.min(ms,1500));}
};
/* Mumbles' sounds: all synthesised, no audio files */
function noise(dur){const c=ac();if(!c)return null;const n=Math.floor(c.sampleRate*dur),b=c.createBuffer(1,n,c.sampleRate),d=b.getChannelData(0);for(let i=0;i<n;i++)d[i]=Math.random()*2-1;const s=c.createBufferSource();s.buffer=b;return s;}
Object.assign(SFX,{
  creak(){const c=ac();if(!c)return;const t=c.currentTime,o=c.createOscillator(),g=c.createGain(),lp=c.createBiquadFilter(),lfo=c.createOscillator(),lg=c.createGain();
    o.type="sawtooth";o.frequency.setValueAtTime(70,t);o.frequency.linearRampToValueAtTime(115,t+.9);o.frequency.linearRampToValueAtTime(82,t+1.4);
    lfo.frequency.value=23;lg.gain.value=9;lfo.connect(lg).connect(o.frequency);lp.type="lowpass";lp.frequency.value=900;
    g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(.06,t+.12);g.gain.setValueAtTime(.06,t+1.2);g.gain.linearRampToValueAtTime(0,t+1.5);
    o.connect(lp).connect(g).connect(c.destination);o.start(t);lfo.start(t);o.stop(t+1.55);lfo.stop(t+1.55);},
  mmmf(){const c=ac();if(!c)return;const t=c.currentTime,o=c.createOscillator(),g=c.createGain(),lp=c.createBiquadFilter(),v=c.createOscillator(),vg=c.createGain();
    o.type="triangle";o.frequency.setValueAtTime(150,t);o.frequency.linearRampToValueAtTime(190,t+.18);o.frequency.linearRampToValueAtTime(140,t+.5);
    v.frequency.value=7;vg.gain.value=10;v.connect(vg).connect(o.frequency);lp.type="lowpass";lp.frequency.value=520;
    g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(.16,t+.05);g.gain.setValueAtTime(.16,t+.4);g.gain.linearRampToValueAtTime(0,t+.56);
    o.connect(lp).connect(g).connect(c.destination);o.start(t);v.start(t);o.stop(t+.6);v.stop(t+.6);},
  fwip(){const c=ac(),s=noise(.22);if(!s)return;const t=c.currentTime,f=c.createBiquadFilter(),g=c.createGain();f.type="bandpass";f.Q.value=3;
    f.frequency.setValueAtTime(600,t);f.frequency.exponentialRampToValueAtTime(5200,t+.18);g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(.3,t+.04);g.gain.exponentialRampToValueAtTime(.001,t+.22);
    s.connect(f).connect(g).connect(c.destination);s.start(t);},
  dust(){const c=ac(),s=noise(.5);if(!s)return;const t=c.currentTime,f=c.createBiquadFilter(),g=c.createGain();f.type="lowpass";f.frequency.value=1200;
    g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(.22,t+.03);g.gain.exponentialRampToValueAtTime(.001,t+.45);s.connect(f).connect(g).connect(c.destination);s.start(t);},
  heartbeat(n=2){for(let i=0;i<n;i++){const d=i*.8;tone(62,d,.35,.06);tone(124,d,.08,.04,"triangle");tone(56,d+.2,.28,.06);tone(112,d+.2,.06,.04,"triangle");}},
  squelch(){const c=ac();if(!c)return;const t=c.currentTime,o=c.createOscillator(),g=c.createGain();o.type="triangle";o.frequency.setValueAtTime(260,t);o.frequency.exponentialRampToValueAtTime(70,t+.35);g.gain.setValueAtTime(.2,t);g.gain.exponentialRampToValueAtTime(.001,t+.4);o.connect(g).connect(c.destination);o.start(t);o.stop(t+.42);},
  tick(){SFX.kal(784,0,.12);SFX.kal(1047,.08,.08);}
});

/* ================= small organ pictures (same pastel colours as the map) ================= */
const OC={brain:"#CDB4EE",windpipe:"#9DC3E6",lungs:"#F4A6A6",heart:"#E0455F",diaphragm:"#F29E4C",gullet:"#E58FB0",stomach:"#F27BA0",liver:"#C98A6B",kidneys:"#D9867B",smallint:"#F9D27A",largeint:"#9CC27A",bladder:"#9DC3E6",rectum:"#9CC27A",skin:"#F6C9A0"};
const SW=`stroke="#2E3F6E" stroke-width="3" stroke-linejoin="round"`;
const HEART_D="M30,50 C8,36 6,16 18,12 C24,10 28,13 30,18 C32,13 36,10 42,12 C54,16 52,36 30,50Z";
const IC={
  brain:`<ellipse cx="30" cy="30" rx="24" ry="19" fill="${OC.brain}" ${SW}/><path d="M30,12 V48 M16,24 q6,4 0,10 M44,24 q-6,4 0,10 M22,40 q4,-4 8,0 M38,40 q-4,-4 -8,0" fill="none" stroke="#8E6CC9" stroke-width="2.5" stroke-linecap="round"/>`,
  heart:`<path d="${HEART_D}" fill="${OC.heart}" ${SW}/><path d="M18,20 q2,-5 7,-4" stroke="#fff" stroke-width="3" fill="none" stroke-linecap="round"/>`,
  lungs:`<rect x="27" y="4" width="6" height="22" rx="3" fill="${OC.windpipe}" ${SW}/><ellipse cx="18" cy="36" rx="12" ry="18" fill="${OC.lungs}" ${SW}/><ellipse cx="42" cy="36" rx="12" ry="18" fill="${OC.lungs}" ${SW}/>`,
  gullet:`<path d="M26,4 h8 v34 q0,10 10,14 l-4,6 q-14,-6 -14,-20Z" fill="${OC.gullet}" ${SW}/>`,
  stomach:`<path d="M20,8 h8 v10 q22,-4 24,18 q2,20 -20,20 q-16,0 -18,-10 q12,4 18,-2 q6,-6 -2,-12 q-10,-4 -10,-10Z" fill="${OC.stomach}" ${SW}/>`,
  smallint:`<circle cx="30" cy="30" r="22" fill="${OC.smallint}" ${SW}/><path d="M16,24 q7,-8 14,0 t14,0 M16,36 q7,-8 14,0 t14,0" fill="none" stroke="#C9952E" stroke-width="3" stroke-linecap="round"/>`,
  largeint:`<path d="M14,52 V16 q0,-6 6,-6 h20 q6,0 6,6 v34" fill="none" stroke="#2E3F6E" stroke-width="14" stroke-linecap="round" stroke-linejoin="round"/><path d="M14,52 V16 q0,-6 6,-6 h20 q6,0 6,6 v34" fill="none" stroke="${OC.largeint}" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"/>`,
  liver:`<path d="M6,24 q24,-14 50,-6 q-2,24 -26,32 q-22,0 -24,-26Z" fill="${OC.liver}" ${SW}/>`,
  kidneys:`<path d="M10,14 q12,-6 14,10 q-6,4 0,10 q-2,16 -14,10 q-8,-12 0,-30Z" fill="${OC.kidneys}" ${SW}/><path d="M50,14 q-12,-6 -14,10 q6,4 0,10 q2,16 14,10 q8,-12 0,-30Z" fill="${OC.kidneys}" ${SW}/>`,
  bladder:`<path d="M30,52 q-20,0 -20,-20 q0,-20 20,-20 q20,0 20,20 q0,20 -20,20Z" fill="${OC.bladder}" ${SW}/><rect x="26" y="50" width="8" height="8" rx="3" fill="${OC.bladder}" ${SW}/>`,
  rectum:`<path d="M10,8 h40 v10 h-14 v30 q0,6 -6,6 q-6,0 -6,-6 v-30 h-14Z" fill="${OC.rectum}" ${SW}/>`
};
const icon=k=>IC[k]?`<svg class="oi" viewBox="0 0 60 60" aria-hidden="true">${IC[k]}</svg>`:k;

/* ================= helpers ================= */
const shuffle=a=>{a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;};
function kmatch(alts,keys){if(!alts||!keys)return false;if(heardAny(alts,keys))return true;
  return alts.some(a=>keys.some(k=>/^\d+$/.test(k)&&new RegExp("(^|\\D)"+k+"(\\D|$)").test(a)));}
function micRow(){return canHear()?`<div class="row"><button class="tbtn" id="noMic">Celly can't hear me</button></div>`:"";}
function noMicTap(){const nm=$("#noMic");if(nm&&!nm.onclick)nm.onclick=()=>{if(S.cancelHear)S.cancelHear();setMode("tap");nm.remove();};}
const tapOrSay=()=>canHear()?"Tap, or say it.":"Tap your answer.";
/* one question, several answers. Tap, or say a key word. Returns true if right first time. */
/* Celly reads the answer choices aloud (recorded lines in window.OPTV), each button lights up as she reads it */
function optKey(h){const d=document.createElement("div");d.innerHTML=h;return d.textContent.replace(/^[^A-Za-z0-9]+/,"").replace(/\s+/g," ").trim();}
async function readOpts(btns,texts){if(S.mute||!window.OPTV)return;const tok=S.token;S.speaking=true;Celly.setPose("talk");
  for(let k=0;k<btns.length;k++){if(tok!==S.token||!btns[k].isConnected||btns[k].onclick===null)break;const id=window.OPTV[optKey(texts[k])];if(!id)continue;
    btns[k].classList.add("reading");await clipLine(id,tok);btns[k].classList.remove("reading");if(tok===S.token)await sleep(250);}
  if(tok===S.token){S.speaking=false;Mic.muteUntil=performance.now()+450;Celly.mouth(0);Celly.setPose("idle");}}
function remember(ask,btns,texts){S.lastOpts={key:[].concat(ask||[]).join("|"),btns,texts};}
function choose(opts,{ask=null,wrong="match_wrong",into="#opts",grid=false,onRight=null}={}){return new Promise(async res=>{noMicTap();
  const box=$(into);box.innerHTML=grid?`<div class="pick">${opts.map((o,k)=>`<button data-k="${k}"><span class="e">${o.e?icon(o.e):""}</span>${o.t}</button>`).join("")}</div>`
    :`<div class="opts">${opts.map((o,k)=>`<button class="opt" data-k="${k}">${o.e?`<span class="oe">${icon(o.e)}</span> `:""}${o.t}</button>`).join("")}</div>`;
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
/* a picture grid where every right card must be found (need = how many to find before the rest light up) */
function pickMany(T,{ask=null,wrong="team_wrong",need=null,into="#opts",onRight=null}={}){return new Promise(async res=>{noMicTap();
  const box=$(into);box.innerHTML=`<div class="pick">${T.map((o,k)=>`<button data-k="${k}"><span class="e">${icon(o.e)}</span>${o.t}</button>`).join("")}</div>`;
  const btns=[...box.querySelectorAll("button")];let left=need??T.filter(t=>t.ok).length,wrongN=0,busy=false,fin=false;
  const pickK=async k=>{const o=T[k],b=btns[k];if(busy||fin||b.classList.contains("right"))return;busy=true;ac();
    if(o.ok){b.classList.add("right");SFX.sparkle();const c=centre(b);confetti(c.x,c.y,20);left--;if(o.line)await say(o.line,{face:"happy"});if(onRight)await onRight(o);}
    else{wrongN++;b.classList.remove("wrong");void b.offsetWidth;b.classList.add("wrong");SFX.oops();if(o.no)await o.no();else await say(wrong,{face:"oops"});}
    busy=false;if(left<=0){fin=true;if(S.cancelHear)S.cancelHear();btns.forEach((x,i)=>{x.onclick=null;if(T[i].ok)x.classList.add("right");});res(wrongN===0);}else listen();};
  btns.forEach((b,k)=>b.onclick=()=>pickK(k));
  const listen=async()=>{if(fin||!canHear())return;const got=await hear(12000,a=>{for(let k=0;k<T.length;k++)if(!btns[k].classList.contains("right")&&kmatch(a,T[k].keys))return k+1;return null;});
    if(!fin&&got.ok)pickK(got.val-1);};
  if(ask)await say(ask,{face:"normal"});listen();});}
/* put cards in order. Each slot can show a hint letter (the mnemonic). Returns true if no mistakes. */
function orderTiles(items,{ask=null,wrong="notyet",hint=null,after=null}={}){return new Promise(async res=>{noMicTap();
  let order;do{order=shuffle(items.map((x,k)=>k));}while(order.every((v,k)=>v===k));
  $("#order").innerHTML=`${hint?`<p class="trick">${hint}</p>`:""}<ol class="oslots" id="oslots">${items.map((it,k)=>`<li><b class="ol">${it.l||k+1}</b><span class="ot"></span></li>`).join("")}</ol>
    <div class="otiles" id="otiles">${order.map(k=>`<button class="tile wtile" data-k="${k}">${items[k].t}</button>`).join("")}</div>`;
  let pos=0,mistakes=0,busy=false,fin=false;
  const tryK=async k=>{if(busy||fin)return;const b=$(`#otiles [data-k="${k}"]`);if(!b||b.classList.contains("used"))return;ac();
    if(items[k].t===items[pos].t){busy=true;b.classList.add("used");const li=$("#oslots").children[pos];li.querySelector(".ot").textContent=items[pos].t;li.classList.add("filled");SFX.tap();
      const it=items[pos];pos++;if(pos===items.length){fin=true;if(S.cancelHear)S.cancelHear();}
      if(it.line)await say(it.line,{face:"happy"});if(after)await after(it);busy=false;if(fin)res(mistakes===0);else listen();}
    else{mistakes++;b.classList.remove("shake");void b.offsetWidth;b.classList.add("shake");SFX.oops();busy=true;await say(wrong,{face:"oops"});busy=false;listen();}};
  $("#otiles").querySelectorAll("button").forEach(b=>b.onclick=()=>tryK(+b.dataset.k));
  const listen=async()=>{if(fin||!canHear())return;const got=await hear(12000,a=>kmatch(a,items[pos].keys)?pos+1:null);if(!fin&&got.ok)tryK(got.val-1);};
  if(ask)await say(ask,{face:"normal"});listen();});}
/* tap a part of a picture (body map, plant, chart). accept(o) says if the tapped part is right. */
function tapPart(box,accept,{wrong="map_wrong",keys=[]}={}){return new Promise(res=>{
  const root=$(box);let wrongN=0,fin=false,busy=false;
  const done=o=>{if(fin)return;fin=true;root.onclick=null;if(S.cancelHear)S.cancelHear();res({first:wrongN===0,o});};
  root.onclick=async e=>{const t=e.target.closest("[data-o]");if(!t||fin||busy)return;ac();const o=t.dataset.o;
    if(accept(o))done(o);else{wrongN++;SFX.oops();busy=true;await say(wrong,{face:"oops"});busy=false;listen();}};
  const listen=async()=>{if(fin||!canHear()||!keys.length)return;const got=await hear(12000,a=>kmatch(a,keys)?1:null);if(!fin&&got.ok)done(null);};
  listen();});}
const YES=["yes","yeah","yep","right","true","correct"],NO=["no","nope","wrong","not","false","isn't","never"];

/* ================= the Body Town map ================= */
const ORG={/* name, label lines, label side and y, leader-line end */
  brain:{n:"brain",lab:["brain"],side:"R",y:46,to:[244,46]},
  skin:{n:"skin",lab:["skin"],side:"L",y:150,to:[112,158]},
  windpipe:{n:"windpipe",lab:["windpipe"],side:"L",y:112,to:[206,128]},
  lungs:{n:"lungs",lab:["lungs"],side:"L",y:196,to:[150,204]},
  heart:{n:"heart",lab:["heart"],side:"R",y:224,to:[244,226]},
  diaphragm:{n:"diaphragm",lab:["diaphragm"],side:"R",y:270,to:[272,268]},
  gullet:{n:"gullet",lab:["gullet"],side:"L",y:244,to:[206,244]},
  liver:{n:"liver",lab:["liver"],side:"L",y:300,to:[156,304]},
  stomach:{n:"stomach",lab:["stomach"],side:"R",y:316,to:[256,314]},
  kidneys:{n:"kidneys",lab:["kidneys"],side:"L",y:346,to:[136,346]},
  largeint:{n:"large intestine",lab:["large","intestine"],side:"L",y:388,to:[164,388]},
  smallint:{n:"small intestine",lab:["small","intestine"],side:"R",y:372,to:[234,380]},
  bladder:{n:"bladder",lab:["bladder"],side:"R",y:432,to:[226,436]}};
const FOUND=new Set();
function bodyMap(){
  const o=(k,inner)=>`<g class="org${FOUND.has(k)?" found":""}" data-o="${k}" id="o-${k}">${inner}</g>`;
  const fill=k=>`fill="${OC[k]}" stroke="#2E3F6E" stroke-width="3"`;
  const labels=Object.entries(ORG).filter(([k])=>k!=="skin").map(([k,v])=>labelSvg(k,v)).join("")+labelSvg("skin",ORG.skin);
  return `<svg id="bodysvg" viewBox="-14 0 448 486" role="img" aria-label="A map of Body Town: the human body and its organs">
  <g class="org skin${FOUND.has("skin")?" found":""}" data-o="skin" id="o-skin">
   <path class="skinp" d="M196,94 L196,116 Q150,118 128,136 Q110,150 106,182 L94,300 Q92,318 106,320 Q118,320 118,302 L128,206 L128,446 L132,480 L200,480 L206,456 L214,456 L220,480 L288,480 L292,446 L292,206 L302,302 Q302,320 314,320 Q328,318 326,300 L314,182 Q310,150 292,136 Q270,118 224,116 L224,94Z" stroke="#2E3F6E" stroke-width="5" stroke-linejoin="round"/>
   <circle class="skinp" cx="210" cy="56" r="42" stroke="#2E3F6E" stroke-width="5"/></g>
  ${o("brain",`<ellipse cx="210" cy="48" rx="29" ry="21" ${fill("brain")}/><path d="M210,30 V66 M196,42 q6,4 0,10 M224,42 q-6,4 0,10" fill="none" stroke="#8E6CC9" stroke-width="2.5" stroke-linecap="round"/>`)}
  ${o("windpipe",`<rect x="203" y="98" width="14" height="74" rx="6" ${fill("windpipe")}/><path d="M203,112 h14 M203,126 h14 M203,140 h14 M203,154 h14" stroke="#2E3F6E" stroke-width="1.5"/>`)}
  ${o("lungs",`<ellipse cx="172" cy="210" rx="32" ry="48" ${fill("lungs")}/><ellipse cx="248" cy="210" rx="32" ry="48" ${fill("lungs")}/>`)}
  ${o("gullet",`<rect x="205" y="174" width="10" height="114" rx="5" ${fill("gullet")}/>`)}
  ${o("heart",`<path transform="translate(204,198) scale(.9)" d="${HEART_D}" ${fill("heart")}/>`)}
  ${o("diaphragm",`<path d="M138,270 Q210,236 282,270 L282,282 Q210,250 138,282Z" ${fill("diaphragm")}/>`)}
  ${o("liver",`<path d="M138,288 Q176,278 212,292 Q204,324 166,332 Q140,328 138,288Z" ${fill("liver")}/>`)}
  ${o("stomach",`<path d="M210,290 Q248,280 268,300 Q276,330 246,338 Q226,340 220,326 Q236,322 236,310 Q226,300 210,300Z" ${fill("stomach")}/>`)}
  ${o("kidneys",`<ellipse cx="142" cy="348" rx="11" ry="19" ${fill("kidneys")} stroke-dasharray="6 4"/><ellipse cx="278" cy="348" rx="11" ry="19" ${fill("kidneys")} stroke-dasharray="6 4"/>`)}
  ${o("largeint",`<path d="M166,424 L160,356 Q160,344 174,344 L246,344 Q258,344 258,356 L254,424" fill="none" stroke="#2E3F6E" stroke-width="17" stroke-linecap="round" stroke-linejoin="round"/><path class="li" d="M166,424 L160,356 Q160,344 174,344 L246,344 Q258,344 258,356 L254,424" fill="none" stroke="${OC.largeint}" stroke-width="11" stroke-linecap="round" stroke-linejoin="round"/>`)}
  ${o("smallint",`<rect x="178" y="358" width="64" height="56" rx="22" ${fill("smallint")}/><path d="M186,374 q6,-8 12,0 t12,0 t12,0 t12,0 M186,390 q6,-8 12,0 t12,0 t12,0 t12,0" fill="none" stroke="#C9952E" stroke-width="2.5" stroke-linecap="round"/>`)}
  ${o("bladder",`<ellipse cx="210" cy="438" rx="19" ry="15" ${fill("bladder")}/>`)}
  <g id="labs">${labels}</g></svg>`;}
function labelSvg(k,v){const L=v.side==="L",x=L?114:306,lh=19,y0=v.y-(v.lab.length-1)*lh/2;
  const ex=L?x+4:x-4;
  return `<g class="olab${FOUND.has(k)?" on":""}" id="l-${k}"><line x1="${ex}" y1="${v.y-5}" x2="${v.to[0]}" y2="${v.to[1]}" stroke="#2E3F6E" stroke-width="2"/><circle cx="${v.to[0]}" cy="${v.to[1]}" r="3.5" fill="#2E3F6E"/>
   <text x="${x}" y="${y0}" text-anchor="${L?"end":"start"}">${v.lab.map((t,i)=>`<tspan x="${x}" dy="${i?lh:0}">${t}</tspan>`).join("")}</text></g>`;}
function light(k){FOUND.add(k);const g=$("#o-"+k),l=$("#l-"+k);if(g){g.classList.add("found","glow");setTimeout(()=>g.classList.remove("glow"),1600);}if(l)l.classList.add("on");}
const MAPKEYS={brain:["brain","head"],skin:["skin","everywhere","all over"],windpipe:["windpipe","wind pipe","trachea","neck"],lungs:["lung","lungs"],heart:["heart"],diaphragm:["diaphragm","diafram","dia from"],
  liver:["liver","river"],kidneys:["kidney","kidneys","back"],bladder:["bladder","blather"]};
async function findOrgan(k,{find,job,extra=[]}){
  await say(find,{face:"normal"});
  const r=await tapPart("#mapbox",o=>k==="skin"?true:o===k,{keys:["here","there","this one","found it",...(MAPKEYS[k]||[])]});
  light(k);SFX.sparkle();const g=$("#o-"+k);if(g){const c=centre(g);confetti(c.x,c.y,26);}
  rec(TRAIL[S.step],"where the "+ORG[k].n+" is",r.first,null);
  return r.first;}

/* ================= start: welcome to Body Town ================= */
function start(){
  trail(0);
  show(`<h1>The Body Town Tour</h1><p>Every organ in your body is a building in Body Town. Celly is your tour guide! Talk to her, or tap. It goes with the 7Ab Organs video.</p>
  <div class="row"><button class="big go" id="go">Start the tour</button></div>
  <details class="note"><summary>For the grown-up</summary><p>Use Chrome or Edge. When the browser asks for the microphone, choose “Allow while visiting the site”. It asks once.
  Your child's voice is turned into text by the browser (Google in Chrome, Microsoft in Edge). This page does not record or keep anything. It takes about 15 minutes, with a brain break in the middle.</p></details>`,0);
  $("#say").textContent="Hello, scientist! Press the button to start the tour.";
  Celly.pose("wave",1800);
  $("#go").onclick=async()=>{ac();loadSprite();S.started=true;if(canHear())Mic.start();S.step=0;
    show(`<h2>Welcome to Body Town</h2><div class="patient"><span class="e">🏘️</span><div>Every <b>organ</b> is a building. The brain is the town hall. The heart is the pumping station.</div></div>`,0);
    await say("hello",{face:"happy",pose:"talk wave"});
    SFX.creak();Celly.face("surprised");await sleep(900);await say("creak",{face:"surprised"});
    SFX.creak();Guest.show();await sleep(1000);SFX.dust();await Guest.say("Mmmf! Where am I? Is it lunchtime?");
    await say("mumbles_in",{face:"happy"});
    if(canHear()){
      show(`<h2>Mic check</h2><p>Say: <b>“Hello, Mumbles!”</b></p>${micRow()}`,0);
      let noMic=false;const skip=new Promise(r=>$("#noMic").onclick=()=>{noMic=true;stopVoice();if(S.cancelHear)S.cancelHear();r();});
      await say("miccheck");
      const got=noMic?{ok:false}:await Promise.race([hear(7000,a=>a[0].length>0),skip.then(()=>({ok:false}))]);
      if(got&&got.ok){SFX.sparkle();Guest.say("MMMF! Hello!");Guest.unravel();await say("heardyou",{face:"happy"});}
      else await say("nohear",{face:"normal"});
    }else await say("tapmode",{face:"happy"});
    egypt();};
}

/* ================= 1 · wake up, Mumbles! ================= */
async function egypt(){S.step=0;
  show(`<h2>Wake up, Mumbles!</h2><p>When Mumbles became a mummy, they threw one organ away. Which one? <span class="muted">${tapOrSay()}</span></p><div id="opts"></div>${micRow()}`,0);
  const first=await choose(shuffle([{t:"heart",e:"heart",keys:["heart"]},{t:"brain",e:"brain",ok:1,keys:["brain","brains"]},
    {t:"toes",e:"🦶",keys:["toe","toes","feet","foot"],no:async()=>{Guest.say("My heart says… the toes? No? My toes are fine, thank you.",{ms:4200});await say("egypt_wrong",{face:"oops"});}}]),
    {ask:"egypt_q",wrong:"egypt_wrong",grid:true});
  rec("Wake up, Mumbles!","the Egyptians threw the brain away",first,null);
  await say("egypt_ans",{face:"surprised"});await say("egypt_why",{face:"normal"});
  await Guest.say("My heart says I'm very clever. Wait…",{pose:"think"});
  await say("mumbles_heart",{face:"happy"});
  show(`<h2>Brain or heart?</h2><div class="sortcard"><span class="oe">${icon("brain")}</span> brain = the town hall</div><p>The brain <b>controls</b> the body.</p><div id="move"></div>`,0);
  await say("brain_fact",{face:"normal"});
  $("#move").innerHTML=`<div class="move">🙆 Touch your head.<br>🫶 Now touch your heart.</div>`;
  await say("touch",{face:"happy"});await sleep(1500);SFX.heartbeat();
  await say("heart_job",{face:"happy"});
  show(`<h2>The big question</h2><div class="move">What do <b>organs</b> do?</div>`,0);
  await say("question",{face:"think"});await sleep(600);
  words();
}

/* ================= 2 · word workshop ================= */
const WORDS={
  organ:{w:"organ",syl:["or","gan"],mean:"w_organ",col:OC.brain,ok:["organ","organs","oregon","or gan","organic"]},
  function:{w:"function",syl:["func","tion"],mean:"w_function",col:OC.diaphragm,ok:["function","functions","funk shun","func tion"]},
  diaphragm:{w:"diaphragm",syl:["di","a","phragm"],tile:{phragm:'phra<span class="sil">g</span>m'},mean:"w_diaphragm",col:OC.diaphragm,ok:["diaphragm","diaphragms","diafram","dia from","diaphram"]},
  intestine:{w:"intestine",syl:["in","tes","tine"],mean:"w_intestine",col:OC.smallint,ok:["intestine","intestines","in testing","in tess tin","intestin"]},
  photosynthesis:{w:"photosynthesis",syl:["pho","to","syn","the","sis"],mean:"w_photosynthesis",col:"#5DAA4E",ok:["photosynthesis","photo synthesis","photosynthesise","photosynthesize"]},
  diagnosis:{w:"diagnosis",syl:["di","ag","no","sis"],mean:"w_diagnosis",col:OC.windpipe,ok:["diagnosis","diagnose","diagnoses","dia gnosis","diag nosis"]}
};
async function words(){S.step=1;
  show(`<h2>Word workshop</h2><p class="muted">Tour guides need the right words.</p>`,1);
  await watch("media/clip_organ.mp4","Organ and function, from the 7Ab Organs video");
  show(`<h2>Word workshop</h2><div class="patient"><span class="e">🏛️</span><div><b>organ</b> = a large part of a plant or animal, with an important job.<br><span class="muted">It is made of different tissues, working together.</span></div></div>
   <div class="patient"><span class="e">🔧</span><div><b>function</b> = job</div></div>`,1);
  await say("organ_def",{face:"normal"});await say("tissues",{face:"normal"});await say("func_means",{face:"happy"});
  await Guest.say("My function is being spooky!");
  await say("buildintro",{face:"happy"});
  const list=["organ","function","diaphragm","intestine"];
  for(let i=0;i<list.length;i++)await buildWord(WORDS[list[i]],`${i+1} of ${list.length}`);
  await say("wordsdone",{face:"happy",pose:"dance"});Celly.setPose("idle");
  mapUp();
}
async function buildWord(W,label){
  const T=s=>(W.tile&&W.tile[s])||s;
  let order;do{order=W.syl.map((s,k)=>k).sort(()=>Math.random()-.5);}while(order.every((v,k)=>v===k));
  show(`<h2>Build the word · ${label}</h2>
   <div class="meaning"><span class="swatch" style="background:${W.col}"></span><p>${window.LINES[W.mean]}</p></div>
   <div class="slots" id="slots">${W.syl.map(()=>'<div class="slot"></div>').join("")}</div>
   <div class="tiles" id="tiles">${order.map(k=>`<button class="tile" data-k="${k}">${T(W.syl[k])}</button>`).join("")}</div><div id="more"></div>`,S.step);
  say([W.mean,"tapbeats"],{face:"normal"});
  let pos=0,mistakes=0;
  await new Promise(done=>card.querySelectorAll(".tile").forEach(b=>b.onclick=()=>{ac();const k=+b.dataset.k;
    if(W.syl[k]===W.syl[pos]&&!b.classList.contains("used")){b.classList.add("used");const s=$("#slots").children[pos];s.innerHTML=T(W.syl[pos]);s.classList.add("filled");SFX.tap();say("s_"+W.syl[pos],{face:"keep"});pos++;if(pos===W.syl.length)done();}
    else{mistakes++;b.classList.remove("shake");void b.offsetWidth;b.classList.add("shake");SFX.oops();say("notyet",{face:"oops"});}}));
  Celly.face("happy");Celly.pose("happy",900);SFX.chime();
  $("#tiles").outerHTML=`<div class="wordshow">${W.syl.map(T).join("")}</div>`;
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
  rec("Build the word",W.w,mistakes===0,said);
}

/* ================= 3 · the Body Town map: upstairs ================= */
async function mapUp(){S.step=2;
  show(`<h2>The Body Town map: upstairs</h2><div class="mapbox" id="mapbox">${bodyMap()}</div><p class="taphint" id="hint">👆 Find each building on the map.</p>`,2);
  await say("map_intro",{face:"happy"});
  await findOrgan("brain",{find:"f_brain"});await say("j_brain",{face:"happy"});
  await findOrgan("skin",{find:"f_skin"});await say("j_skin",{face:"surprised"});await say("j_skin2",{face:"normal"});
  await findOrgan("windpipe",{find:"f_windpipe"});await say("j_windpipe",{face:"normal"});
  await findOrgan("lungs",{find:"f_lungs"});SFX.dust();await Guest.say("Achoo! Sorry. Very old dust.",{pose:"sneeze"});Guest.unravel();await say("j_lungs",{face:"normal"});
  await findOrgan("heart",{find:"f_heart"});SFX.heartbeat();await Guest.say("Ba-dum! Ba-dum! (That's me saying it.)");await say("j_heart",{face:"happy"});await say("heart_where",{face:"normal"});
  await findOrgan("diaphragm",{find:"f_diaphragm"});await say("j_diaphragm",{face:"normal"});
  SFX.chime();await say("map_done",{face:"happy",pose:"dance"});Celly.setPose("idle");
  lunch();
}

/* ================= 4 · follow your lunch ================= */
const GSSL=[{t:"gullet",l:"G",line:"g_gullet",o:"gullet",keys:["gullet","oesophagus","esophagus"]},{t:"stomach",l:"S",line:"g_stomach",o:"stomach",keys:["stomach","tummy"]},
  {t:"small intestine",l:"S",line:"g_small",o:"smallint",keys:["small"]},{t:"large intestine",l:"L",line:"g_large",o:"largeint",keys:["large","big"]}];
const JOBS=[{o:"brain",t:"brain",j:"controls the body",keys:["control","controls"]},{o:"heart",t:"heart",j:"pumps blood",keys:["pump","pumps"]},{o:"lungs",t:"lungs",j:"gets oxygen into your blood",keys:["oxygen","air"]},
  {o:"stomach",t:"stomach",j:"breaks up food",keys:["break","breaks"]},{o:"smallint",t:"small intestine",j:"absorbs food into your blood",keys:["absorb","absorbs"]},{o:"liver",t:"liver",j:"makes, destroys and stores substances",keys:["make","makes","destroy","store","substance"]}];
async function lunch(){S.step=3;
  show(`<h2>Follow your lunch</h2><p class="muted">Downstairs in Body Town.</p>`,3);
  Guest.say("I haven't had a snack for thousands of years!",{ms:3800});
  await watch("media/clip_lunch.mp4","Follow your lunch, from the 7Ab Organs video","lunch_intro");
  show(`<h2>Good Snacks Stay Long</h2><div id="order"></div>`,3);
  await say("gssl",{face:"happy"});
  const first=await orderTiles(GSSL,{ask:"gssl_order",wrong:"gssl_wrong",hint:"<b>G</b>ood <b>S</b>nacks <b>S</b>tay <b>L</b>ong",after:async it=>{if(it.o==="stomach")SFX.squelch();}});
  rec("Follow your lunch","the food path: gullet, stomach, small intestine, large intestine",first,null);
  SFX.chime();confetti();
  show(`<h2>The Body Town map: downstairs</h2><div class="mapbox" id="mapbox">${bodyMap()}</div><p class="taphint">👆 Find each building on the map.</p>`,3);
  for(const g of GSSL){await sleep(350);light(g.o);SFX.pop();}
  await say("nutrition",{face:"happy"});
  await findOrgan("liver",{find:"f_liver"});await say("j_liver",{face:"normal"});
  await findOrgan("kidneys",{find:"f_kidneys"});await say("j_kidneys",{face:"normal"});
  card.insertAdjacentHTML("beforeend",`<div class="move" id="kmove">🙌 Hands on your back, just above your waist.</div>`);
  await say("kidney_touch",{face:"happy"});await sleep(1200);$("#kmove").remove();
  await findOrgan("bladder",{find:"f_bladder"});await say("j_bladder",{face:"normal"});
  await Guest.say("What is a… toilet?",{pose:"think"});
  await say("match_intro",{face:"happy"});
  let n=0;
  for(const J of shuffle(JOBS)){n++;
    const others=shuffle(JOBS.filter(x=>x!==J)).slice(0,2);
    show(`<h2>Job cards · ${n} of ${JOBS.length}</h2><div class="sortcard"><span class="oe">${icon(J.o)}</span>${J.t}</div><p>What is its job? <span class="muted">${tapOrSay()}</span></p><div id="opts"></div>`,3);
    const f=await choose(shuffle([{t:J.j,ok:1,keys:J.keys},...others.map(o=>({t:o.j,keys:o.keys}))]),{wrong:"match_wrong"});
    await say(praise(),{face:"happy"});rec("Job cards","the "+J.t+" "+J.j,f,null);}
  show(`<h2>Every building visited!</h2><div class="mapbox" id="mapbox">${bodyMap()}</div>`,3);
  SFX.chime();confetti(undefined,undefined,90);
  await say("snack_done",{face:"happy",pose:"dance"});await say("breaktime",{face:"happy"});Celly.setPose("idle");
  brainBreak();
}

/* ================= 5 · brain break: the Mummy Moves ================= */
async function brainBreak(){S.step=4;
  show(`<h2>Brain break: the Mummy Moves</h2><div class="move" id="move">🧍 Stand up!</div><div class="row"><button class="tbtn" id="skipBB">skip the brain break</button></div>`,4);
  let skipped=false;$("#skipBB").onclick=()=>{skipped=true;stopVoice();};
  Guest.say("Mummy Moves! My best dance!",{pose:"dance",ms:3000});
  await say("bb_intro",{face:"happy",pose:"wave"});
  const moves=[["bb_walk","🚶 Walk like a mummy. Stiff legs. Slow steps.","wiggle",2600],["bb_neck","✋ Touch your neck: windpipe!","idle",1800],["bb_chest","🫁 Hands on your chest. Breathe in…","breath",3200],
    ["bb_ribs","😮‍💨 Hands under your ribs: diaphragm. Breathe out…","breath",3200],["bb_kid","🙌 Hands on your back: kidneys!","pump",1800]];
  for(const [id,text,pose,ms] of moves){if(skipped)break;$("#move").textContent=text;if(id==="bb_walk")Guest.pose("dance",ms+2000);
    await say(id,{face:"happy",pose});Celly.setPose(pose);await sleep(ms);Celly.setPose("idle");}
  if(!skipped){$("#move").textContent="⚡ Quick! Touch the organ that does your thinking!";await say("bb_trick",{face:"happy"});await sleep(1500);
    if(!skipped){Guest.say("My heart says… heart!",{pose:"think"});$("#move").textContent="🧠 Your head! (Mumbles touched his heart…)";SFX.tickle();await say("bb_caught",{face:"happy",pose:"dance"});}}
  if(!skipped){$("#move").textContent="🙂 Sit down. Ready!";}
  Celly.setPose("idle");await say("bb_done",{face:"happy"});
  teams();
}

/* ================= 6 · Mrs Gren's organ teams ================= */
const C=(k,t,keys,extra={})=>Object.assign({e:k,t,keys},extra);
async function teams(){S.step=5;
  show(`<h2>Mrs Gren's organ teams</h2><div class="patient"><span class="e">👵</span><div>Organs work in <b>teams</b> for Mrs Gren's life processes.</div></div>`,5);
  await say("teams_intro",{face:"happy"});
  const T=[
    {h:"Respiration: oxygen into the blood",ask:"t_oxygen",ans:"t_oxygen_a",item:"lungs get oxygen into the blood",one:true,cards:[C("lungs","lungs",["lung","lungs"],{ok:1}),C("heart","heart",["heart"]),C("stomach","stomach",["stomach"]),C("kidneys","kidneys",["kidney"])]},
    {h:"Nutrition team",ask:"t_food",ans:"t_food_a",item:"nutrition: gullet, stomach, small intestine",cards:[C("gullet","gullet",["gullet","oesophagus"],{ok:1}),C("stomach","stomach",["stomach"],{ok:1}),C("smallint","small intestine",["small"],{ok:1}),C("largeint","large intestine",["large"]),C("lungs","lungs",["lung"]),C("bladder","bladder",["bladder"])]},
    {h:"Excretion team",ask:"t_waste",ans:"t_waste_a",item:"excretion: kidneys, lungs, liver",cards:[C("kidneys","kidneys",["kidney"],{ok:1}),C("lungs","lungs",["lung"],{ok:1}),C("liver","liver",["liver"],{ok:1}),C("heart","heart",["heart"]),C("brain","brain",["brain"]),C("stomach","stomach",["stomach"])]},
    {h:"Storing waste",ask:"t_store",ans:"t_store_a",item:"bladder and rectum store waste",cards:[C("bladder","bladder",["bladder"],{ok:1}),C("rectum","rectum",["rectum"],{ok:1}),C("kidneys","kidneys",["kidney"]),C("brain","brain",["brain"]),C("heart","heart",["heart"])]},
    {h:"Sensitivity team",ask:"t_sense",ans:"t_sense_a",item:"sense organs: skin, eyes, ears, nose, tongue",need:3,cards:[C("✋","skin",["skin"],{ok:1}),C("👁️","eyes",["eye","eyes"],{ok:1}),C("👂","ears",["ear","ears"],{ok:1}),C("👃","nose",["nose"],{ok:1}),C("👅","tongue",["tongue"],{ok:1}),C("liver","liver",["liver"]),C("stomach","stomach",["stomach"])]}];
  for(const X of T){
    show(`<h2>${X.h}</h2><p>${X.need?`Find <b>3 or more</b>.`:X.one?"Tap the organ.":`Find <b>all ${X.cards.filter(c=>c.ok).length}</b>.`} <span class="muted">${tapOrSay()}</span></p><div id="opts"></div>${micRow()}`,5);
    const first=X.one?await choose(shuffle(X.cards),{ask:X.ask,wrong:"team_wrong",grid:true}):await pickMany(shuffle(X.cards),{ask:X.ask,wrong:"team_wrong",need:X.need});
    if(X.ask==="t_store"){await say(X.ans,{face:"happy"});await Guest.say("Hee hee! Rectum!",{pose:"dance"});}
    else await say(X.ans,{face:"happy"});
    rec("Organ teams",X.item,first,null);}
  /* the whale's new organ */
  show(`<h2>Big news!</h2><div class="patient"><span class="e">🐋</span><div>Scientists found a <b>new organ</b> in a whale's chin.</div></div><div id="opts"></div>`,5);
  await say("whale_intro",{face:"surprised"});await Guest.say("A whale with a CHIN?!",{pose:"hop"});Guest.unravel();
  $("#opts").innerHTML=`<div class="patient"><span class="e">🦐</span><div>It senses tiny <b>krill</b>. Then the whale opens wide. Gulp!</div></div>`;
  await say("whale_job",{face:"happy"});
  show(`<h2>The whale's new organ</h2><p>Sensing krill. Which life process is that? <span class="muted">${tapOrSay()}</span></p><div id="opts"></div>`,5);
  let first=await choose(shuffle([{t:"sensitivity",e:"👀",ok:1,keys:["sensitivity","sensitive","sense","sensing"]},{t:"growth",e:"📏",keys:["growth","grow"]},{t:"excretion",e:"🗑️",keys:["excretion","excrete"]},{t:"reproduction",e:"🐣",keys:["reproduction","reproduce"]}]),{ask:"whale_q",wrong:"match_wrong"});
  await say("whale_a",{face:"happy"});rec("Organ teams","the whale's new organ: sensitivity",first,null);
  show(`<h2>The whale's jaw</h2><p>Which organ tells the jaw to move? <span class="muted">${tapOrSay()}</span></p><div id="opts"></div>`,5);
  first=await choose(shuffle([{t:"brain",e:"brain",ok:1,keys:["brain"]},{t:"heart",e:"heart",keys:["heart"],no:async()=>{Guest.say("My heart says… heart?",{pose:"think"});await say("match_wrong",{face:"oops"});}},{t:"stomach",e:"stomach",keys:["stomach"]}]),{ask:"whale_brain",wrong:"match_wrong",grid:true});
  await say("whale_brain_a",{face:"happy"});rec("Organ teams","the brain controls the jaw",first,null);
  confetti(undefined,undefined,90);await say("teams_done",{face:"happy",pose:"dance"});Celly.setPose("idle");
  park();
}

/* ================= 7 · Body Town Park ================= */
const PLANT_SVG=`<svg id="plantsvg" viewBox="0 0 340 420" role="img" aria-label="A plant with roots, a stem, leaves and a flower, and a little snail">
 <rect x="0" y="300" width="340" height="120" rx="18" fill="#EAD7B4"/><path d="M0,300 H340" stroke="#A9774A" stroke-width="5"/>
 <g class="porg" data-o="roots" id="p-roots"><path d="M170,300 C168,330 150,350 128,372 M170,300 C172,336 186,356 214,378 M170,304 V392 M150,344 l-24,4 M190,350 l22,-6" fill="none" stroke="#C49A6C" stroke-width="7" stroke-linecap="round"/>
  <path d="M170,300 V392 M170,300 C168,330 150,350 128,372 M170,300 C172,336 186,356 214,378" fill="none" stroke="transparent" stroke-width="34"/></g>
 <g class="porg" data-o="stem" id="p-stem"><path d="M170,300 C166,240 176,180 168,110" fill="none" stroke="#2E3F6E" stroke-width="16" stroke-linecap="round"/><path d="M170,300 C166,240 176,180 168,110" fill="none" stroke="#81A63C" stroke-width="10" stroke-linecap="round"/>
  <path d="M170,300 C166,240 176,180 168,110" fill="none" stroke="transparent" stroke-width="34"/></g>
 <g class="porg" data-o="leaves" id="p-leaves"><path d="M170,236 C130,240 100,220 92,196 C124,186 158,200 170,236Z" fill="#5DAA4E" stroke="#2E3F6E" stroke-width="5" stroke-linejoin="round"/><path d="M168,232 L110,202" stroke="#3E7E33" stroke-width="3"/>
  <path d="M172,180 C206,186 238,170 250,144 C214,134 184,150 172,180Z" fill="#5DAA4E" stroke="#2E3F6E" stroke-width="5" stroke-linejoin="round"/><path d="M174,178 L232,150" stroke="#3E7E33" stroke-width="3"/></g>
 <g class="porg" data-o="flower" id="p-flower">${[0,72,144,216,288].map(a=>`<ellipse cx="168" cy="72" rx="15" ry="24" transform="rotate(${a} 168 96)" fill="#F6B8C6" stroke="#2E3F6E" stroke-width="4"/>`).join("")}<circle cx="168" cy="96" r="15" fill="#FBE7A1" stroke="#2E3F6E" stroke-width="4"/></g>
 <g id="plabs" font-size="20"></g>
 <g id="snail" style="transition:transform 1.2s ease-in-out" transform="translate(40,388)"><g transform="scale(.9)">
  <path d="M-22,0 Q-24,-10 -10,-10 L22,-10 Q30,-10 30,-20 L32,-30" fill="#F2DCB4" stroke="#2E3F6E" stroke-width="4" stroke-linejoin="round"/><circle cx="32" cy="-32" r="3" fill="#2E3F6E"/>
  <circle cx="2" cy="-22" r="16" fill="#F29E4C" stroke="#2E3F6E" stroke-width="4"/><path d="M2,-22 m-7,0 a7,7 0 1,1 7,7 a4,4 0 1,1 -4,-4" fill="none" stroke="#C8742A" stroke-width="3"/></g></g>
</svg>`;
const PLANT=[{o:"roots",line:"p_roots",at:[150,360],lab:[222,390,"roots"],keys:["root","roots"]},{o:"stem",line:"p_stem",at:[190,270],lab:[186,282,"stem"],keys:["stem"]},
  {o:"leaves",line:"p_leaves",at:[220,170],lab:[60,252,"leaves"],keys:["leaf","leaves"]},{o:"flower",line:"p_flowers",at:[206,58],lab:[214,40,"flower"],keys:["flower","flowers"]}];
const POTS=`<svg viewBox="0 0 400 230" role="img" aria-label="Two plants: one on a sunny windowsill, one in Mumbles' dark tomb">
 <rect x="8" y="8" width="184" height="214" rx="18" fill="#EAF4FB" stroke="#2E3F6E" stroke-width="5"/><circle cx="54" cy="52" r="22" fill="#FBE7A1" stroke="#F29E4C" stroke-width="5"/>
 <rect x="208" y="8" width="184" height="214" rx="18" fill="#6B6488" stroke="#2E3F6E" stroke-width="5"/><path d="M244,40 h112 M244,60 h112" stroke="#8C84AB" stroke-width="4"/>
 ${[100,300].map((x,i)=>`<g id="pl${i}" style="transition:transform 2.5s,filter 2.5s;transform-box:fill-box;transform-origin:50% 100%"><path d="M${x},186 C${x-2},160 ${x+2},140 ${x},118" stroke="#81A63C" stroke-width="7" fill="none"/>
   <path d="M${x},150 C${x-26},152 ${x-40},138 ${x-42},124 C${x-22},120 ${x-6},132 ${x},150Z M${x},134 C${x+26},136 ${x+40},122 ${x+42},108 C${x+22},104 ${x+6},116 ${x},134Z" fill="#5DAA4E" stroke="#2E3F6E" stroke-width="3"/></g>
   <path d="M${x-30},182 h60 l-8,34 h-44Z" fill="#C98A6B" stroke="#2E3F6E" stroke-width="4" stroke-linejoin="round"/>`).join("")}
 <text x="100" y="30" text-anchor="middle" font-size="17">sunny</text><text x="300" y="30" text-anchor="middle" font-size="17" fill="#fff">dark tomb</text></svg>`;
const REPORT=[{t:"Aim",l:"A",line:"h_aim",keys:["aim"]},{t:"Prediction",l:"P",line:"h_pred",keys:["prediction","predict"]},{t:"Method",l:"M",line:"h_method",keys:["method"]},
  {t:"Results",l:"R",line:"h_results",keys:["result","results"]},{t:"Conclusion",l:"C",line:"h_concl",keys:["conclusion"]},{t:"Evaluation",l:"E",line:"h_eval",keys:["evaluation","evaluate"]}];
async function park(){S.step=6;
  show(`<h2>Body Town Park</h2><div class="plantbox" id="plantbox">${PLANT_SVG}</div><p class="taphint">🐌 <b>R</b>eal <b>S</b>nails <b>L</b>ove <b>F</b>lowers: roots, stem, leaves, flowers</p>`,6);
  await say("park_intro",{face:"happy"});await say("rslf",{face:"happy"});await say("plant_tap",{face:"normal"});
  let allFirst=true;
  for(const P of PLANT){
    const r=await tapPart("#plantbox",o=>o===P.o,{wrong:"plant_wrong",keys:P.keys});allFirst=allFirst&&r.first;
    $("#p-"+P.o).classList.add("found");$("#snail").setAttribute("transform",`translate(${P.at[0]},${P.at[1]})`);SFX.pop();
    $("#plabs").insertAdjacentHTML("beforeend",`<text x="${P.lab[0]}" y="${P.lab[1]}" class="plab">${P.lab[2]}</text>`);
    await say(P.line,{face:"happy"});}
  rec("Body Town Park","plant organs: roots, stem, leaves, flowers",allFirst,null);
  show(`<h2>Which plant organ makes food?</h2><div id="opts"></div>`,6);
  let first=await choose(shuffle([{t:"leaves",e:"🍃",ok:1,keys:["leaf","leaves"]},{t:"roots",e:"🌱",keys:["root","roots","soil"]},{t:"flowers",e:"🌸",keys:["flower","flowers"]}]),{ask:"leaf_q",wrong:"park_wrong",grid:true});
  await say(praise(),{face:"happy"});rec("Body Town Park","leaves make food",first,null);
  await buildWord(WORDS.photosynthesis,"a big one");
  show(`<h2>Photosynthesis</h2><p class="muted">Photo = light. Synthesis = making.</p>`,6);
  await watch("media/clip_photo.mp4","Photosynthesis, from the 7Ab Organs video");
  show(`<h2>The leaf's recipe</h2><p>Pick the <b>3</b> things photosynthesis needs. <span class="muted">${tapOrSay()}</span></p><div id="opts"></div>${micRow()}`,6);
  first=await pickMany(shuffle([{e:"☀️",t:"light",ok:1,line:"r_light",keys:["light","sun","sunlight"]},{e:"💨",t:"carbon dioxide",ok:1,line:"r_co2",keys:["carbon","dioxide","co2"]},
    {e:"💧",t:"water",ok:1,line:"r_water",keys:["water"]},{e:"🏖️",t:"sand",keys:["sand"],no:async()=>{Guest.say("I brought sand! Plants love sand, yes? …No?",{ms:4000});await say("park_wrong",{face:"oops"});}},
    {e:"🌑",t:"darkness",keys:["dark","darkness"]}]),{ask:"recipe",wrong:"park_wrong"});
  rec("Body Town Park","photosynthesis needs light, carbon dioxide and water",first,null);
  /* the experiment */
  show(`<h2>Let's test it!</h2><div class="labbox">${POTS}</div><div class="row" id="ff"></div><div id="opts"></div>`,6);
  await say("expt_intro",{face:"happy"});await Guest.say("Hey! That's my tomb!",{pose:"hop"});
  $("#ff").innerHTML=`<button class="big" id="go">⏩ Fast forward one week</button>`;await waitClick("#go");$("#ff").innerHTML="";SFX.whoosh();
  $("#pl0").style.transform="scale(1.3)";$("#pl1").style.transform="scale(.9) rotate(8deg)";$("#pl1").style.filter="saturate(.15) brightness(1.25)";await sleep(2600);
  first=await choose(shuffle([{t:"the sunny plant",e:"☀️",ok:1,keys:["sun","sunny","window","light"]},{t:"the plant in the dark tomb",e:"🌑",keys:["dark","tomb"]},{t:"they made the same",e:"🟰",keys:["same","both"]}]),{ask:"expt_q",wrong:"park_wrong"});
  await say("expt_a",{face:"happy"});rec("Body Town Park","less light, less food",first,null);
  /* the report */
  show(`<h2>Write it like a scientist</h2><div id="order"></div>`,6);
  await say("report",{face:"normal"});
  first=await orderTiles(REPORT,{ask:"report_order",wrong:"report_wrong",hint:"<b>A</b> <b>P</b>et <b>M</b>ummy <b>R</b>eally <b>C</b>an't <b>E</b>at",after:async it=>{if(it.l==="A")await Guest.say("It's true. I really can't.",{pose:"think"});}});
  rec("Body Town Park","report headings in order",first,null);SFX.chime();
  show(`<h2>Giant leaves</h2><div class="patient"><span class="e">🪷</span><div>A giant water lily leaf can be <b>3 metres</b> across. That is longer than a bed!</div></div>`,6);
  await say("lily",{face:"surprised"});
  show(`<h2>Storage organs</h2><p>Pick the <b>2</b> storage organs. <span class="muted">${tapOrSay()}</span></p><div id="opts"></div>${micRow()}`,6);
  first=await pickMany(shuffle([{e:"🥕",t:"carrot",ok:1,keys:["carrot","carrots"]},{e:"🥔",t:"potato",ok:1,keys:["potato","potatoes"],line:null},{e:"🍃",t:"leaf",keys:["leaf"]},{e:"🌸",t:"flower",keys:["flower"]}]),
    {ask:"store_q",wrong:"park_wrong",onRight:async o=>{if(o.t==="potato")await Guest.say("What is a… potato?",{pose:"think"});}});
  await say("store_a",{face:"happy"});rec("Body Town Park","storage organs: carrot and potato",first,null);
  confetti();await say("park_done",{face:"happy",pose:"dance"});Celly.setPose("idle");
  hospital();
}

/* ================= 8 · Body Town Hospital ================= */
const CHART=[{o:"liver",t:"liver",v:9.5},{o:"heart",t:"heart",v:68.8},{o:"lungs",t:"lungs",v:21.5},{o:"kidneys",t:"kidneys",v:3.2}];
function chartSvg(){const H=210,base=260,max=70;
  return `<svg id="chartsvg" viewBox="0 0 400 340" role="img" aria-label="Bar chart: deaths from organ diseases in the UK, per 100 000 people">
   <line x1="40" y1="${base}" x2="390" y2="${base}" stroke="#2E3F6E" stroke-width="4"/><line x1="40" y1="30" x2="40" y2="${base}" stroke="#2E3F6E" stroke-width="4"/>
   ${CHART.map((c,i)=>{const x=62+i*84,h=Math.max(6,c.v/max*H);return `<g class="bar" data-o="${c.o}"><rect x="${x}" y="${base-h}" width="62" height="${h}" rx="8" fill="${OC[c.o]}" stroke="#2E3F6E" stroke-width="3"/>
     <text x="${x+31}" y="${base-h-8}" text-anchor="middle" font-size="20">${c.v}</text>
     <svg x="${x+11}" y="${base+6}" width="40" height="40" viewBox="0 0 60 60">${IC[c.o]}</svg><text x="${x+31}" y="${base+66}" text-anchor="middle" font-size="21">${c.t}</text>
     <rect x="${x-8}" y="20" width="78" height="${base+50}" fill="transparent"/></g>`;}).join("")}
   <text x="14" y="150" font-size="15" transform="rotate(-90 14 150)" text-anchor="middle" fill="#56607A">per 100 000 people</text></svg>`;}
const SYMP=[{q:"sy1",o:"kidneys",item:"little urine: kidneys",sym:"💧 only a small amount of urine"},{q:"sy2",o:"lungs",item:"hard to breathe: lungs",sym:"😮‍💨 finds it hard to breathe"},
  {q:"sy3",o:"heart",item:"very fast pulse: heart",sym:"💓 a very fast pulse"},{q:"sy4",o:"stomach",item:"sore chest after eating: stomach",sym:"🍝 a sore chest after eating"}];
const SYOPTS=[{o:"kidneys",t:"kidneys",keys:["kidney","kidneys"]},{o:"lungs",t:"lungs",keys:["lung","lungs"]},{o:"heart",t:"heart",keys:["heart"]},{o:"stomach",t:"stomach",keys:["stomach"]}];
const STEPS=[{t:"idea",line:"ps_idea",keys:["idea"]},{t:"test",line:"ps_test",keys:["test"]},{t:"evidence",line:"ps_evid",keys:["evidence"]},{t:"conclusion",line:"ps_concl",keys:["conclusion"]},{t:"diagnosis",line:"ps_diag",keys:["diagnosis"]}];
const JOBPEOPLE=[{t:"cardiologist",e:"🫀",line:"job_cardio",j:"a heart doctor",keys:["heart"]},{t:"physiotherapist",e:"🏃",line:"job_physio",j:"helps people recover from muscle and bone injuries",keys:["muscle","bone","injur","recover"]},
  {t:"pathologist",e:"🔬",line:"job_path",j:"studies organs and tissues, to find out what went wrong",keys:["studies","study","tissue","wrong"]}];
async function hospital(){S.step=7;
  show(`<h2>Body Town Hospital</h2><div class="stem"><span style="--c:${OC.lungs}"><b>S</b>cience</span><span style="--c:${OC.windpipe}"><b>T</b>echnology</span><span style="--c:${OC.smallint}"><b>E</b>ngineering</span><span style="--c:${OC.largeint}"><b>M</b>aths</span></div>`,7);
  await say("hosp_intro",{face:"think"});await say("stem",{face:"normal"});
  show(`<h2>X-rays, 1895</h2><div class="patient"><span class="e">🦴</span><div>X-rays show the <b>bones</b> inside you.</div></div><div id="opts"></div>`,7);
  await say("xray",{face:"normal"});await Guest.say("Magic bone light!",{pose:"hop"});
  $("#opts").innerHTML=`<div class="patient"><span class="e">🦵</span><div>This patient may have a <b>broken leg</b>.</div></div><div id="opts2"></div>`;
  let first=await choose(shuffle([{t:"an X-ray",e:"🦴",ok:1,keys:["x ray","xray","x-ray","ray","bone"]},{t:"a stethoscope",e:"🩺",keys:["stethoscope"]},{t:"a thermometer",e:"🌡️",keys:["thermometer"]}]),{ask:"xray_q",wrong:"hosp_wrong",into:"#opts2",grid:true});
  await say("xray_a",{face:"happy"});rec("Body Town Hospital","an X-ray for a broken leg",first,null);
  show(`<h2>Looking inside, without cutting</h2><div class="patient"><span class="e">🖥️</span><div>A body <b>scanner</b> can show a heart pumping.</div></div><div class="patient"><span class="e">🩺</span><div>A <b>stethoscope</b>: hear the heartbeat and breathing. Measure the <b>pulse</b> too.</div></div>`,7);
  await say("scan",{face:"normal"});SFX.heartbeat(3);await say("heart_check",{face:"happy"});
  show(`<h2>Solve it like a scientist</h2><div id="order"></div>`,7);
  first=await orderTiles(STEPS,{ask:"method_intro",wrong:"method_wrong"});
  rec("Body Town Hospital","idea, test, evidence, conclusion, diagnosis",first,null);SFX.chime();
  await buildWord(WORDS.diagnosis,"the doctor's word");await say("diag_means",{face:"happy"});
  /* case file */
  show(`<h2>Case file one</h2><div class="patient"><span class="e">🟡</span><div>This patient has <b>yellow skin</b>.</div></div><div id="ev"></div><div id="opts"></div>`,7);
  await say("case_intro",{face:"think"});
  $("#ev").innerHTML=`<div class="patient"><span class="e">🧪</span><div>Urine test: a <b>yellow substance</b>. More evidence!</div></div>`;await say("case_ev",{face:"normal"});
  first=await choose(shuffle([{t:"liver",e:"liver",ok:1,keys:["liver","river"]},{t:"heart",e:"heart",keys:["heart"]},{t:"lungs",e:"lungs",keys:["lung","lungs"]}]),{ask:"case_q",wrong:"hosp_wrong",grid:true});
  await say("case_a",{face:"happy"});rec("Body Town Hospital","yellow skin and urine: liver",first,null);
  await say("symp_intro",{face:"normal"});
  for(let i=0;i<SYMP.length;i++){const P=SYMP[i];
    show(`<h2>Patient ${i+1} of ${SYMP.length}</h2><div class="patient"><div>Symptom: <b>${P.sym}</b></div></div><p>Which organ has a problem? <span class="muted">${tapOrSay()}</span></p><div id="opts"></div>`,7);
    const f=await choose(shuffle(SYOPTS.map(o=>({t:o.t,e:o.o,keys:o.keys,ok:o.o===P.o?1:0}))),{ask:P.q,wrong:"hosp_wrong",grid:true});
    await say(praise(),{face:"happy"});rec("Body Town Hospital",P.item,f,null);}
  show(`<h2>Organ diseases in the UK</h2><p class="muted">Deaths from organ diseases, per 100 000 people.</p><div class="chartbox" id="chartbox">${chartSvg()}</div><p class="taphint">👆 Tap the tallest bar.</p>`,7);
  await say("chart_q",{face:"normal"});
  const r=await tapPart("#chartbox",o=>o==="heart",{wrong:"hosp_wrong",keys:["heart"]});
  $('#chartbox .bar[data-o="heart"]').classList.add("found");SFX.sparkle();
  await say("chart_a",{face:"normal"});rec("Body Town Hospital","heart disease is the most common",r.first,null);
  await say("jobs_intro",{face:"happy"});
  for(const J of shuffle(JOBPEOPLE)){
    show(`<h2>Who does what?</h2><div class="sortcard"><span>${J.e}</span>${J.t}</div><p>What is this job? <span class="muted">${tapOrSay()}</span></p><div id="opts"></div>`,7);
    const f=await choose(shuffle(JOBPEOPLE.map(x=>({t:x.j,ok:x===J?1:0,keys:x.keys}))),{wrong:"hosp_wrong"});
    await say(J.line,{face:"happy"});if(J.t==="pathologist")await Guest.say("Eek! Not me! I'm fine!",{pose:"sneeze"});
    rec("Body Town Hospital","what a "+J.t+" does",f,null);}
  show(`<h2>Body Town Hospital</h2><div class="patient"><span class="e">🎓</span><div>Doctors train at university for <b>6 or 7 years</b>. Nurses need organ know-how too.</div></div>`,7);
  await say("train",{face:"normal"});confetti();await say("hosp_done",{face:"happy",pose:"dance"});Celly.setPose("idle");
  teach();
}

/* ================= 9 · teach Celly (Mumbles muddled her) ================= */
const MUDDLE=[
  {m:"m1",f:"m1_fix",item:"the brain does the thinking",fix:"No! The brain controls the body. The heart pumps blood."},
  {m:"m2",f:"m2_fix",item:"skin is an organ",fix:"No! Skin is an organ. It's the biggest one."},
  {m:"m3",f:"m3_fix",item:"plants make food in their leaves",fix:"No! Plants make their own food, in their leaves."},
  {m:"m4",f:"m4_fix",item:"the small intestine absorbs food",fix:"No! The small intestine absorbs food."},
  {m:"m5",f:"m5_fix",item:"lungs excrete carbon dioxide",fix:"No! Lungs also get rid of carbon dioxide."}];
async function teach(){S.step=8;
  show(`<h2>Teach Celly</h2><p>Oh dear. Mumbles told Celly some “facts”. Help her!</p>`,8);
  await Guest.say("Oops. I may have told Celly some things.",{pose:"think",ms:3600});
  Celly.face("worried");await say("teach_intro",{face:"worried",pose:"shiver"});Celly.setPose("idle");
  for(let i=0;i<MUDDLE.length;i++){const M=MUDDLE[i];
    show(`<h2>Teach Celly · ${i+1} of ${MUDDLE.length}</h2><div class="patient"><span class="e">🤔</span><div>“${window.LINES[M.m]}”</div></div><p class="muted">${canHear()?"Say “no” or “yes”, or tap.":"Tap your answer."}</p><div id="opts"></div>`,8);
    const first=await choose([{t:"Yes, that's right.",keys:YES},{t:M.fix,ok:1,neg:1,keys:NO}],{ask:[M.m],wrong:"teach_wrong"});
    Celly.face("happy");await say(M.f,{face:"happy",pose:"happy"});
    rec("Teach Celly",M.item,first,null);}
  await say("teach_done",{face:"happy",pose:"dance"});Celly.setPose("idle");
  finish();
}

/* ================= the end: certificate and grown-up summary ================= */
async function finish(){S.step=9;
  const total=S.results.length,first=S.results.filter(r=>r.first).length;
  const again=[...new Set(S.results.filter(r=>!r.first||r.said===false).map(r=>r.item))];
  const acts=[...new Set(S.results.map(r=>r.act))];
  const rows=acts.map(a=>`<tr><th>${a}</th><td>${S.results.filter(r=>r.act===a).map(r=>`<div>${r.item} ${r.first&&r.said!==false?'<span class="tag ok">secure</span>':'<span class="tag help">needs another go</span>'}</div>`).join("")}</td></tr>`).join("");
  const date=new Date().toLocaleDateString("en-GB",{day:"numeric",month:"long",year:"numeric"});
  show(`<div class="cert" id="cert"><div class="t">Celly School certificate</div><h1>Body Town Organ Expert</h1>
   <p>This is to say that</p><div class="n" id="certName">a brilliant scientist</div>
   <p>toured every building in Body Town, with Mumbles the mummy.<br>7Ab Organs · ${date}</p>
   <label class="muted" for="nameIn">Your name (a grown-up can help):</label><input id="nameIn" autocomplete="off" maxlength="30">
   <div class="row"><button class="big" id="saveCert">Save my certificate</button></div></div>
   <details class="note"><summary>For the grown-up: how it went</summary>
   <p>${first} of ${total} right first time. “Needs another go” means your child got there with help, or Celly couldn't hear the word clearly. It is not a mark.
   ${again.length?`Practise these next, with the 7Ab workbook pages: <b>${again.join(", ")}</b>.`:"Everything looks secure."} Next: the 7Ac Tissues video.</p>
   <div class="tablebox"><table>${rows}</table></div></details>
   <div class="row"><button class="big plain" id="restart">Play again</button></div>`,9);
  $("#nameIn").oninput=e=>{$("#certName").textContent=e.target.value.trim()||"a brilliant scientist";};
  $("#saveCert").onclick=saveCert;$("#restart").onclick=()=>location.reload();
  Celly.face("happy");Celly.setPose("dance");SFX.chime();confetti(undefined,undefined,120);setTimeout(()=>{SFX.sparkle();confetti(undefined,undefined,80);},700);
  await say("finish",{face:"happy",pose:"dance"});await say("bigideas",{face:"normal"});
  Guest.pose("dance",2400);await Guest.say("Thank you from the bottom of my heart! Not my brain. I don't have one.",{pose:"dance",ms:4600});await say("mumbles_bye",{face:"happy"});
  await say("cert",{face:"happy"});await say("next",{face:"happy",pose:"wave"});Celly.setPose("idle");Mic.stop();
}
function saveCert(){
  const W=1400,H=990,c=document.createElement("canvas");c.width=W;c.height=H;const g=c.getContext("2d");
  g.fillStyle="#FAF6E9";g.fillRect(0,0,W,H);g.strokeStyle="#81A63C";g.lineWidth=16;g.strokeRect(30,30,W-60,H-60);g.lineWidth=4;g.strokeRect(58,58,W-116,H-116);
  const F='"Lexend", "Segoe UI", Arial, sans-serif';g.fillStyle="#1F2A44";g.textAlign="center";
  g.font=`600 30px ${F}`;g.fillText("CELLY SCHOOL CERTIFICATE",W/2,150);g.font=`600 80px ${F}`;g.fillText("Body Town Organ Expert",W/2,260);
  g.font=`400 34px ${F}`;g.fillText("This is to say that",W/2,340);g.font=`600 64px ${F}`;g.fillText($("#certName").textContent,W/2,430);
  g.font=`400 34px ${F}`;g.fillText("toured every building in Body Town, with Mumbles the mummy.",W/2,500);g.fillStyle="#56607A";g.fillText("7Ab Organs · "+new Date().toLocaleDateString("en-GB",{day:"numeric",month:"long",year:"numeric"}),W/2,556);
  g.font=`400 26px ${F}`;g.fillText("www.cellyschool.com",W/2,H-90);
  const name="Celly School certificate - Body Town Organ Expert.png";
  const save=()=>{const a=document.createElement("a");a.download=name;a.href=c.toDataURL("image/png");document.body.appendChild(a);a.click();a.remove();};
  const svg=new XMLSerializer().serializeToString(rig).replace(/class="rig[^"]*"/,'class="rig"');
  const img=new Image();img.onload=()=>{g.drawImage(img,W/2-170,590,340,340);save();};img.onerror=save;
  img.src="data:image/svg+xml;charset=utf-8,"+encodeURIComponent(svg.includes("xmlns=")?svg:svg.replace("<svg",'<svg xmlns="http://www.w3.org/2000/svg"'));
}

/* ================= go ================= */
const ROOMS=[start,words,mapUp,lunch,brainBreak,teams,park,hospital,teach,finish];
try{const pr=JSON.parse(sessionStorage.getItem("cs7ab_prefs")||"null");if(pr){S.mode=(pr.mode==="tap"||!SR)?"tap":"talk";if(pr.mute)$("#muteBtn").click();}}catch(e){}
setMode(S.mode);
const R0=+(new URLSearchParams(location.search).get("room")||0);
if(R0>0&&R0<ROOMS.length){trail(R0);
  show(`<h2>${TRAIL[R0]}</h2><p>Ready when you are.</p><div class="row"><button class="big go" id="go">Go to ${TRAIL[R0]}</button></div>`,R0);
  $("#say").textContent="Let's go to "+TRAIL[R0]+"!";
  $("#go").onclick=()=>{ac();loadSprite();S.started=true;if(canHear())Mic.start();ROOMS[R0]();};
}else{trail(0);start();}
