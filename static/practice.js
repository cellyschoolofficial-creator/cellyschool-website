(function(){
  // Stars: saved only in this browser.
  function getStars(){try{return JSON.parse(localStorage.getItem('cs-stars')||'{}')}catch(e){return {}}}
  function setStar(c){var s=getStars();s[c]=1;try{localStorage.setItem('cs-stars',JSON.stringify(s))}catch(e){}}
  var stars=getStars();
  document.querySelectorAll('[data-star]').forEach(function(el){if(stars[el.getAttribute('data-star')])el.hidden=false;});
  document.querySelectorAll('[data-unit-count]').forEach(function(el){var u=el.getAttribute('data-unit-count'),n=0;Object.keys(stars).forEach(function(k){if(k.indexOf(u)===0)n++;});el.textContent=n;});

  // start() runs once now; unlock.js calls it again after it adds the data for a paid lesson.
  window.csPracticeStart=start; start();
  function start(){
  var box=document.querySelector('.practice'), dataEl=document.getElementById('practice-data');
  if(!box||!dataEl||box.getAttribute('data-started'))return;
  box.setAttribute('data-started','1');
  var D=JSON.parse(dataEl.textContent), code=D.code;
  var words=D.words.filter(function(w){return w.w&&w.m});
  var beatWords=D.words.filter(function(w){return w.b&&w.b.length>1});

  // Gentle sounds, can be switched off.
  var soundOn=true;try{soundOn=localStorage.getItem('cs-sound')!=='0'}catch(e){}
  var AC=null;
  function tone(freq,len,type,vol){if(!soundOn)return;try{AC=AC||new (window.AudioContext||window.webkitAudioContext)();var o=AC.createOscillator(),g=AC.createGain();o.type=type||'sine';o.frequency.value=freq;g.gain.setValueAtTime(vol||0.12,AC.currentTime);g.gain.exponentialRampToValueAtTime(0.0001,AC.currentTime+len);o.connect(g);g.connect(AC.destination);o.start();o.stop(AC.currentTime+len);}catch(e){}}
  function good(){tone(660,.18);setTimeout(function(){tone(880,.25)},120)}
  function soft(){tone(300,.2,'triangle',.08)}
  function beat(i){tone(220+i*40,.15,'triangle',.18)}
  function say(t){try{if(!soundOn||!window.speechSynthesis)return;var u=new SpeechSynthesisUtterance(t);u.lang='en-GB';u.rate=.8;speechSynthesis.cancel();speechSynthesis.speak(u)}catch(e){}}
  function shuffle(a){a=a.slice();for(var i=a.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1));var t=a[i];a[i]=a[j];a[j]=t}return a}
  function h(tag,cls,txt){var e=document.createElement(tag);if(cls)e.className=cls;if(txt!=null)e.textContent=txt;return e}
  function btn(txt,cls,fn){var b=h('button','btn '+(cls||''),txt);b.type='button';b.addEventListener('click',fn);return b}

  var modes=[];
  if(D.quiz.length)modes.push(['quiz','Recall quiz']);
  if(words.length>=3)modes.push(['match','Match the words']);
  if(beatWords.length)modes.push(['beats','Tap the beats']);
  if(!modes.length)return;
  document.getElementById('practice').hidden=false;
  var q=document.getElementById('quiz'); if(q&&D.quiz.length)q.hidden=true;

  var tabs=h('div','ptabs'); tabs.setAttribute('role','tablist');
  var stage=h('div','pstage'); stage.setAttribute('aria-live','polite');
  var snd=btn('','psound',function(){soundOn=!soundOn;try{localStorage.setItem('cs-sound',soundOn?'1':'0')}catch(e){}label()});
  function label(){snd.textContent=soundOn?'🔊 Sound on':'🔈 Sound off';snd.setAttribute('aria-pressed',soundOn?'true':'false')}
  label();
  modes.forEach(function(m){var b=btn(m[1],'ptab',function(){open(m[0])});b.setAttribute('role','tab');b.dataset.m=m[0];tabs.appendChild(b)});
  tabs.appendChild(snd);
  box.appendChild(tabs);box.appendChild(stage);

  function done(msg){setStar(code);if(window.csTrack)csTrack('practice-done',{lesson:code});var s=document.querySelectorAll('[data-star="'+code+'"]');s.forEach(function(e){e.hidden=false});
    var w=h('div','pcard pdone');w.appendChild(h('p','pbig','⭐'));w.appendChild(h('p','pq',msg));w.appendChild(h('p','small','Star saved on this device.'));return w}

  function open(m){
    tabs.querySelectorAll('.ptab').forEach(function(b){b.setAttribute('aria-selected',b.dataset.m===m?'true':'false')});
    stage.innerHTML='';
    if(m==='quiz')quiz();if(m==='match')match();if(m==='beats')beats();
  }

  function quiz(){
    var queue=D.quiz.map(function(x,i){return {x:x,i:i,again:false}}), total=D.quiz.length, first=0, n=0;
    function show(){
      stage.innerHTML='';
      if(!queue.length){var w=done('You knew '+first+' of '+total+' straight away. Well done for practising!');w.appendChild(btn('Try again','primary',quiz));stage.appendChild(w);return}
      var it=queue.shift(), c=h('div','pcard');
      c.appendChild(h('p','pstep',it.again?'One more try':'Question '+(it.i+1)+' of '+total));
      c.appendChild(h('p','pq',it.x.q));
      c.appendChild(h('p','phint','Say your answer out loud first.'));
      var row=h('div','btns');
      row.appendChild(btn('Show answer','primary',function(){
        row.remove();c.appendChild(h('p','pa',it.x.a));
        var r2=h('div','btns');
        r2.appendChild(btn('✓ I knew it','pyes',function(){good();if(!it.again)first++;show()}));
        r2.appendChild(btn('Not yet','',function(){soft();if(!it.again){it.again=true;queue.push(it)}show()}));
        c.appendChild(r2);r2.querySelector('button').focus();
      }));
      c.appendChild(row);stage.appendChild(c);
    }
    show();
  }

  function match(){
    var order=shuffle(words), i=0, tries=0;
    function show(){
      stage.innerHTML='';
      if(i>=order.length){var w=done('All '+order.length+' words matched!');w.appendChild(btn('Play again','primary',match));stage.appendChild(w);return}
      var t=order[i], c=h('div','pcard');
      c.appendChild(h('p','pstep','Word '+(i+1)+' of '+order.length));
      c.appendChild(h('p','phint','Which word means:'));
      c.appendChild(h('p','pq',t.m));
      var opts=shuffle([t].concat(shuffle(words.filter(function(w){return w!==t})).slice(0,3)));
      var grid=h('div','popts');
      opts.forEach(function(o){var b=btn(o.w,'popt',function(){
        if(o===t){b.classList.add('ok');good();say(o.w);grid.querySelectorAll('button').forEach(function(x){x.disabled=true});setTimeout(function(){i++;show()},1100)}
        else{b.classList.add('no');b.disabled=true;soft()}
      });grid.appendChild(b)});
      c.appendChild(grid);stage.appendChild(c);
    }
    show();
  }

  function beats(){
    var order=beatWords.slice(), i=0;
    function show(){
      stage.innerHTML='';
      if(i>=order.length){var w=done('You tapped the beats of '+order.length+' words!');w.appendChild(btn('Tap again','primary',beats));stage.appendChild(w);return}
      var t=order[i], c=h('div','pcard'), k=0;
      c.appendChild(h('p','pstep','Word '+(i+1)+' of '+order.length));
      c.appendChild(h('p','phint','Say each part as you tap it. One tap, one beat.'));
      var row=h('div','pbeats');
      t.b.forEach(function(p){row.appendChild(h('span','pbeat',p.toLowerCase()))});
      c.appendChild(row);
      var whole=h('p','pword',t.w);whole.style.visibility='hidden';c.appendChild(whole);
      var tap=btn('Tap','primary ptap',function(){
        var bs=row.children; if(k>=bs.length)return;
        bs[k].classList.add('on');beat(k);k++;
        if(k===bs.length){tap.disabled=true;whole.style.visibility='visible';setTimeout(function(){good();say(t.w)},250);
          var r=h('div','btns');r.appendChild(btn('Hear it again','',function(){say(t.w)}));
          r.appendChild(btn(i+1<order.length?'Next word →':'Finish','primary',function(){i++;show()}));c.appendChild(r);r.lastChild.focus()}
      });
      c.appendChild(tap);stage.appendChild(c);tap.focus();
    }
    show();
  }
  open(modes[0][0]);
  if(location.hash==='#practice')document.getElementById('practice').scrollIntoView();
  }
})();
