/* Celly School visit insights.
   1) Umami: cookieless counts of pages and key actions (no personal data).
   2) Microsoft Clarity: visit replays and heatmaps, ONLY after a grown-up says yes.
   IDs come from the data-* attributes on this script tag. */
(function(){
  var me=document.currentScript, UM=me&&me.getAttribute('data-umami'), CL=me&&me.getAttribute('data-clarity');
  var page=location.pathname.replace(/^\/|\.html$/g,'')||'home';

  // ---------- Umami (cookieless) ----------
  var queue=[];
  window.csTrack=function(name,data){
    try{ if(window.umami&&umami.track){umami.track(name,data||{});} else queue.push([name,data]); }catch(e){}
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
  document.addEventListener('click',function(ev){
    var b=ev.target.closest&&ev.target.closest('#comfy');if(b)csTrack('easier-reading',{page:page});
  },true);

  // ---------- Clarity (replays), consent first ----------
  if(!CL)return;
  var KEY='cs-consent';
  function get(){try{return localStorage.getItem(KEY)}catch(e){return null}}
  function put(v){try{localStorage.setItem(KEY,v)}catch(e){}}
  function loadClarity(){
    if(window.clarity)return;
    (function(c,l,a,r,i,t,y){c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
      t=l.createElement(r);t.async=1;t.src='https://www.clarity.ms/tag/'+i;
      y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);})(window,document,'clarity','script',CL);
    window.clarity('consent');
  }
  var choice=get();
  if(choice==='yes'){loadClarity();}
  else if(choice!=='no'){
    var bar=document.createElement('div');bar.className='consent';bar.setAttribute('role','region');bar.setAttribute('aria-label','Help us improve');
    bar.innerHTML='<p><strong>For grown-ups:</strong> can we record how this page is used, to make the lessons easier? '+
      'Microsoft Clarity records clicks and scrolling, with typing hidden, and uses cookies. <a href="/privacy">More</a></p>'+
      '<div class="consent-btns"><button type="button" class="btn primary" data-c="yes">Yes, that\'s fine</button><button type="button" class="btn" data-c="no">No thanks</button></div>';
    bar.addEventListener('click',function(e){var v=e.target.getAttribute&&e.target.getAttribute('data-c');if(!v)return;
      put(v);bar.remove();csTrack('consent-'+v,{page:page});if(v==='yes')loadClarity();});
    document.body.appendChild(bar);
  }
  // Let people change their mind from the privacy page
  document.querySelectorAll('[data-consent-reset]').forEach(function(b){b.hidden=false;b.addEventListener('click',function(){
    try{localStorage.removeItem(KEY)}catch(e){}; if(window.clarity){try{clarity('consent',false)}catch(e){}} location.reload();});});
})();
