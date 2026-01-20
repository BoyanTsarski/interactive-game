window.addEventListener('load', () => {

  /* --- UI --- */
  const ui = document.createElement('div');
  ui.id = 'ui';

  const startBtn = document.createElement('button'); startBtn.textContent='Start';
  const difficultySelect = document.createElement('select');
  difficultySelect.innerHTML=`<option value="easy">Easy</option><option value="normal" selected>Normal</option><option value="hard">Hard</option>`;
  const scoreEl=document.createElement('div'); const timeEl=document.createElement('div'); const highScoreEl=document.createElement('div');

  ui.append(startBtn, difficultySelect, scoreEl, timeEl, highScoreEl);
  document.body.appendChild(ui);

  const arena=document.createElement('div'); arena.id='arena'; document.body.appendChild(arena);

  /* --- Overlay WIN / GAME OVER --- */
  const overlay=document.createElement('div'); overlay.id='overlay'; overlay.classList.add('hidden');
  overlay.innerHTML=`<div id="overlay-content"><h1></h1><p></p><button>Play Again</button></div>`;
  document.body.appendChild(overlay);
  overlay.querySelector('button').addEventListener('click',()=>{ overlay.classList.add('hidden'); startGame(); });

  /* --- Crosshair --- */
  const crosshair = document.createElement('div'); crosshair.id='crosshair'; document.body.appendChild(crosshair);
  document.addEventListener('mousemove', e => { crosshair.style.left = e.pageX+'px'; crosshair.style.top = e.pageY+'px'; });

  /* --- DROP ZONES --- */
  const safeZone=document.createElement('div'); safeZone.id='safeZone'; safeZone.className='zone'; safeZone.textContent='SAFE';
  const dangerZone=document.createElement('div'); dangerZone.id='dangerZone'; dangerZone.className='zone'; dangerZone.textContent='DANGER';
  arena.append(safeZone,dangerZone);

  /* --- Keyboard Challenge message --- */
  const keyboardMsg = document.createElement('div');
  keyboardMsg.id = 'keyboardMessage';
  keyboardMsg.textContent = 'KEYBOARD CHALLENGE!\nИзползвай стрелки или WASD, за да преместиш обекта!';
  arena.appendChild(keyboardMsg);

  /* --- GAME STATE --- */
  let active=null, score=0, combo=0, time=60, dragging=false, offsetX=0, offsetY=0, paused=false;
  let gameInterval, spawnInterval, spawnSpeed=800;
  let highScore = Number(localStorage.getItem('highScore')) || 0;
  let keyboardChallenge=false;
  let keyboardChallengeShown=false; // за да се показва само веднъж

  updateUI();

  startBtn.addEventListener('click', startGame);

  /* --- Start Game --- */
  function startGame(){
    resetGame();

    // Стартираме spawn и таймер едва след Start
    spawnInterval = setInterval(spawnShape, spawnSpeed);
    gameInterval = setInterval(gameTick, 1000);

    // Keyboard challenge се показва само веднъж на 20-та секунда
    setTimeout(()=> {
        if(!keyboardChallengeShown && document.querySelectorAll('.shape').length > 0) {
            startKeyboardChallenge();
            keyboardChallengeShown = true;
        }
    }, 20000);
  }

  /* --- Reset Game --- */
  function resetGame(){
    arena.innerHTML=''; 
    arena.append(safeZone,dangerZone); 
    arena.appendChild(keyboardMsg);

    score = 0; 
    combo = 0; 
    paused = false; 
    keyboardChallenge = false;
    keyboardChallengeShown = false; // нулираме за нов рунд

    const diff = difficultySelect.value;
    if(diff==='easy'){time=80; spawnSpeed=1000;}
    else if(diff==='hard'){time=45; spawnSpeed=500;}
    else{time=60; spawnSpeed=800;}

    updateUI();
  }

  /* --- Game Tick --- */
  function gameTick(){ 
    if(paused) return; 
    time--; 
    updateUI(); 
    if(time<=0) endGame(); 
  }

  /* --- End Game --- */
  function endGame(){
    clearInterval(gameInterval); clearInterval(spawnInterval);
    if(score>highScore){highScore=score; localStorage.setItem('highScore',highScore);}
    overlay.classList.remove('hidden','win','lose');
    const title=overlay.querySelector('h1'); const text=overlay.querySelector('p');
    if(score>=100){overlay.classList.add('win'); title.textContent='🏆 YOU WIN!'; text.textContent=`Score: ${score}`;}
    else{overlay.classList.add('lose'); title.textContent='💀 GAME OVER'; text.textContent=`Score: ${score}`;}
  }

  /* --- Update UI --- */
  function updateUI(){ 
    scoreEl.textContent=`Score: ${score} (x${combo})`; 
    timeEl.textContent=`Time: ${time}s`; 
    highScoreEl.textContent=`High Score: ${highScore}`;
  }

  /* --- Spawn Shapes --- */
  function spawnShape(){
    if(paused) return;
    const shape=document.createElement('div'); shape.classList.add('shape');
    const rnd=Math.random(); 
    let points=10;
    if(rnd>0.9){shape.classList.add('gold'); points=30;} // жълт квадрат
    else if(rnd>0.7){shape.classList.add('circle'); points=-5;} // червен кръг
    else{shape.classList.add('cube');} // син квадрат
    shape.dataset.points=points;
    shape.style.left=Math.random()*(arena.clientWidth-50)+'px';
    shape.style.top=Math.random()*(arena.clientHeight-50)+'px';
    arena.appendChild(shape);
    shape.addEventListener('click',e=>{e.stopPropagation(); select(shape);});
    shape.addEventListener('mousedown', e=>{if(!keyboardChallenge){dragging=true; offsetX=e.offsetX; offsetY=e.offsetY; select(shape);}} );
    shape.addEventListener('dblclick',()=>hitShape(shape));
  }

  document.addEventListener('mousemove',e=>{ 
    if(!dragging || !active || paused || keyboardChallenge) return; 
    active.style.left=e.pageX-offsetX+'px'; 
    active.style.top=e.pageY-offsetY-60+'px';
  });

  document.addEventListener('mouseup',()=>{
    if(dragging && active && !keyboardChallenge) checkDrop(active); 
    dragging=false;
  });

  /* --- Select / Hit / Explode --- */
  function select(el){ 
    document.querySelectorAll('.active').forEach(a=>a.classList.remove('active')); 
    active=el; el.classList.add('active'); 
  }
  function hitShape(el){ 
    const pts=Number(el.dataset.points); 
    combo=pts>0?combo+1:0; 
    score+=pts*Math.max(1,combo); 
    explode(el); 
    updateUI();
  }
  function explode(el){ el.classList.add('explosion'); setTimeout(()=>el.remove(),400); }

  /* --- Check Drop --- */
  function checkDrop(el){
    const elRect = el.getBoundingClientRect(); 
    const safeRect = safeZone.getBoundingClientRect(); 
    const dangerRect = dangerZone.getBoundingClientRect();
    const type = el.classList.contains('circle') ? 'red' : (el.classList.contains('gold') ? 'yellow' : 'blue');

    if(isInside(elRect, safeRect)){
      if(type==='red'){ score -=15; combo=0; } 
      else { score +=20; combo++; }
      explode(el);
    } else if(isInside(elRect, dangerRect)){
      if(type==='red'){ score +=20; combo++; }
      else { score -=15; combo=0; }
      explode(el);
    }
    updateUI();
  }

  function checkKeyboardDrop(el){
    const elRect = el.getBoundingClientRect();
    const safeRect = safeZone.getBoundingClientRect();
    const dangerRect = dangerZone.getBoundingClientRect();
    const type = el.classList.contains('circle') ? 'red' : (el.classList.contains('gold') ? 'yellow' : 'blue');

    if(isInside(elRect, safeRect)){
      if(type==='red'){ score -=15; combo=0; }
      else { score +=20; combo++; }
      explode(el);
      keyboardChallenge=false;
      keyboardMsg.style.opacity=0; // веднага изчезва
    } else if(isInside(elRect, dangerRect)){
      if(type==='red'){ score +=20; combo++; }
      else { score -=15; combo=0; }
      explode(el);
      keyboardChallenge=false;
      keyboardMsg.style.opacity=0; // веднага изчезва
    }
    updateUI();
  }

  function isInside(a,b){ return a.left>b.left && a.right<b.right && a.top>b.top && a.bottom<b.bottom;}

  /* --- Keyboard controls --- */
  document.addEventListener('keydown', e=>{
    if(!active || paused) return;
    const step = e.shiftKey?25:10;

    if(keyboardChallenge){
      let x=active.offsetLeft; let y=active.offsetTop;
      if(e.key==='ArrowUp'||e.key==='w') y-=step;
      if(e.key==='ArrowDown'||e.key==='s') y+=step;
      if(e.key==='ArrowLeft'||e.key==='a') x-=step;
      if(e.key==='ArrowRight'||e.key==='d') x+=step;
      active.style.left=x+'px'; active.style.top=y+'px';
      checkKeyboardDrop(active);
      return;
    }

    if(e.key==='ArrowUp') active.style.top=(active.offsetTop-step)+'px';
    if(e.key==='ArrowDown') active.style.top=(active.offsetTop+step)+'px';
    if(e.key==='ArrowLeft') active.style.left=(active.offsetLeft-step)+'px';
    if(e.key==='ArrowRight') active.style.left=(active.offsetLeft+step)+'px';
    if(e.key==='Delete'){explode(active); active=null;}
    if(e.key==='q') active.style.transform='rotate(-15deg)';
    if(e.key==='e') active.style.transform='rotate(15deg)';
    if(e.key==='Tab'){e.preventDefault(); const shapes=[...document.querySelectorAll('.shape')]; if(shapes.length){const index=shapes.indexOf(active); select(shapes[(index+1)%shapes.length]);}}
  });

  /* --- Keyboard Challenge functions --- */
  function startKeyboardChallenge(){
    const shapes = document.querySelectorAll('.shape'); 
    if(shapes.length === 0) return;

    if(!active) select(shapes[0]);

    keyboardChallenge = true;
    paused = true;
    showKeyboardMessage(2000);
    setTimeout(()=>paused=false,300);
  }

  /* --- Show keyboard message overlay --- */
  function showKeyboardMessage(duration=2000){
    keyboardMsg.classList.remove('fadeOut');
    keyboardMsg.style.opacity = 1;
    setTimeout(()=>{ keyboardMsg.classList.add('fadeOut'); }, duration);
  }

});
