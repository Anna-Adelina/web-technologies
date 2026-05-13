'use strict';

// ─── Elements ─────────────────────────────────────────────

const gameMenu     = document.querySelector('.game-menu');
const btnStart     = document.querySelector('.button-start-game');
const btnRestart   = document.querySelector('.button-restart');
const btnNextLevel = document.querySelector('.button-next-level');

const wrapper      = document.querySelector('.wrapper');
const gamePanels   = document.querySelector('.game-panels');
const gameScreen   = document.querySelector('.game-screen');
const winScreen    = document.querySelector('.win-screen');

const gunmanEl     = document.querySelector('.gunman');
const messageEl    = document.querySelector('.message');

const timeYouEl    = document.querySelector('.time-panel__you');
const timeGunmanEl = document.querySelector('.time-panel__gunman');
const scoreNumEl   = document.querySelector('.score-panel__score_num');
const levelEl      = document.querySelector('.score-panel__level');

// ─── Game state ───────────────────────────────────────────

let currentLevel     = 0;
let score            = 0;
let phase            = 'idle';

let duelStartTime    = 0;
let gunmanReactionMs = 0;

let waitTimeoutId   = null;
let gunmanTimeoutId = null;
let timerIntervalId = null;

// ─── Levels config ────────────────────────────────────────

const LEVELS = [
  { level: 1, walkDuration: 5000, minWait: 2000, maxWait: 5000, basePoints: 100 },
  { level: 2, walkDuration: 4000, minWait: 1500, maxWait: 4000, basePoints: 200 },
  { level: 3, walkDuration: 3500, minWait: 1200, maxWait: 3500, basePoints: 300 },
  { level: 4, walkDuration: 3000, minWait: 1000, maxWait: 3000, basePoints: 400 },
  { level: 5, walkDuration: 2500, minWait:  800, maxWait: 2500, basePoints: 500 },
];

// CSS classes per level (matches style.css)
const GUNMAN_CLASSES = [
  'gunman-level-1',
  'gunman-level-2',
  'gunman-level-3',
  'gunman-level-4',
  'gunman-level-5',
];

// Pixel widths at 1x (will be scaled 3x in CSS via transform)
// Used to center the character on screen
// After scale(3): visual width = cssWidth * 3
const GUNMAN_WIDTHS_1X = [32, 32, 26, 32, 32];

// ─── Audio ────────────────────────────────────────────────

const sfx = {
  intro:    new Audio('./sfx/intro.m4a'),
  fire:     new Audio('./sfx/fire.m4a'),
  shot:     new Audio('./sfx/shot.m4a'),
  shotFall: new Audio('./sfx/shot-fall.m4a'),
  death:    new Audio('./sfx/death.m4a'),
  foul:     new Audio('./sfx/foul.m4a'),
  wait:     new Audio('./sfx/wait.m4a'),
  win:      new Audio('./sfx/win.m4a'),
};

function playSound(name) {
  const audio = sfx[name];
  if (!audio) return;
  audio.currentTime = 0;
  audio.play().catch(() => {});
}

function stopAllSounds() {
  Object.values(sfx).forEach(a => { a.pause(); a.currentTime = 0; });
}

// ─── Helpers ──────────────────────────────────────────────

function rand(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function formatTime(ms) {
  return (ms / 1000).toFixed(2);
}

function clearAllTimeouts() {
  clearTimeout(waitTimeoutId);
  clearTimeout(gunmanTimeoutId);
  clearInterval(timerIntervalId);
  waitTimeoutId = gunmanTimeoutId = timerIntervalId = null;
}

function setGunmanState(stateClass) {
  const baseClass = GUNMAN_CLASSES[currentLevel] || 'gunman-level-1';
  gunmanEl.className = 'gunman ' + baseClass + (stateClass ? ' ' + stateClass : '');
}

function showMessage(text, cssClass) {
  messageEl.className = 'message' + (cssClass ? ' ' + cssClass : '');
  messageEl.textContent = text || '';
}

function clearMessage() {
  messageEl.className = 'message';
  messageEl.textContent = '';
}

function showScreen(name) {
  gameMenu.style.display     = 'none';
  wrapper.style.display      = 'none';
  gameScreen.style.display   = 'none';
  gamePanels.style.display   = 'none';
  winScreen.style.display    = 'none';
  btnRestart.style.display   = 'none';
  btnNextLevel.style.display = 'none';

  if (name === 'menu') {
    gameMenu.style.display = 'block';
  } else if (name === 'game') {
    wrapper.style.display    = 'block';
    gameScreen.style.display = 'block';
    gamePanels.style.display = 'block';
  } else if (name === 'win') {
    winScreen.style.display = 'block';
  }
}

function updateHUD() {
  scoreNumEl.textContent = score;
  levelEl.textContent    = 'Level ' + (currentLevel + 1);
}

// ─── Custom Events ────────────────────────────────────────

function emitPhaseChange(newPhase, detail = {}) {
  const event = new CustomEvent('phaseChange', {
    detail: { phase: newPhase, level: currentLevel + 1, score, ...detail }
  });
  gameScreen.dispatchEvent(event);
}

gameScreen.addEventListener('phaseChange', (e) => {
  const { phase, level, score } = e.detail;
  console.log(`[Phase] ${phase} | Level: ${level} | Score: ${score}`);
});

// ─── startGame ────────────────────────────────────────────

function startGame() {
  stopAllSounds();
  score        = 0;
  currentLevel = 0;
  playSound('intro');
  moveGunman();
}

// ─── restartGame ──────────────────────────────────────────

function restartGame() {
  stopAllSounds();
  clearAllTimeouts();
  btnRestart.style.display = 'none';
  moveGunman();
}

// ─── nextLevel ────────────────────────────────────────────

function nextLevel() {
  stopAllSounds();
  clearAllTimeouts();
  currentLevel += 1;
  btnNextLevel.style.display = 'none';
  moveGunman();
}

// ─── moveGunman ───────────────────────────────────────────

function moveGunman() {
  phase = 'walking';
  const cfg = LEVELS[currentLevel];
  const scale = 3;
  const w1x   = GUNMAN_WIDTHS_1X[currentLevel] || 32;
  const visualW = w1x * scale; // actual pixel width on screen

  showScreen('game');
  updateHUD();
  clearMessage();

  timeYouEl.textContent    = '0.00';
  timeGunmanEl.textContent = '0.00';

  const baseClass = GUNMAN_CLASSES[currentLevel] || 'gunman-level-1';
  gunmanEl.className = 'gunman ' + baseClass;

  // Start off-screen to the right. Because transform-origin is bottom-left,
  // we set left so the visual right edge is past the screen edge (800px).
  gunmanEl.style.transition = 'none';
  gunmanEl.style.left = (800 + 20) + 'px'; // just off-screen right

  void gunmanEl.offsetWidth; // force reflow

  // Target center: screen is 800px wide, center at 400px
  // visual width = w1x * 3, so left edge = 400 - visualW/2
  const targetLeft = Math.round(400 - visualW / 2);

  // Move using steps() so the character "walks" rather than glides
  const steps = 18;
  gunmanEl.style.transition = `left ${cfg.walkDuration / 1000}s steps(${steps})`;
  gunmanEl.style.left = targetLeft + 'px';

  waitTimeoutId = setTimeout(prepareForDuel, cfg.walkDuration);
}

// ─── prepareForDuel ───────────────────────────────────────

function prepareForDuel() {
  phase = 'waiting';
  emitPhaseChange('waiting'); // кастомна подія
  const cfg       = LEVELS[currentLevel];
  const baseClass = GUNMAN_CLASSES[currentLevel] || 'gunman-level-1';

  setGunmanState(baseClass + '__standing');
  playSound('wait');

  const waitTime = rand(cfg.minWait, cfg.maxWait);

  waitTimeoutId = setTimeout(() => {
    phase         = 'duel';
    duelStartTime = Date.now();
    emitPhaseChange('duel'); // кастомна подія
 
    setGunmanState(baseClass + '__ready');
    showMessage('', 'message--fire');
    playSound('fire');

    timeCounter();

    gunmanReactionMs = rand(400, 1100 - currentLevel * 150);
    gunmanTimeoutId  = setTimeout(() => {
      if (phase === 'duel') gunmanShootsPlayer();
    }, gunmanReactionMs);

  }, waitTime);
}

// ─── timeCounter ──────────────────────────────────────────

function timeCounter() {
  clearInterval(timerIntervalId);
  timerIntervalId = setInterval(() => {
    if (phase !== 'duel') { clearInterval(timerIntervalId); return; }
    timeYouEl.textContent = formatTime(Date.now() - duelStartTime);
  }, 50);
}

// ─── gunmanShootsPlayer ───────────────────────────────────

function gunmanShootsPlayer() {
  phase = 'result';
  emitPhaseChange('playerLost', { gunmanTime: gunmanReactionMs }); // кастомна подія
  clearAllTimeouts();

  timeGunmanEl.textContent = formatTime(gunmanReactionMs);
  const baseClass = GUNMAN_CLASSES[currentLevel] || 'gunman-level-1';

  setGunmanState(baseClass + '__shooting');
  clearMessage();
  showMessage('YOU LOSE!', 'message--dead');
  playSound('death');

  gameScreen.classList.add('game-screen--death');
  setTimeout(() => gameScreen.classList.remove('game-screen--death'), 4000);

  btnRestart.style.display = 'block';
}

// ─── playerShootsGunman ───────────────────────────────────

function playerShootsGunman() {
  const baseClass = GUNMAN_CLASSES[currentLevel] || 'gunman-level-1';

  if (phase === 'waiting') {
    phase = 'result';
    clearAllTimeouts();
    stopAllSounds();
    playSound('foul');
    clearMessage();
    showMessage('TOO EARLY!', 'message--dead');
    btnRestart.style.display = 'block';
    return;
  }

  if (phase !== 'duel') return;

  phase = 'result';
  const elapsed = Date.now() - duelStartTime;
  emitPhaseChange('playerWon', { elapsed }); // кастомна подія
  clearAllTimeouts();

  timeYouEl.textContent    = formatTime(elapsed);
  timeGunmanEl.textContent = formatTime(gunmanReactionMs);

  setGunmanState(baseClass + '__death');
  clearMessage();

  playSound('shot');
  setTimeout(() => playSound('shotFall'), 300);

  scoreCount(elapsed);

  setTimeout(() => {
    if (currentLevel + 1 >= LEVELS.length) {
      playSound('win');
      setTimeout(() => {
        document.querySelector('.win-screen__score-num').textContent = score;
        showScreen('win');
      }, 2500);
    } else {
      showMessage('NICE SHOT!', 'message--win');
      btnNextLevel.style.display = 'block';
    }
  }, 1000);
}

// ─── scoreCount ───────────────────────────────────────────

function scoreCount(playerMs) {
  const cfg        = LEVELS[currentLevel];
  const speedBonus = Math.max(0, Math.floor((1000 - playerMs) / 10));
  const gained     = cfg.basePoints + speedBonus;
  score           += gained;
  updateHUD();
}

// ─── Input ────────────────────────────────────────────────

gunmanEl.addEventListener('click', playerShootsGunman);

document.addEventListener('keydown', (e) => {
  if (e.code === 'Space' || e.key === ' ') {
    e.preventDefault();
    playerShootsGunman();
  }
});

btnStart.addEventListener('click', startGame);
btnRestart.addEventListener('click', restartGame);
btnNextLevel.addEventListener('click', nextLevel);

// ─── Init ─────────────────────────────────────────────────

showScreen('menu');