/* Talk to Celly · 7Ae Organ systems · "Body Town Grand Opening" — Celly School
   Story: Mayor Celly opens Body Town. Snooze the sleepy sausage dog muddled every signpost; the learner is Chief Engineer. */
"use strict";
const $=s=>document.querySelector(s);
const card=$("#card");
const SR=window.SpeechRecognition||window.webkitSpeechRecognition;
const S={mode:SR?"talk":"tap",mute:false,results:[],last:[],speaking:false,praise:0,token:0};
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
function rec(act,item,first,said){S.results.push({act,item,first,said});try{sessionStorage.setItem("cs7ae_res",JSON.stringify(S.results));}catch(e){}}
try{const r=JSON.parse(sessionStorage.getItem("cs7ae_res")||"[]");if(new URLSearchParams(location.search).get("room"))S.results=r;else sessionStorage.removeItem("cs7ae_res");}catch(e){}

/* ================= Celly and Very Wobbly Cabbage ================= */
const BODY="M200,64 C280,60 352,112 356,206 C360,296 290,362 200,362 C110,364 42,298 44,208 C46,114 120,68 200,64Z";
const CELLY_SVG=`<svg class="rig idle" id="cellyRig" viewBox="0 0 400 400" role="img" aria-label="Mayor Celly the cell">
<ellipse cx="200" cy="384" rx="120" ry="12" fill="#1F2A44" opacity=".08"/>
<g class="whole">
 <g class="armL"><ellipse cx="54" cy="268" rx="21" ry="44" transform="rotate(38 54 268)" class="limb" fill="#FBE7A1" stroke="#2E3F6E" stroke-width="10"/></g>
 <g class="armR"><ellipse cx="346" cy="268" rx="21" ry="44" transform="rotate(-38 346 268)" class="limb" fill="#FBE7A1" stroke="#2E3F6E" stroke-width="10"/></g>
 <path id="cBody" class="tgt" data-part="cytoplasm" d="${BODY}" fill="#FBE7A1"/>
 <path id="cMem" d="${BODY}" fill="none" stroke="#2E3F6E" stroke-width="12" stroke-linejoin="round" pointer-events="none"/>
 <path class="tgt" data-part="membrane" d="${BODY}" fill="none" stroke="transparent" stroke-width="36" pointer-events="stroke"/>
  <g class="chain" pointer-events="none"><path d="M86,262 Q200,352 314,262" fill="none" stroke="#C8962A" stroke-width="13" stroke-linecap="round"/><path d="M86,262 Q200,352 314,262" fill="none" stroke="#F5CF5B" stroke-width="7" stroke-dasharray="9 7" stroke-linecap="round"/>
   <circle cx="200" cy="316" r="25" fill="#F5CF5B" stroke="#C8962A" stroke-width="6"/><path d="M200,301 l4.5,9.5 10.5,1 -8,7 2.5,10.5 -9.5,-5.5 -9.5,5.5 2.5,-10.5 -8,-7 10.5,-1z" fill="#FFF3C4" stroke="#C8962A" stroke-width="2.5" stroke-linejoin="round"/></g>
 <path d="M110,190 q8,-78 72,-98 q-48,32 -60,98z" fill="#fff" opacity=".45" pointer-events="none"/>
 <g class="part nuc tgt" id="cNuc" data-part="nucleus"><circle cx="122" cy="140" r="36" fill="#8E6CC9" stroke="#6B4FA6" stroke-width="8"/><circle cx="130" cy="133" r="12" fill="#6B4FA6"/></g>
 <g class="part mito tgt" data-part="mito" transform="translate(292,128) rotate(30)"><rect x="-30" y="-14" width="60" height="28" rx="14" fill="#F29E4C" stroke="#C8742A" stroke-width="6"/><path d="M-17,0 L-10,-6 L-3,6 L3,-6 L10,6 L17,-6" fill="none" stroke="#C8742A" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round"/></g>
 <g class="part mito tgt" data-part="mito" transform="translate(118,300) rotate(-20)"><rect x="-28" y="-13" width="56" height="26" rx="13" fill="#F29E4C" stroke="#C8742A" stroke-width="6"/><path d="M-16,0 L-9,-6 L-2,6 L4,-6 L11,6 L17,-5" fill="none" stroke="#C8742A" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round"/></g>
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
  for(const id of ids){if(tok!==S.token)break;const text=window.LINES[id]||id;
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
const TRAIL=["Welcome to Body Town","Climb the ladder","Build the words","Fix the signposts","The town map","Brain break","The garden district","Body Town Hospital","Teach Celly","Grand Opening"];
function trail(n){S.room=n;$("#trail").innerHTML=`<button class="step nav" data-go="${n-1}" ${n<=0?"disabled":""} aria-label="Previous room">◀ back</button>`+
  TRAIL.map((t,i)=>`<button class="step ${i<n?"done":i===n?"now":""}" data-go="${i}" ${i===n?'aria-current="step"':""} title="Go to ${t}">${i<n?"✓ ":""}${t}</button>`).join("")+
  `<button class="step nav" data-go="${n+1}" ${n>=TRAIL.length-1?"disabled":""} aria-label="Next room">next ▶</button>`;}
/* jump to any room: reload the page at that room, so nothing from the old room keeps running */
function goRoom(i){i=Math.max(0,Math.min(TRAIL.length-1,i));if(i===S.room)return;
  try{sessionStorage.setItem("cs7ae_prefs",JSON.stringify({mode:S.mode,mute:S.mute}));}catch(e){}
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
/* ================= Snooze the sleepy sausage dog (the town inspector) ================= */
const SNOOZE_SVG=`<svg class="rig guest idle" viewBox="0 0 380 230" role="img" aria-label="Snooze the sausage dog">
<ellipse cx="190" cy="218" rx="160" ry="9" fill="#1F2A44" opacity=".08"/>
<g class="whole">
 <g class="tail"><path d="M74,118 Q38,104 30,70" fill="none" stroke="#2E3F6E" stroke-width="16" stroke-linecap="round"/><path d="M74,118 Q38,104 30,70" fill="none" stroke="#C98A4B" stroke-width="7" stroke-linecap="round"/></g>
 <g class="legs" fill="#B87A3E" stroke="#2E3F6E" stroke-width="6">
  <rect class="lb" x="84" y="150" width="24" height="54" rx="11"/><rect class="lb" x="114" y="150" width="24" height="54" rx="11"/>
  <rect class="lf" x="236" y="150" width="24" height="54" rx="11"/><rect class="lf" x="266" y="150" width="24" height="54" rx="11"/></g>
 <rect x="64" y="96" width="246" height="76" rx="38" fill="#C98A4B" stroke="#2E3F6E" stroke-width="7"/>
 <path d="M96,152 Q180,170 284,150" fill="none" stroke="#E7B985" stroke-width="10" stroke-linecap="round" opacity=".7"/>
 <g class="collar"><path d="M270,92 Q284,132 278,170" fill="none" stroke="#2E3F6E" stroke-width="16" stroke-linecap="round"/><path d="M270,92 Q284,132 278,170" fill="none" stroke="#6FA8DC" stroke-width="9" stroke-linecap="round"/>
  <circle cx="282" cy="150" r="13" fill="#F5CF5B" stroke="#C8962A" stroke-width="4"/><path d="M282,143 l2,4.5 5,.5 -3.8,3.3 1.2,5 -4.4,-2.6 -4.4,2.6 1.2,-5 -3.8,-3.3 5,-.5z" fill="#FFF3C4"/></g>
 <ellipse cx="312" cy="84" rx="44" ry="40" fill="#C98A4B" stroke="#2E3F6E" stroke-width="7"/>
 <ellipse cx="346" cy="100" rx="28" ry="20" fill="#E7B985" stroke="#2E3F6E" stroke-width="6"/>
 <ellipse cx="368" cy="92" rx="9" ry="7.5" fill="#1F2A44"/>
 <path d="M340,112 Q348,118 356,112" fill="none" stroke="#2E3F6E" stroke-width="4" stroke-linecap="round"/>
 <g class="eyeOpen"><ellipse cx="320" cy="72" rx="10" ry="12" fill="#fff" stroke="#2E3F6E" stroke-width="4"/><circle cx="323" cy="74" r="5.5" fill="#1F2A44"/><circle cx="325" cy="71" r="2" fill="#fff"/></g>
 <path class="eyeShut" d="M310,74 Q320,82 330,74" fill="none" stroke="#2E3F6E" stroke-width="5" stroke-linecap="round"/>
 <path class="ear" d="M290,58 Q262,62 266,118 Q276,134 294,116 Q300,86 290,58Z" fill="#9C6330" stroke="#2E3F6E" stroke-width="6" stroke-linejoin="round"/>
 <g class="dirt" fill="#A9774A"><circle cx="248" cy="196" r="7"/><circle cx="226" cy="184" r="5"/><circle cx="262" cy="178" r="6"/><circle cx="210" cy="200" r="4"/></g>
</g>
<g class="zzz" fill="#6B4FA6" font-family="Lexend,Arial" font-weight="600"><text x="330" y="36" font-size="22">z</text><text x="346" y="18" font-size="28">z</text><text x="366" y="-4" font-size="34">Z</text></g>
</svg>`;
const Guest={kind:null,t:0,
  show(kind="snooze",pose="drive"){if(this.kind!==kind){this.kind=kind;$("#guestArt").innerHTML=SNOOZE_SVG;}$("#actors").classList.add("withGuest");
    if(pose==="sleep")this.pose("sleep");else this.pose(pose,900);},
  hide(){this.kind=null;$("#actors").classList.remove("withGuest");$("#gsay").classList.remove("on");},
  el(){return $("#guestArt svg");},
  asleep(){const g=this.el();return !!g&&g.classList.contains("sleep");},
  pose(p,ms){const g=this.el();if(!g)return;g.classList.remove("idle","wag","sleep","dig","sad","drive");g.classList.add(p);if(ms)setTimeout(()=>{const x=this.el();if(x&&x.classList.contains(p)){x.classList.remove(p);x.classList.add("idle");}},ms);},
  say(text,{sfx="woof",ms=3200,pose="wag"}={}){if(!this.kind)return sleep(0);const b=$("#gsay");b.textContent=text;b.classList.add("on");clearTimeout(this.t);this.t=setTimeout(()=>b.classList.remove("on"),ms);
    if(sfx&&SFX[sfx])SFX[sfx]();
    if(pose)this.pose(pose,pose==="sad"||pose==="sleep"?0:1100);return sleep(Math.min(ms,1400));}
};
/* Body Town sounds: woof, snore, yawn, digging, scissors and the town-hall chime (all synthesised) */
function noise(dur,{f=800,q=1,type="bandpass",amp=.2,t0=0}={}){const c=ac();if(!c)return;const n=Math.floor(c.sampleRate*dur),b=c.createBuffer(1,n,c.sampleRate),d=b.getChannelData(0);for(let i=0;i<n;i++)d[i]=(Math.random()*2-1)*Math.pow(1-i/n,1.5);
  const s=c.createBufferSource(),fl=c.createBiquadFilter(),g=c.createGain();s.buffer=b;fl.type=type;fl.frequency.value=f;fl.Q.value=q;g.gain.value=amp;s.connect(fl).connect(g).connect(c.destination);s.start(c.currentTime+t0);}
Object.assign(SFX,{
  woof(){const c=ac();if(!c)return;const t=c.currentTime;[0,.26].forEach(d=>{const o=c.createOscillator(),g=c.createGain(),lp=c.createBiquadFilter();o.type="sawtooth";o.frequency.setValueAtTime(260,t+d);o.frequency.exponentialRampToValueAtTime(120,t+d+.16);lp.type="lowpass";lp.frequency.value=900;
    g.gain.setValueAtTime(0,t+d);g.gain.linearRampToValueAtTime(.16,t+d+.02);g.gain.exponentialRampToValueAtTime(.001,t+d+.2);o.connect(lp).connect(g).connect(c.destination);o.start(t+d);o.stop(t+d+.22);});},
  snore(){const c=ac();if(!c)return;const t=c.currentTime,o=c.createOscillator(),g=c.createGain(),lfo=c.createOscillator(),lg=c.createGain(),lp=c.createBiquadFilter();
    o.type="triangle";o.frequency.setValueAtTime(70,t);o.frequency.linearRampToValueAtTime(95,t+.7);o.frequency.linearRampToValueAtTime(62,t+1.3);lfo.frequency.value=26;lg.gain.value=18;lfo.connect(lg).connect(o.frequency);lp.type="lowpass";lp.frequency.value=500;
    g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(.2,t+.5);g.gain.linearRampToValueAtTime(.04,t+1.3);g.gain.linearRampToValueAtTime(0,t+1.5);o.connect(lp).connect(g).connect(c.destination);o.start(t);lfo.start(t);o.stop(t+1.55);lfo.stop(t+1.55);},
  yawn(){const c=ac();if(!c)return;const t=c.currentTime,o=c.createOscillator(),g=c.createGain();o.type="triangle";o.frequency.setValueAtTime(520,t);o.frequency.exponentialRampToValueAtTime(170,t+1.1);
    g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(.12,t+.2);g.gain.linearRampToValueAtTime(0,t+1.2);o.connect(g).connect(c.destination);o.start(t);o.stop(t+1.25);},
  dig(){[0,.22,.44,.66].forEach(d=>noise(.14,{f:500,q:.8,type:"lowpass",amp:.35,t0:d}));},
  snip(){noise(.05,{f:3500,q:2,amp:.4});noise(.05,{f:3000,q:2,amp:.4,t0:.16});tone(1400,.16,.05,.05,"square");},
  dingdong(){SFX.kal(659.3,0,.2);SFX.kal(523.3,.42,.2);},
  sadbeep(){[392,349,330].forEach((f,i)=>SFX.kal(f,i*.25,.08));},
  tick(){SFX.kal(784,0,.12);SFX.kal(1047,.08,.08);}
});

/* ================= helpers ================= */
const shuffle=a=>{a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;};
function kmatch(alts,keys){if(!alts||!keys)return false;if(heardAny(alts,keys))return true;
  return alts.some(a=>keys.some(k=>/^\d+$/.test(k)&&new RegExp("(^|\\D)"+k+"(\\D|$)").test(a)));}
function micRow(){return canHear()?`<div class="row"><button class="tbtn" id="noMic">Celly can't hear me</button></div>`:"";}
function announce(){SFX.dingdong();return `<div class="announce" aria-hidden="true"><span>🔔</span> Ding-dong! Body Town announcement!</div>`;}
/* one question, several answers. Tap, or say a key word. Returns true if right first time. */
/* Celly reads the answer choices aloud (recorded lines in window.OPTV), each button lights up as she reads it */
function optKey(h){const d=document.createElement("div");d.innerHTML=h;return d.textContent.replace(/^[^A-Za-z0-9]+/,"").replace(/\s+/g," ").trim();}
async function readOpts(btns,texts){if(S.mute||!window.OPTV)return;const tok=S.token;S.speaking=true;Celly.setPose("talk");
  for(let k=0;k<btns.length;k++){if(tok!==S.token||!btns[k].isConnected||btns[k].onclick===null)break;const id=window.OPTV[optKey(texts[k])];if(!id)continue;
    btns[k].classList.add("reading");await clipLine(id,tok);btns[k].classList.remove("reading");if(tok===S.token)await sleep(250);}
  if(tok===S.token){S.speaking=false;Mic.muteUntil=performance.now()+450;Celly.mouth(0);Celly.setPose("idle");}}
function remember(ask,btns,texts){S.lastOpts={key:[].concat(ask||[]).join("|"),btns,texts};}
function choose(opts,{ask=null,wrong="wrong",into="#opts",grid=false,onRight=null}={}){return new Promise(async res=>{
  const box=$(into);box.innerHTML=grid?`<div class="pick">${opts.map((o,k)=>`<button data-k="${k}"><span class="e">${o.e||""}</span>${o.t}</button>`).join("")}</div>`
    :`<div class="opts">${opts.map((o,k)=>`<button class="opt" data-k="${k}">${o.e?o.e+" ":""}${o.t}</button>`).join("")}</div>`;
  const btns=[...box.querySelectorAll("button")];let wrongN=0,settled=false;
  const pickK=async k=>{if(settled)return;ac();const o=opts[k],b=btns[k];
    if(o.ok){settled=true;if(S.cancelHear)S.cancelHear();btns.forEach(x=>x.onclick=null);b.classList.add("right");SFX.sparkle();if(onRight)await onRight(o);res(wrongN===0);}
    else{wrongN++;b.classList.remove("wrong");void b.offsetWidth;b.classList.add("wrong");SFX.oops();if(o.no)await o.no();else await say(wrongN%2?wrong:"wrong2",{face:"oops"});listen();}};
  btns.forEach((b,k)=>b.onclick=()=>pickK(k));
  const order=opts.map((o,k)=>k).sort((a,b)=>(opts[b].neg?1:0)-(opts[a].neg?1:0));
  const listen=async()=>{if(settled||!canHear()||!opts.some(o=>o.keys))return;
    const got=await hear(10000,a=>{for(const k of order)if(kmatch(a,opts[k].keys))return k+1;return null;});
    if(settled)return;if(got.ok)pickK(got.val-1);};
  if(ask)await say(ask,{face:"normal"});remember(S.last,btns,opts.map(o=>o.t));if(!settled)await readOpts(btns,opts.map(o=>o.t));listen();});}
const YES=["yes","yeah","yep","they do","it does","of course","definitely"],NO=["no","nope","not","don't","dont","never","wrong"];
async function yesNo(q,isYes,{wrong="wrong",yesT="Yes",noT="No"}={}){
  return choose([{t:yesT,ok:isYes,keys:YES},{t:noT,ok:!isYes,keys:NO,neg:true}],{ask:q,wrong});}
/* put tiles in order (tap). items: [{t, line, slot}] in the right order. Returns the number of mistakes. */
async function orderTiles(items,{cls="",wrong="ladder_wrong",onPlace=null}={}){
  let order;do{order=shuffle(items.map((x,k)=>k));}while(order.every((v,k)=>items[v].t===items[k].t));
  $("#order").innerHTML=`<div class="slots ${cls}" id="slots">${items.map(it=>`<div class="slot">${it.slot?`<small>${it.slot}</small>`:""}<span></span></div>`).join("")}</div>
   <div class="tiles ${cls}" id="tiles">${order.map(k=>`<button class="tile" data-k="${k}">${items[k].t}</button>`).join("")}</div>`;
  let pos=0,mistakes=0;
  await new Promise(done=>card.querySelectorAll("#tiles .tile").forEach(b=>b.onclick=async()=>{ac();if(pos>=items.length)return;const k=+b.dataset.k;
    if(items[k].t===items[pos].t&&!b.classList.contains("used")){b.classList.add("used");const it=items[pos];const s=$("#slots").children[pos];s.querySelector("span").textContent=it.t;s.classList.add("filled");SFX.tap();pos++;
      const last=pos===items.length;if(onPlace)await onPlace(pos-1,last);if(it.line)await say(it.line,{face:"happy"});if(last)done();}
    else{mistakes++;b.classList.remove("shake");void b.offsetWidth;b.classList.add("shake");SFX.oops();say(wrong,{face:"oops"});}}));
  return mistakes;}
/* tap several right answers in a grid; traps say their own line. Returns true if no trap was tapped. */
async function multiPick(T,{into="#opts",intro=null,onRight=null}={}){
  let left=T.filter(t=>t.ok).length,wrongN=0;
  $(into).innerHTML=`<div class="pick">${T.map((o,k)=>`<button data-k="${k}"><span class="e">${o.e}</span>${o.t}</button>`).join("")}</div>`;
  const btns=[...$(into).querySelectorAll("button")];
  await new Promise(async done=>{let busy=false,fin=false;
    const pickK=async k=>{const o=T[k],b=btns[k];if(busy||fin||b.classList.contains("right"))return;busy=true;ac();
      if(o.ok){b.classList.add("right");SFX.sparkle();confetti(centre(b).x,centre(b).y,20);if(o.line)await say(o.line,{face:"happy"});else await sleep(250);left--;}
      else{wrongN++;b.classList.remove("wrong");void b.offsetWidth;b.classList.add("wrong");SFX.oops();if(o.no)await o.no();else await say("wrong",{face:"oops"});}
      busy=false;if(left===0){fin=true;if(S.cancelHear)S.cancelHear();done();}else listen();};
    btns.forEach((b,k)=>b.onclick=()=>pickK(k));
    if($("#noMic"))$("#noMic").onclick=()=>{if(S.cancelHear)S.cancelHear();setMode("tap");};
    const listen=async()=>{if(fin||!canHear())return;const got=await hear(12000,a=>{for(let k=0;k<T.length;k++)if(!btns[k].classList.contains("right")&&!btns[k].classList.contains("wrong")&&kmatch(a,T[k].keys))return k+1;return null;});
      if(!fin&&got.ok)pickK(got.val-1);};
    if(intro)await say(intro,{face:"normal"});listen();});
  return wrongN===0;}
/* sort cards into 2 or 3 boxes. bins: [{id,label,e,small,keys}], cards: [{n,e,bin,line,before,after}] */
async function sortCards(bins,cards,{act,wrongLine="sign_wrong",cls=""}={}){
  $("#sort").innerHTML=`<div class="sortcard" id="sc"></div><div class="bins n${bins.length} ${cls}">${bins.map(b=>`<button class="bin" id="b-${b.id}"><span class="bl"><span class="be">${b.e}</span> ${b.label}</span><small>${b.small}</small><span class="got" id="g-${b.id}"></span></button>`).join("")}</div>`;
  for(const C of cards){
    $("#sc").innerHTML=`<span class="ce">${C.e}</span><span>${C.n}</span>`;$("#sc").style.animation="none";void $("#sc").offsetWidth;$("#sc").style.animation="";
    if(C.before)await C.before();
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
    if(C.after)await C.after();
    rec(act,C.n,wrong===0,null);
  }}
/* wake Snooze: say "wake up", "Snooze" or "woof", tap him, or press the button */
function wakeSnooze({any=false,ms=8000,onMiss=null,after=null}={}){return new Promise(async res=>{
  let done=false;const fin=v=>{if(done)return;done=true;if(S.cancelHear)S.cancelHear();$("#guestArt").onclick=null;res(v);};
  $("#guestArt").onclick=()=>{ac();fin("tap");};if($("#wake"))$("#wake").onclick=()=>{ac();fin("tap");};
  if(after)await after;
  for(let tries=0;tries<4&&!done&&canHear();tries++){const got=await hear(ms,a=>any?a[0].length>0:kmatch(a,["wake","snooze","snooz","woof","up","oi","hey"]));
    if(done)break;if(got.ok){fin("voice");break;}if(tries===0&&onMiss)await onMiss();}});}
async function snoozeWakes(){Guest.pose("wag",1600);SFX.woof();Guest.say("WOOF! I wasn't asleep! I was… inspecting my eyelids.",{sfx:null,ms:4200});await sleep(1600);}

/* ================= pictures (inline SVG, same pastel style) ================= */
const MAP_SVG=`<svg viewBox="0 0 360 230" role="img" aria-label="An Ancient Egyptian map of the heart with air pipes">
 <path d="M24,22 Q60,10 100,20 T180,18 T260,22 T336,18 L340,208 Q300,220 260,210 T180,214 T100,208 T20,212Z" fill="#F2DCB4" stroke="#A9774A" stroke-width="6" stroke-linejoin="round"/>
 <g stroke="#C8742A" stroke-width="3" fill="none" opacity=".55"><path d="M44,40 v20 M52,40 q8,10 0,20 M64,44 h10 M300,180 l10,-12 l10,12 M296,40 q10,-8 20,0 q-10,8 -20,0"/></g>
 <g fill="none" stroke="#E0455F" stroke-width="7" stroke-linecap="round"><path d="M180,122 Q130,80 92,58"/><path d="M180,122 Q232,80 270,56"/><path d="M180,140 Q120,160 84,190"/><path d="M180,140 Q244,160 282,186"/></g>
 <g fill="#fff" stroke="#6FA8DC" stroke-width="3"><circle cx="84" cy="52" r="10"/><circle cx="98" cy="44" r="8"/><circle cx="276" cy="48" r="10"/><circle cx="262" cy="42" r="7"/><circle cx="76" cy="196" r="9"/><circle cx="290" cy="192" r="9"/></g>
 <path d="M180,152 C140,126 146,94 166,96 C174,97 178,104 180,110 C182,104 186,97 194,96 C214,94 220,126 180,152Z" fill="#F27BA0" stroke="#2E3F6E" stroke-width="5"/>
 <text x="180" y="40" text-anchor="middle" font-family="Lexend,Arial" font-size="17" fill="#6B4A2E">air pipes?</text>
</svg>`;
const BODY_SVG=`<svg class="body" viewBox="0 0 240 410" role="img" aria-label="A body with six organ systems">
 <g class="sys s-loco" data-sys="loco">
  <path d="M80,104 Q46,112 40,160 L30,244 Q30,256 42,256 Q52,256 54,244 L64,170 Z"/><path d="M160,104 Q194,112 200,160 L210,244 Q210,256 198,256 Q188,256 186,244 L176,170 Z"/>
  <path d="M86,290 L80,392 Q80,404 94,404 Q106,404 108,392 L116,300 Z"/><path d="M154,290 L160,392 Q160,404 146,404 Q134,404 132,392 L124,300 Z"/></g>
 <path class="torso" d="M78,100 Q120,88 162,100 Q178,140 172,200 Q168,250 158,300 Q120,316 82,300 Q72,250 68,200 Q62,140 78,100Z"/>
 <circle class="torso" cx="120" cy="50" r="38"/><rect class="torso" x="108" y="84" width="24" height="20" rx="6"/>
 <g class="sys s-circ vess" data-sys="circ"><path class="ln" d="M128,170 Q150,200 150,280 L140,390 M112,170 Q92,200 92,280 L100,390 M120,160 Q170,140 190,240 M120,160 Q70,140 50,240"/></g>
 <g class="sys s-nerv" data-sys="nerv"><ellipse cx="120" cy="44" rx="25" ry="18"/><path class="ln" d="M120,64 L120,286 M120,120 Q90,130 58,200 M120,120 Q150,130 182,200 M120,286 Q104,330 96,390 M120,286 Q136,330 144,390"/></g>
 <g class="sys s-urin" data-sys="urin"><ellipse cx="96" cy="222" rx="10" ry="16"/><ellipse cx="144" cy="222" rx="10" ry="16"/><ellipse cx="120" cy="280" rx="14" ry="11"/><path class="ln" d="M98,238 Q108,262 114,272 M142,238 Q132,262 126,272"/></g>
 <g class="sys s-dig" data-sys="dig"><path class="ln" d="M120,86 L122,186"/><path d="M118,184 Q160,176 158,206 Q154,226 128,214 Q116,206 118,184Z"/><path d="M98,226 Q120,214 142,226 Q150,244 132,250 Q118,256 108,246 Q90,240 98,226Z"/></g>
 <g class="sys s-breath" data-sys="breath"><rect x="115" y="90" width="10" height="44" rx="4"/><ellipse cx="96" cy="152" rx="20" ry="34"/><ellipse cx="146" cy="152" rx="20" ry="34"/></g>
 <g class="sys s-circ" data-sys="circ"><path d="M126,180 C108,168 108,150 118,150 C122,150 125,153 126,156 C127,153 130,150 134,150 C144,150 144,168 126,180Z"/></g>
</svg>`;
const SYS={
  dig:{n:"digestive",e:"🏭",c:"#F29E4C",keys:["digestive","digest","food","stomach"]},
  circ:{n:"circulatory",e:"🚚",c:"#E0455F",keys:["circulatory","circular","circ","blood","heart"]},
  breath:{n:"breathing",e:"💨",c:"#6FA8DC",keys:["breathing","breath","breathe","air","lungs","respiratory"]},
  urin:{n:"urinary",e:"♻️",c:"#E8B931",keys:["urinary","urine","waste","kidney","wee"]},
  nerv:{n:"nervous",e:"📞",c:"#8E6CC9",keys:["nervous","nerve","brain"]},
  loco:{n:"locomotor",e:"🚌",c:"#81A63C",keys:["locomotor","loco","move","moving","bones","muscle"]}
};
function bodyLight(id,on=true){document.querySelectorAll(`.body .s-${id}`).forEach(g=>g.classList.toggle("lit",on));}
const PLANT_SVG=`<svg class="plant" viewBox="0 0 300 350" role="img" aria-label="A plant with roots, stem, leaves and a flower">
 <rect x="20" y="262" width="260" height="80" rx="16" fill="#E8C99A" stroke="#A9774A" stroke-width="5"/>
 <g class="porg" data-o="root"><path class="hit" d="M150,262 Q120,300 90,320 M150,262 Q150,300 146,334 M150,262 Q186,296 214,318 M126,292 Q110,292 100,306 M176,290 Q194,286 204,300" fill="none" stroke="transparent" stroke-width="30"/>
  <path class="po" d="M150,262 Q120,300 90,320 M150,262 Q150,300 146,334 M150,262 Q186,296 214,318 M126,292 Q110,292 100,306 M176,290 Q194,286 204,300" fill="none" stroke="#A9774A" stroke-width="10" stroke-linecap="round"/></g>
 <g class="porg" data-o="stem"><rect class="hit" x="128" y="80" width="44" height="186" fill="transparent"/><rect class="po" x="142" y="84" width="16" height="182" rx="8" fill="#5DAA4E" stroke="#3E7E33" stroke-width="4"/></g>
 <g class="porg" data-o="leaf"><path class="po" d="M146,200 Q96,214 62,176 Q106,150 146,190Z" fill="#81A63C" stroke="#3E7E33" stroke-width="4"/><path class="po" d="M154,160 Q204,170 240,132 Q194,108 154,150Z" fill="#81A63C" stroke="#3E7E33" stroke-width="4"/><path class="po" d="M146,124 Q104,128 80,96 Q118,78 146,116Z" fill="#81A63C" stroke="#3E7E33" stroke-width="4"/></g>
 <g class="xylem" fill="none" stroke="#9FD3F5" stroke-width="4" stroke-linecap="round"><path d="M150,330 Q150,300 150,262 L150,90 M150,262 Q122,298 94,318 M150,262 Q184,294 212,316 M150,194 Q110,196 76,178 M150,154 Q196,150 232,134 M150,120 Q118,116 88,98"/></g>
 <g class="drops" fill="#6FA8DC"><circle class="dr" cx="150" cy="300" r="5"/><circle class="dr" cx="150" cy="300" r="5" style="animation-delay:.5s"/><circle class="dr" cx="150" cy="300" r="5" style="animation-delay:1s"/><circle class="dr" cx="150" cy="300" r="5" style="animation-delay:1.5s"/></g>
 <g class="vap" fill="#fff" stroke="#9FD3F5" stroke-width="2"><circle cx="70" cy="168" r="7"/><circle cx="236" cy="124" r="7" style="animation-delay:.6s"/><circle cx="84" cy="88" r="6" style="animation-delay:1.1s"/><circle cx="220" cy="148" r="5" style="animation-delay:1.6s"/></g>
 <g class="porg" data-o="flower"><circle class="hit" cx="150" cy="58" r="40" fill="transparent"/><g class="po"><circle cx="150" cy="30" r="15" fill="#F27BA0" stroke="#2E3F6E" stroke-width="3"/><circle cx="176" cy="50" r="15" fill="#F27BA0" stroke="#2E3F6E" stroke-width="3"/><circle cx="166" cy="80" r="15" fill="#F27BA0" stroke="#2E3F6E" stroke-width="3"/><circle cx="134" cy="80" r="15" fill="#F27BA0" stroke="#2E3F6E" stroke-width="3"/><circle cx="124" cy="50" r="15" fill="#F27BA0" stroke="#2E3F6E" stroke-width="3"/><circle cx="150" cy="56" r="13" fill="#F5CF5B" stroke="#2E3F6E" stroke-width="3"/></g></g>
</svg>`;
function field(big,label){const cells=[[40,40],[78,34],[116,44],[30,80],[70,76],[110,84],[44,118],[84,116],[120,120]];
  return `<svg viewBox="0 0 150 150" class="field" role="img" aria-label="Sample ${label}: ${big?"very large":"small"} nuclei"><defs><clipPath id="cp${label}"><circle cx="75" cy="75" r="68"/></clipPath></defs>
  <circle cx="75" cy="75" r="70" fill="#FDF3F6" stroke="#2E3F6E" stroke-width="6"/><g clip-path="url(#cp${label})">
  ${cells.map(([x,y],i)=>`<rect x="${x-20}" y="${y-18}" width="40" height="36" rx="12" fill="#F6C9D6" stroke="#C0587A" stroke-width="2.5" transform="rotate(${(i*23)%30-15} ${x} ${y})"/><circle cx="${x+(i%3-1)*2}" cy="${y}" r="${big?(i%2?12:14):4.5}" fill="#8E6CC9"/>`).join("")}</g>
  <text x="75" y="146" text-anchor="middle" font-family="Lexend,Arial" font-size="0">${label}</text></svg>`;}
const SLIDE_SVG=`<svg viewBox="0 0 320 130" role="img" aria-label="A microscope slide"><rect x="10" y="30" width="300" height="76" rx="8" fill="#EAF4FB" stroke="#2E3F6E" stroke-width="5"/>
 <ellipse cx="160" cy="68" rx="34" ry="20" fill="#F6B8C6" opacity=".9"/><g id="cover" style="transition:transform 1.1s ease-out;transform:translateY(-130px)"><rect x="112" y="24" width="96" height="88" rx="4" fill="#fff" fill-opacity=".45" stroke="#6FA8DC" stroke-width="4"/></g></svg>`;
const RIBBON_SVG=`<svg viewBox="0 0 360 150" role="img" aria-label="A red ribbon across the gate of Body Town">
 <rect x="8" y="10" width="20" height="130" rx="6" fill="#CFD8E6" stroke="#2E3F6E" stroke-width="5"/><rect x="332" y="10" width="20" height="130" rx="6" fill="#CFD8E6" stroke="#2E3F6E" stroke-width="5"/>
 <g class="rL"><path d="M28,62 Q100,78 180,70 L180,92 Q100,100 28,84Z" fill="#E0455F" stroke="#2E3F6E" stroke-width="4"/></g>
 <g class="rR"><path d="M332,62 Q260,78 180,70 L180,92 Q260,100 332,84Z" fill="#E0455F" stroke="#2E3F6E" stroke-width="4"/>
  <path d="M180,80 Q150,52 146,84 Q150,110 180,80Z M180,80 Q210,52 214,84 Q210,110 180,80Z" fill="#F27BA0" stroke="#2E3F6E" stroke-width="4"/><circle cx="180" cy="80" r="9" fill="#E0455F" stroke="#2E3F6E" stroke-width="4"/></g>
 <text x="180" y="138" text-anchor="middle" font-family="Lexend,Arial" font-size="18" fill="#56607A">Body Town</text></svg>`;

/* ================= 0 · welcome to Body Town ================= */
function start(){
  trail(0);
  show(`<h1>Body Town Grand Opening</h1><p>It's Grand Opening Day in Body Town, and Celly is the mayor. But Snooze the sleepy dog has muddled every signpost! Be Celly's Chief Engineer. Talk to her, or tap. It goes with the 7Ae Organ systems video.</p>
  <div class="row"><button class="big go" id="go">Open Body Town</button></div>
  <details class="note"><summary>For the grown-up</summary><p>Use Chrome or Edge. When the browser asks for the microphone, choose “Allow while visiting the site”. It asks once.
  Your child's voice is turned into text by the browser (Google in Chrome, Microsoft in Edge). This page does not record or keep anything. It takes about 15 minutes, with a brain break in the middle.
  There is a calm hospital visit near the end (a biopsy, cancer cells, transplants and dialysis), and a short “have your say” moment about organ donor cards to talk about together. It has no right answer and no score.</p></details>`,0);
  $("#say").textContent="Hello, scientist! Press the button to open Body Town.";
  Celly.pose("wave",1800);
  $("#go").onclick=async()=>{ac();loadSprite();S.started=true;if(canHear())Mic.start();
    show(`${announce()}<h2>Welcome to Body Town</h2><p class="muted">🏙️ Grand Opening Day. Mayor: Celly.</p>`,0);
    await say("hello",{face:"happy",pose:"talk wave"});
    Guest.show("snooze","sleep");SFX.snore();Guest.say("Zzz… zzz…",{sfx:null,pose:"sleep"});
    await say("snooze_in",{face:"happy"});SFX.snore();await say("snooze_asleep",{face:"oops"});
    show(`<h2>Wake up, Snooze!</h2><p>${canHear()?"Say: <b>“Wake up, Snooze!”</b>":"Tap Snooze, or press the button."}</p><div class="row"><button class="big" id="wake">⏰ Wake up, Snooze!</button></div>`,0);
    const asked=canHear()?say("miccheck"):say("tapmode",{face:"happy"});
    const how=await wakeSnooze({any:true,ms:7000,after:asked,onMiss:()=>say("nohear",{face:"normal"})});
    await snoozeWakes();
    if(how==="voice"){SFX.sparkle();await say("heardyou",{face:"happy"});}
    await say("help",{face:"happy"});Guest.say("WOOF! Hello, Chief Engineer!");
    show(`<h2>Oh no! A muddle!</h2><div class="patient"><span class="e">🪧</span><div><b>gullet</b> ➜ the bone yard 🦴?</div></div><div class="patient"><span class="e">🪧</span><div><b>kidneys</b> ➜ the phone network 📞?</div></div>`,0);
    await say("problem",{face:"surprised"});
    egypt();};
}
async function egypt(){
  show(`<h2>Snooze is digging…</h2><div class="labbox" id="mapbox"></div>`,0);
  Guest.pose("dig",2200);SFX.dig();await Guest.say("Look what I dug up!",{sfx:null,pose:"dig"});
  $("#mapbox").innerHTML=MAP_SVG;SFX.pop();
  await say("dig",{face:"surprised"});
  await watch("media/clip_air.mp4","Ancient Egyptian doctors and the heart, from the Organ systems video");
  show(`<h2>The heart's “air pipes”</h2><div class="labbox">${MAP_SVG}</div><p>Why did they think this? <span class="muted">${canHear()?"Say it, or tap.":"Tap it."}</span></p><div id="opts"></div>`,0);
  await say("egypt_air",{face:"think"});
  const first=await choose(shuffle([
    {t:"In dead bodies, the blood had drained out. So the tubes held air.",e:"⚱️",ok:1,keys:["drained","dead","drain"]},
    {t:"They looked inside living people with scanners.",e:"🩻",keys:["scanner","scanners","living"]},
    {t:"The heart is full of balloons.",e:"🎈",keys:["balloon","balloons"]}]),{ask:["egypt_why"]});
  await say("egypt_ans",{face:"happy"});await say("today",{face:"normal"});
  rec("Welcome to Body Town","why Egyptian doctors thought the tubes carried air",first,null);
  ladder();
}

/* ================= 1 · climb the ladder ================= */
async function ladder(){
  show(`${announce()}<h2>Climb the ladder</h2><div class="pageq">❓ How do cells, tissues and organs work together?</div>
   <p class="trick">🦉 <b>C</b>an <b>T</b>iny <b>O</b>wls <b>S</b>ing <b>O</b>pera?</p><div id="order"></div>`,1);
  await say("ladder_intro",{face:"think"});await say("ladder_trick",{face:"happy"});
  say("ladder_order",{face:"normal"});
  const m=await orderTiles([{t:"cell",slot:"1",line:"lad_cell"},{t:"tissue",slot:"2",line:"lad_tissue"},{t:"organ",slot:"3",line:"lad_organ"},{t:"organ system",slot:"4",line:"lad_system"},{t:"organism",slot:"5",line:"lad_organism"}],{cls:"ladder words",wrong:"ladder_wrong"});
  rec("Climb the ladder","cell → tissue → organ → organ system → organism",m===0,null);
  SFX.chime();confetti();
  show(`<h2>What is an organ system?</h2><div id="opts"></div>`,1);
  let first=await choose(shuffle([{t:"A group of organs that work together, to do an important job",e:"🏙️",ok:1,keys:["group of organs","group","together"]},
    {t:"Just one big organ",e:"🫀",neg:1,keys:["one big","just one","one organ","big organ"]},
    {t:"A group of the same type of cells",e:"🟡",keys:["same type","same","cells"]}]),{ask:["sys_q"]});
  await say("sys_ans",{face:"happy"});rec("Climb the ladder","organ system = a group of organs working together",first,null);
  show(`<h2>The heart's tissues</h2><div class="patient"><span class="e">❤️</span><div>The heart is <b>one organ</b>. Find its <b>3</b> tissues. <span class="muted">${canHear()?"Tap, or say it.":""}</span></div></div><div id="opts"></div>${micRow()}`,1);
  first=await multiPick(shuffle([{t:"muscle tissue",e:"💪",ok:1,keys:["muscle"]},{t:"fat tissue",e:"🟡",ok:1,keys:["fat"]},{t:"nerve tissue",e:"⚡",ok:1,keys:["nerve","nerves"]},
    {t:"paper tissue",e:"🧻",keys:["paper","sneeze","tissue paper"],no:async()=>{Guest.say("A paper tissue? Achoo!",{sfx:"woof"});await say("paper_tissue",{face:"happy"});}}]),{intro:"heart_tissues"});
  await say("heart_ans",{face:"happy"});rec("Climb the ladder","the heart has muscle, fat and nerve tissue",first,null);
  /* build a stomach */
  show(`<h2>Build a stomach</h2><p class="muted">Start at the bottom: the cells.</p><div id="order"></div><div id="opts"></div>`,1);
  const m2=await orderTiles([{t:"💪 muscle cells + ⚡ nerve cells",slot:"cells"},{t:"muscle tissue + nerve tissue",slot:"tissues"},{t:"stomach",slot:"organ"},],{cls:"ladder words",wrong:"ladder_wrong",
    onPlace:async(i)=>{if(i===0)await say("stomach_cells",{face:"normal"});if(i===2){await say("stomach_organ",{face:"happy"});Guest.say("A stomach! Can I fill it with biscuits?");}}});
  first=await choose(shuffle([{t:"digestive system",e:"🏭",ok:1,keys:["digestive","digest","food"]},{t:"circulatory system",e:"🚚",keys:["circulatory","blood","heart"]},{t:"urinary system",e:"♻️",keys:["urinary","urine","wee"]}]),{ask:["stomach_q"]});
  $("#slots").insertAdjacentHTML("beforeend",`<div class="slot filled"><small>system</small><span>digestive system</span></div>`);
  await say("stomach_ans",{face:"happy"});rec("Climb the ladder","stomach: cells → tissues → organ → digestive system",first&&m2===0,null);
  words();
}

/* ================= 2 · build the words ================= */
const WORDS=[
  {w:"digestive",syl:["di","ges","tive"],mean:"w_digestive",col:"#F29E4C",after:"digest_means",ok:["digestive","digest","digestives","die jest of","di jest if"],
    pre:async()=>{await Guest.say("A DIGESTIVE? Where?!");},post:async()=>{await Guest.say("Aww. No biscuit.",{sfx:"sadbeep",pose:"sad"});}},
  {w:"circulatory",syl:["cir","cu","la","to","ry"],mean:"w_circulatory",col:"#E0455F",after:"circ_means",ok:["circulatory","circulation","circular tree","circulatry","circulatorie"]},
  {w:"urinary",syl:["u","ri","nar","y"],mean:"w_urinary",col:"#E8B931",after:"urin_means",ok:["urinary","urine area","your inary","urinery","you're in a ree"]},
  {w:"locomotor",syl:["lo","co","mo","tor"],mean:"w_locomotor",col:"#81A63C",after:"loco_means",ok:["locomotor","locomotive","loco motor","locomoter","low co motor"]}
];
async function words(){
  show(`${announce()}<h2>Build the words</h2><p class="muted">Engineers need the right words.</p>`,2);
  await say("buildintro",{face:"happy"});
  for(let i=0;i<WORDS.length;i++)await buildWord(WORDS[i],i,WORDS.length,2);
  await say("wordsdone",{face:"happy",pose:"dance"});Celly.setPose("idle");
  signposts();
}
async function buildWord(W,i,N,step){
  let order;do{order=W.syl.map((s,k)=>k).sort(()=>Math.random()-.5);}while(order.every((v,k)=>v===k));
  show(`<h2>Build the word${N>1?` · ${i+1} of ${N}`:""}</h2>
   <div class="meaning"><span class="swatch" style="background:${W.col}"></span><p>${window.LINES[W.mean]}</p></div>
   <div class="slots" id="slots">${W.syl.map(()=>'<div class="slot"></div>').join("")}</div>
   <div class="tiles" id="tiles">${order.map(k=>`<button class="tile" data-k="${k}">${W.syl[k]}</button>`).join("")}</div><div id="more"></div>`,step);
  say([W.mean,"tapbeats"],{face:"normal"});
  let pos=0,mistakes=0;
  await new Promise(done=>card.querySelectorAll(".tile").forEach(b=>b.onclick=()=>{ac();const k=+b.dataset.k;if(pos>=W.syl.length)return;
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
  if(W.pre)await W.pre();
  if(W.after)await say(W.after,{face:"happy"});
  if(W.post)await W.post();
  rec("Build the words",W.w,mistakes===0,said);
}

/* ================= 3 · fix the signposts ================= */
const B=id=>({id,label:SYS[id].n,e:SYS[id].e,small:{dig:"food factory",circ:"delivery vans",breath:"air supply",urin:"waste collection",nerv:"phone network",loco:"transport"}[id],keys:SYS[id].keys});
async function signposts(){
  show(`${announce()}<h2>Fix the signposts · round 1</h2><p class="muted">${canHear()?"Say the team, or tap its box.":"Tap the right team."}</p><div id="sort"></div>`,3);
  await say("sign_intro",{face:"happy"});await Guest.say("Oops. That was me.",{sfx:"sadbeep",pose:"sad"});await say("sign_how",{face:"normal"});Guest.pose("idle");
  const R1=[
    {n:"gullet",e:"🥄",bin:"dig",line:"c_gullet"},{n:"heart",e:"❤️",bin:"circ",line:"c_heart"},{n:"windpipe",e:"🌬️",bin:"breath",line:"c_windpipe"},
    {n:"stomach",e:"🥣",bin:"dig",line:"c_stomach"},{n:"blood vessels",e:"🩸",bin:"circ",line:"c_vessels",after:async()=>{await say("vessels_km",{face:"surprised"});await say("earth4",{face:"happy"});await Guest.say("That's a LOT of walkies!");}},
    {n:"lungs",e:"🫁",bin:"breath",line:"c_lungs",after:async()=>{SFX.snore();Guest.say("Zzz…",{sfx:null,pose:"sleep",ms:2000});}},
    {n:"small intestine",e:"🌀",bin:"dig",line:"c_smallint"},{n:"diaphragm",e:"〰️",bin:"breath",line:"c_diaphragm"},{n:"large intestine",e:"🔄",bin:"dig",line:"c_largeint"},
    {n:"rectum",e:"🚪",bin:"dig",line:"c_rectum"},{n:"liver",e:"🟤",bin:"dig",line:"c_liver",after:async()=>{if(Guest.asleep())await snoozeWakes();}}];
  await sortCards([B("dig"),B("circ"),B("breath")],R1,{act:"Fix the signposts"});
  SFX.chime();confetti();
  show(`<h2>Fix the signposts · round 2</h2><p class="muted">${canHear()?"Say the team, or tap its box.":"Tap the right team."}</p><div id="sort"></div>`,3);
  const R2=[
    {n:"kidneys",e:"🫘",bin:"urin",line:"c_kidneys",after:async()=>{await say("kidneys_40",{face:"surprised"});}},{n:"brain",e:"🧠",bin:"nerv",line:"c_brain"},
    {n:"muscles",e:"💪",bin:"loco",line:"c_muscles"},{n:"bladder",e:"🎈",bin:"urin",line:"c_bladder"},{n:"spinal cord",e:"🦯",bin:"nerv",line:"c_spinal"},
    {n:"nerves",e:"⚡",bin:"nerv",line:"c_nerves"},{n:"bones",e:"🦴",bin:"loco",line:"c_bones",before:async()=>{Guest.pose("dig",1400);await Guest.say("Is that bone for me?");}}];
  await sortCards([B("urin"),B("nerv"),B("loco")],R2,{act:"Fix the signposts"});
  confetti(undefined,undefined,100);await say("sign_done",{face:"happy",pose:"dance"});Celly.setPose("idle");
  townMap();
}

/* ================= 4 · the town map ================= */
const DOGS=[["circ","Can","d_c"],["dig","Dogs","d_d"],["urin","Usually","d_u"],["nerv","Nap","d_n"],["breath","By","d_b"],["loco","Lakes","d_l"]];
async function townMap(){
  show(`${announce()}<h2>The town map</h2><p class="muted">🗺️ Six teams. One trick.</p>`,4);
  await say("map_intro",{face:"happy"});
  await watch("media/clip_dogs.mp4","Can Dogs Usually Nap By Lakes, from the Organ systems video");
  show(`<h2>Can Dogs Usually Nap By Lakes?</h2><p class="trick">🐕 <b>C</b>an <b>D</b>ogs <b>U</b>sually <b>N</b>ap <b>B</b>y <b>L</b>akes?</p><div id="order"></div>`,4);
  await say("dogs_trick",{face:"happy"});await Guest.say("That's ME! I'm the dog! I nap by the lake!",{ms:3800});
  say("dogs_order",{face:"normal"});
  const m=await orderTiles(DOGS.map(([id,w,l])=>({t:SYS[id].n,slot:w,line:l})),{cls:"dogs words",wrong:"dogs_wrong",
    onPlace:async(i,last)=>{if(i===2){SFX.snore();Guest.say("Zzz…",{sfx:null,pose:"sleep",ms:2200});}if(last&&Guest.asleep())snoozeWakes();}});
  rec("The town map","the six systems: Can Dogs Usually Nap By Lakes",m===0,null);
  SFX.chime();confetti();
  /* body map: hear the job, tap the system */
  show(`<h2>Which team does this job?</h2><div class="bodywrap">${BODY_SVG}</div><div class="chips" id="chips">${Object.keys(SYS).map(id=>`<button class="syschip" data-sys="${id}" style="--c:${SYS[id].c}">${SYS[id].e} ${SYS[id].n}</button>`).join("")}</div>`,4);
  await say("jobs_intro",{face:"normal"});
  const JOBS=shuffle([["dig","j_digest"],["circ","j_circ"],["breath","j_breath"],["urin","j_urin"],["nerv","j_nerv"],["loco","j_loco"]]);
  for(const [id,line] of JOBS){
    let wrong=0,settled=false;
    document.querySelectorAll(".syschip.wrong").forEach(c=>c.classList.remove("wrong"));
    await new Promise(done=>{
      const tryS=async s=>{if(settled)return;ac();
        if(s===id){settled=true;if(S.cancelHear)S.cancelHear();bodyLight(id);const ch=$(`.syschip[data-sys="${id}"]`);ch.classList.add("right");SFX.sparkle();confetti(centre(ch).x,centre(ch).y,20);await say(praise(),{face:"happy"});done();}
        else{wrong++;SFX.oops();const ch=$(`.syschip[data-sys="${s}"]`);if(ch){ch.classList.remove("wrong");void ch.offsetWidth;ch.classList.add("wrong");}await say(wrong%2?"body_wrong":"wrong2",{face:"oops"});listen();}};
      document.querySelectorAll(".body .sys").forEach(g=>g.onclick=()=>tryS(g.dataset.sys));
      document.querySelectorAll(".syschip").forEach(b=>b.onclick=()=>tryS(b.dataset.sys));
      const listen=async()=>{if(settled||!canHear())return;const got=await hear(10000,a=>{for(const s of Object.keys(SYS))if(kmatch(a,SYS[s].keys))return s;return null;});if(!settled&&got.ok)tryS(got.val);};
      say(line,{face:"think"}).then(listen);});
    rec("The town map","job of the "+SYS[id].n+" system",wrong===0,null);
  }
  /* Mrs Gren links */
  const P={nutrition:["nutrition","food","eat","eating"],excretion:["excretion","waste","excrete"],sensitivity:["sensitivity","sense","sensing","sensitive"],respiration:["respiration","energy","respire"],movement:["movement","move","moving"],growth:["growth","grow","growing"],reproduction:["reproduction","reproduce","babies"]};
  await say("gren_intro",{face:"happy"});
  for(const [id,p,a] of shuffle([["dig","nutrition","ga_digest"],["urin","excretion","ga_urin"],["nerv","sensitivity","ga_nerv"],["breath","respiration","ga_breath"],["loco","movement","ga_loco"]])){
    const others=shuffle(Object.keys(P).filter(x=>x!==p)).slice(0,2);
    show(`<h2>Mrs Gren's life processes</h2><div class="sortcard" style="border-color:${SYS[id].c}"><span class="ce">${SYS[id].e}</span><span>${SYS[id].n} system</span></div><div id="opts"></div>`,4);
    const first=await choose(shuffle([{t:p,ok:1,keys:P[p]},...others.map(o=>({t:o,keys:P[o]}))]),{ask:["gren_q"]});
    await say(a,{face:"happy"});rec("The town map",SYS[id].n+" system helps with "+p,first,null);
  }
  /* the relay race */
  show(`<h2>A tricky one</h2><div class="bodywrap small">${BODY_SVG}</div><div id="opts"></div>`,4);
  bodyLight("breath");
  const first=await choose(shuffle([{t:"The circulatory system carries it, in the blood",e:"🚚",ok:1,keys:["circulatory","blood","heart"]},
    {t:"The breathing system carries it all the way",e:"💨",keys:["breathing","lungs","breath"]},{t:"Your toes breathe it in",e:"🦶",keys:["toes","toe"]}]),{ask:["oxy_q"]});
  bodyLight("circ");SFX.whoosh();
  await say("oxy_ans",{face:"happy"});await say("oxy_relay",{face:"happy",pose:"pump"});Celly.setPose("idle");
  rec("The town map","breathing takes oxygen in; circulatory carries it round",first,null);
  confetti(undefined,undefined,90);await say("map_done",{face:"happy",pose:"dance"});await say("breaktime",{face:"happy"});Celly.setPose("idle");
  brainBreak();
}

/* ================= 5 · brain break: Body Town workout ================= */
async function brainBreak(){
  show(`${announce()}<h2>Brain break: Body Town workout</h2><div class="move" id="move">Stand up!</div><div class="row" id="bbrow"><button class="tbtn" id="skipBB">skip the brain break</button></div>`,5);
  let skipped=false;$("#skipBB").onclick=()=>{skipped=true;stopVoice();};
  await say("bb_intro",{face:"happy",pose:"wave"});
  const moves=[["bb_pulse","❤️ Fingers on your wrist. Feel the beat!","idle",2400],["bb_breathe","😮‍💨 Hands on your chest. Breathe in… and out.","breath",3600],["bb_kidney","🫘 Hands on your back. Hello, kidneys!","wiggle",2200],
    ["bb_trace","👉 Trace the food path: mouth ➜ tummy.","idle",2600],["bb_nose","👃 Eyes shut. Touch your nose!","idle",2600],["bb_march","🚶 March on the spot! Knees up!","pump",3000]];
  for(const [id,text,pose,ms] of moves){if(skipped)break;$("#move").textContent=text;
    await say(id,{face:"happy",pose});Celly.setPose(pose);await sleep(ms);Celly.setPose("idle");}
  if(!skipped){$("#move").textContent="😴 Nap by the lake… snore!";await say("bb_nap",{face:"happy"});SFX.snore();await sleep(1600);}
  if(!skipped){
    Guest.say("Zzz… zzz… ZZZ…",{sfx:"snore",pose:"sleep",ms:4000});$("#move").textContent="🐕 Snooze really fell asleep!";
    $("#bbrow").innerHTML=`<button class="big" id="wake">⏰ Wake up, Snooze!</button>`;
    const asked=say("bb_snooze",{face:"happy",pose:"dance"});await wakeSnooze({after:asked});Celly.setPose("idle");
    Guest.pose("wag",1600);await Guest.say("WOOF! I wasn't asleep!");$("#bbrow").innerHTML="";
    $("#move").textContent="🙂 Sit down. Ready!";await say("bb_awake",{face:"happy"});
  }else{Guest.pose("idle");}
  Celly.setPose("idle");
  garden();
}

/* ================= 6 · the garden district ================= */
async function garden(){
  show(`${announce()}<h2>The garden district</h2><p class="muted">🌱 Body Town has a garden.</p><div id="opts"></div>`,6);
  let first=await yesNo(["garden_intro"],true,{yesT:"🌱 Yes, they do",noT:"🙅 No, they don't"});
  await say("garden_yes",{face:"happy"});rec("The garden district","plants have organ systems",first,null);
  await watch("media/clip_water.mp4","A plant's water transport system, from the Organ systems video");
  show(`<h2>The water transport system</h2><div class="plantwrap">${PLANT_SVG}</div><div class="labels" id="plabs"></div><p class="muted" id="ph">${canHear()?"Tap, or say the organ.":"Tap the plant."}</p>`,6);
  const ORG={root:["pl_root","roots",["root","roots"]],stem:["pl_stem","stem",["stem"]],leaf:["pl_leaf","leaves",["leaf","leaves"]],flower:["pl_flower","flower",["flower","petal"]]};
  let left=3,wrongN=0;
  await new Promise(async done=>{let busy=false,fin=false;
    const tap=async o=>{if(busy||fin)return;const g=$(`.porg[data-o="${o}"]`);if(g.classList.contains("got"))return;busy=true;ac();
      if(o==="flower"){wrongN++;SFX.oops();g.classList.remove("no");void g.getBBox();g.classList.add("no");Guest.say("Pretty! But no.",{sfx:null});await say(ORG[o][0],{face:"normal"});}
      else{g.classList.add("got");SFX.sparkle();$("#plabs").insertAdjacentHTML("beforeend",`<span class="lab">✅ ${ORG[o][1]}</span>`);await say(ORG[o][0],{face:"happy"});left--;}
      busy=false;if(left===0){fin=true;if(S.cancelHear)S.cancelHear();done();}else listen();};
    document.querySelectorAll(".porg").forEach(g=>g.onclick=()=>tap(g.dataset.o));
    const listen=async()=>{if(fin||!canHear())return;const got=await hear(12000,a=>{for(const o of ["flower","root","stem","leaf"])if(!$(`.porg[data-o="${o}"]`).classList.contains("got")&&kmatch(a,ORG[o][2]))return o;return null;});if(!fin&&got.ok)tap(got.val);};
    await say("garden_tap",{face:"normal"});listen();});
  rec("The garden district","water transport system: roots, stem, leaves",wrongN===0,null);
  /* why does water keep flowing up? */
  $("#ph").innerHTML=`<span class="taphint">👆 Tap a leaf</span>`;
  document.querySelectorAll(".porg").forEach(g=>g.onclick=null);
  await say("water_how",{face:"think"});
  await new Promise(r=>{const g=$(`.porg[data-o="leaf"]`);g.onclick=()=>{ac();g.onclick=null;r();};
    if(canHear())hear(10000,a=>kmatch(a,["leaf","leaves"])).then(v=>{if(v.ok&&g.onclick){g.onclick=null;r();}});});
  if(S.cancelHear)S.cancelHear();
  $(".plant").classList.add("flow");SFX.whoosh();$("#ph").textContent="💧 Water goes up. It evaporates out of tiny holes in the leaves.";
  await say("holes",{face:"normal"});await say("pulled",{face:"happy"});
  show(`<h2>Which tissue carries the water?</h2><div class="plantwrap small">${PLANT_SVG}</div><div id="opts"></div>`,6);
  $(".plant").classList.add("flow");
  first=await choose(shuffle([{t:"xylem",ok:1,keys:["xylem","zylem","zy","silem","sigh","psy","xy"]},{t:"muscle tissue",keys:["muscle"]},{t:"nerve tissue",keys:["nerve"]}]),{ask:["xylem_q"]});
  await say("xylem_ans",{face:"happy"});rec("The garden district","xylem is in all three organs",first,null);
  show(`<h2>The root's ladder</h2><div id="order"></div>`,6);
  say("root_ladder",{face:"normal"});
  const m=await orderTiles([{t:"root hair cell",slot:"cell"},{t:"root hair tissue",slot:"tissue"},{t:"root",slot:"organ"}],{cls:"ladder words"});
  await say("root_done",{face:"happy"});rec("The garden district","root hair cell → root hair tissue → root",m===0,null);
  /* Snooze's question: a fair test */
  show(`<h2>Snooze's question</h2><div class="patient"><span class="e">🍃</span><div>Does a leaf lose more water from its <b>top</b>, or <b>underneath</b>?</div></div><div id="opts"></div>`,6);
  await Guest.say("Top or bottom? I want to know!",{ms:3600});await say("leaf_test",{face:"think"});
  first=await choose(shuffle([{t:"Cover the top of one leaf with jelly, and the underside of another. Weigh them each day.",e:"⚖️",ok:1,keys:["jelly","cover"]},
    {t:"Look at one leaf and guess.",e:"👀",keys:["guess","look"]},{t:"Put one leaf in the sun and one in a cupboard.",e:"☀️",keys:["sun","cupboard","dark"]}]),{ask:["test_how"]});
  await say("test_ans",{face:"normal"});await say("test_fair",{face:"normal"});await say("test_result",{face:"happy"});
  await Guest.say("Dogs don't sweat much. Leaves do it all day!",{ms:3800});
  rec("The garden district","a fair test for leaf water loss",first,null);
  hospital();
}

/* ================= 7 · Body Town Hospital (calm and kind) ================= */
async function hospital(){
  const q={sfx:null,pose:"idle"};
  show(`${announce()}<h2>Body Town Hospital</h2><div class="patient"><span class="e">🏥</span><div>Sometimes an organ doesn't work properly.</div></div>`,7);
  await say("hosp_intro",{face:"normal"});Guest.say("Is everyone okay?",q);
  await say("biopsy_what",{face:"normal"});
  show(`<h2>A biopsy</h2><div class="wordshow">bi · op · sy</div><p class="muted">bio = life · opsy = looking</p><div class="labbox">${SLIDE_SVG}</div><div class="row" id="ff"><button class="big" id="coverslip">🔬 Put the coverslip on</button></div><div id="opts"></div>`,7);
  await say("biopsy_beats",{face:"normal"});
  await waitClick("#coverslip");$("#ff").innerHTML="";$("#cover").style.transform="none";SFX.pop();await sleep(900);
  await say("slide",{face:"normal"});
  show(`<h2>Look closely at the nuclei</h2><p>Which sample might be cancer?</p><div id="opts"></div>`,7);
  await say("compare",{face:"normal"});
  let first=await choose([{e:field(false,"X"),t:"Sample X",keys:["x ","ex ","eggs","sample x","axe"]},{e:field(true,"Y"),t:"Sample Y",ok:1,keys:["y ","why ","wye","sample y","sample why"]}],{grid:true,ask:["cancer_q"]});
  await say("cancer_ans",{face:"normal"});rec("Body Town Hospital","biopsy: very large nuclei (sample Y)",first,null);
  show(`<h2>Is the heart working well?</h2><div id="opts"></div>`,7);
  first=await choose(shuffle([{t:"A pulse that's too fast or too slow",e:"💓",ok:1,keys:["pulse","fast","slow","breath"]},{t:"Their hair turns green",e:"💚",keys:["hair","green"]},{t:"They sneeze a lot",e:"🤧",keys:["sneeze","sneezing"]}]),{ask:["heart_sign_q"]});
  await say("heart_sign_ans",{face:"normal"});rec("Body Town Hospital","signs of a heart problem",first,null);
  show(`<h2>Replacing an organ</h2>`,7);
  await say("fix_or_replace",{face:"normal"});
  await buildWord({w:"transplant",syl:["trans","plant"],mean:"w_transplant",col:"#6FA8DC",after:"trans_means",ok:["transplant","transplants","trans plant","transplanted"]},0,1,7);
  show(`<h2>Where does the organ come from?</h2><div class="patient"><span class="e">💝</span><div>The healthy organ usually comes from a person who has <b>recently died</b>. It's a kind gift.</div></div>`,7);
  await say("donor",{face:"normal"});await say("donor_gift",{face:"happy"});Guest.say("That's a kind gift.",q);
  show(`<h2>Long ago in India</h2><div class="patient"><span class="e">📜</span><div><b>Sushruta</b> mended skin using nearby skin, about <b>2700 years ago</b>.</div></div>`,7);
  await say("sushruta",{face:"normal"});await say("sushruta_when",{face:"surprised"});
  show(`<h2>What can doctors transplant today?</h2><p class="muted">Tap all the ones you think.</p><div id="opts"></div>${micRow()}`,7);
  first=await multiPick(shuffle([{t:"heart",e:"❤️",ok:1,keys:["heart"]},{t:"lungs",e:"🫁",ok:1,keys:["lung","lungs"]},{t:"liver",e:"🟤",ok:1,keys:["liver"]},{t:"kidney",e:"🫘",ok:1,keys:["kidney","kidneys"]},
    {t:"face",e:"🙂",ok:1,keys:["face"]},{t:"arm",e:"💪",ok:1,keys:["arm","arms"]},{t:"leg",e:"🦵",ok:1,keys:["leg","legs"]},
    {t:"Snooze's sleepiness",e:"😴",keys:["sleepy","sleepiness","snooze"],no:async()=>{await say("sleepy_no",{face:"happy"});Guest.say("My sleepiness? Oh. Fair enough.",q);}}]),{intro:"today_q"});
  await say("today_ans",{face:"surprised"});rec("Body Town Hospital","organs doctors can transplant",first,null);
  show(`<h2>When kidneys stop working</h2><div class="patient"><span class="e">🫘</span><div>Kidneys take <b>urea</b> out of the blood. It goes into urine.</div></div>`,7);
  await say("urea",{face:"normal"});await say("kidney_fail",{face:"normal"});await say("dialysis_what",{face:"normal"});
  show(`<h2>Dialysis or transplant?</h2><p class="muted">${canHear()?"Say “dialysis” or “transplant”, or tap.":"Tap the right box."}</p><div id="sort"></div>`,7);
  await say("dt_sort",{face:"normal"});
  await sortCards([{id:"dia",label:"dialysis",e:"🩺",small:"a machine cleans the blood",keys:["dialysis","machine","dial"]},{id:"tra",label:"transplant",e:"💝",small:"a new organ",keys:["transplant","new organ","trans"]}],shuffle([
    {n:"takes many hours, every week",e:"⏳",bin:"dia",line:"dt_hours"},{n:"doesn't need a donor",e:"🙅",bin:"dia",line:"dt_nodonor"},{n:"no medicines for the rest of your life",e:"💊",bin:"dia",line:"dt_nomeds"},
    {n:"a more normal life, even holidays!",e:"🏖️",bin:"tra",line:"dt_normal"},{n:"medicines for the rest of your life",e:"💊",bin:"tra",line:"dt_meds"},{n:"needs a donor, and sometimes doesn't work",e:"🤝",bin:"tra",line:"dt_needdonor"}]),{act:"Body Town Hospital",wrongLine:"wrong",cls:"textcards"});
  await say("dt_done",{face:"happy"});
  /* have your say: no right answer, not scored */
  show(`<h2>Have your say</h2><div class="cards2"><div class="donor"><span class="e">💳</span><span>Carry a card if you <b>DO</b> want to donate</span></div><div class="donor"><span class="e">💳</span><span>Carry a card only if you <b>DON'T</b> want to donate</span></div></div>
   <p class="muted">There's no right answer. Talk about it together.</p><div class="row"><button class="big plain" id="talkGrownUp">I'll talk about it with my grown-up 💬</button></div>`,7);
  await say("card_intro",{face:"normal"});await say("card_other",{face:"think"});
  const talked=waitClick("#talkGrownUp");await say("card_talk",{face:"happy"});await talked;S.donorTalk=true;SFX.pop();
  await say("hosp_done",{face:"happy"});
  teach();
}

/* ================= 8 · teach Celly (she has caught Snooze's sleepiness) ================= */
const MUDDLE=[
  {m:"m1",f:"m1_fix",item:"an organ system is a group of organs",fix:"No! An organ system is a group of organs, working together."},
  {m:"m2",f:"m2_fix",item:"breathing takes oxygen in; circulatory carries it",fix:"No! Breathing only takes oxygen in. The circulatory system carries it round."},
  {m:"m3",f:"m3_fix",item:"the heart's tubes carry blood, not air",fix:"No! They carry blood. The air was only there in dead bodies."},
  {m:"m4",f:"m4_fix",item:"plants have a water transport system",fix:"No! Plants have a water transport system."},
  {m:"m5",f:"m5_fix",item:"the ladder order",fix:"No! Cell, tissue, organ, organ system, organism."}];
async function teach(){
  show(`<h2>Teach Celly</h2><p>Mayor Celly has caught Snooze's sleepiness. She is muddled. Help her!</p>`,8);
  SFX.yawn();Celly.face("surprised");await say("teach_intro",{face:"surprised",pose:"breath"});Celly.setPose("idle");
  for(let i=0;i<MUDDLE.length;i++){const M=MUDDLE[i];
    show(`<h2>Teach Celly · ${i+1} of ${MUDDLE.length}</h2><div class="patient"><span class="e">🥱</span><div>“${window.LINES[M.m]}”</div></div><p class="muted">${canHear()?"Say “no” or “yes”, or tap.":"Tap your answer."}</p><div id="opts"></div>`,8);
    const first=await choose([{t:"Yes, that's right.",keys:["yes","yeah","right","correct"]},{t:M.fix,ok:1,neg:1,keys:["no","nope","wrong","not","never"]}],{ask:[M.m],wrong:"teach_wrong"});
    Celly.face("happy");await say(M.f,{face:"happy",pose:"happy"});
    rec("Teach Celly",M.item,first,null);}
  await say("teach_done",{face:"happy",pose:"dance"});Guest.say("WOOF! I'm wide awake too!");Celly.setPose("idle");
  opening();
}

/* ================= 9 · the Grand Opening, certificate and grown-up summary ================= */
async function opening(){
  show(`${announce()}<h2>The Grand Opening!</h2><div class="labbox ribbon" id="ribbon">${RIBBON_SVG}</div><div class="row" id="rrow"><button class="big go" id="cutRibbon">✂️ Snooze, cut the ribbon!</button></div><div class="labels" id="ideas"></div>`,9);
  Celly.face("happy");Celly.setPose("dance");SFX.chime();
  await say("finish",{face:"happy",pose:"dance"});
  const cut=waitClick("#cutRibbon");await say("ribbon",{face:"happy"});await cut;
  $("#rrow").innerHTML="";Guest.pose("dig",900);SFX.snip();$("#ribbon").classList.add("cut");confetti(undefined,undefined,120);setTimeout(()=>{SFX.sparkle();confetti(undefined,undefined,80);},700);
  await Guest.say("I did it! With my teeth!",{ms:3600});
  const ideas=[["bigideas1","🧱 cells ➜ tissues ➜ organs ➜ organ systems"],["bigideas2","🐕 Can Dogs Usually Nap By Lakes?"],["bigideas3","🌱 roots, stem and leaves"]];
  for(const [id,t] of ideas){$("#ideas").insertAdjacentHTML("beforeend",`<span class="lab">${t}</span>`);await say(id,{face:"normal"});}
  await say("unit_recap",{face:"happy",pose:"dance"});Celly.setPose("idle");
  await say("snooze_bye",{face:"happy"});Guest.say("Zzz… (happily)",{sfx:"snore",pose:"sleep",ms:4000});
  certificate();
}
async function certificate(){
  const total=S.results.length,first=S.results.filter(r=>r.first).length;
  const again=[...new Set(S.results.filter(r=>!r.first||r.said===false).map(r=>r.item))];
  const acts=[...new Set(S.results.map(r=>r.act))];
  const rows=acts.map(a=>`<tr><th>${a}</th><td>${S.results.filter(r=>r.act===a).map(r=>`<div>${r.item} ${r.first&&r.said!==false?'<span class="tag ok">secure</span>':'<span class="tag help">needs another go</span>'}</div>`).join("")}</td></tr>`).join("");
  const date=new Date().toLocaleDateString("en-GB",{day:"numeric",month:"long",year:"numeric"});
  show(`<div class="cert" id="cert"><div class="t">Celly School certificate</div><h1>Unit 7A Champion</h1><p class="sub">Chief Engineer of Body Town</p>
   <p>This is to say that</p><div class="n" id="certName">a brilliant scientist</div>
   <p>fixed every signpost and opened Body Town.<br>7A Cells, tissues, organs and systems · 7Ae Organ systems · ${date}</p>
   <label class="muted" for="nameIn">Your name (a grown-up can help):</label><input id="nameIn" autocomplete="off" maxlength="30">
   <div class="row"><button class="big" id="saveCert">Save my certificate</button></div></div>
   <details class="note"><summary>For the grown-up: how it went</summary>
   <p>${first} of ${total} right first time. “Needs another go” means your child got there with help, or Celly couldn't hear the word clearly. It is not a mark.
   ${again.length?`Practise these next, with the 7Ae workbook pages: <b>${again.join(", ")}</b>.`:"Everything looks secure. Next: unit 7B Sexual reproduction in animals."}</p>
   <p>Talked about donor cards: ${S.donorTalk?"yes":"not yet"}.</p>
   <div class="tablebox"><table>${rows}</table></div></details>
   <div class="row"><button class="big plain" id="restart">Play again</button></div>`,9);
  $("#nameIn").oninput=e=>{$("#certName").textContent=e.target.value.trim()||"a brilliant scientist";};
  $("#saveCert").onclick=saveCert;$("#restart").onclick=()=>location.reload();
  Celly.face("happy");Celly.setPose("dance");SFX.chime();confetti(undefined,undefined,120);
  await say("cert",{face:"happy",pose:"dance"});await say("next",{face:"happy",pose:"wave"});Celly.setPose("idle");Mic.stop();
}
function saveCert(){
  const W=1400,H=990,c=document.createElement("canvas");c.width=W;c.height=H;const g=c.getContext("2d");
  g.fillStyle="#FAF6E9";g.fillRect(0,0,W,H);g.strokeStyle="#81A63C";g.lineWidth=16;g.strokeRect(30,30,W-60,H-60);g.lineWidth=4;g.strokeRect(58,58,W-116,H-116);
  const F='"Lexend", "Segoe UI", Arial, sans-serif';g.fillStyle="#1F2A44";g.textAlign="center";
  g.font=`600 30px ${F}`;g.fillText("CELLY SCHOOL CERTIFICATE",W/2,140);g.font=`600 80px ${F}`;g.fillText("Unit 7A Champion",W/2,240);
  g.font=`600 36px ${F}`;g.fillStyle="#C8742A";g.fillText("Chief Engineer of Body Town",W/2,296);g.fillStyle="#1F2A44";
  g.font=`400 34px ${F}`;g.fillText("This is to say that",W/2,362);g.font=`600 64px ${F}`;g.fillText($("#certName").textContent,W/2,446);
  g.font=`400 34px ${F}`;g.fillText("fixed every signpost and opened Body Town.",W/2,512);g.fillStyle="#56607A";g.font=`400 28px ${F}`;
  g.fillText("7A Cells, tissues, organs and systems · 7Ae Organ systems · "+new Date().toLocaleDateString("en-GB",{day:"numeric",month:"long",year:"numeric"}),W/2,562);
  g.font=`400 26px ${F}`;g.fillText("www.cellyschool.com",W/2,H-72);
  const name="Celly School certificate - Unit 7A Champion.png";
  const save=()=>{const a=document.createElement("a");a.download=name;a.href=c.toDataURL("image/png");document.body.appendChild(a);a.click();a.remove();};
  const toImg=svg=>{const i=new Image();i.src="data:image/svg+xml;charset=utf-8,"+encodeURIComponent(svg.includes("xmlns=")?svg:svg.replace("<svg",'<svg xmlns="http://www.w3.org/2000/svg"'));return i;};
  const cel=toImg(new XMLSerializer().serializeToString(rig).replace(/class="rig[^"]*"/,'class="rig"'));
  const dog=toImg(SNOOZE_SVG.replace(/class="rig guest[^"]*"/,'class="rig"').replace('<g class="zzz"','<g class="zzz" style="display:none"').replace('<g class="dirt"','<g class="dirt" style="display:none"').replace('<path class="eyeShut"','<path class="eyeShut" style="display:none"'));
  let n=0;const both=()=>{if(++n<2)return;try{g.drawImage(cel,W/2-250,592,280,280);}catch(e){}try{g.drawImage(dog,W/2+40,722,250,151);}catch(e){}save();};
  cel.onload=both;cel.onerror=both;dog.onload=both;dog.onerror=both;
}

/* ================= go ================= */
const STEPS=[start,ladder,words,signposts,townMap,brainBreak,garden,hospital,teach,opening];
try{const pr=JSON.parse(sessionStorage.getItem("cs7ae_prefs")||"null");if(pr){S.mode=(pr.mode==="tap"||!SR)?"tap":"talk";if(pr.mute)$("#muteBtn").click();}}catch(e){}
setMode(S.mode);
const R0=+(new URLSearchParams(location.search).get("room")||0);
if(R0>0&&R0<STEPS.length){trail(R0);
  show(`<h2>${TRAIL[R0]}</h2><p>Ready when you are.</p><div class="row"><button class="big go" id="go">Go to ${TRAIL[R0]}</button></div>`,R0);
  $("#say").textContent="Let's go to "+TRAIL[R0]+"!";
  $("#go").onclick=()=>{ac();loadSprite();S.started=true;if(canHear())Mic.start();STEPS[R0]();};
}else{trail(0);start();}
