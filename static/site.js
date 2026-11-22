(function(){
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
    if(window.csTrack)csTrack('video-play',{lesson:location.pathname.replace(/^\//,'')});
    var f=document.createElement('iframe');
    f.src='https://www.youtube-nocookie.com/embed/'+vid+'?autoplay=1&rel=0&modestbranding=1';
    f.title='Lesson video';f.allow='autoplay; encrypted-media; picture-in-picture; fullscreen';f.allowFullscreen=true;
    box.replaceChild(f,b);
  });
  box.appendChild(b);
})();
