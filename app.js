(() => {
  'use strict';
  const {DURATION,remaining,start,flip,fill}=ArenaCore;
  const $=id=>document.getElementById(id);
  const key='arena.partida.v1';
  let state={mode:'ready',remaining:DURATION,deadline:0};
  let sound=true,audio=null,wake=null,lastSecond=-1,lastMode=null,lastLeft=DURATION,lastAction=-Infinity,flashTimer;
  try{
    sound=localStorage.getItem('arena.sonido')!=='no';
    const saved=JSON.parse(localStorage.getItem(key)||'null');
    if(saved&&['running','expired','ready'].includes(saved.mode)&&Number.isFinite(saved.deadline)&&Number.isFinite(saved.remaining)&&saved.remaining>=0&&saved.remaining<=DURATION){
      state=saved;
      if(state.mode==='running'&&remaining(state,Date.now())===0)state={mode:'expired',remaining:0,deadline:state.deadline};
    }
  }catch{}
  lastLeft=remaining(state,Date.now());
  function save(){try{localStorage.setItem(key,JSON.stringify(state));}catch{}}
  function flash(text){$('flash').textContent=text;$('flash').classList.add('show');clearTimeout(flashTimer);flashTimer=setTimeout(()=>$('flash').classList.remove('show'),2000);}
  async function unlock(){
    try{
      const Audio=window.AudioContext||window.webkitAudioContext;
      if(!audio&&Audio)audio=new Audio();
      if(audio?.state==='suspended')await audio.resume();
      if(sound&&(!audio||audio.state!=='running'))flash('El sonido no está disponible. Sigue los avisos visuales.');
    }catch{if(sound)flash('El sonido no está disponible. Sigue los avisos visuales.');}
    updateSound();
  }
  function tone(frequency=660,duration=.12,delay=0){
    if(!sound||document.hidden||audio?.state!=='running')return;
    const osc=audio.createOscillator(),gain=audio.createGain(),at=audio.currentTime+delay;
    osc.type='sine';osc.frequency.value=frequency;
    gain.gain.setValueAtTime(0,at);gain.gain.linearRampToValueAtTime(.2,at+.015);gain.gain.exponentialRampToValueAtTime(.001,at+duration);
    osc.connect(gain);gain.connect(audio.destination);osc.start(at);osc.stop(at+duration+.02);
  }
  function finishSound(){tone(440,.25);tone(330,.25,.28);tone(220,.65,.56);}
  function updateSound(){const b=$('sound');b.textContent=sound&&state.mode==='running'&&audio?.state!=='running'?'Activar sonido':`Sonido: ${sound?'sí':'no'}`;b.setAttribute('aria-pressed',String(sound));}
  async function keepAwake(){
    if(state.mode!=='running'||document.hidden||!navigator.wakeLock||wake)return;
    try{wake=await navigator.wakeLock.request('screen');wake.addEventListener('release',()=>wake=null);}catch{}
  }
  function releaseAwake(){if(wake){wake.release().catch(()=>{});wake=null;}}
  function announce(text){$('announcement').textContent=text;}
  function paint(now=Date.now(),silent=false){
    const left=remaining(state,now);
    if(state.mode==='running'&&left===0){state={...state,mode:'expired',remaining:0};save();releaseAwake();if(!silent)finishSound();announce('Tiempo agotado. Fin de la partida.');}
    const second=Math.ceil(left/1000),running=state.mode==='running';
    if(!silent&&running&&!document.hidden){
      if(lastLeft>60000&&left<=60000&&left>59000){tone(660,.3);flash('Queda 1 minuto');announce('Queda 1 minuto');}
      if(lastLeft>30000&&left<=30000&&left>29000){tone(660);tone(660,.12,.2);flash('Quedan 30 segundos');announce('Quedan 30 segundos');}
      if(second<=10&&second>0&&second!==lastSecond){tone(second<=3?880:660,.1);announce(`${second}`);$('time').classList.remove('tick');void $('time').offsetWidth;$('time').classList.add('tick');}
    }
    const textChanged=second!==lastSecond||state.mode!==lastMode;
    if(textChanged){$('time').textContent=`${Math.floor(second/60)}:${String(second%60).padStart(2,'0')}`;$('time').setAttribute('aria-label',`${Math.floor(second/60)} minutos y ${second%60} segundos`);}
    lastSecond=second;lastLeft=left;
    window.Arena3D?.update(left/DURATION,running);
    $('glass').classList.toggle('inactive',!running);$('app').classList.toggle('urgent',running&&left<=10000);$('app').classList.toggle('expired',state.mode==='expired');
    if(textChanged){
    $('eyebrow').textContent=state.mode==='ready'?'Listo para la partida':running?'La arena sigue cayendo':'Se acabó la arena';
    $('status').textContent=state.mode==='ready'?'Tres minutos para escapar.':running?(second<=10?'Últimos segundos':second<=30?'Queda muy poca arena':second<=60?'Menos de un minuto':'A vuestro ritmo. Sin parar el reloj.'):'Tiempo agotado. Fin de la partida.';
    $('action').textContent=state.mode==='ready'?'Empezar partida':running?'Dar la vuelta':'Partida terminada';
    $('action').disabled=state.mode==='expired';$('glass').disabled=state.mode==='expired';
    $('glass').setAttribute('aria-label',state.mode==='ready'?'Empezar el reloj de arena':running?'Dar la vuelta al reloj de arena':'Tiempo agotado');
    $('hint').innerHTML=state.mode==='expired'?'Pulsa Reiniciar para preparar otra partida.':state.mode==='ready'?'Después, toca el reloj para voltearlo.<br><strong>Voltear no reinicia los tres minutos.</strong>':'Toca el reloj o el botón para voltearlo.<br><strong>La arena caída será tu nuevo tiempo.</strong>';
    updateSound();lastMode=state.mode;
    }
  }
  function act(){
    if(performance.now()-lastAction<1150)return;
    lastAction=performance.now();
    const now=Date.now();
    if(state.mode==='expired')return;
    unlock();
    if(state.mode==='ready'){state=start(now);announce('Partida iniciada. Tres minutos.');}
    else{
      if(remaining(state,now)<=0){paint(now);return;}
      state=flip(state,now);
      const s=Math.ceil(remaining(state,now)/1000),text=`Volteado · ${Math.floor(s/60)}:${String(s%60).padStart(2,'0')}`;
      flash(text);announce(text);
      window.Arena3D?.flip();
    }
    lastSecond=-1;lastLeft=remaining(state,now);save();paint(now,true);keepAwake();
  }
  $('action').addEventListener('click',act);$('glass').addEventListener('click',act);
  $('sound').addEventListener('click',()=>{if(sound&&state.mode==='running'&&audio?.state!=='running'){unlock().then(()=>tone(660,.1));return;}sound=!sound;updateSound();try{localStorage.setItem('arena.sonido',sound?'si':'no');}catch{}if(sound)unlock().then(()=>tone(660,.1));});
  $('fullscreen').addEventListener('click',async()=>{
    try{if(document.fullscreenElement)await document.exitFullscreen();else if(document.documentElement.requestFullscreen)await document.documentElement.requestFullscreen();else flash('Para pantalla completa, añade Arena a tu inicio.');}catch{flash('Pantalla completa no disponible en este navegador.');}
  });
  document.addEventListener('fullscreenchange',()=>{$('fullscreen').setAttribute('aria-label',document.fullscreenElement?'Salir de pantalla completa':'Pantalla completa');});
  $('help').addEventListener('click',()=>$('helpDialog').showModal());$('closeHelp').addEventListener('click',()=>$('helpDialog').close());
  $('reset').addEventListener('click',()=>$('resetDialog').showModal());$('cancelReset').addEventListener('click',()=>$('resetDialog').close());
  $('confirmReset').addEventListener('click',()=>{state={mode:'ready',remaining:DURATION,deadline:0};lastSecond=-1;lastLeft=DURATION;save();releaseAwake();$('resetDialog').close();clearTimeout(flashTimer);$('flash').classList.remove('show');paint();$('action').focus();announce('Nueva partida preparada.');});
  document.addEventListener('visibilitychange',()=>{if(!document.hidden){lastSecond=Math.ceil(remaining(state,Date.now())/1000);paint(Date.now(),true);keepAwake();}else releaseAwake();});
  window.addEventListener('pageshow',()=>{lastSecond=-1;paint(Date.now(),true);keepAwake();});
  window.addEventListener('pagehide',save);
  function frame(){paint();requestAnimationFrame(frame);}
  updateSound();paint(Date.now(),true);keepAwake();requestAnimationFrame(frame);
})();
