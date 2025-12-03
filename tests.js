/* --- Shared audio click generator (for keys & buttons) --- */
let audioCtx = null;
let audioEnabled = true;
function ensureAudio(){
  if(!audioCtx){
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
}

function playClickSound(volume = 0.10, pitch = 1500){
  if(!audioEnabled) return;
  try{
    ensureAudio();
    const ctx = audioCtx;
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = 'square';
    o.frequency.value = pitch + (Math.random()*80 - 40); // slight randomness
    o.connect(g);
    g.connect(ctx.destination);
    const now = ctx.currentTime;
    g.gain.setValueAtTime(volume, now);
    g.gain.exponentialRampToValueAtTime(0.001, now + 0.06);
    o.start(now);
    o.stop(now + 0.07);
  }catch(e){
    // audio blocked or unavailable; simply ignore
    console.warn('Audio error', e);
  }
}

/* --- Keyboard Test (updated) --- */
(function(){
  function initKeyboard(){
    const container = document.querySelector('.keyboard');
    if(!container) return;

    // read sound toggle
    const soundToggle = document.getElementById('enableSound');
    if(soundToggle){
      audioEnabled = soundToggle.checked;
      soundToggle.addEventListener('change', ()=> audioEnabled = soundToggle.checked);
    }

    container.addEventListener('click', (e)=>{
      const keyEl = e.target.closest('.key');
      if(!keyEl) return;
      pressKeyVisual(keyEl, {playSound:true, isPhysical:false});
    });

    // Keydown/keyup handlers
    window.addEventListener('keydown', (ev)=>{
      // ESC clears
      if(ev.key === 'Escape'){
        clearAllHighlights(container);
        return;
      }
      // avoid repeated sound on hold
      const isHeld = ev.repeat === true;
      const k = mapKey(ev);
      const el = container.querySelector(`[data-key="${k}"]`) || container.querySelector(`[data-code="${ev.code}"]`);
      if(el){
        pressKeyVisual(el, {playSound: !isHeld, isPhysical:true});
        if(!isHeld) el.classList.add('held');
      }
    });

    window.addEventListener('keyup', (ev)=>{
      const k = mapKey(ev);
      const el = container.querySelector(`[data-key="${k}"]`) || container.querySelector(`[data-code="${ev.code}"]`);
      if(el){
        releaseKeyVisual(el);
      }
    });

    // layout toggles
    const toggles = document.querySelectorAll('.kb-size-toggle button');
    toggles.forEach(btn=>{
      btn.addEventListener('click', ()=>{
        toggles.forEach(b=>b.classList.remove('active'));
        btn.classList.add('active');
        const size = btn.dataset.size;
        container.classList.remove('kb-size-100','kb-size-1800','kb-size-tkl','kb-size-75','kb-size-60','kb-size-40');
        container.classList.add('kb-size-' + size);

        // If size is TKL or 60/40 ensure numpad hidden visually
        if(['tkl','60','40'].includes(size)){
          // CSS handles it, but we can add class for clarity
          container.classList.add('no-numpad');
        }else{
          container.classList.remove('no-numpad');
        }
      });
    });
  }

  function pressKeyVisual(el, opts = {playSound:true, isPhysical:false}){
    el.classList.add('key-pressed');
    if(opts.isPhysical){
      el.classList.add('held');
    }
    if(opts.playSound){
      playClickSound(0.08, 1400);
    }
    // emulate click release after short time if it was a mouse click (not held)
    if(!opts.isPhysical){
      setTimeout(()=>{ el.classList.remove('key-pressed'); }, 150);
    }
  }

  function releaseKeyVisual(el){
    el.classList.remove('key-pressed');
    el.classList.remove('held');
  }

  function clearAllHighlights(container){
    container.querySelectorAll('.key.key-pressed, .key.held').forEach(k=>{
      k.classList.remove('key-pressed');
      k.classList.remove('held');
    });
  }

  function mapKey(ev){
    if(ev.key && ev.key.length === 1) return ev.key.toLowerCase();
    return ev.key;
  }

  document.addEventListener('DOMContentLoaded', initKeyboard);
})();

/* --- Mouse Test (improvements) --- */
(function(){
  function initMouseTest(){
    const target = document.querySelector('.mouse-target');
    if(!target) return;
    const indicators = {
      left: document.querySelector('#m1'),
      right: document.querySelector('#m2'),
      middle: document.querySelector('#m3'),
      m4: document.querySelector('#m4'),
      m5: document.querySelector('#m5'),
    };

    const prEl = document.querySelector('#pollRate');
    const logEl = document.querySelector('#mouseLog');
    const clearLogBtn = document.querySelector('#clearLogBtn');
    const resetPollingBtn = document.querySelector('#resetPollingBtn');
    const saveLogBtn = document.querySelector('#saveLogBtn');
    const downloadLogBtn = document.querySelector('#downloadLogBtn');
    const saveStatus = document.querySelector('#saveStatus');

    // Polling estimation values
    let last = performance.now();
    let rates = [];
    let avg = 0;

    // Restore log on load if present
    restoreLog();

    // pointer move: only measure mouse pointer events
    function onPointerMove(ev){
      if(ev.pointerType !== 'mouse') return;
      const now = performance.now();
      const dt = now - last;
      last = now;
      if(dt <= 0 || dt > 1000) return; // discard long gaps
      const freq = 1000/dt;
      rates.push(freq);
      if(rates.length > 25) rates.shift();
      avg = Math.round(rates.reduce((s,v)=>s+v,0)/rates.length);
      if(prEl) prEl.textContent = `${avg} Hz (estimado)`;
    }

    // pointer down/up to handle pressed state reliably
    function onPointerDown(ev){
      // prefer mouse only (ignore touch/stylus)
      if(ev.pointerType !== 'mouse') return;
      const btnName = mapMouseButton(ev.button);
      const el = indicators[btnName];
      if(el){
        el.classList.add('pressed');
      }
      updateLog(`Pressed ${btnName ? btnName.toUpperCase() : ev.button}`);
      // capture pointer so we receive pointerup even outside target
      try{
        target.setPointerCapture(ev.pointerId);
      }catch(e){}
      playClickSound(0.09, 1000);
    }

    function onPointerUp(ev){
      if(ev.pointerType !== 'mouse') return;
      const btnName = mapMouseButton(ev.button);
      const el = indicators[btnName];
      if(el){
        el.classList.remove('pressed');
      }
      try{
        target.releasePointerCapture(ev.pointerId);
      }catch(e){}
      updateLog(`Released ${btnName ? btnName.toUpperCase() : ev.button}`);
    }

    function onPointerCancel(ev){
      // remove all pressed states if pointer canceled
      Object.values(indicators).forEach(el=>el && el.classList.remove('pressed'));
    }

    // global mouse-down fallback
    window.addEventListener('mousedown', (ev)=>{
      const btnName = mapMouseButton(ev.button);
      const el = indicators[btnName];
      if(el){
        el.classList.add('pressed');
        setTimeout(()=>el.classList.remove('pressed'), 220);
      }
      updateLog(`mDown ${btnName ? btnName.toUpperCase() : ev.button}`);
      playClickSound(0.09, 1000);
    });

    // register listeners
    target.addEventListener('pointermove', onPointerMove);
    target.addEventListener('pointerdown', onPointerDown);
    target.addEventListener('pointerup', onPointerUp);
    target.addEventListener('pointercancel', onPointerCancel);
    // ensure pressed states cleared on leaving the window/target
    target.addEventListener('pointerleave', onPointerCancel);

    function mapMouseButton(b){
      switch(b){
        case 0: return 'left';
        case 1: return 'middle';
        case 2: return 'right';
        case 3: return 'm4';
        case 4: return 'm5';
        default: return null;
      }
    }

    function updateLog(msg, pushToLocal = true){
      if(!logEl) return;
      const li = document.createElement('li');
      li.textContent = `${new Date().toLocaleTimeString()} — ${msg}`;
      logEl.prepend(li);
      while(logEl.children.length>40) logEl.removeChild(logEl.lastChild);

      // optionally push to localStorage as unsaved
      if(pushToLocal) markUnsaved();
    }

    function clearLog(){
      if(logEl) logEl.innerHTML = '';
      localStorage.removeItem('mouseTest_log');
      setSaveStatus('Não salvo');
    }

    function resetPolling(){
      rates = [];
      avg = 0;
      if(prEl) prEl.textContent = '— Hz';
      // reset any internal counters if needed
    }

    function saveLog(){
      if(!logEl) return;
      const items = [];
      for(const li of Array.from(logEl.children)){
        items.push(li.textContent);
      }
      try{
        localStorage.setItem('mouseTest_log', JSON.stringify(items));
        setSaveStatus('Salvo');
      }catch(e){
        console.warn('Erro salvando log:', e);
        setSaveStatus('Erro ao salvar');
      }
    }

    function restoreLog(){
      try{
        const raw = localStorage.getItem('mouseTest_log');
        if(!raw) return setSaveStatus('Sem salvamento');
        const items = JSON.parse(raw);
        if(!items || !Array.isArray(items)) return setSaveStatus('Sem salvamento');
        if(logEl){
          logEl.innerHTML = '';
          items.reverse().forEach(t => {
            const li = document.createElement('li');
            li.textContent = t;
            logEl.prepend(li);
          });
        }
        setSaveStatus('Restaurado');
      }catch(e){
        console.warn('Erro restaurando log:', e);
        setSaveStatus('Erro ao restaurar');
      }
    }

    function downloadLog(){
      if(!logEl) return;
      const lines = Array.from(logEl.children).map(li => li.textContent);
      const blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `mouse-test-log-${new Date().toISOString().replace(/[:.]/g,'-')}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setSaveStatus('Baixado');
    }

    function setSaveStatus(txt){
      if(saveStatus) saveStatus.textContent = txt;
      // clear transient "Baixado" or "Restaurado" after a bit
      if(txt === 'Baixado' || txt === 'Restaurado' || txt === 'Salvo'){
        setTimeout(()=>{ if(saveStatus && saveStatus.textContent === txt) saveStatus.textContent = ''; }, 2200);
      }
    }

    // mark unsaved change
    function markUnsaved(){
      setSaveStatus('Não salvo');
    }

    // bind controls
    if(clearLogBtn) clearLogBtn.addEventListener('click', clearLog);
    if(resetPollingBtn) resetPollingBtn.addEventListener('click', resetPolling);
    if(saveLogBtn) saveLogBtn.addEventListener('click', saveLog);
    if(downloadLogBtn) downloadLogBtn.addEventListener('click', downloadLog);

    // Make sure pointer handlers still work (no change from previous)
    // ...existing code for pointermove, pointerdown, pointerup, pointercancel...
  }

  document.addEventListener('DOMContentLoaded', initMouseTest);
})();

/* --- Headset Test --- */
(function(){
  function initHeadsetTest(){
    const playBtn = document.querySelector('#playTone');
    const stopBtn = document.querySelector('#stopTone');
    const pannerSelect = document.querySelector('#pannerSelect');
    const volRange = document.querySelector('#volRange');
    const seqBtn = document.querySelector('#playSeq');
    if(!playBtn) return;

    let ctx = null, osc=null, gain=null, pan=null;
    function setupAudio(){
      ctx = new (window.AudioContext || window.webkitAudioContext)();
      gain = ctx.createGain(); gain.gain.value = 0.4;
      pan = ctx.createStereoPanner();
      osc = ctx.createOscillator();
      osc.type = 'sine'; osc.frequency.value = 880;
      osc.connect(gain);
      gain.connect(pan);
      pan.connect(ctx.destination);
      osc.start();
    }

    playBtn.addEventListener('click', ()=>{
      if(!ctx) setupAudio();
      pan.pan.value = Number(pannerSelect.value);
    });

    stopBtn.addEventListener('click', ()=>{
      if(ctx){ ctx.close(); ctx=null; osc=null; gain=null; pan=null; }
    });

    volRange.addEventListener('input', ()=>{
      if(gain) gain.gain.value = Number(volRange.value);
    });

    seqBtn.addEventListener('click', async ()=>{
      if(!ctx) setupAudio();
      // play a short sequence panning positions for simulação 7.1
      const positions = [-1, -0.6, -0.2, 0, 0.2, 0.6, 1]; // left->right simulação
      for(const p of positions){
        if(!ctx) break;
        pan.pan.value = p;
        await sleep(350);
      }
    });

    function sleep(ms){ return new Promise(resolve=>setTimeout(resolve, ms)); }
  }

  document.addEventListener('DOMContentLoaded', initHeadsetTest);
})();
