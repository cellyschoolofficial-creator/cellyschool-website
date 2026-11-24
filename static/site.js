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
  b.addEventListener('click',function(){
    var slug=location.pathname.replace(/^\/(preview-[a-z0-9-]+\/)?/,'').replace(/\.html$/,'');
    if(window.csTrack)csTrack('video-play',{lesson:slug});
    // The YouTube player API tells us how much is really watched (time spent playing, not just a press of play).
    var holder=document.createElement('div');holder.id='ytPlayer';box.replaceChild(holder,b);
    function make(){
      var secs=0,dur=0,last=0,timer=null;
      var p=new YT.Player('ytPlayer',{videoId:vid,host:'https://www.youtube-nocookie.com',
        playerVars:{autoplay:1,rel:0,modestbranding:1,playsinline:1},
        events:{onReady:function(e){try{e.target.playVideo();}catch(x){}},
          onStateChange:function(e){
            clearInterval(timer);
            if(e.data===YT.PlayerState.PLAYING){last=Date.now();timer=setInterval(function(){
              var now=Date.now();secs+=Math.min(5,(now-last)/1000);last=now;
              try{dur=p.getDuration()||dur;}catch(x){}
              if(window.csWatched)csWatched(slug,secs,dur);
            },2000);}
          }}});
      var f=box.querySelector('iframe');if(f){f.title='Lesson video';f.setAttribute('allow','autoplay; encrypted-media; picture-in-picture; fullscreen');f.setAttribute('allowfullscreen','');}
    }
    if(window.YT&&window.YT.Player)make();
    else{var prev=window.onYouTubeIframeAPIReady;window.onYouTubeIframeAPIReady=function(){if(prev)prev();make();};
      var sc=document.createElement('script');sc.src='https://www.youtube.com/iframe_api';document.head.appendChild(sc);}
  });
  box.appendChild(b);
})();

/* ---------- Progress on this device (Stage 2, Nov 2026) ----------
   Saved only in this browser (localStorage "cs_progress"): which lessons were opened or watched,
   which workbooks were downloaded and which games were finished. Nothing is sent anywhere. */
(function(){
  var KEY='cs_progress2';
  var BASE=(location.pathname.match(/^\/preview-[a-z0-9-]+/)||[''])[0];
  function load(){try{var p=JSON.parse(localStorage.getItem(KEY)||'null')||{};p.lessons=p.lessons||{};p.games=p.games||{};return p;}catch(e){return {lessons:{},games:{}};}}
  function save(p){try{localStorage.setItem(KEY,JSON.stringify(p));}catch(e){}}
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
  var last=P.last;if(!last)return;
  var href,label,sub='';
  if(last.kind==='game'&&P.games[last.slug]&&!P.games[last.slug].done){
    var G=P.games[last.slug],gn=games[last.slug]||G.name||'your game';href=BASE+'/'+'play/'+last.slug+'/';
    if(G.played!=null&&!G.done){label='▶ Play again: '+gn;sub='Last time '+G.played+' of '+G.of+' rooms were played. Play them all to finish the game.';}
    else{label='▶ Carry on: '+gn;sub='Level '+(G.level||1)+' of 2, your place is saved.';}
  }else{
    var i=-1;order.forEach(function(o,k){if(o[0]===last.slug)i=k;});
    var cur=order[i];
    if(cur&&!isDone(P,cur[0])){href=BASE+'/'+cur[0];label='▶ Carry on: '+cur[1]+' '+cur[2];}
    else{var nx=null;for(var k=i+1;k<order.length;k++){if(order[k][3]&&!isDone(P,order[k][0])){nx=order[k];break;}}
      if(nx){href=BASE+'/'+nx[0];label='▶ Next: '+nx[1]+' '+nx[2];}}
  }
  if(!href)return;
  var vids=0,gms=0;Object.keys(P.lessons).forEach(function(k){if(P.lessons[k].watched)vids++;});Object.keys(P.games).forEach(function(k){if(P.games[k].done)gms++;});
  var bits=[];if(vids)bits.push(vids+' video'+(vids>1?'s':'')+' watched');if(gms)bits.push(gms+' game'+(gms>1?'s':'')+' finished');
  box.innerHTML='<p class="carry-hi">👋 Welcome back!</p><a class="btn primary big" href="'+href+'">'+esc(label)+'</a>'+
    (sub?'<p class="carry-sub">'+esc(sub)+'</p>':'')+(bits.length?'<p class="carry-sub">✓ '+bits.join(' · ')+'</p>':'');
  box.hidden=false;
  var hg=document.getElementById('heroGo');if(hg)hg.hidden=true;
  box.addEventListener('click',function(e){if(e.target.closest('a')&&window.csTrack)csTrack('carry-on-click',{to:href.replace(BASE,'')});});
})();
