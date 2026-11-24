/* Celly School visit insights.
   1) Umami: cookieless counts of pages and key actions (no personal data).
   2) Microsoft Clarity (replays), PostHog EU (funnels, retention, surveys) and Google Analytics 4
     (traffic sources): ONLY after a grown-up says yes.
   IDs come from the data-* attributes on this script tag. */
(function(){
  var me=document.currentScript, UM=me&&me.getAttribute('data-umami'), CL=me&&me.getAttribute('data-clarity'),
      PH=me&&me.getAttribute('data-posthog'), GA=me&&me.getAttribute('data-ga');
  var page=location.pathname.replace(/^\/|\.html$/g,'')||'home';

  // ---------- Umami (cookieless) ----------
  var queue=[];
  window.csTrack=function(name,data){
    try{ if(window.umami&&umami.track){umami.track(name,data||{});} else queue.push([name,data]); }catch(e){}
    try{ if(window.posthog&&posthog.capture) posthog.capture(name,data||{}); }catch(e){}
    try{ if(window.gtag) gtag('event',name.replace(/-/g,'_'),data||{}); }catch(e){}
  };
  if(UM){
    var s=document.createElement('script');s.defer=true;s.src='https://cloud.umami.is/script.js';
    s.setAttribute('data-website-id',UM);s.setAttribute('data-domains','www.cellyschool.com');
    s.onload=function(){var q=queue;queue=[];q.forEach(function(x){window.csTrack(x[0],x[1]);});};
    document.head.appendChild(s);
  }
  // Clicks worth counting
  document.addEventListener('click',function(ev){
    var a=ev.target.closest&&ev.target.closest('a');if(!a)return;
    var h=a.getAttribute('href')||'';
    if(a.hasAttribute('download')||/\.pdf($|\?)/i.test(h)) csTrack('workbook-download',{page:page,file:h.split('/').pop()});
    else if(/youtube\.com|youtu\.be/.test(h)) csTrack('youtube-click',{page:page});
    else if(/thinkific\.com/.test(h)||/^\/course$/.test(h)) csTrack('thinkific-click',{page:page});
    else if(/teachers?payteachers|tes\.com/.test(h)) csTrack('shop-click',{page:page,to:a.hostname});
    else if(/^mailto:/.test(h)) csTrack('email-click',{page:page});
  },true);
  // Talk to Celly games: which game is opened, which rooms are started, how far children get
  var game=(location.pathname.match(/^\/play\/([a-z0-9]+)\//)||[])[1];
  if(game){
    var room=+(new URLSearchParams(location.search).get('room')||0);
    csTrack('game-open',{game:game,room:room});
    document.addEventListener('click',function(ev){
      var t=ev.target.closest&&ev.target.closest('#go,[data-go],#modeTalk,#modeTap,#again');if(!t)return;
      if(t.id==='go') csTrack('game-start',{game:game,room:room});
      else if(t.id==='modeTalk'||t.id==='modeTap') csTrack('game-mode',{game:game,mode:t.id==='modeTalk'?'talk':'tap'});
      else if(t.id==='again') csTrack('game-say-again',{game:game});
      else csTrack('game-room',{game:game,to:+t.getAttribute('data-go')});
    },true);
    var seenCert=false;
    new MutationObserver(function(){ if(!seenCert&&document.querySelector('.cert,#cert,.certificate')){seenCert=true;csTrack('game-finish',{game:game});} })
      .observe(document.documentElement,{subtree:true,childList:true});
  }
  document.addEventListener('click',function(ev){
    var b=ev.target.closest&&ev.target.closest('#comfy');if(b)csTrack('easier-reading',{page:page});
  },true);

  // ---------- Clarity (replays), consent first ----------
  if(!CL&&!PH&&!GA)return;
  var KEY='cs-consent';
  function get(){try{return localStorage.getItem(KEY)}catch(e){return null}}
  function put(v){try{localStorage.setItem(KEY,v)}catch(e){}}
  function loadClarity(){
    if(!CL||window.clarity)return;
    (function(c,l,a,r,i,t,y){c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
      t=l.createElement(r);t.async=1;t.src='https://www.clarity.ms/tag/'+i;
      y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);})(window,document,'clarity','script',CL);
    window.clarity('consent');
  }
  function loadPostHog(){
    if(!PH||window.posthog&&window.posthog.__loaded)return;
    !function(t,e){var o,n,p,r;e.__SV||(window.posthog=e,e._i=[],e.init=function(i,s,a){function g(t,e){var o=e.split(".");2==o.length&&(t=t[o[0]],e=o[1]),t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}}(p=t.createElement("script")).type="text/javascript",p.crossOrigin="anonymous",p.async=!0,p.src=s.api_host.replace(".i.posthog.com","-assets.i.posthog.com")+"/static/array.js",(r=t.getElementsByTagName("script")[0]).parentNode.insertBefore(p,r);var u=e;for(void 0!==a?u=e[a]=[]:a="posthog",u.people=u.people||[],u.toString=function(t){var e="posthog";return"posthog"!==a&&(e+="."+a),t||(e+=" (stub)"),e},u.people.toString=function(){return u.toString(1)+".people (stub)"},o="init capture register register_once unregister opt_out_capturing has_opted_out_capturing opt_in_capturing reset isFeatureEnabled getFeatureFlag onFeatureFlags getSurveys getActiveMatchingSurveys renderSurvey identify setPersonProperties group".split(" "),n=0;n<o.length;n++)g(u,o[n]);e._i.push([i,s,a])},e.__SV=1)}(document,window.posthog||[]);
    posthog.init(PH,{api_host:'https://eu.i.posthog.com',person_profiles:'identified_only',
      capture_pageview:true,capture_pageleave:true,autocapture:true,
      disable_session_recording:true,               // Clarity already does recordings
      mask_all_text:false,mask_all_element_attributes:false,
      session_recording:{maskAllInputs:true}});
  }
  function loadGA(){
    if(!GA||window.gtag)return;
    var s=document.createElement('script');s.async=true;s.src='https://www.googletagmanager.com/gtag/js?id='+GA;document.head.appendChild(s);
    window.dataLayer=window.dataLayer||[];window.gtag=function(){dataLayer.push(arguments);};
    gtag('js',new Date());
    gtag('config',GA,{allow_google_signals:false,allow_ad_personalization_signals:false});
  }
  function loadAll(){loadClarity();loadPostHog();loadGA();}
  var choice=get();
  if(choice==='yes'){loadAll();}
  else if(choice!=='no'){
    var bar=document.createElement('div');bar.className='consent';bar.setAttribute('role','region');bar.setAttribute('aria-label','Help us improve');
    bar.innerHTML='<p><strong>For grown-ups:</strong> can we record how this page is used, to make the lessons easier? '+
      'Microsoft Clarity, PostHog and Google Analytics record clicks, scrolling and how the games are used, with typing hidden. They use cookies. <a href="/privacy">More</a></p>'+
      '<div class="consent-btns"><button type="button" class="btn primary" data-c="yes">Yes, that\'s fine</button><button type="button" class="btn" data-c="no">No thanks</button></div>';
    bar.addEventListener('click',function(e){var v=e.target.getAttribute&&e.target.getAttribute('data-c');if(!v)return;
      put(v);bar.remove();csTrack('consent-'+v,{page:page});if(v==='yes')loadAll();});
    document.body.appendChild(bar);
  }
  // Let people change their mind from the privacy page
  document.querySelectorAll('[data-consent-reset]').forEach(function(b){b.hidden=false;b.addEventListener('click',function(){
    try{localStorage.removeItem(KEY)}catch(e){}; if(window.clarity){try{clarity('consent',false)}catch(e){}} if(window.posthog&&posthog.opt_out_capturing){try{posthog.opt_out_capturing()}catch(e){}} location.reload();});});
})();
