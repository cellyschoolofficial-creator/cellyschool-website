/* School order (Nov 2026): a parent can set the order their school teaches the units.
   Saved on this device (localStorage "cs_order"); every "Next" suggestion follows it. */
window.CSOrder=(function(){
  var D=window.CS_DATA||{L:[],U:[]};
  function get(){try{var o=JSON.parse(localStorage.getItem('cs_order')||'null');return o&&o.units&&o.units.length?o:null;}catch(e){return null;}}
  function set(o){try{localStorage.setItem('cs_order',JSON.stringify(o||{units:[],now:'',t:Date.now()}));}catch(e){}try{if(window.CSSync)CSSync.soon();}catch(e){}}
  function book(){return D.U.map(function(u){return u[0];});}
  function units(){var o=get(),b=book();if(!o)return b;var out=o.units.filter(function(c){return b.indexOf(c)>=0;});b.forEach(function(c){if(out.indexOf(c)<0)out.push(c);});return out;}
  function unitOf(code){return String(code).slice(0,2).toUpperCase();}
  function lessonsOf(u){return D.L.filter(function(l){return unitOf(l[1])===u;});}
  function find(slug){for(var i=0;i<D.L.length;i++)if(D.L[i][0]===slug)return D.L[i];return null;}
  // next lesson: the next one in the same unit, else the first lesson of the next unit in the school's order
  function nextAfter(slug){
    var l=find(slug);if(!l)return null;var u=unitOf(l[1]),inU=lessonsOf(u),i=-1;
    inU.forEach(function(x,k){if(x[0]===slug)i=k;});
    if(i>=0&&i+1<inU.length)return inU[i+1];
    var us=units(),j=us.indexOf(u);
    for(var k=j+1;k<us.length;k++){var f=lessonsOf(us[k]);if(f.length)return f[0];}
    return null;
  }
  function current(){var o=get();return o&&o.now?o.now:null;}
  function unitName(c){for(var i=0;i<D.U.length;i++)if(D.U[i][0]===c)return D.U[i][1];return '';}
  return {get:get,set:set,book:book,units:units,nextAfter:nextAfter,lessonsOf:lessonsOf,find:find,current:current,unitName:unitName,custom:function(){return !!get();}};
})();
(function(){
  // Phone menu: one button opens the full list (Stage 1, Nov 2026)
  var mb=document.getElementById('menuBtn'), nv=document.getElementById('mainNav');
  if(mb&&nv)mb.addEventListener('click',function(){var o=!nv.classList.contains('open');nv.classList.toggle('open',o);mb.setAttribute('aria-expanded',o?'true':'false');});
  // Reading comfort: bigger text and wider spacing, remembered on this device only.
  var html=document.documentElement, btn=document.getElementById('comfy');
  function set(on){html.classList.toggle('comfy',on);if(btn)btn.setAttribute('aria-pressed',on?'true':'false');}
  try{set(localStorage.getItem('comfy')==='1');}catch(e){}
  if(btn)btn.addEventListener('click',function(){var on=!html.classList.contains('comfy');set(on);try{localStorage.setItem('comfy',on?'1':'0');}catch(e){}});

  // Lesson video: shown from its go-live time; loads YouTube only when the play button is pressed.
  var box=document.querySelector('.video[data-vid]');
  if(!box)return;
  var vid=box.getAttribute('data-vid'), from=box.getAttribute('data-from'), age=box.hasAttribute('data-age');
  var live=!from||Date.now()>=Date.parse(from);
  if(!live){
    var d=new Date(Date.parse(from));
    var txt=d.toLocaleString(undefined,{weekday:'long',day:'numeric',month:'long',hour:'numeric',minute:'2-digit'});
    box.querySelector('.when').textContent=txt;
    return;
  }
  document.querySelectorAll('.yt-link').forEach(function(a){a.hidden=false;});
  document.querySelectorAll('.t[data-s]').forEach(function(t){
    var a=document.createElement('a');a.href='https://www.youtube.com/watch?v='+vid+'&t='+t.getAttribute('data-s')+'s';a.textContent=t.textContent;a.rel='noopener';a.target='_blank';t.textContent='';t.appendChild(a);
  });
  var soon=box.querySelector('.soon'); if(soon)soon.remove();
  if(age){
    var a=document.createElement('a');a.className='soon';a.href='https://www.youtube.com/watch?v='+vid;a.target='_blank';a.rel='noopener';
    a.innerHTML='<p><strong>Watch this lesson on YouTube</strong><br>This unit is age-restricted on YouTube, so it plays there, not on this page.</p>';
    a.style.textDecoration='none';box.appendChild(a);return;
  }
  var b=document.createElement('button');b.type='button';b.setAttribute('aria-label','Play the lesson video');
  b.style.backgroundImage='url(https://i.ytimg.com/vi/'+vid+'/hqdefault.jpg)';
  b.innerHTML='<span class="play"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5v14l11-7z"/></svg></span>';
  var slug=location.pathname.replace(/^\/(preview-[a-z0-9-]+\/)?/,'').replace(/\.html$/,'');
  var player=null,startAt=0;
  function startVideo(at){
    if(player){try{player.seekTo(at||0,true);player.playVideo();}catch(e){}return;}
    startAt=at||0;
    if(window.csTrack)csTrack('video-play',{lesson:slug});
    // Celly's own controls: the video plays here, and nothing in it links away to YouTube.
    box.innerHTML='<div id="ytPlayer"></div><div class="vshield" aria-hidden="true"></div>'+
      '<div class="vcover"><img src="/img/celly.png" alt=""><p class="vcover-t">Ready?</p><button type="button" class="btn primary vcover-b">▶ Play</button></div>';
    var ctl=document.createElement('div');ctl.className='vctl';
    ctl.innerHTML='<button type="button" class="btn" data-v="pp">⏸ Pause</button><button type="button" class="btn" data-v="back">⏪ Back 10 seconds</button><span class="vt"></span>';
    box.parentNode.insertBefore(ctl,box.nextSibling);
    var cover=box.querySelector('.vcover'),ct=box.querySelector('.vcover-t'),cb=box.querySelector('.vcover-b'),pp=ctl.querySelector('[data-v=pp]'),vt=ctl.querySelector('.vt');
    function fmt(x){x=Math.max(0,Math.round(x));return Math.floor(x/60)+':'+('0'+(x%60)).slice(-2);}
    function play(){if(player&&player.playVideo)player.playVideo();}
    function pause(){if(player&&player.pauseVideo)player.pauseVideo();}
    box.querySelector('.vshield').onclick=pause;
    cb.onclick=function(){if(player&&player.getPlayerState&&player.getPlayerState()===0)player.seekTo(0,true);play();};
    pp.onclick=function(){if(player&&player.getPlayerState&&player.getPlayerState()===1)pause();else play();};
    ctl.querySelector('[data-v=back]').onclick=function(){if(player&&player.getCurrentTime){player.seekTo(Math.max(0,player.getCurrentTime()-10),true);play();}};
    function make(){
      var secs=0,dur=0,last=0,timer=null;
      player=new YT.Player('ytPlayer',{videoId:vid,host:'https://www.youtube-nocookie.com',
        playerVars:{autoplay:1,start:startAt,rel:0,modestbranding:1,playsinline:1,controls:0,disablekb:1,fs:0,iv_load_policy:3,cc_load_policy:1},
        events:{onReady:function(e){try{e.target.playVideo();}catch(x){}},
          onStateChange:function(e){
            clearInterval(timer);
            if(e.data===1){cover.hidden=true;pp.textContent='⏸ Pause';last=Date.now();timer=setInterval(function(){
              var now=Date.now();secs+=Math.min(5,(now-last)/1000);last=now;
              try{dur=player.getDuration()||dur;}catch(x){}
              if(window.csWatched)csWatched(slug,secs,dur);
            },2000);}
            else if(e.data===2){ct.textContent='Paused';cb.textContent='▶ Carry on watching';cover.hidden=false;pp.textContent='▶ Play';}
            else if(e.data===0){ct.textContent='✓ Well done! You watched the whole lesson.';cb.textContent='🔁 Watch it again';cover.hidden=false;pp.textContent='▶ Play';}
          }}});
      var f=box.querySelector('iframe');if(f){f.title='Lesson video';f.setAttribute('allow','autoplay; encrypted-media; picture-in-picture');}
      setInterval(function(){if(player&&player.getCurrentTime&&player.getDuration){var d=player.getDuration();if(d)vt.textContent=fmt(player.getCurrentTime())+' of '+fmt(d);}},500);
    }
    if(window.YT&&window.YT.Player)make();
    else{var prev=window.onYouTubeIframeAPIReady;window.onYouTubeIframeAPIReady=function(){if(prev)prev();make();};
      var sc=document.createElement('script');sc.src='https://www.youtube.com/iframe_api';document.head.appendChild(sc);}
  }
  b.addEventListener('click',function(){startVideo(0);});
  // chapter times jump inside the video on this page (instead of opening YouTube)
  document.querySelectorAll('.t[data-s] a').forEach(function(a){a.removeAttribute('target');a.addEventListener('click',function(e){
    e.preventDefault();startVideo(+a.parentNode.getAttribute('data-s')||0);box.scrollIntoView({behavior:'smooth',block:'center'});});});
  box.appendChild(b);
})();

/* ---------- Progress on this device (Stage 2, Nov 2026) ----------
   Saved only in this browser (localStorage "cs_progress"): which lessons were opened or watched,
   which workbooks were downloaded and which games were finished. Nothing is sent anywhere. */
(function(){
  // progress is kept per child by sync.js (CSProg); fall back to a simple store if it is missing
  var BASE=(location.pathname.match(/^\/preview-[a-z0-9-]+/)||[''])[0];
  function load(){if(window.CSProg)return CSProg.get();try{var p=JSON.parse(localStorage.getItem('cs_progress2')||'null')||{};p.lessons=p.lessons||{};p.games=p.games||{};return p;}catch(e){return {lessons:{},games:{}};}}
  function save(p){if(window.CSProg)return CSProg.put(p);try{localStorage.setItem('cs_progress2',JSON.stringify(p));}catch(e){}}
  function esc(s){return String(s).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];});}
  function isDone(p,slug){var l=p.lessons[slug]||{},g=p.games[slug]||{};return !!(l.watched||g.done);}
  // a video counts as watched only after most of it has really played (70%, or 6 minutes if YouTube gives no length)
  window.csWatched=function(slug,secs,dur){var p=load(),l=p.lessons[slug]=p.lessons[slug]||{};l.secs=Math.max(l.secs||0,Math.round(secs));if(dur)l.dur=Math.round(dur);
    if(!l.watched&&(dur?secs>=0.7*dur:secs>=360)){l.watched=Date.now();if(window.csTrack)csTrack('video-watched',{lesson:slug});}save(p);};

  // 1. record this lesson
  var meta=document.getElementById('lessonMeta');
  if(meta){
    var slug=meta.getAttribute('data-slug'),name=meta.getAttribute('data-name');
    var p=load(),l=p.lessons[slug]=p.lessons[slug]||{};l.name=name;l.seen=l.seen||Date.now();l.t=Date.now();
    p.last={kind:'lesson',slug:slug,t:Date.now()};save(p);
    document.addEventListener('click',function(e){
      var t=e.target.closest&&e.target.closest('a[href*="-workbook"],a[download]');if(!t)return;
      var q=load(),m=q.lessons[slug]=q.lessons[slug]||{name:name};
      m.wb=Date.now();
      save(q);
    },true);
  }

  // 2. ticks on lesson cards and unit cards
  var P=load();
  document.querySelectorAll('a.card[href]').forEach(function(a){
    var h=(a.getAttribute('href')||'').replace(BASE,'');
    var m=h.match(/^\/(7[a-l][a-e])$/), u=h.match(/^\/year-7\/(7[a-l])$/), g=h.match(/^\/play\/(7[a-l][a-e])\/$/);
    var tag=null;
    if(m){var s=m[1];if(isDone(P,s))tag=['done','✓ Done'];else if(P.lessons[s]){var L0=P.lessons[s],pc=L0.dur&&L0.secs?Math.min(99,Math.round(L0.secs/L0.dur*100)):0;tag=['seen',pc>=5?'▶ '+pc+'% watched':'Started'];}}
    else if(g){var gg=P.games[g[1]];if(gg&&gg.done)tag=['done','✓ Finished'];else if(gg&&gg.room>0)tag=['seen','Level '+(gg.level||1)+' started'];else if(gg&&gg.played)tag=['seen',gg.played+' of '+gg.of+' rooms played'];}
    else if(u){var keys={};Object.keys(P.lessons).concat(Object.keys(P.games)).forEach(function(k){if(k.indexOf(u[1])===0&&isDone(P,k))keys[k]=1;});
      var n=Object.keys(keys).length;if(n)tag=['done','✓ '+n+' of 5 done'];}
    if(tag){var b=document.createElement('span');b.className='prog '+tag[0];b.textContent=tag[1];a.appendChild(b);}
  });

  // 3. "Carry on" on the home page and the Year 7 page
  var box=document.getElementById('carryOn');
  if(!box)return;
  var order=[],games={};try{order=JSON.parse(box.getAttribute('data-order'));games=JSON.parse(box.getAttribute('data-games'));}catch(e){}
  var last=P.last;
  if(!last){var nu=CSOrder.current();if(!nu)return;var f0=CSOrder.lessonsOf(nu)[0];if(!f0)return;
    box.innerHTML='<a class="btn primary big" href="'+BASE+'/'+f0[0]+'">'+esc('▶ Start '+nu+': '+f0[2])+'</a><p class="carry-sub">Following your school\'s order. <a href="'+BASE+'/year-7#schoolOrder">Change</a></p>';
    box.hidden=false;var hg0=document.getElementById('heroGo');if(hg0)hg0.hidden=true;return;}
  var href,label,sub='';
  if(last.kind==='game'&&P.games[last.slug]&&!P.games[last.slug].done){
    var G=P.games[last.slug],gn=games[last.slug]||G.name||'your game';href=BASE+'/'+'play/'+last.slug+'/';
    if(G.played!=null&&!G.done){label='▶ Play again: '+gn;sub='Last time '+G.played+' of '+G.of+' rooms were played. Play them all to finish the game.';}
    else{label='▶ Carry on: '+gn;sub='Level '+(G.level||1)+' of 2, your place is saved.';}
  }else{
    var i=-1;order.forEach(function(o,k){if(o[0]===last.slug)i=k;});
    var cur=order[i];
    if(cur&&!isDone(P,cur[0])){href=BASE+'/'+cur[0];label='▶ Carry on: '+cur[1]+' '+cur[2];}
    else{var nx=null,cur2=last.slug;for(var k=0;k<60;k++){var n2=CSOrder.nextAfter(cur2);if(!n2)break;if(!isDone(P,n2[0])){nx=n2;break;}cur2=n2[0];}
      if(nx){href=BASE+'/'+nx[0];label='▶ Next: '+nx[1]+' '+nx[2];}}
  }
  if(!href)return;
  var vids=0,gms=0;Object.keys(P.lessons).forEach(function(k){if(P.lessons[k].watched)vids++;});Object.keys(P.games).forEach(function(k){if(P.games[k].done)gms++;});
  var bits=[];if(vids)bits.push(vids+' video'+(vids>1?'s':'')+' watched');if(gms)bits.push(gms+' game'+(gms>1?'s':'')+' finished');
  box.innerHTML='<p class="carry-hi">👋 Welcome back!</p><a class="btn primary big" href="'+href+'">'+esc(label)+'</a>'+
    (sub?'<p class="carry-sub">'+esc(sub)+'</p>':'')+(bits.length?'<p class="carry-sub">✓ '+bits.join(' · ')+'</p>':'')+(CSOrder.custom()?'<p class="carry-sub">Following your school\'s order. <a href="'+BASE+'/year-7#schoolOrder">Change</a></p>':'');
  box.hidden=false;
  var hg=document.getElementById('heroGo');if(hg)hg.hidden=true;
  box.addEventListener('click',function(e){if(e.target.closest('a')&&window.csTrack)csTrack('carry-on-click',{to:href.replace(BASE,'')});});
})();

/* ---------- School order: rewrite "Next" links, and the editor on the Year 7 page ---------- */
(function(){
  if(!window.CSOrder)return;
  var BASE=(location.pathname.match(/^\/preview-[a-z0-9-]+/)||[''])[0];
  function esc(x){return String(x).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];});}
  var meta=document.getElementById('lessonMeta');
  var here=meta?meta.getAttribute('data-slug'):(location.pathname.match(/\/(7[a-l][a-e])-workbook(\.html)?$/)||[])[1];
  if(here&&CSOrder.custom()){
    var nx=CSOrder.nextAfter(here),wb=/-workbook(\.html)?$/.test(location.pathname);
    document.querySelectorAll('.pager a.next').forEach(function(a){
      if(!nx){a.remove();return;}
      a.href=BASE+'/'+nx[0]+(wb?'-workbook':'');var st=a.querySelector('strong');if(st)st.textContent=nx[1]+' '+nx[2];
      var d=a.querySelector('.dir');if(d&&!/school/.test(d.textContent))d.textContent=(wb?'Next workbook':'Next lesson')+' (your school\'s order) →';
    });
    var nb=document.querySelector('.nb-next');
    if(nb){if(nx){nb.href=BASE+'/'+nx[0];nb.lastElementChild.textContent='Next: '+nx[1];}else nb.remove();}
  }
  // editor
  var box=document.getElementById('schoolOrder');if(!box)return;
  var U=(window.CS_DATA||{}).U||[];
  function summary(){
    var o=CSOrder.get();
    if(!o){box.querySelector('#soEdit').onclick=editor;return;}
    var us=CSOrder.units(),now=o.now||us[0];
    box.innerHTML='<h2 id="soH">Your school\'s order ✓</h2><p class="so-line">'+us.map(function(c){return '<span class="so-chip'+(c===now?' now':'')+'">'+c+'</span>';}).join('<span aria-hidden="true">→</span>')+'</p>'+
      '<p>Now on: <b>'+esc(now+' '+CSOrder.unitName(now))+'</b>. Every “Next” button follows this order.</p>'+
      (window.CSSync&&CSSync.linked()?'<p class="small">🔗 Saved with your email, on all your linked devices.</p>':'<p class="small">Saved on this device. <a href="#" id="soLink">🔗 Save it with my email for all my devices</a></p>')+
      '<p><button class="btn" type="button" id="soEdit">Change</button></p>';
    box.querySelector('#soEdit').onclick=editor;
    var sl=box.querySelector('#soLink');
    if(sl)sl.onclick=function(e){e.preventDefault();var b=document.createElement('div');box.innerHTML='';box.appendChild(b);
      CSSync.linkUI(b,{intro:'<h2 style="margin-top:0">Save with your email</h2><p>We’ll email you a 6-digit code. Then your school’s order, your children and their progress are the same on every device you link.</p>',
        onDone:function(){location.reload();},onCancel:function(){location.reload();}});};
  }
  function editor(){
    var o=CSOrder.get(),picked=o?CSOrder.units().slice(0,o.units.length):[],now=o&&o.now||'';
    function draw(){
      box.innerHTML='<h2 id="soH">Your school\'s order</h2><p>Tap the units in the order your school teaches them. Units you don\'t tap go at the end, in book order.</p>'+
        '<div class="so-grid">'+U.map(function(u){var k=picked.indexOf(u[0]);return '<button type="button" class="so-u'+(k>=0?' on':'')+'" data-u="'+u[0]+'" aria-pressed="'+(k>=0)+'"><span class="so-n">'+(k>=0?k+1:'')+'</span><b>'+u[0]+'</b> '+esc(u[1])+'</button>';}).join('')+'</div>'+
        '<label class="so-now">Which unit is your child doing now? <select id="soNow"><option value="">Choose a unit</option>'+U.map(function(u){return '<option value="'+u[0]+'"'+(u[0]===now?' selected':'')+'>'+u[0]+' '+esc(u[1])+'</option>';}).join('')+'</select></label>'+
        '<div class="btns"><button class="btn primary" type="button" id="soSave">Save our order</button><button class="btn" type="button" id="soUndo">Clear</button><button class="btn" type="button" id="soBook">Use the book order</button></div>';
      box.querySelectorAll('.so-u').forEach(function(b){b.onclick=function(){var c=b.getAttribute('data-u'),k=picked.indexOf(c);if(k>=0)picked.splice(k,1);else picked.push(c);if(!now&&picked.length===1)now=c;draw();};});
      box.querySelector('#soNow').onchange=function(e){now=e.target.value;};
      box.querySelector('#soUndo').onclick=function(){picked=[];now='';draw();};
      box.querySelector('#soBook').onclick=function(){CSOrder.set(null);if(window.csTrack)csTrack('school-order-clear',{});location.reload();};
      box.querySelector('#soSave').onclick=function(){
        if(!picked.length&&!now){CSOrder.set(null);location.reload();return;}
        var units=picked.length?picked.slice():[now];
        CSOrder.set({units:units,now:now||units[0],t:Date.now()});
        if(window.csTrack)csTrack('school-order-set',{order:CSOrder.units().join(','),now:now||units[0]});
        location.hash='schoolOrder';location.reload();
      };
    }
    draw();
  }
  summary();
})();

/* ---------- Whose progress? A small switch in the header when a family has 2 or more children ---------- */
(function(){
  if(!window.CSFamily||!window.CSProg)return;
  var f=CSFamily.get();if(!f||!f.kids||f.kids.length<2)return;
  var wrap=document.querySelector('header.top .wrap');if(!wrap)return;
  var cur=CSProg.kid();
  var b=document.createElement('div');b.className='kid-switch';
  b.innerHTML='<label for="kidSel">Learning:</label><select id="kidSel">'+f.kids.map(function(k){return '<option'+(k===cur?' selected':'')+'>'+CSFamily.esc(k)+'</option>';}).join('')+'</select>';
  var mb=document.getElementById('menuBtn');wrap.insertBefore(b,mb||null);
  b.querySelector('select').onchange=function(e){CSProg.setKid(e.target.value);if(window.csTrack)csTrack('kid-switch',{});location.reload();};
})();
