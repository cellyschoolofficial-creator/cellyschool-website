/* Talk to Celly · 7Ad Cells (v2) · "Celly's Cell Museum" — Celly School
   Story: a big sneeze blows Celly's parts through her Cell Museum; the learner follows them room by room. */
"use strict";
const $=s=>document.querySelector(s);
const card=$("#card");
const SR=window.SpeechRecognition||window.webkitSpeechRecognition;
const S={mode:SR?"talk":"tap",mute:false,results:[],last:[],speaking:false,praise:0,token:0};
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
function rec(act,item,first,said){S.results.push({act,item,first,said});}

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
  for(const id of ids){if(tok!==S.token)break;const text=window.LINES[id]||id;
    if(S.mute){await sleep(Math.min(2400,500+text.length*30));continue;}
    let ok=false;if(window.VOICE.ready&&window.LINES[id]){curAudio=null;ok=await clipLine(id,tok);curAudio=null;}
    if(!ok&&tok===S.token){cancelAnimationFrame(flap);flap=requestAnimationFrame(flapper);await ttsLine(text,tok);cancelAnimationFrame(flap);}
    await sleep(120);}
  if(tok===S.token){S.speaking=false;Mic.muteUntil=performance.now()+450;Celly.mouth(0);if(!pose||pose==="talk")Celly.setPose("idle");}
}
function praise(){S.praise=(S.praise%6)+1;return (typeof praiseExtra==="function"&&praiseExtra())||"p"+S.praise;}
$("#again").onclick=()=>{if(S.last.length)say(S.last);};

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
const TRAIL=["Achoo!","Hooke's rooms","Building blocks","Word workshop","Fix Celly","Wobbly Cabbage","Brain break","Plant or animal?","Special jobs","How big really?","Teach Celly","Draw it","Certificate"];
function trail(n){$("#trail").innerHTML=TRAIL.map((t,i)=>`<span class="step ${i<n?"done":i===n?"now":""}">${i<n?"✓ ":""}${t}</span>`).join("");}
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
/* ================= sidekicks (on screen only: speech tag + synthesised sounds; Celly is the only voice) ================= */
const FACE=(x1,x2,y,s=1)=>`<g pointer-events="none">
 <ellipse cx="${x1}" cy="${y}" rx="${15*s}" ry="${18*s}" fill="#fff" stroke="#2E3F6E" stroke-width="${5*s}"/><circle cx="${x1+2*s}" cy="${y+3*s}" r="${9*s}" fill="#1F2A44"/><circle cx="${x1+5*s}" cy="${y-2*s}" r="${3*s}" fill="#fff"/>
 <ellipse cx="${x2}" cy="${y}" rx="${15*s}" ry="${18*s}" fill="#fff" stroke="#2E3F6E" stroke-width="${5*s}"/><circle cx="${x2+2*s}" cy="${y+3*s}" r="${9*s}" fill="#1F2A44"/><circle cx="${x2+5*s}" cy="${y-2*s}" r="${3*s}" fill="#fff"/>
 <ellipse cx="${x1-20*s}" cy="${y+28*s}" rx="${12*s}" ry="${8*s}" fill="#F6B8C6"/><ellipse cx="${x2+20*s}" cy="${y+28*s}" rx="${12*s}" ry="${8*s}" fill="#F6B8C6"/>
 <path d="M${(x1+x2)/2-16*s},${y+32*s} Q${(x1+x2)/2},${y+50*s} ${(x1+x2)/2+16*s},${y+32*s} Q${(x1+x2)/2},${y+38*s} ${(x1+x2)/2-16*s},${y+32*s}Z" fill="#7A3550" stroke="#2E3F6E" stroke-width="${3*s}" stroke-linejoin="round"/></g>`;
const CURLS=(xs,ys)=>xs.map((x,i)=>`<circle cx="${x}" cy="${ys[i]}" r="24"/>`).join("");
const HOOKE_SVG=`<svg class="rig guest hooke idle" viewBox="0 0 300 350" role="img" aria-label="Robert Hooke, a scientist from 1665">
<ellipse cx="150" cy="338" rx="100" ry="10" fill="#1F2A44" opacity=".08"/>
<g class="whole">
 <path d="M66,334 Q62,250 104,218 L196,218 Q238,250 234,334Z" fill="#8B5E3C" stroke="#2E3F6E" stroke-width="8" stroke-linejoin="round"/>
 <path d="M150,226 L150,334" stroke="#6B4A2E" stroke-width="5"/><circle cx="150" cy="260" r="6" fill="#F2C14E" stroke="#2E3F6E" stroke-width="3"/><circle cx="150" cy="292" r="6" fill="#F2C14E" stroke="#2E3F6E" stroke-width="3"/>
 <g fill="#6B4A2E" stroke="#2E3F6E" stroke-width="5">${CURLS([86,78,80,90,214,222,220,210],[104,146,188,228,104,146,188,228])}</g>
 <path d="M122,214 L178,214 L168,246 L150,236 L132,246Z" fill="#fff" stroke="#2E3F6E" stroke-width="5" stroke-linejoin="round"/>
 <ellipse cx="150" cy="148" rx="56" ry="64" fill="#F6D7B8" stroke="#2E3F6E" stroke-width="8"/>
 <path d="M90,128 Q92,64 150,62 Q208,64 210,128 Q186,96 150,98 Q114,96 90,128Z" fill="#6B4A2E" stroke="#2E3F6E" stroke-width="6" stroke-linejoin="round"/>
 ${FACE(128,172,150,1)}
</g></svg>`;
const CAB_SVG=`<svg class="rig guest cab idle" viewBox="0 0 300 350" role="img" aria-label="Very Wobbly Cabbage, a plant cell">
<ellipse cx="150" cy="336" rx="110" ry="10" fill="#1F2A44" opacity=".08"/>
<g class="whole">
 <rect id="cabWall" x="20" y="40" width="260" height="280" rx="46" fill="#EAF3DA" stroke="#C9B9A3" stroke-width="5" stroke-dasharray="14 10"/>
 <rect x="38" y="58" width="224" height="244" rx="34" fill="none" stroke="#2E3F6E" stroke-width="4"/>
 <g class="part gone" id="cabVac"><rect x="96" y="84" width="108" height="78" rx="34" fill="#BFDDF5" stroke="#6FA8DC" stroke-width="5"/></g>
 <g class="part gone" id="cabChl" fill="#5DAA4E" stroke="#3E7E33" stroke-width="4">
  <ellipse cx="68" cy="100" rx="18" ry="11" transform="rotate(-20 68 100)"/><ellipse cx="234" cy="98" rx="18" ry="11" transform="rotate(20 234 98)"/>
  <ellipse cx="62" cy="236" rx="18" ry="11" transform="rotate(15 62 236)"/><ellipse cx="240" cy="246" rx="18" ry="11" transform="rotate(-15 240 246)"/>
  <ellipse cx="150" cy="284" rx="18" ry="11"/></g>
 <circle cx="70" cy="168" r="15" fill="#8E6CC9" stroke="#6B4FA6" stroke-width="5"/>
 <rect x="206" y="196" width="38" height="18" rx="9" fill="#F29E4C" stroke="#C8742A" stroke-width="4" transform="rotate(25 225 205)"/>
 ${FACE(124,176,200,1)}
</g></svg>`;
const RUBY_SVG=`<svg class="rig guest ruby idle" viewBox="0 0 320 340" role="img" aria-label="Ruby Root-Hair, a root hair cell">
<ellipse cx="130" cy="330" rx="104" ry="9" fill="#1F2A44" opacity=".08"/>
<g class="whole">
 <g class="rarm"><path d="M186,176 L298,146 Q314,144 314,158 Q314,170 298,172 L186,206Z" fill="#FDF0D5" stroke="#A9774A" stroke-width="10" stroke-linejoin="round"/></g>
 <rect x="34" y="150" width="160" height="170" rx="14" fill="#FDF0D5" stroke="#A9774A" stroke-width="12"/>
 <rect x="46" y="162" width="136" height="146" rx="8" fill="none" stroke="#F27BA0" stroke-width="3"/>
 <rect x="56" y="246" width="90" height="50" rx="20" fill="#BFDDF5" stroke="#6FA8DC" stroke-width="4"/>
 <circle cx="164" cy="272" r="12" fill="#8E6CC9" stroke="#6B4FA6" stroke-width="4"/>
 <path d="M114,150 L84,126 L88,160Z M114,150 L144,126 L140,160Z" fill="#E0455F" stroke="#2E3F6E" stroke-width="4" stroke-linejoin="round"/><circle cx="114" cy="148" r="9" fill="#E0455F" stroke="#2E3F6E" stroke-width="4"/>
 ${FACE(94,138,198,.9)}
</g></svg>`;
const MITO=(x,y,r=0,s=1)=>`<g transform="translate(${x},${y}) rotate(${r}) scale(${s})"><rect x="-15" y="-7" width="30" height="14" rx="7" fill="#F29E4C" stroke="#C8742A" stroke-width="3"/></g>`;
const MAX_SVG=`<svg class="rig guest max idle" viewBox="0 0 320 300" role="img" aria-label="Max Muscle, a heart muscle cell">
<ellipse cx="160" cy="290" rx="130" ry="9" fill="#1F2A44" opacity=".08"/>
<g class="whole">
 <path d="M14,250 Q60,232 120,234 Q130,212 112,192" stroke="#2E3F6E" stroke-width="8" fill="none" stroke-linecap="round"/>
 <path d="M306,250 Q260,232 200,234 Q190,212 208,192" stroke="#2E3F6E" stroke-width="8" fill="none" stroke-linecap="round"/>
 <path d="M30,90 L60,60 L90,92 L230,92 L260,60 L290,90 L262,120 L262,200 L290,230 L260,262 L230,230 L90,230 L60,262 L30,230 L58,200 L58,120Z" fill="#F6B8C6" stroke="#2E3F6E" stroke-width="8" stroke-linejoin="round"/>
 <g stroke="#E89AAE" stroke-width="4">${[86,110,134,186,210,234].map(x=>`<line x1="${x}" y1="98" x2="${x}" y2="224"/>`).join("")}</g>
 ${MITO(86,116,20)}${MITO(234,112,-20)}${MITO(80,206,-15)}${MITO(240,204,15)}${MITO(118,222,0,.8)}${MITO(202,222,0,.8)}${MITO(160,104,0,.8)}
 <circle cx="160" cy="214" r="10" fill="#8E6CC9" stroke="#6B4FA6" stroke-width="4"/>
 ${FACE(138,182,150,.9)}
</g></svg>`;
const Guest={kind:null,t:0,
  show(kind){this.kind=kind;$("#guestArt").innerHTML={hooke:HOOKE_SVG,cab:CAB_SVG,ruby:RUBY_SVG,max:MAX_SVG}[kind];$("#actors").classList.add("withGuest");this.pose("popin",800);},
  hide(){this.kind=null;$("#actors").classList.remove("withGuest");$("#gsay").classList.remove("on");},
  el(){return $("#guestArt svg");},
  pose(p,ms){const g=this.el();if(!g)return;g.classList.remove("idle","flap","popin","stretch","beat");void g.getBoundingClientRect();g.classList.add(p);
    if(ms)setTimeout(()=>{const x=this.el();if(x&&x.classList.contains(p)){x.classList.remove(p);x.classList.add("idle");}},ms);},
  say(text,{sfx=null,ms=3200,pose="flap"}={}){if(!this.kind)return Promise.resolve();const b=$("#gsay");b.textContent=text;b.classList.add("on");clearTimeout(this.t);this.t=setTimeout(()=>b.classList.remove("on"),ms);
    const s=sfx||{hooke:"pluck",cab:"boing",ruby:"slide",max:"beat"}[this.kind];if(s&&SFX[s])SFX[s]();
    if(pose)this.pose(pose,pose==="stretch"?2000:pose==="beat"?1700:900);return sleep(Math.min(ms,1400));}
};
function praiseExtra(){return Guest.kind==="cab"&&S.praise===3?"p7":null;}
const Cab={part(name,on){if(name==="wall"){const w=$("#cabWall");if(!w)return;w.setAttribute("stroke",on?"#A9774A":"#C9B9A3");w.setAttribute("stroke-width",on?"14":"5");w.setAttribute("stroke-dasharray",on?"":"14 10");}
  if(name==="chloro"&&$("#cabChl"))$("#cabChl").classList.toggle("gone",!on);if(name==="vacuole"&&$("#cabVac"))$("#cabVac").classList.toggle("gone",!on);},
  target(name){return name==="wall"?$("#cabWall"):name==="chloro"?$("#cabChl"):$("#cabVac");}};
/* sidekick sounds and museum sounds: all synthesised, no audio files */
function noise(t0,dur,{type="bandpass",f0=1000,f1=f0,q=1,g=.2,attack=.01}={}){const c=ac();if(!c)return;const n=Math.ceil(c.sampleRate*dur),b=c.createBuffer(1,n,c.sampleRate),d=b.getChannelData(0);for(let i=0;i<n;i++)d[i]=Math.random()*2-1;
  const s=c.createBufferSource(),f=c.createBiquadFilter(),gn=c.createGain(),t=c.currentTime+t0;s.buffer=b;f.type=type;f.Q.value=q;f.frequency.setValueAtTime(f0,t);f.frequency.exponentialRampToValueAtTime(f1,t+dur);
  gn.gain.setValueAtTime(.0001,t);gn.gain.exponentialRampToValueAtTime(g,t+attack);gn.gain.exponentialRampToValueAtTime(.0001,t+dur);s.connect(f).connect(gn).connect(c.destination);s.start(t);s.stop(t+dur+.02);}
function sweep(f0,f1,t0,dur,{type="sine",g=.1,vib=0}={}){const c=ac();if(!c)return;const t=c.currentTime+t0,o=c.createOscillator(),gn=c.createGain();o.type=type;o.frequency.setValueAtTime(f0,t);o.frequency.exponentialRampToValueAtTime(f1,t+dur);
  if(vib){const l=c.createOscillator(),lg=c.createGain();l.frequency.value=vib;lg.gain.value=f0*.08;l.connect(lg).connect(o.frequency);l.start(t);l.stop(t+dur+.05);}
  gn.gain.setValueAtTime(0,t);gn.gain.linearRampToValueAtTime(g,t+.02);gn.gain.setValueAtTime(g,t+dur*.7);gn.gain.exponentialRampToValueAtTime(.0001,t+dur);o.connect(gn).connect(c.destination);o.start(t);o.stop(t+dur+.05);}
Object.assign(SFX,{
  pluck(){[392,523.3,659.3,784].forEach((f,i)=>{tone(f,i*.09,.07,.09,"sawtooth");tone(f*2,i*.09,.02,.05,"square");});},
  boing(){sweep(180,420,0,.35,{g:.14,vib:18});sweep(420,260,.32,.3,{g:.1,vib:14});},
  slide(){sweep(330,1250,0,.75,{g:.08,type:"triangle"});},
  beat(){[0,.42].forEach(d=>{tone(70,d,.3,.06,"sine");tone(55,d+.14,.24,.07,"sine");});},
  tick(){SFX.kal(784,0,.12);SFX.kal(1047,.08,.08);},
  cross(){tone(196,0,.1,.08,"triangle");},
  key(){tone(1320,0,.05,.03,"square");},
  timewarp(){sweep(200,1600,0,.9,{g:.07,type:"triangle",vib:9});noise(0,1,{f0:300,f1:3000,g:.12,attack:.4});}
});

/* ================= flying parts (the sneeze, and each word bringing a part home) ================= */
const ICON={
  nucleus:'<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="22" fill="#8E6CC9" stroke="#6B4FA6" stroke-width="5"/><circle cx="37" cy="27" r="7" fill="#6B4FA6"/></svg>',
  cytoplasm:'<svg viewBox="0 0 64 64"><path d="M32,6 C50,6 60,18 58,34 C56,52 44,60 30,58 C14,56 6,44 8,30 C10,16 18,6 32,6Z" fill="#FBE7A1" stroke="#E2C565" stroke-width="4"/></svg>',
  membrane:'<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="24" fill="none" stroke="#F27BA0" stroke-width="8"/></svg>',
  mito:'<svg viewBox="0 0 64 64"><g transform="rotate(25 32 32)"><rect x="6" y="20" width="52" height="24" rx="12" fill="#F29E4C" stroke="#C8742A" stroke-width="5"/></g></svg>',
  wall:'<svg viewBox="0 0 64 64"><rect x="8" y="8" width="48" height="48" rx="10" fill="none" stroke="#A9774A" stroke-width="8"/></svg>',
  chloro:'<svg viewBox="0 0 64 64"><ellipse cx="32" cy="32" rx="24" ry="14" fill="#5DAA4E" stroke="#3E7E33" stroke-width="5"/></svg>',
  vacuole:'<svg viewBox="0 0 64 64"><rect x="8" y="14" width="48" height="36" rx="16" fill="#BFDDF5" stroke="#6FA8DC" stroke-width="5"/></svg>'
};
function fly(icon,from,toEl,ms=850){return new Promise(res=>{if(!toEl){res();return;}const f=document.createElement("div");f.className="flyer";f.innerHTML=ICON[icon];document.body.appendChild(f);
  const a=from,b=centre(toEl);const mid={x:(a.x+b.x)/2,y:Math.min(a.y,b.y)-120};
  const an=f.animate([{transform:`translate(${a.x}px,${a.y}px) scale(.8)`},{transform:`translate(${mid.x}px,${mid.y}px) scale(1.3) rotate(180deg)`},{transform:`translate(${b.x}px,${b.y}px) scale(.6) rotate(360deg)`}],{duration:matchMedia("(prefers-reduced-motion:reduce)").matches?10:ms,easing:"ease-in-out"});
  f.style.left="0";f.style.top="0";an.onfinish=()=>{f.remove();res();};});}
async function partHome(name,fromEl){
  const from=fromEl?centre(fromEl):{x:innerWidth/2,y:innerHeight*.75};
  SFX.whoosh();await fly(name,from,Celly.target(name));Celly.part(name,true);SFX.pop();SFX.chime();
  const c=centre(Celly.target(name));confetti(c.x,c.y,40);Celly.face("happy");Celly.pose("happy",1100);}
async function scatter(){
  SFX.whoosh();
  for(const n of ["nucleus","mito","membrane","cytoplasm"]){const c=centre(Celly.target(n));const f=document.createElement("div");f.className="flyer";f.innerHTML=ICON[n];document.body.appendChild(f);f.style.left="0";f.style.top="0";
    const ang=Math.random()*Math.PI*2,dx=Math.cos(ang)*innerWidth,dy=Math.sin(ang)*innerHeight-200;
    f.animate([{transform:`translate(${c.x}px,${c.y}px)`},{transform:`translate(${c.x+dx}px,${c.y+dy}px) rotate(720deg)`}],{duration:900,easing:"ease-in"}).onfinish=()=>f.remove();
    Celly.part(n,false);await sleep(90);}}

/* ================= helpers ================= */
const shuffle=a=>{a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;};
function kmatch(alts,keys){if(!alts||!keys)return false;if(heardAny(alts,keys))return true;
  return alts.some(a=>keys.some(k=>/^[\d.]+$/.test(k)&&new RegExp("(^|[^\\d.])"+k.replace(".","\\.")+"([^\\d.]|$)").test(a)));}
function micRow(){return canHear()?`<div class="row"><button class="tbtn" id="noMic">Celly can't hear me</button></div>`:"";}
/* one question, several answers. Tap, or say a key word. Returns true if right first time. */
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
  if(ask)await say(ask,{face:"normal"});listen();});}
const YES=["yes","yeah","yep","true","tick","right","correct","of course","lots"],NO=["no","nope","false","cross","wrong","not","never","don't","dont","can't","cannot","too small"];
function yesNo(q,isYes,{wrong="lab_wrong",yesT="✅ Yes",noT="❌ No"}={}){
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
    if(wants.includes(p)){off();if(mark)box.querySelectorAll(`[data-part="${p}"]`).forEach(x=>x.classList.add("found"));SFX.sparkle();res({mistakes,part:p,el:e});}
    else{mistakes++;e.classList.remove("nope");void e.getBoundingClientRect();e.classList.add("nope");SFX.oops();
      if(!busy){busy=true;await say(wrong,{face:"oops"});busy=false;}}});});}
function chip(into,text,col){$(into).insertAdjacentHTML("beforeend",`<span class="lab"><i style="background:${col}"></i>${text}</span>`);}
/* put wide cards in order (like Mrs Gren's tiles). Returns the number of wrong taps. */
async function orderCards(C,{labels,wrong,onPlace}){
  let order;do{order=shuffle(C.map((c,k)=>k));}while(order.every((v,k)=>v===k));
  $("#order").innerHTML=`<ol class="oslots" id="oslots">${C.map((c,k)=>`<li class="oslot"><span class="on wide">${labels[k]}</span><span class="ot"></span></li>`).join("")}</ol>
   <div class="ocards" id="ocards">${order.map(k=>`<button class="ocard" data-k="${k}"><span class="oi">${C[k].ic}</span><span>${C[k].t}</span></button>`).join("")}</div>`;
  let pos=0,mistakes=0,busy=false;
  await new Promise(done=>$("#ocards").querySelectorAll(".ocard").forEach(b=>b.onclick=async()=>{if(busy||b.classList.contains("used"))return;ac();const k=+b.dataset.k;
    if(k===pos){busy=true;b.classList.add("used");const s=$("#oslots").children[pos];s.querySelector(".ot").innerHTML=`<span class="oi">${C[k].ic}</span><span>${C[k].t}</span>`;s.classList.add("filled");SFX.tap();
      pos++;await onPlace(k);busy=false;if(pos===C.length)done();}
    else{mistakes++;b.classList.remove("shake");void b.offsetWidth;b.classList.add("shake");SFX.oops();say(wrong,{face:"oops"});}}));
  return mistakes;}
function tapBox(svg,cls=""){return `<div class="labbox tapzone ${cls}">${svg}</div>`;}
function room(n,title){return `<h2><span class="roomno">Room ${n}</span> ${title}</h2>`;}

/* ================= pictures (inline SVG, same pastel style; colour is never the only clue) ================= */
/* Hooke's cork, seen through his microscope: rows of little boxes */
const CORK_SVG=(()=>{let b="";const R=(n)=>{let x=Math.sin(n*12.9898)*43758.5453;return x-Math.floor(x);};let k=0;
  for(let r=0;r<6;r++)for(let c=0;c<7;c++){k++;const x=34+c*40+(r%2?20:0)+R(k)*4,y=40+r*36+R(k+50)*4,w=34+R(k+9)*4,h=30+R(k+3)*3;
    b+=`<rect class="hit" data-part="box" x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${w.toFixed(1)}" height="${h.toFixed(1)}" rx="5" fill="#E8C99A" stroke="#A9774A" stroke-width="4"/>`;}
  return `<svg viewBox="0 0 340 300" role="img" aria-label="Cork through Hooke's microscope: lots of little boxes">
  <defs><clipPath id="lensC"><circle cx="170" cy="150" r="138"/></clipPath></defs>
  <circle cx="170" cy="150" r="146" fill="#1F2A44"/><g clip-path="url(#lensC)"><rect x="0" y="0" width="340" height="300" fill="#C89F6E"/>${b}</g>
  <circle cx="170" cy="150" r="140" fill="none" stroke="#2E3F6E" stroke-width="8"/></svg>`;})();
/* building blocks: one cell, a tissue, a whole living thing */
const BCELL=(x,y,s=1)=>`<g transform="translate(${x},${y}) scale(${s})"><rect x="-17" y="-12" width="34" height="24" rx="7" fill="#F6B8C6" stroke="#2E3F6E" stroke-width="3"/><circle cx="0" cy="0" r="5" fill="#8E6CC9"/></g>`;
function BRICKS(stage){
  const tissue=[0,1,2].map(r=>[0,1,2].map(c=>BCELL(145+c*36,72+r*28)).join("")).join("");
  return `<svg viewBox="0 0 400 186" role="img" aria-label="One cell, then a tissue, then a whole person">
  <g>${BCELL(50,100,1.5)}<text x="50" y="160" text-anchor="middle" font-family="Lexend,Arial" font-size="20" fill="#1F2A44">one cell</text></g>
  <g style="opacity:${stage>=2?1:0};transition:opacity .6s"><path d="M88,100 h26 m-9,-9 l9,9 l-9,9" stroke="#2E3F6E" stroke-width="5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>${tissue}
   <text x="181" y="160" text-anchor="middle" font-family="Lexend,Arial" font-size="20" fill="#1F2A44">a tissue</text></g>
  <g style="opacity:${stage>=3?1:0};transition:opacity .6s"><path d="M240,100 h26 m-9,-9 l9,9 l-9,9" stroke="#2E3F6E" stroke-width="5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
   <defs><pattern id="cellPat" width="16" height="12" patternUnits="userSpaceOnUse"><rect x="1" y="1" width="14" height="10" rx="3" fill="#F6B8C6" stroke="#2E3F6E" stroke-width="1.2"/><circle cx="8" cy="6" r="2" fill="#8E6CC9"/></pattern></defs>
   <g transform="translate(330,14) scale(.82) translate(-330,-14)"><path d="M330,20 a17,17 0 1,1 -.1,0Z M306,60 Q330,52 354,60 L366,104 L354,108 L348,84 L346,130 L352,178 L336,178 L330,134 L324,178 L308,178 L314,130 L312,84 L306,108 L294,104Z" fill="url(#cellPat)" stroke="#2E3F6E" stroke-width="4" stroke-linejoin="round"/></g>
   <text x="330" y="176" text-anchor="middle" font-family="Lexend,Arial" font-size="20" fill="#1F2A44" font-weight="600">you!</text></g></svg>`;}
/* Very Wobbly Cabbage's cell, big, with all seven parts to tap */
const CHL=(x,y,r=0,cls="")=>`<ellipse class="${cls}" cx="${x}" cy="${y}" rx="17" ry="10" transform="rotate(${r} ${x} ${y})" fill="#5DAA4E" stroke="#3E7E33" stroke-width="3.5"/>`;
const PLANT_SVG=`<svg viewBox="0 0 360 280" role="img" aria-label="A plant cell with seven parts">
 <g class="hit" data-part="cyto"><rect x="34" y="34" width="292" height="212" rx="16" fill="#FBF3CF"/></g>
 <g class="hit" data-part="vac"><rect x="112" y="76" width="150" height="118" rx="40" fill="#BFDDF5" stroke="#6FA8DC" stroke-width="5"/></g>
 <g class="hit" data-part="chl">${CHL(70,64,-20)}${CHL(292,62,20)}${CHL(62,132,80)}${CHL(298,150,-80)}${CHL(190,224,0)}${CHL(284,222,-15)}</g>
 <g class="hit" data-part="nuc"><circle cx="82" cy="200" r="24" fill="#8E6CC9" stroke="#6B4FA6" stroke-width="5"/><circle cx="88" cy="194" r="8" fill="#6B4FA6"/></g>
 <g class="hit" data-part="mito">${MITO(140,226,15,1.1)}${MITO(240,48,-10,1.1)}${MITO(108,52,10,1.1)}</g>
 <g class="hit" data-part="mem"><rect x="34" y="34" width="292" height="212" rx="16" fill="none" stroke="transparent" stroke-width="14"/><rect x="34" y="34" width="292" height="212" rx="16" fill="none" stroke="#F27BA0" stroke-width="4"/></g>
 <g class="hit" data-part="wall"><path fill-rule="evenodd" d="M36,10 H324 Q350,10 350,36 V244 Q350,270 324,270 H36 Q10,270 10,244 V36 Q10,10 36,10Z M42,27 Q27,27 27,42 V238 Q27,253 42,253 H318 Q333,253 333,238 V42 Q333,27 318,27Z" fill="#C49A6C" stroke="#7A5434" stroke-width="3"/>
  <g fill="#FAF6E9">${[[90,10,10,17],[230,10,10,17],[10,140,17,10],[333,100,17,10],[160,253,10,17],[333,200,17,10]].map(([x,y,w,h])=>`<rect x="${x}" y="${y}" width="${w}" height="${h}"/>`).join("")}</g></g>
</svg>`;
/* a light-microscope "photo" of leaf cells at ×275: chloroplasts show, mitochondria don't */
const LEAF_PHOTO=(()=>{let s="";const cells=[[14,24,104,150],[124,14,108,160],[238,30,100,144]];
  cells.forEach(([x,y,w,h],i)=>{s+=`<g class="hit" data-part="no"><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="10" fill="#E4EED2" stroke="#8C6A45" stroke-width="7"/><rect x="${x+22}" y="${y+28}" width="${w-44}" height="${h-56}" rx="18" fill="#F1F6EA"/></g>`;
    const pts=[[x+12,y+16],[x+w/2,y+12],[x+w-14,y+18],[x+10,y+h/2],[x+w-11,y+h/2-10],[x+12,y+h-16],[x+w/2,y+h-12],[x+w-14,y+h-18]];
    s+=`<g class="hit" data-part="chl">${pts.map(([a,b],k)=>`<ellipse cx="${a}" cy="${b}" rx="9" ry="6" transform="rotate(${(k*37)%90-40} ${a} ${b})" fill="#4E9A43" stroke="#2F6B2A" stroke-width="2"/>`).join("")}</g>`;});
  return `<svg viewBox="0 0 352 200" role="img" aria-label="A photo of leaf cells through a light microscope, times 275">
  <rect x="0" y="0" width="352" height="200" rx="14" fill="#D7E4C3"/>${s}
  <rect x="270" y="176" width="72" height="20" rx="8" fill="#1F2A44"/><text x="306" y="191" text-anchor="middle" font-family="Lexend,Arial" font-size="14" fill="#fff">×275</text></svg>`;})();
/* mystery cells (simple drawings: thick brown box = cell wall; thin pink line = membrane only) */
const MC={
  cheek:`<svg viewBox="0 0 240 150" role="img" aria-label="A cheek cell"><path d="M60,30 C120,10 196,30 206,74 C214,116 160,138 104,132 C50,128 22,98 30,66 C34,46 44,36 60,30Z" fill="#FBE7EC" stroke="#F27BA0" stroke-width="4"/><circle cx="118" cy="78" r="16" fill="#8E6CC9" stroke="#6B4FA6" stroke-width="4"/>${MITO(70,60,20,.7)}${MITO(168,96,-15,.7)}${MITO(160,48,10,.7)}</svg>`,
  leaf:`<svg viewBox="0 0 240 150" role="img" aria-label="A leaf cell"><rect x="40" y="10" width="160" height="130" rx="12" fill="#EAF3DA" stroke="#A9774A" stroke-width="12"/><rect x="80" y="40" width="80" height="62" rx="22" fill="#BFDDF5" stroke="#6FA8DC" stroke-width="4"/>${CHL(66,34,-20)}${CHL(176,34,20)}${CHL(62,112,20)}${CHL(178,116,-20)}${CHL(120,124,0)}<circle cx="64" cy="76" r="12" fill="#8E6CC9" stroke="#6B4FA6" stroke-width="4"/></svg>`,
  root:`<svg viewBox="0 0 240 150" role="img" aria-label="A root hair cell"><path d="M20,40 H110 L222,18 Q234,18 234,30 Q234,40 222,42 L122,64 V136 H20Z" fill="#FDF0D5" stroke="#A9774A" stroke-width="10" stroke-linejoin="round"/><rect x="34" y="78" width="60" height="44" rx="16" fill="#BFDDF5" stroke="#6FA8DC" stroke-width="4"/><circle cx="104" cy="98" r="10" fill="#8E6CC9" stroke="#6B4FA6" stroke-width="4"/></svg>`,
  fat:`<svg viewBox="0 0 240 150" role="img" aria-label="A fat cell"><ellipse cx="120" cy="75" rx="96" ry="66" fill="#FBE7EC" stroke="#F27BA0" stroke-width="4"/><ellipse cx="126" cy="76" rx="78" ry="54" fill="#FFF3B8" stroke="#E2C565" stroke-width="4"/><ellipse cx="38" cy="78" rx="8" ry="14" fill="#8E6CC9" stroke="#6B4FA6" stroke-width="3"/><text x="126" y="83" text-anchor="middle" font-family="Lexend,Arial" font-size="18" fill="#8A6A2A">store</text></svg>`,
  onion:`<svg viewBox="0 0 240 150" role="img" aria-label="An onion cell"><rect x="16" y="30" width="208" height="90" rx="10" fill="#F6F2FA" stroke="#A9774A" stroke-width="12"/><rect x="40" y="48" width="140" height="54" rx="20" fill="#E3EEF8" stroke="#6FA8DC" stroke-width="4"/><circle cx="196" cy="74" r="12" fill="#8E6CC9" stroke="#6B4FA6" stroke-width="4"/></svg>`,
  muscle:`<svg viewBox="0 0 240 150" role="img" aria-label="A muscle cell"><path d="M10,75 Q60,36 120,34 Q180,36 230,75 Q180,114 120,116 Q60,114 10,75Z" fill="#F6B8C6" stroke="#F27BA0" stroke-width="4"/><circle cx="120" cy="75" r="11" fill="#8E6CC9" stroke="#6B4FA6" stroke-width="3"/>${MITO(66,66,10,.6)}${MITO(90,92,-10,.6)}${MITO(156,60,-10,.6)}${MITO(176,88,10,.6)}${MITO(44,80,0,.5)}${MITO(200,72,0,.5)}</svg>`,
  tube:`<svg viewBox="0 0 240 150" role="img" aria-label="A long plant cell with holes in its end walls"><rect x="8" y="40" width="224" height="70" rx="6" fill="#EAF3DA" stroke="#A9774A" stroke-width="10"/>
   <g fill="#EAF3DA">${[50,66,82,98].map(y=>`<rect x="2" y="${y-4}" width="12" height="8"/><rect x="226" y="${y-4}" width="12" height="8"/>`).join("")}</g>
   <g stroke="#A9C99A" stroke-width="3">${[56,75,94].map(y=>`<line x1="14" y1="${y}" x2="226" y2="${y}"/>`).join("")}</g></svg>`,
  musclePacked:`<svg viewBox="0 0 240 150" role="img" aria-label="A branched cell packed with mitochondria"><path d="M20,40 L50,20 L70,46 L170,46 L190,20 L220,40 L196,64 L196,90 L220,112 L190,132 L170,106 L70,106 L50,132 L20,112 L44,90 L44,64Z" fill="#F6B8C6" stroke="#F27BA0" stroke-width="4" stroke-linejoin="round"/>
   ${[[70,62],[96,58],[124,62],[150,58],[176,64],[66,90],[94,92],[150,92],[178,88],[120,94]].map(([x,y],i)=>MITO(x,y,i%2?15:-15,.55)).join("")}<circle cx="122" cy="76" r="9" fill="#8E6CC9" stroke="#6B4FA6" stroke-width="3"/></svg>`
};
/* a photo with a millimetre ruler under it. 10 px = 1 mm in the drawing */
function RULER_SVG(kind,showRuler){
  const mm=kind==="cheek"?28:62,W=800,x0=40;
  const cell=kind==="cheek"
    ?`<path d="M${x0},120 C${x0+10},50 ${x0+110},28 ${x0+170},40 C${x0+250},52 ${x0+282},96 ${x0+280},128 C${x0+276},178 ${x0+200},200 ${x0+130},196 C${x0+50},192 ${x0-2},170 ${x0},120Z" fill="#FBE7EC" stroke="#F27BA0" stroke-width="6"/><circle cx="${x0+150}" cy="118" r="26" fill="#8E6CC9" stroke="#6B4FA6" stroke-width="5"/>`
    :`<rect x="${x0}" y="60" width="620" height="128" rx="14" fill="#E4EED2" stroke="#8C6A45" stroke-width="10"/><rect x="${x0+80}" y="88" width="460" height="72" rx="30" fill="#F1F6EA"/>${[...Array(12)].map((_,i)=>`<ellipse cx="${x0+40+i*50}" cy="${i%2?78:170}" rx="16" ry="10" fill="#4E9A43" stroke="#2F6B2A" stroke-width="3"/>`).join("")}`;
  let ticks="";for(let i=0;i<=70;i++){const x=x0+i*10,h=i%10===0?30:i%5===0?20:11;ticks+=`<line x1="${x}" y1="236" x2="${x}" y2="${236+h}" stroke="#1F2A44" stroke-width="${i%10===0?3:2}"/>`;
    if(i%10===0)ticks+=`<text x="${x}" y="296" text-anchor="middle" font-family="Lexend,Arial" font-size="34" font-weight="600" fill="#1F2A44">${i}</text>`;}
  return `<svg viewBox="0 0 ${W} 320" role="img" aria-label="A ${kind} cell photo with a ruler">
   <rect x="0" y="0" width="${W}" height="214" rx="16" fill="${kind==="cheek"?"#F7EEF6":"#D7E4C3"}"/>${cell}
   <rect x="${W-120}" y="10" width="106" height="34" rx="10" fill="#1F2A44"/><text x="${W-67}" y="35" text-anchor="middle" font-family="Lexend,Arial" font-size="22" fill="#fff">×${kind==="cheek"?600:275}</text>
   <g class="ruler${showRuler?" in":""}"><rect x="${x0-24}" y="226" width="${W-32}" height="88" rx="8" fill="#FFF6D6" stroke="#C8A44A" stroke-width="3"/>${ticks}<text x="${x0+754}" y="258" text-anchor="end" font-family="Lexend,Arial" font-size="24" fill="#56607A">mm</text>
    <g class="guide"><line x1="${x0}" y1="40" x2="${x0}" y2="236" stroke="#E0455F" stroke-width="3" stroke-dasharray="8 6"/><line x1="${x0+mm*10}" y1="40" x2="${x0+mm*10}" y2="236" stroke="#E0455F" stroke-width="3" stroke-dasharray="8 6"/></g></g></svg>`;}
/* the root hair cell to trace and label */
const RH_OUT="M30,100 L200,100 L360,70 Q392,64 392,84 Q392,100 362,102 L214,128 L214,220 L30,220 Z";
const RH_IN="M42,112 L201,112 L362,82 Q378,79 378,86 Q378,91 360,92 L203,118 L203,208 L42,208 Z";
const ROOTDRAW_SVG=`<svg viewBox="0 0 400 240" role="img" aria-label="A root hair cell to trace and label">
 <g class="col" style="opacity:0;transition:opacity .8s">
  <g class="hit" data-part="cyto"><path d="${RH_IN}" fill="#FDF0D5"/></g>
  <g class="hit" data-part="vac"><rect x="56" y="126" width="104" height="68" rx="24" fill="#BFDDF5" stroke="#6FA8DC" stroke-width="4"/></g>
  <g class="hit" data-part="nuc"><circle cx="182" cy="160" r="14" fill="#8E6CC9" stroke="#6B4FA6" stroke-width="4"/></g>
  <g class="hit" data-part="mem"><path d="${RH_IN}" fill="none" stroke="transparent" stroke-width="12" stroke-linejoin="round"/><path d="${RH_IN}" fill="none" stroke="#F27BA0" stroke-width="3.5" stroke-linejoin="round"/></g>
  <g class="hit" data-part="wall"><path fill-rule="evenodd" d="${RH_OUT} ${RH_IN}" fill="#C49A6C" stroke="#7A5434" stroke-width="2.5" stroke-linejoin="round"/></g>
 </g>
 <g class="dots" fill="none" stroke="#9AA3B5" stroke-width="3" stroke-dasharray="3 7" stroke-linecap="round" stroke-linejoin="round" pointer-events="none" style="transition:opacity .8s">
  <path d="${RH_OUT}"/><path d="${RH_IN}"/><rect x="56" y="126" width="104" height="68" rx="24"/><circle cx="182" cy="160" r="14"/></g>
</svg>`;

/* ================= 0 · welcome to the museum, and the sneeze ================= */
function start(){
  trail(0);
  show(`<h1>Celly's Cell Museum</h1><p>Celly is the guide in her own museum… until a big sneeze! Help her find her parts, room by room. Talk to her, or tap. It goes with the 7Ad Cells video.</p>
  <div class="row"><button class="big go" id="go">Open the museum</button></div>
  <details class="note"><summary>For the grown-up</summary><p>Use Chrome or Edge. When the browser asks for the microphone, choose “Allow while visiting the site”. It asks once.
  Your child's voice is turned into text by the browser (Google in Chrome, Microsoft in Edge). This page does not record or keep anything. It takes about 20 minutes, with a brain break in the middle. Step 10 uses an on-screen calculator.</p></details>`,0);
  $("#say").textContent="Hello, scientist! Press the button to open my Cell Museum.";
  Celly.pose("wave",1800);
  $("#go").onclick=async()=>{ac();loadSprite();S.started=true;if(canHear())Mic.start();
    show(`<h2>Celly's Cell Museum</h2><p class="muted">🏛️ Open every day. Cells of all shapes welcome.</p>`,0);
    await say("hello",{face:"happy",pose:"talk wave"});
    Celly.face("surprised");Celly.setPose("wiggle");$("#say").textContent="Oh dear. My nose is tickly… ah… ah…";SFX.tickle();await sleep(1700);
    Celly.setPose("shiver");await say("sneeze",{pose:"shiver"});
    await scatter();Celly.face("oops");Celly.setPose("idle");confetti(innerWidth/2,innerHeight/3,30);
    show(`<h2>Oh no!</h2><p>Celly's parts flew off down the museum corridor.</p>`,0);
    await say("scattered",{face:"oops"});await say("help",{face:"worried"});Celly.face("normal");
    if(canHear()){
      show(`<h2>Mic check</h2><p>Say: <b>“Hello, Celly!”</b></p>${micRow()}`,0);
      let noMic=false;const skip=new Promise(r=>$("#noMic").onclick=()=>{noMic=true;stopVoice();if(S.cancelHear)S.cancelHear();r();});
      await say("miccheck");
      const got=noMic?{ok:false}:await Promise.race([hear(7000,a=>a[0].length>0),skip.then(()=>({ok:false}))]);
      if(got&&got.ok){SFX.sparkle();await say("heardyou",{face:"happy"});}
      else await say("nohear",{face:"normal"});
    }else await say("tapmode",{face:"happy"});
    show(`<h2>Today's big question</h2><div class="move">❓ How are <b>plant</b> and <b>animal</b> cells the same, and different?</div>`,0);
    await say("bigq",{face:"think"});
    hooke();};
}

/* ================= 1 · Hooke's little rooms ================= */
async function hooke(){
  show(`${room(1,"Hooke's little rooms")}<div class="patient"><span class="e">⏳</span><div>Time machine to <b>1665</b></div></div>`,1);
  SFX.timewarp();await say("room1",{face:"happy"});
  Guest.show("hooke");await sleep(600);await Guest.say("Good day! I am Robert Hooke.");
  await say("hooke_hi",{face:"happy"});
  show(`${room(1,"Hooke's little rooms")}<p class="muted">Hooke's cork, through his microscope (about ×30)</p>${tapBox(CORK_SVG,"cork")}<p class="taphint" id="hint">👆 Tap <b>3</b> little boxes. <span id="cnt">0</span> of 3</p><div id="opts"></div>`,1);
  Guest.say("Behold, my cork!");await say("cork",{face:"normal"});
  say("tapboxes",{face:"normal"});
  await new Promise(done=>{let n=0;document.querySelectorAll(".cork .hit").forEach(b=>b.onclick=e=>{e.stopPropagation();ac();if(b.classList.contains("found"))return;
    b.classList.add("found");b.setAttribute("fill","#FBE7A1");SFX.tap();n++;$("#cnt").textContent=n;if(n===3){document.querySelectorAll(".cork .hit").forEach(x=>x.onclick=null);done();}});});
  SFX.chime();$("#hint").innerHTML="🏠 Little boxes, like little rooms: <b>cells</b>!";
  await say("boxes_a",{face:"happy"});Guest.say("Little rooms… CELLS!");
  let first=await choose(shuffle([{t:"They looked like the small rooms that monks lived in",e:"🏠",ok:1,keys:["room","rooms","monk","monks","little room","small room"]},
    {t:"They were full of jelly",e:"🍮",keys:["jelly"]},{t:"They could talk",e:"💬",keys:["talk","talking"]}]),{ask:["rooms_q"]});
  await say("rooms_a",{face:"happy"});rec("Hooke's little rooms","Hooke named cells (cork, 1665)",first,null);
  /* microscopes got better: a timeline */
  show(`${room(1,"Microscopes got better")}<p>Put the microscopes in order. <b>Oldest first.</b></p><div id="order"></div>`,1);
  Guest.say("Thirty times bigger!",{ms:3000});
  say("scope_intro",{face:"normal"});
  const C=[{ic:"🔍",t:"Hooke's microscope · about <b>×30</b>",line:"sc_hooke"},{ic:"🔬",t:"Brass microscope · about <b>×200</b>",line:"sc_1800"},{ic:"💡",t:"Modern light microscope · up to <b>×1500</b>",line:"sc_today"}];
  const wr=await orderCards(C,{labels:["1665","early 1800s","today"],wrong:"sc_wrong",onPlace:async k=>{await say(C[k].line,{face:"happy"});}});
  rec("Hooke's little rooms","microscopes: ×30, ×200, ×1500",wr===0,null);
  /* Granville's mummy */
  show(`${room(1,"The mummy mystery")}<div class="patient"><span class="e">🏺</span><div><b>1825</b>: Dr Granville studies a mummy that is about 2500 years old.</div></div><div id="opts"></div>`,1);
  Guest.say("A mummy? How spooky!");
  first=await choose(shuffle([{t:"His microscope magnified more",e:"🔬",ok:1,keys:["magnif","bigger","better","microscope","zoom","more detail"]},
    {t:"The mummy waved at him",e:"👋",neg:1,keys:["wave","waved","waving"],no:async()=>say("mummy_joke",{face:"happy"})},
    {t:"He had bigger eyes",e:"👀",neg:1,keys:["eyes","eye"]}]),{ask:["mummy"]});
  await say("granville_a",{face:"happy"});await say("smaller",{face:"normal"});
  $("#opts").insertAdjacentHTML("afterend",`<div class="move rule">🏺 1825: “cancer” → 2009: <b>TB</b>, a lung disease</div>`);
  await say("tb",{face:"normal"});
  rec("Hooke's little rooms","Granville saw more: higher magnification",first,null);
  Guest.say("Farewell!",{ms:1600});await sleep(1200);SFX.timewarp();Guest.hide();
  blocks();
}

/* ================= 2 · building blocks ================= */
async function blocks(){
  show(`${room(2,"Building blocks")}<div class="labbox" id="bb">${BRICKS(1)}</div><div class="row" id="addrow"><button class="big act" id="add">➕ Add cells</button></div><div id="opts"></div>`,2);
  say("brick1",{face:"happy"});
  await act("#add",["add","more"]);stopVoice();SFX.pop();$("#bb").innerHTML=BRICKS(2);[0,1,2].forEach(i=>setTimeout(SFX.tap,i*150));
  $("#add").textContent="➕ Add even more";
  await say("brick_tissue",{face:"happy"});
  await act("#add",["add","more"]);SFX.chime();$("#bb").innerHTML=BRICKS(3);$("#addrow").remove();
  await say("brick_you",{face:"happy",pose:"happy"});
  let first=await choose(shuffle([{t:"A cell is the basic building block of all living things.",ok:1,keys:["building block","basic","all living","block"]},
    {t:"Only animals are made of cells.",keys:["only animals","only"]},{t:"A cell is bigger than an organ.",keys:["bigger"]}]),{ask:["block_q"]});
  await say("block_a",{face:"happy"});rec("Building blocks","cells are the building blocks of all living things",first,null);
  first=await choose(shuffle([{t:"A group of the same type of cells, working together",e:"🧩",ok:1,keys:["same","group","together","team"]},
    {t:"A paper hanky",e:"🤧",neg:1,keys:["hanky","paper","nose","sneeze"],no:async()=>say("hanky",{face:"happy"})},{t:"One very big cell",e:"🔵",neg:1,keys:["one","big cell"]}]),{ask:["tissue_q"]});
  await say("tissue_a",{face:"happy"});rec("Building blocks","a tissue = the same type of cells working together",first,null);
  words();
}

/* ================= 3 · the word workshop: each word brings a part home ================= */
const WORDS=[
  {w:"nucleus",part:"nucleus",syl:["nu","cle","us"],col:"var(--nucleus)",mean:"w_nucleus",back:"back_nucleus",ok:["nucleus","nucleas","nucleous","new clear us","nuclear","new cleus"]},
  {w:"cytoplasm",part:"cytoplasm",syl:["cy","to","plasm"],col:"var(--cyto)",mean:"w_cytoplasm",back:"back_cytoplasm",ok:["cytoplasm","cyto plasm","site o plasm","sito plasm","psycho plasm","site of plasm"]},
  {w:"membrane",part:"membrane",syl:["mem","brane"],col:"var(--membrane)",mean:"w_membrane",back:"back_membrane",ok:["membrane","member ain","main brain","mem brain","membrain","membranes"]},
  {w:"mitochondria",part:"mito",syl:["mi","to","chon","dri","a"],col:"var(--mito)",mean:"w_mitochondria",back:"back_mitochondria",ok:["mitochondria","mitochondrion","mitochondrian","might o condria","mighty condria","mito condria","mitochondrial"]},
  {w:"chloroplast",plant:"chloro",syl:["chlor","o","plast"],col:"var(--chloro)",mean:"w_chloroplast",after:["chloro_means","notmine"],ok:["chloroplast","chloroplasts","chloro plast","floro plast","clorer plast","chlorplast","cloroplast"]},
  {w:"vacuole",plant:"vacuole",syl:["vac","u","ole"],col:"var(--vacuole)",mean:"w_vacuole",after:["vac_means"],ok:["vacuole","vacuoles","vac you all","vacu ole","back you all","vacuum all","vacuo"]}
];
async function words(){
  show(`${room(3,"Word workshop")}<p class="muted">Each word you build brings one part back to Celly.</p>`,3);
  await say("room3",{face:"happy"});
  await watch("media/clip_words.mp4","Nine Cats Make Music, from the Cells video");
  await say("buildintro",{face:"happy"});
  for(let i=0;i<WORDS.length;i++){await buildWord(WORDS[i],i);
    if(i===3){show(`${room(3,"Word workshop")}<div class="labels">${["nucleus","cytoplasm","membrane","mitochondria"].map((w,k)=>`<span class="lab"><i style="background:${["#8E6CC9","#FBE7A1","#F27BA0","#F29E4C"][k]}"></i>${w}</span>`).join("")}</div><div class="move">🐱 <b>N</b>ine <b>C</b>ats <b>M</b>ake <b>M</b>usic</div>`,3);
      await say("fourback",{face:"happy",pose:"dance"});Celly.setPose("idle");}}
  await say(praise(),{face:"happy"});
  fixCelly();
}
async function buildWord(W,i){
  let order;do{order=W.syl.map((s,k)=>k).sort(()=>Math.random()-.5);}while(order.every((v,k)=>v===k));
  show(`<h2>Build the word · ${i+1} of ${WORDS.length}</h2>
   <div class="meaning"><span class="swatch" style="background:${W.col}"></span><p>${window.LINES[W.mean]}</p></div>
   <div class="slots" id="slots">${W.syl.map(()=>'<div class="slot"></div>').join("")}</div>
   <div class="tiles" id="tiles">${order.map(k=>`<button class="tile" data-k="${k}">${W.syl[k]}</button>`).join("")}</div><div id="more"></div>`,3);
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
  if(W.part){await partHome(W.part,$(".wordshow"));await say(W.back,{face:"happy"});}
  else{const c=centre($(".wordshow"));confetti(c.x,c.y,40);SFX.whoosh();
    $(".wordshow").insertAdjacentHTML("afterend",`<div class="patient"><span class="e">${ICON[W.plant].replace("<svg",'<svg width="54" height="54"')}</span><div>A <b>plant</b> part. Kept safe for a friend!</div></div>`);
    for(const a of W.after)await say(a,{face:a==="notmine"?"surprised":"happy"});}
  rec("Word workshop",W.w,mistakes===0,said);
}

/* ================= 4 · fix Celly: tap her parts ================= */
const LABELS=[
  {part:"nucleus",ask:"ask_nucleus",is:"is_nucleus",name:"nucleus",word:"nucleus",n:"n_nucleus",col:"#8E6CC9"},
  {part:"cytoplasm",ask:"ask_cytoplasm",is:"is_cytoplasm",name:"cytoplasm",word:"cytoplasm",n:"n_cytoplasm",col:"#FBE7A1"},
  {part:"membrane",ask:"ask_membrane",is:"is_membrane",name:"cell surface membrane",word:"membrane",n:"n_membrane",col:"#F27BA0"},
  {part:"mito",ask:"ask_mito",is:"is_mito",name:"mitochondria",word:"mitochondria",n:"n_mitochondria",col:"#F29E4C"}
];
async function fixCelly(){
  bigStage(true);
  show(`${room(4,"The animal cell room")}<p class="muted">Is everything back in the right place?</p>`,4);
  await watch("media/clip_cell.mp4","Draw an animal cell, from the Cells video");
  show(`${room(4,"Fix Celly")}<p class="taphint">👆 Tap the part on Celly.</p><div class="labels" id="labels"></div><div id="more"></div>`,4);
  await say("room4",{face:"happy"});
  const tg=[...document.querySelectorAll("#cellyRig .tgt")];tg.forEach(t=>t.classList.add("tapme"));
  for(const L of LABELS){
    say(L.ask,{face:"normal"});let wrong=0;
    await new Promise(done=>tg.forEach(t=>t.onclick=async ev=>{ev.stopPropagation();ac();const got=t.dataset.part;
      if(got===L.part){tg.forEach(x=>x.onclick=null);done();}
      else{wrong++;SFX.oops();const info=LABELS.find(x=>x.part===got);await say([info.is,"lab_wrong",L.ask],{face:"oops"});}}));
    SFX.chime();Celly.face("happy");Celly.pose("happy",900);if(L.part==="nucleus")$("#cNuc").classList.add("pulse");
    const c=centre(Celly.target(L.part==="membrane"?"cytoplasm":L.part));confetti(c.x,c.y,25);
    chip("#labels",L.name,L.col);
    let said=null;
    if(canHear()){
      $("#more").innerHTML=micRow();
      await say([praise(),"whatname"],{face:"happy"});
      const skip=new Promise(r=>$("#noMic").onclick=()=>{if(S.cancelHear)S.cancelHear();r({skip:true});});
      const W=WORDS.find(w=>w.w===L.word);
      const got=await Promise.race([hear(7000,a=>heardWord(a,L.word,W?W.ok:[])),skip]);
      if(got.ok){said=true;SFX.sparkle();await say(L.is,{face:"happy"});}
      else if(!got.skip){said=false;await say([L.is,"sayit",L.n],{face:"normal"});}
      $("#more").innerHTML="";
    }else await say([praise(),L.is],{face:"happy"});
    $("#cNuc").classList.remove("pulse");
    rec("Fix Celly",L.name,wrong===0,said);
  }
  tg.forEach(t=>{t.classList.remove("tapme");t.onclick=null;});
  await say("foundall",{face:"happy",pose:"dance"});Celly.setPose("idle");
  show(`${room(4,"A tricky one")}<div class="patient"><span class="e">⚡</span><div>“Mitochondria <b>make</b> energy.”</div></div><div id="opts"></div>`,4);
  document.querySelectorAll("#cellyRig .mito").forEach(m=>m.classList.add("glow"));
  const first=await choose([{t:"✅ True",keys:["true","yes","make","makes"]},{t:"❌ False: they <b>release</b> energy",ok:1,neg:1,keys:["false","no","release","releases","not","don't"]}],{ask:["mito_q"]});
  await say("mito_a",{face:"happy"});document.querySelectorAll("#cellyRig .mito").forEach(m=>m.classList.remove("glow"));
  rec("Fix Celly","mitochondria release energy (not make it)",first,null);
  bigStage(false);cabbage();
}

/* ================= 5 · Very Wobbly Cabbage: plant only or both, then label his cell ================= */
const SORT=[
  {n:"nucleus",line:"n_nucleus",bin:"both",col:"var(--nucleus)"},
  {n:"cell wall",line:"n_wall",bin:"plant",col:"var(--wall)",yes:"yes_wall",cab:"wall",g:"That's MY wall!"},
  {n:"cytoplasm",line:"n_cytoplasm",bin:"both",col:"var(--cyto)"},
  {n:"chloroplasts",line:"n_chloroplast",bin:"plant",col:"var(--chloro)",yes:"yes_chloro",cab:"chloro",g:"Ooh, my chloroplasts!"},
  {n:"cell surface membrane",line:"n_csm",bin:"both",col:"var(--membrane)"},
  {n:"vacuole",line:"n_vacuole",bin:"plant",col:"var(--vacuole)",yes:"yes_vacuole",cab:"vacuole",g:"Wobble wobble!"},
  {n:"mitochondria",line:"n_mitochondria",bin:"both",col:"var(--mito)"}
];
const PLABEL=[
  {p:"wall",ask:"pl_wall",a:"pl_wall_a",name:"cell wall (cellulose)",col:"#A9774A"},
  {p:"mem",ask:"pl_mem",a:"pl_mem_a",name:"cell surface membrane",col:"#F27BA0"},
  {p:"vac",ask:"pl_vac",a:"pl_vac_a",name:"vacuole (cell sap)",col:"#6FA8DC"},
  {p:"chl",ask:"pl_chl",a:"pl_chl_a",name:"chloroplast (chlorophyll)",col:"#5DAA4E"},
  {p:"nuc",ask:"pl_nuc",name:"nucleus",col:"#8E6CC9"},
  {p:"cyto",ask:"pl_cyto",name:"cytoplasm",col:"#FBE7A1"},
  {p:"mito",ask:"pl_mito",name:"mitochondria",col:"#F29E4C"}];
async function cabbage(){
  show(`${room(5,"The plant cell room")}<p class="muted">Meet Celly's friend.</p>`,5);
  await say("room5",{face:"happy"});
  await watch("media/clip_cabbage.mp4","Plant cell extras, from the Cells video");
  Guest.show("cab");SFX.chime();await Guest.say("Wobble wobble! Hello!");
  await say("cab_hi",{face:"happy",pose:"wave"});await say("cab_parts",{face:"normal"});
  show(`${room(5,"Plant cells only, or both?")}
   <div class="sortcard" id="sc"></div>
   <div class="bins">
    <button class="bin" id="b-plant">🥬 plant cells only<small>say “plant”</small><span class="got" id="g-plant"></span></button>
    <button class="bin" id="b-both">🥬 + 🙂 both plant and animal cells<small>say “both”</small><span class="got" id="g-both"></span></button>
   </div>`,5);
  await say("cab_how");
  for(const C of SORT){
    $("#sc").innerHTML=`<span class="swatch" style="background:${C.col}"></span>${C.n}`;$("#sc").style.animation="none";void $("#sc").offsetWidth;$("#sc").style.animation="";
    let wrong=0,settled=false;
    const ans=await new Promise(async done=>{
      const tryBin=async b=>{if(settled)return;ac();
        if(b===C.bin){settled=true;if(S.cancelHear)S.cancelHear();done(b);}
        else{wrong++;SFX.oops();const el=$("#b-"+b);el.classList.remove("wrong");void el.offsetWidth;el.classList.add("wrong");await say(C.bin==="plant"?"no_plant":"no_both",{face:"oops"});listenLoop();}};
      $("#b-plant").onclick=()=>tryBin("plant");$("#b-both").onclick=()=>tryBin("both");
      const listenLoop=async()=>{if(settled||!canHear())return;
        const got=await hear(8000,a=>heardAny(a,["both","animal","all of them"])?"both":heardAny(a,["plant","plants","plant only"])?"plant":null);
        if(settled)return;if(got.ok)tryBin(got.val);else if(!got.skipped)listenLoop();};
      await say([C.line,"q_plantboth"],{face:"normal"});listenLoop();});
    $("#g-"+ans).insertAdjacentHTML("beforeend",`<span>${C.n}</span>`);
    if(C.cab){SFX.whoosh();await fly(C.cab,centre($("#sc")),Cab.target(C.cab));Cab.part(C.cab,true);SFX.pop();Guest.say(C.g);const c=centre(Cab.target(C.cab));confetti(c.x,c.y,30);await say(C.yes,{face:"happy"});}
    else{SFX.sparkle();await say("yes_both",{face:"happy"});}
    rec("Plant cells only, or both?",C.n,wrong===0,null);
  }
  await say("vwc",{face:"happy",pose:"dance"});Celly.setPose("idle");
  /* label Cabbage's cell: all seven parts */
  show(`${room(5,"Label Cabbage's cell")}${tapBox(PLANT_SVG,"plant")}<div class="labels" id="labels"></div>`,5);
  await say("cablabel",{face:"normal"});
  const box=$(".tapzone");
  for(const P of PLABEL){
    say(P.ask,{face:"normal"});const r=await tapPart(box,P.p);stopVoice();
    chip("#labels",P.name,P.col);
    if(P.a)await say(P.a,{face:"happy"});else await say(praise(),{face:"happy"});
    rec("Label a plant cell",P.name,r.mistakes===0,null);}
  SFX.chime();confetti();Guest.say("That's me! Wobble wobble!");await say("sevenlabels",{face:"happy",pose:"dance"});Celly.setPose("idle");
  /* a light-microscope photo: chloroplasts yes, mitochondria no */
  show(`${room(5,"Photo puzzle")}${tapBox(LEAF_PHOTO,"photo")}<div id="opts"></div>`,5);
  say("photo_intro",{face:"normal"});
  const r=await tapPart($(".tapzone"),"chl");stopVoice();Guest.say("Ooh, my chloroplasts!");
  await say(praise(),{face:"happy"});rec("Photo puzzle","chloroplasts show in a light-microscope photo",r.mistakes===0,null);
  const first=await yesNo(["photo_mito_q"],false,{yesT:"✅ Yes, I can see lots",noT:"❌ No, they're too small to see here"});
  await say("photo_mito_a",{face:"happy"});rec("Photo puzzle","mitochondria too small to see here",first,null);
  Guest.say("Bye bye! Wobble wobble!",{ms:1800});await sleep(1300);Guest.hide();
  brainBreak();
}

/* ================= 6 · brain break ================= */
async function brainBreak(){
  show(`<h2>Brain break</h2><div class="move" id="move">Stand up!</div><div class="row"><button class="tbtn" id="skipBB">skip the brain break</button></div>`,6);
  let skipped=false;$("#skipBB").onclick=()=>{skipped=true;stopVoice();if(S.cancelHear)S.cancelHear();};
  const moves=[["bb_start","Stand up and copy Celly!","wave"],["bb_fist","✊ Make a fist: nucleus!","talk"],["bb_wiggle","🖐 Wiggle your fingers: cytoplasm!","wiggle"],["bb_circle","⭕ Draw a big circle: membrane!","spin"],["bb_box","🙆 Make a big box with your arms: cell wall!","breath"]];
  for(const [id,text,pose] of moves){if(skipped)break;$("#move").textContent=text;
    if(id==="bb_fist")$("#cNuc").classList.add("pulse");
    await say(id,{face:"happy",pose});Celly.setPose(pose);await sleep(2600);$("#cNuc").classList.remove("pulse");Celly.setPose("idle");}
  if(!skipped){$("#move").textContent="💪 Pump your arms and shout: ENERGY!";
    document.querySelectorAll("#cellyRig .mito").forEach(m=>m.classList.add("glow"));
    await say("bb_energy",{face:"happy",pose:"pump"});Celly.setPose("pump");
    const got=await hear(6000,a=>a[0].length>0);
    if(!skipped){if(got.ok){SFX.sparkle();confetti();await say("bb_heard",{face:"happy",pose:"dance"});}else{await sleep(2500);await say("bb_moves",{face:"happy",pose:"dance"});}}
    document.querySelectorAll("#cellyRig .mito").forEach(m=>m.classList.remove("glow"));
    if(!skipped){$("#move").textContent="😌 Sit down. One slow breath in… and out.";await say("bb_breath",{face:"normal",pose:"breath"});Celly.setPose("breath");await sleep(4200);}}
  Celly.setPose("idle");detective();
}

/* ================= 7 · cell detective: plant or animal? ================= */
const MYST=[["cheek","animal","d_cheek","a cheek cell"],["leaf","plant","d_leaf","a leaf cell"],["root","plant","d_root","a root hair cell"],["fat","animal","d_fat","a fat cell"],["onion","plant","d_onion","an onion cell"],["muscle","animal","d_muscle","a muscle cell"]];
async function detective(){
  show(`${room(6,"Mystery cells")}<div class="sortcard mcell" id="sc"></div>
   <div class="bins">
    <button class="bin" id="b-plant">🌱 plant cell<small>say “plant”</small><span class="got" id="g-plant"></span></button>
    <button class="bin" id="b-animal">🐾 animal cell<small>say “animal”</small><span class="got" id="g-animal"></span></button>
   </div><div id="opts"></div>`,7);
  await say("room6",{face:"happy"});
  let n=0,tricked=false;const TRICK=`<div class="move rule">🔎 The trick: look for a <b>cell wall</b>, not chloroplasts.</div>`;
  for(const [k,kind,line,name] of MYST){n++;
    $("#sc").innerHTML=`<span class="mlab">Mystery cell ${n} of 6</span>${MC[k]}`;$("#sc").style.animation="none";void $("#sc").offsetWidth;$("#sc").style.animation="";
    let wrong=0,settled=false;
    await new Promise(async done=>{
      const tryBin=async b=>{if(settled)return;ac();
        if(b===kind){settled=true;if(S.cancelHear)S.cancelHear();done(b);}
        else{wrong++;SFX.oops();const el=$("#b-"+b);el.classList.remove("wrong");void el.offsetWidth;el.classList.add("wrong");if(k==="root"){$("#opts").innerHTML=TRICK;tricked=true;}await say(k==="root"?"trick":"det_wrong",{face:"oops"});listenLoop();}};
      $("#b-plant").onclick=()=>tryBin("plant");$("#b-animal").onclick=()=>tryBin("animal");
      const listenLoop=async()=>{if(settled||!canHear())return;
        const got=await hear(9000,a=>kmatch(a,["animal","animals"])?"animal":kmatch(a,["plant","plants"])?"plant":null);
        if(settled)return;if(got.ok)tryBin(got.val);else if(!got.skipped)listenLoop();};
      listenLoop();});
    $("#g-"+kind).insertAdjacentHTML("beforeend",`<span>${name}</span>`);SFX.sparkle();
    $("#sc .mlab").textContent=`${name[0].toUpperCase()+name.slice(1)}: ${kind} cell`;
    await say(line,{face:"happy"});
    if(k==="root"&&!tricked){$("#opts").innerHTML=TRICK;await say("trick",{face:"normal"});}
    rec("Plant or animal?",`${name}: ${kind}`,wrong===0,null);
  }
  show(`${room(6,"The best clue")}<div id="opts"></div>`,7);
  const first=await choose(shuffle([{t:"a cell wall",e:"🧱",ok:1,keys:["wall"]},{t:"chloroplasts",e:"🟢",keys:["chloroplast","chloroplasts","green"]},{t:"a big storage space",e:"🫙",keys:["storage","store","space","vacuole"]}]),{ask:["clue_q"],grid:true});
  await say("clue_a",{face:"happy"});rec("Plant or animal?","best clue: the cell wall",first,null);
  await say(praise(),{face:"happy",pose:"dance"});Celly.setPose("idle");
  special();
}

/* ================= 8 · special jobs: Ruby Root-Hair and Max Muscle ================= */
const FEAT=[
  {f:"Lots of mitochondria",e:MITO(0,0,0,1),q:"f_mito",a:"f_mito_a",item:"lots of mitochondria → energy to move",opts:[{t:"Lots of energy, to move",ok:1,keys:["energy","move","moving"]},{t:"Support for the cell",keys:["support"]},{t:"Storing cell sap",keys:["sap","store","storing"]}]},
  {f:"A thicker cell wall",e:"🧱",q:"f_wall",a:"f_wall_a",item:"thicker wall → support",opts:[{t:"More support",ok:1,keys:["support","strong","stronger"]},{t:"Lots of energy, to move",keys:["energy","move"]},{t:"Making food",keys:["food"]}]},
  {f:"Lots of chloroplasts",e:"🟢",q:"f_chl",a:"f_chl_a",item:"lots of chloroplasts → top of the leaf, in the light",opts:[{t:"At the top of a leaf, in the light",ok:1,keys:["top","leaf","light","sun"]},{t:"In a root, underground",neg:1,keys:["root","underground","soil"]},{t:"Deep inside a muscle",keys:["muscle"]}]},
  {f:"No chloroplasts at all",e:"⚫",q:"f_none",a:"f_none_a",item:"no chloroplasts → in a root",opts:[{t:"In a root, underground",ok:1,neg:1,keys:["root","underground","soil","dark"]},{t:"At the top of a leaf, in the light",keys:["top","leaf","light"]},{t:"On the sunny side of a leaf",keys:["sunny","sun"]}]}];
const JOBS={store:{t:"Storing things",e:"🫙",keys:["store","storing","storage","fat"]},carry:{t:"Carrying things",e:"🚚",keys:["carry","carrying","transport","move things","flow"]},move:{t:"Moving",e:"💪",keys:["move","moving","movement","squeeze"]},water:{t:"Taking in water",e:"💧",keys:["water","drink","soak","absorb"]}};
const WXYZ=[["W","fat","store","m_fat_q","m_fat_a","fat cell (animal): stores"],["X","tube","carry","m_tube_q","m_tube_a","sieve tube (plant): carries"],["Y","musclePacked","move","m_musc_q","m_musc_a","muscle cell (animal): moves"],["Z","root","water","m_root_q","m_root_a","root hair cell (plant): takes in water"]];
async function special(){
  show(`${room(7,"Special jobs")}<div class="patient"><span class="e">⭐</span><div><b>specialised</b> cell = a cell with features that let it do a particular job</div></div>`,8);
  await say("spec_def",{face:"normal"});
  await watch("media/clip_special.mp4","Specialised cells and the root hair cell, from the Cells video");
  Guest.show("ruby");await sleep(500);await Guest.say("Hiya! I'm Ruby! *s-t-r-e-t-c-h*",{pose:"stretch"});
  show(`${room(7,"Ruby Root-Hair")}<div class="patient"><span class="e">🌱</span><div><b>root hair cell</b> · takes water from the soil<br><span class="muted">×30 in the book's photo</span></div></div><div class="move" id="move">🙆 Stretch your arm out long!</div><div class="row" id="actrow"><button class="big act" id="did">🙆 I stretched!</button></div><div id="opts"></div>`,8);
  await say("ruby_hi",{face:"happy"});await say("ruby_job",{face:"normal"});
  const st=act("#did",["stretch","done","did it"]);Guest.pose("stretch",2000);await say("ruby_stretch",{face:"happy",pose:"wave"});await st;$("#actrow").remove();
  Guest.say("Slurp! Lovely water.",{pose:"stretch"});
  let first=await yesNo(["ruby_q"],false,{yesT:"✅ Yes",noT:"❌ No chloroplasts"});
  Guest.say("It's dark down here!");await say("ruby_a",{face:"happy"});rec("Special jobs","root hair cells: no chloroplasts",first,null);
  /* Max Muscle */
  show(`${room(7,"Max Muscle")}<p class="muted">A muscle cell, from the video:</p>`,8);
  await watch("media/clip_muscle.mp4","A muscle cell, from the Cells video");
  Guest.show("max");await sleep(500);await Guest.say("Ba-dum! Ba-dum! I'm Max!",{pose:"beat"});
  show(`${room(7,"Max Muscle")}<div class="patient"><span class="e">🫀</span><div><b>heart muscle cell</b> · cells work together to make the heart move<br><span class="muted">×500 in the book's photo</span></div></div><div class="move">✊ Squeeze your fist, like a heartbeat!</div><div class="row" id="actrow"><button class="big act" id="did">✊ I squeezed!</button></div>`,8);
  await say("max_hi",{face:"happy"});await say("max_job",{face:"normal"});await say("max_mito",{face:"normal"});
  const sq=act("#did",["squeeze","done","did it","ba dum"]);await say("max_squeeze",{face:"happy",pose:"pump"});Guest.say("Pump, pump, pump!",{pose:"beat"});await sq;$("#actrow").remove();Celly.setPose("idle");
  /* features and their jobs */
  await say("feat_intro",{face:"normal"});
  for(let i=0;i<FEAT.length;i++){const F=FEAT[i];
    show(`<h2>Feature → job · ${i+1} of 4</h2><div class="sortcard">${F.e.startsWith("<g")?`<svg viewBox="-20 -12 40 24" width="56" height="34">${F.e}</svg>`:`<span style="font-size:40px">${F.e}</span>`}${F.f}</div><div id="opts"></div>`,8);
    first=await choose(shuffle(F.opts),{ask:[F.q]});
    if(i===0)Guest.say("Phew! I need my mitochondria!",{pose:"beat"});
    await say(F.a,{face:"happy"});rec("Special jobs",F.item,first,null);}
  Guest.hide();
  /* mystery cells W to Z */
  await say("myst_intro",{face:"think"});
  for(const [L,pic,job,q,a,item] of WXYZ){
    const others=shuffle(Object.keys(JOBS).filter(j=>j!==job)).slice(0,2);
    show(`<h2>Mystery cell ${L}</h2><div class="sortcard mcell">${MC[pic]}</div><div id="opts"></div>`,8);
    first=await choose(shuffle([{...JOBS[job],ok:1},...others.map(o=>JOBS[o])]),{ask:[q],grid:true});
    await say(a,{face:"happy"});rec("Mystery cells W to Z",item,first,null);}
  confetti();await say("spec_done",{face:"happy",pose:"dance"});Celly.setPose("idle");
  realSize();
}

/* ================= 9 · how big really? (ruler + calculator) ================= */
function fmt(x){return String(parseFloat(x.toPrecision(7)));}
function calcHTML(){const K=["7","8","9","÷","4","5","6","×","1","2","3","−","0",".","=","C"];
  return `<div class="calc" id="calc"><div class="cdisp" id="cdisp">0</div><div class="ckeys">${K.map(k=>`<button class="key${/[÷×−=C]/.test(k)?" opk":""}" data-k="${k}">${k}</button>`).join("")}</div></div>`;}
/* tap the glowing keys in order; returns the answer shown */
function calcRun(seq,result){return new Promise(res=>{let i=0,typed="";const keys=[...document.querySelectorAll("#calc .key")];const d=$("#cdisp");
  const glow=()=>{keys.forEach(k=>k.classList.toggle("glow",i<seq.length&&k.dataset.k===seq[i]));};glow();
  keys.forEach(b=>b.onclick=()=>{ac();if(i>=seq.length)return;const k=b.dataset.k;
    if(k!==seq[i]){b.classList.remove("shake");void b.offsetWidth;b.classList.add("shake");SFX.oops();return;}
    SFX.key();i++;
    if(k==="="){d.textContent=fmt(result);d.classList.add("done");SFX.chime();glow();res(result);return;}
    typed+=/[÷×−]/.test(k)?` ${k} `:k;d.textContent=typed;glow();});});}
const MATH=[
  {kind:"cheek",mm:28,mag:600,rq:"ruler_q",ra:"ruler_a",rwrong:[20,38],cq:"c1_q",ca:"c1_a",seq:["2","8","÷","6","0","0","="],res:28/600,
   right:"about 0.05 mm",words:"about five hundredths of a millimetre",mult:"16 800 mm",add:"628 mm",item:"28 mm ÷ 600 ≈ 0.05 mm"},
  {kind:"leaf",mm:62,mag:275,rq:"ruler2_q",ra:"ruler2_a",rwrong:[60,72],cq:"c2_q",ca:"c2_a",seq:["6","2","÷","2","7","5","="],res:62/275,
   right:"about 0.23 mm",words:"about twenty-three hundredths of a millimetre",mult:"17 050 mm",add:"337 mm",item:"62 mm ÷ 275 ≈ 0.23 mm"}];
async function realSize(){
  show(`${room(8,"How big really?")}<div class="labbox ruled">${RULER_SVG("cheek",false)}</div><div id="opts"></div>`,9);
  await say("room8",{face:"happy"});
  let first=await choose(shuffle([{t:"It looks 600 times bigger than its real size",ok:1,keys:["bigger","times bigger","larger"]},{t:"There are 600 cells",keys:["cells"]},{t:"It is 600 mm wide",keys:["millimetre","millimetres","wide","mm"]}]),{ask:["x600_q"]});
  await say("x600_a",{face:"happy"});rec("How big really?","×600 = looks 600 times bigger",first,null);
  for(let qi=0;qi<MATH.length;qi++){const M=MATH[qi];
    show(`<h2>How big really? · ${M.kind==="cheek"?"cheek cell":"leaf cell"}</h2><div class="labbox ruled">${RULER_SVG(M.kind,false)}</div><div id="opts" class="mathopts"></div>`,9);
    if(qi===1)await say("leaf_intro",{face:"normal"});else await say("measure",{face:"normal"});
    SFX.whoosh();$(".ruler").classList.add("in");await sleep(900);
    first=await choose(shuffle([{t:M.mm+" mm",ok:1,neg:1,keys:[String(M.mm),M.kind==="cheek"?"twenty eight":"sixty two"]},...M.rwrong.map(w=>({t:w+" mm",keys:[String(w)]}))]),{ask:[M.rq],grid:true,wrong:"ruler_wrong"});
    $(".ruler .guide").classList.add("on");await say(M.ra,{face:"happy"});rec("How big really?",`measure the photo: ${M.mm} mm`,first,null);
    show(`<h2>How big really? · ${M.kind==="cheek"?"cheek cell":"leaf cell"}</h2>
      <div class="move rule">real size = picture size <b>÷</b> magnification<br><span class="sum">${M.mm} mm ÷ ${M.mag} = ?</span></div>${calcHTML()}<div id="opts" class="mathopts"></div>`,9);
    card.querySelector("h2").textContent=`How big really? · ${M.kind} cell: work it out`;
    if(qi===0){await say("rule",{face:"normal"});say("calc_go",{face:"happy"});}else say("calc_go",{face:"happy"});
    await calcRun(M.seq,M.res);stopVoice();
    first=await choose(shuffle([{t:`${M.right}<small>${M.words}</small>`,ok:1,neg:1,keys:["point","zero","nought","hundredth","hundredths"]},
      {t:M.mult,keys:["thousand"],no:async()=>say("calc_mult",{face:"oops"})},{t:M.add,keys:["hundred and"],no:async()=>say("calc_add",{face:"oops"})}]),{ask:[M.cq],grid:true});
    await say(M.ca,{face:"happy"});if(qi===0){await say("c1_book",{face:"normal"});await say("tiny",{face:"surprised"});}
    rec("How big really?",M.item,first,null);}
  /* the other way round, with the book's numbers */
  show(`<h2>How big really? · check it backwards</h2><div class="move rule">picture size = real size <b>×</b> magnification<br><span class="sum">0.047 mm × 600 = ?</span></div>${calcHTML()}<div id="opts" class="mathopts"></div>`,9);
  await say("back_intro",{face:"normal"});say("calc_go",{face:"happy"});
  await calcRun(["0",".","0","4","7","×","6","0","0","="],0.047*600);stopVoice();
  first=await choose(shuffle([{t:"about 28 mm",ok:1,keys:["28","twenty eight"]},{t:"about 647 mm",keys:["647","six hundred and forty"]},{t:"about 0.05 mm",keys:["point","zero"]}]),{ask:["c3_q"],grid:true});
  await say("c3_a",{face:"happy",pose:"dance"});Celly.setPose("idle");rec("How big really?","0.047 mm × 600 ≈ 28 mm (backwards)",first,null);
  teach();
}

/* ================= 10 · teach Celly ================= */
const TEACH=[
  {k:"nucleus",item:"what the nucleus does",keys:["control","controls","controlling","boss","in charge","brain","tells","instructions","command","centre","center"],opts:["It controls the cell.","It makes food from light.","It is a strong wall."],right:0},
  {k:"membrane",item:"what the membrane does",keys:["in and out","in or out","goes in","go in","comes in","come in","let","lets","enter","leave","out of","inside","outside","what goes","together","holds"],opts:["It releases energy.","It keeps the cell together, and controls what goes in and out.","It stores cell sap."],right:1}];
const MUDDLE=[
  {m:"m1",f:"m1_fix",item:"plant cells have mitochondria too",fix:"No! Plant cells have mitochondria too."},
  {m:"m2",f:"m2_fix",item:"not all plant cells have chloroplasts",fix:"No! Root hair cells have no chloroplasts."},
  {m:"m3",f:"m3_fix",item:"the cell wall and the membrane are different",fix:"No! The wall is outside. The membrane is inside."}];
async function teach(){
  show(`<h2>Teach Celly</h2><p>Oh dear. Celly is muddled. Help her!</p>`,10);
  Celly.face("worried");await say("teach_intro",{face:"worried",pose:"shiver"});Celly.setPose("idle");
  for(let i=0;i<TEACH.length;i++){const T=TEACH[i];let ok=false,helped=false;
    show(`<h2>Teach Celly · ${i+1} of 5</h2><p>${canHear()?"Explain it to Celly in your own words.":"Tap the best answer."}</p>
     ${canHear()?`<div class="row"><button class="tbtn" id="showOpts">show me some answers</button></div>`:""}<div id="opts"></div>`,10);
    if(canHear()){
      let acc="",earlyOpts=false;$("#showOpts").onclick=()=>{earlyOpts=true;stopVoice();};
      await say(["t_q_"+T.k,"t_explain"],{face:"worried"});
      const r=await new Promise(async done=>{let fin=false;const end=v=>{if(!fin){fin=true;if(S.cancelHear)S.cancelHear();done(v);}};
        $("#showOpts").onclick=()=>end("opts");if(earlyOpts)return end("opts");
        for(let tries=0;tries<2&&!fin;tries++){
          const got=await hear(11000,(a,f)=>{if(f)acc+=" "+a[0];return heardAny([acc+" "+a[0]],T.keys)||null;});
          if(fin)return;if(got.ok)return end("ok");
          if(!got.text){await say("t_nohear",{face:"normal"});continue;}
          return end("help");}
        end("help");});
      if(r==="ok"){ok=true;SFX.sparkle();confetti();await say("t_ok_"+T.k,{face:"happy",pose:"happy"});}
      else if(r==="help"){helped=true;await say("t_help_"+T.k,{face:"think"});await hear(9000,()=>null);SFX.chime();await say("t_gotit",{face:"happy"});}
      else{helped=true;ok=await options(T);}
    }else{await say("t_q_"+T.k,{face:"worried"});ok=await options(T,true);}
    rec("Teach Celly",T.item,ok&&!helped,null);
    $("#opts").insertAdjacentHTML("afterend",`<div class="row"><button class="big" id="next">Next</button></div>`);await waitClick("#next");}
  for(let i=0;i<MUDDLE.length;i++){const M=MUDDLE[i];
    show(`<h2>Teach Celly · ${i+3} of 5</h2><div class="patient"><span class="e">🤔</span><div>“${window.LINES[M.m]}”</div></div><p class="muted">${canHear()?"Say “no” or “yes”, or tap.":"Tap your answer."}</p><div id="opts"></div>`,10);
    const first=await choose([{t:"Yes, that's right.",keys:["yes","yeah","right","correct"]},{t:M.fix,ok:1,neg:1,keys:["no","nope","wrong","not","never"]}],{ask:[M.m],wrong:"teach_wrong"});
    Celly.face("happy");await say(M.f,{face:"happy",pose:"happy"});
    rec("Teach Celly",M.item,first,null);}
  await say("teach_done",{face:"happy",pose:"dance"});Celly.setPose("idle");
  drawIt();
}
function options(T,silent){return new Promise(res=>{$("#opts").innerHTML=`<div class="opts">${T.opts.map((o,k)=>`<button class="opt" data-k="${k}">${o}</button>`).join("")}</div>`;
  if(!silent)say("t_three");let wrong=0;
  $("#opts").querySelectorAll(".opt").forEach(b=>b.onclick=async()=>{ac();const k=+b.dataset.k;
    if(k===T.right){$("#opts").querySelectorAll(".opt").forEach(x=>x.onclick=null);b.classList.add("right");SFX.sparkle();await say("t_ok_"+T.k,{face:"happy",pose:"happy"});res(wrong===0);}
    else{wrong++;b.classList.add("wrong");SFX.oops();say("t_notquite",{face:"oops"});}});});}

/* ================= 11 · draw-along: trace and label a root hair cell ================= */
const RLABEL=[{p:"nuc",ask:"pl_nuc",name:"nucleus",col:"#8E6CC9"},{p:"cyto",ask:"pl_cyto",name:"cytoplasm",col:"#FBE7A1"},{p:"vac",ask:"pl_vac",name:"vacuole",col:"#6FA8DC"},{p:"mem",ask:"pl_mem",name:"cell surface membrane",col:"#F27BA0"},{p:"wall",ask:"pl_wall",name:"cell wall",col:"#A9774A"}];
function tracePad(cv){const box=cv.parentElement,r=box.getBoundingClientRect(),dpr=window.devicePixelRatio||1;cv.width=r.width*dpr;cv.height=r.height*dpr;
  const g=cv.getContext("2d");g.scale(dpr,dpr);g.lineWidth=5;g.lineCap="round";g.lineJoin="round";g.strokeStyle="#8E6CC9";let down=false,last=null,n=0;
  const pt=e=>{const b=cv.getBoundingClientRect();return{x:e.clientX-b.left,y:e.clientY-b.top};};
  cv.onpointerdown=e=>{down=true;last=pt(e);try{cv.setPointerCapture(e.pointerId);}catch(_){}};
  cv.onpointermove=e=>{if(!down)return;const p=pt(e);g.beginPath();g.moveTo(last.x,last.y);g.lineTo(p.x,p.y);g.stroke();last=p;n++;if(n%12===0)tone(500+Math.random()*300,0,.015,.04);};
  cv.onpointerup=cv.onpointercancel=()=>{down=false;};}
async function drawIt(){
  show(`${room(9,"The art studio")}<div class="drawbox tapzone" id="drawbox">${ROOTDRAW_SVG}<canvas id="pad" aria-label="Drawing space: trace the dotted lines"></canvas></div>
    <div class="row" id="trow"><button class="big act" id="doneTrace">✏️ I've finished tracing</button></div><div class="labels" id="labels"></div>`,11);
  tracePad($("#pad"));
  await say("room9",{face:"happy"});say("trace",{face:"normal"});
  await act("#doneTrace",["finished","done","i've finished"],20000);stopVoice();
  $("#trow").remove();$("#pad").style.pointerEvents="none";$("#pad").style.opacity=".55";
  $("#drawbox .col").style.opacity="1";$("#drawbox .dots").style.opacity="0";SFX.chime();confetti(undefined,undefined,40);
  await say("traced",{face:"happy"});
  const box=$("#drawbox");let mistakes=0;
  for(const P of RLABEL){say(P.ask,{face:"normal"});const r=await tapPart(box,P.p);stopVoice();mistakes+=r.mistakes;chip("#labels",P.name,P.col);await say(praise(),{face:"happy"});}
  rec("Draw a root hair cell","label 5 parts (no chloroplasts)",mistakes===0,null);
  await say("nochl",{face:"normal"});await say("drawn",{face:"happy",pose:"dance"});await say("paper",{face:"happy"});Celly.setPose("idle");
  finish();
}

/* ================= the end: certificate and grown-up summary ================= */
const CERT_T="Cell Detective";
async function finish(){
  const total=S.results.length,first=S.results.filter(r=>r.first).length;
  const again=[...new Set(S.results.filter(r=>!r.first||r.said===false).map(r=>r.item))];
  const acts=[...new Set(S.results.map(r=>r.act))];
  const rows=acts.map(a=>`<tr><th>${a}</th><td>${S.results.filter(r=>r.act===a).map(r=>`<div>${r.item} ${r.first&&r.said!==false?'<span class="tag ok">secure</span>':'<span class="tag help">needs another go</span>'}</div>`).join("")}</td></tr>`).join("");
  const date=new Date().toLocaleDateString("en-GB",{day:"numeric",month:"long",year:"numeric"});
  show(`<div class="cert" id="cert"><div class="t">Celly School certificate</div><h1>${CERT_T}</h1>
   <p>This is to say that</p><div class="n" id="certName">a brilliant scientist</div>
   <p>found Celly's parts in every room of the Cell Museum.<br>7Ad Cells · ${date}</p>
   <label class="muted" for="nameIn">Your name (a grown-up can help):</label><input id="nameIn" autocomplete="off" maxlength="30">
   <div class="row"><button class="big" id="saveCert">Save my certificate</button></div></div>
   <div class="move rule">❓ How are plant and animal cells the same, and different?<br><span class="muted"><b>Both:</b> nucleus, cytoplasm, cell surface membrane, mitochondria.<br><b>Plant cells also:</b> cell wall, large vacuole, often chloroplasts.</span></div>
   <details class="note"><summary>For the grown-up: how it went</summary>
   <p>${first} of ${total} right first time. “Needs another go” means your child got there with help, or Celly couldn't hear the word clearly. It is not a mark.
   ${again.length?`Practise these next, with the 7Ad workbook pages: <b>${again.join(", ")}</b>.`:"Everything looks secure. Next: the 7Ae Organ systems video."} On paper: draw and label a root hair cell (Student Book Q8).</p>
   <div class="tablebox"><table>${rows}</table></div></details>
   <div class="row"><button class="big plain" id="restart">Play again</button></div>`,12);
  $("#nameIn").oninput=e=>{$("#certName").textContent=e.target.value.trim()||"a brilliant scientist";};
  $("#saveCert").onclick=saveCert;$("#restart").onclick=()=>location.reload();
  Celly.face("happy");Celly.setPose("dance");SFX.chime();confetti(undefined,undefined,120);setTimeout(()=>{SFX.sparkle();confetti(undefined,undefined,80);},700);
  await say("f_done",{face:"happy",pose:"dance"});await say("answer_bigq",{face:"normal"});await say("answer_bigq2",{face:"normal"});
  await say("f_cert",{face:"happy"});await say("f_next",{face:"happy",pose:"wave"});Celly.setPose("idle");Mic.stop();
}
function saveCert(){
  const W=1400,H=990,c=document.createElement("canvas");c.width=W;c.height=H;const g=c.getContext("2d");
  g.fillStyle="#FAF6E9";g.fillRect(0,0,W,H);g.strokeStyle="#81A63C";g.lineWidth=16;g.strokeRect(30,30,W-60,H-60);g.lineWidth=4;g.strokeRect(58,58,W-116,H-116);
  const F='"Lexend", "Segoe UI", Arial, sans-serif';g.fillStyle="#1F2A44";g.textAlign="center";
  g.font=`600 30px ${F}`;g.fillText("CELLY SCHOOL CERTIFICATE",W/2,150);g.font=`600 84px ${F}`;g.fillText(CERT_T,W/2,260);
  g.font=`400 34px ${F}`;g.fillText("This is to say that",W/2,340);g.font=`600 64px ${F}`;g.fillText($("#certName").textContent,W/2,430);
  g.font=`400 34px ${F}`;g.fillText("found Celly's parts in every room of the Cell Museum.",W/2,500);g.fillStyle="#56607A";g.fillText("7Ad Cells · "+new Date().toLocaleDateString("en-GB",{day:"numeric",month:"long",year:"numeric"}),W/2,556);
  g.font=`400 26px ${F}`;g.fillText("www.cellyschool.com",W/2,H-90);
  const name="Celly School certificate - "+CERT_T+".png";
  const save=()=>{const a=document.createElement("a");a.download=name;a.href=c.toDataURL("image/png");document.body.appendChild(a);a.click();a.remove();};
  const svg=new XMLSerializer().serializeToString(rig).replace(/class="rig[^"]*"/,'class="rig"');
  const img=new Image();img.onload=()=>{g.drawImage(img,W/2-170,590,340,340);save();};img.onerror=save;
  img.src="data:image/svg+xml;charset=utf-8,"+encodeURIComponent(svg.includes("xmlns=")?svg:svg.replace("<svg",'<svg xmlns="http://www.w3.org/2000/svg"'));
}

/* ================= go ================= */
setMode(S.mode);trail(0);start();
