/* =============================================================
   MEMORY PAIR GAME — script.js
   Pure functional style. No class mutations — state is rebuilt
   via pure functions and a single mutable `state` reference.
   ============================================================= */

/* ─── CARD DATA ─────────────────────────────────────────────── */
const ALL_CARDS = [
  { id: 'js',       icon: '1',  },
  { id: 'python',   icon: '1', label: 'Python'     },
  { id: 'java',     icon: '1', label: 'Java'       },
  { id: 'ts',       icon: '1', label: 'TypeScript' },
  { id: 'rust',     icon: '🦀', label: 'Rust'       },
  { id: 'go',       icon: '🐹', label: 'Go'         },
  { id: 'kotlin',   icon: '💜', label: 'Kotlin'     },
  { id: 'swift',    icon: '🍎', label: 'Swift'      },
  { id: 'cpp',      icon: '⚡', label: 'C++'        },
  { id: 'php',      icon: '🐘', label: 'PHP'        },
  { id: 'cs',       icon: '🔵', label: 'C#'         },
  { id: 'ruby',     icon: '💎', label: 'Ruby'       },
  { id: 'scala',    icon: '🔴', label: 'Scala'      },
  { id: 'dart',     icon: '🎯', label: 'Dart'       },
  { id: 'lua',      icon: '🌙', label: 'Lua'        },
];

const DIFF_SECONDS = { easy: 180, normal: 120, hard: 60 };

const DEFAULT_SETTINGS = {
  players:    1,
  p1name:    'Гравець 1',
  p2name:    'Гравець 2',
  rows:       3,
  cols:       4,
  difficulty: 'easy',
  rounds:     1,
};

/* ─── PURE FUNCTIONS ─────────────────────────────────────────── */

const shuffleArray = arr => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

const createDeck = (rows, cols) => {
  const pairsNeeded = (rows * cols) / 2;
  const selected    = shuffleArray(ALL_CARDS).slice(0, pairsNeeded);
  const doubled     = [...selected, ...selected];
  return shuffleArray(doubled).map((card, i) => ({
    ...card,
    uid:     `${card.id}_${i}`,
    flipped: false,
    matched: false,
  }));
};

const createState = settings => ({
  settings,
  deck:          createDeck(settings.rows, settings.cols),
  flippedUids:   [],          // at most 2 uids
  matchedUids:   [],
  moves:         0,
  scores:        [0, 0],
  playerMoves:   [0, 0],
  currentPlayer: 0,
  roundResults:  [],
  currentRound:  1,
  timeLeft:      DIFF_SECONDS[settings.difficulty],
  totalTime:     DIFF_SECONDS[settings.difficulty],
  started:       false,
  done:          false,
  locked:        false,
});

const flipCard = (state, uid) => {
  if (state.locked)                        return state;
  if (state.flippedUids.includes(uid))     return state;
  if (state.matchedUids.includes(uid))     return state;
  if (state.flippedUids.length >= 2)       return state;

  const newFlipped = [...state.flippedUids, uid];
  const isTwoFlipped = newFlipped.length === 2;

  return {
    ...state,
    flippedUids:   newFlipped,
    moves:         isTwoFlipped ? state.moves + 1 : state.moves,
    playerMoves:   isTwoFlipped
      ? state.playerMoves.map((m, i) => i === state.currentPlayer ? m + 1 : m)
      : state.playerMoves,
    started: true,
    locked:  isTwoFlipped,   // lock while checking
  };
};

const resolveFlip = state => {
  if (state.flippedUids.length < 2) return { ...state, result: null };

  const [uidA, uidB] = state.flippedUids;
  const cardA = state.deck.find(c => c.uid === uidA);
  const cardB = state.deck.find(c => c.uid === uidB);
  const isMatch = cardA.id === cardB.id;

  if (isMatch) {
    const matchedUids = [...state.matchedUids, uidA, uidB];
    const scores      = state.scores.map((s, i) => i === state.currentPlayer ? s + 1 : s);
    const done        = matchedUids.length === state.deck.length;
    return {
      ...state,
      flippedUids: [],
      matchedUids,
      scores,
      done,
      locked: false,
      result: 'match',
    };
  }

  // Miss — switch player if 2-player mode
  const nextPlayer = state.settings.players === 2
    ? (state.currentPlayer === 0 ? 1 : 0)
    : state.currentPlayer;

  return {
    ...state,
    currentPlayer: nextPlayer,
    locked:        true,
    result:        'miss',
  };
};

const clearFlipped = state => ({ ...state, flippedUids: [], locked: false });

const buildRoundResult = (state, reason) => ({
  round:   state.currentRound,
  scores:  [...state.scores],
  moves:   [...state.playerMoves],
  elapsed: state.totalTime - state.timeLeft,
  reason,
  winner:
    state.scores[0] > state.scores[1] ? 0 :
    state.scores[1] > state.scores[0] ? 1 : -1,
});

const formatTime = secs => {
  const m = String(Math.floor(secs / 60)).padStart(2, '0');
  const s = String(secs % 60).padStart(2, '0');
  return `${m}:${s}`;
};

const totalPairs = state => state.deck.length / 2;

/* ─── MUTABLE GAME STATE ─────────────────────────────────────── */
let state        = null;
let timerHandle  = null;
let uiSettings   = { ...DEFAULT_SETTINGS };

/* ─── SETUP UI HANDLERS ──────────────────────────────────────── */

const selectPlayers = n => {
  uiSettings = { ...uiSettings, players: n };
  document.getElementById('btn-1p').classList.toggle('active', n === 1);
  document.getElementById('btn-2p').classList.toggle('active', n === 2);
  document.getElementById('p2-row').classList.toggle('hidden', n !== 2);
  document.getElementById('rounds-section').style.opacity = n === 2 ? '1' : '0.6';
};

const selectDiff = d => {
  uiSettings = { ...uiSettings, difficulty: d };
  ['easy', 'normal', 'hard'].forEach(x => {
    document.getElementById(`diff-${x}`).classList.toggle('active', x === d);
  });
};

const updateGridNote = () => {
  const rows  = parseInt(document.getElementById('grid-rows').value) || 3;
  const cols  = parseInt(document.getElementById('grid-cols').value) || 4;
  const total = rows * cols;
  const note  = document.getElementById('grid-note');

  if (total % 2 !== 0) {
    note.textContent = 'Потрібна парна кількість карток';
    note.style.color = 'var(--danger)';
    return false;
  }
  const pairs = total / 2;
  if (pairs > ALL_CARDS.length) {
    note.textContent = `Забагато пар (макс ${ALL_CARDS.length})`;
    note.style.color = 'var(--danger)';
    return false;
  }
  note.textContent = `${total} карток · ${pairs} пар`;
  note.style.color = 'var(--primary)';
  return true;
};

const resetSettings = () => {
  uiSettings = { ...DEFAULT_SETTINGS };
  document.getElementById('p1-name').value      = DEFAULT_SETTINGS.p1name;
  document.getElementById('p2-name').value      = DEFAULT_SETTINGS.p2name;
  document.getElementById('grid-rows').value    = DEFAULT_SETTINGS.rows;
  document.getElementById('grid-cols').value    = DEFAULT_SETTINGS.cols;
  document.getElementById('rounds-count').value = DEFAULT_SETTINGS.rounds;
  selectPlayers(1);
  selectDiff('easy');
  updateGridNote();
};

const startGame = () => {
  if (!updateGridNote()) return;

  const rows = Math.max(3, parseInt(document.getElementById('grid-rows').value) || 3);
  const cols = Math.max(4, parseInt(document.getElementById('grid-cols').value) || 4);

  if ((rows * cols) % 2 !== 0) return;

  const settings = {
    players:    uiSettings.players,
    p1name:     document.getElementById('p1-name').value.trim() || 'Гравець 1',
    p2name:     document.getElementById('p2-name').value.trim() || 'Гравець 2',
    rows,
    cols,
    difficulty: uiSettings.difficulty,
    rounds:     Math.max(1, parseInt(document.getElementById('rounds-count').value) || 1),
  };

  state = createState(settings);
  showScreen('game-area');
  renderAll();
  startTimer();
};

const restartRound = () => {
  clearInterval(timerHandle);
  state = createState(state.settings);
  renderAll();
  startTimer();
};

const goToSetup = () => {
  clearInterval(timerHandle);
  showScreen('setup-panel');
};

/* ─── TIMER ──────────────────────────────────────────────────── */

const startTimer = () => {
  clearInterval(timerHandle);
  timerHandle = setInterval(() => {
    if (!state.started) return;
    state = { ...state, timeLeft: state.timeLeft - 1 };
    renderTimer();
    if (state.timeLeft <= 0) {
      clearInterval(timerHandle);
      onTimeout();
    }
  }, 1000);
};

const onTimeout = () => {
  const result = buildRoundResult(state, 'timeout');
  state = { ...state, done: true, roundResults: [...state.roundResults, result] };
  setTimeout(() => finishRound(result), 400);
};

/* ─── CARD CLICK ─────────────────────────────────────────────── */

const handleCardClick = uid => {
  if (!state || state.done) return;

  const prevLen = state.flippedUids.length;
  state = flipCard(state, uid);
  if (state.flippedUids.length === prevLen) return;

  renderCard(uid);
  renderCounters();

  if (state.flippedUids.length === 2) {
    setTimeout(doResolve, 700);
  }
};

const doResolve = () => {
  const missedUids = [...state.flippedUids];
  state = resolveFlip(state);

  if (state.result === 'match') {
    const [a, b] = missedUids;
    renderCard(a);
    renderCard(b);
    renderCounters();
    renderPlayerHud();

    if (state.done) {
      clearInterval(timerHandle);
      const result = buildRoundResult(state, 'complete');
      state = { ...state, roundResults: [...state.roundResults, result] };
      setTimeout(() => finishRound(result), 500);
    }
  } else {
    // show red shake then flip back
    missedUids.forEach(uid => {
      const el = document.getElementById(`card-${uid}`);
      if (el) el.classList.add('wrong');
    });
    setTimeout(() => {
      state = clearFlipped(state);
      missedUids.forEach(uid => {
        const el = document.getElementById(`card-${uid}`);
        if (el) { el.classList.remove('wrong'); el.classList.remove('flipped'); }
      });
      renderPlayerHud();
    }, 900);
  }
};

/* ─── ROUND / GAME END ───────────────────────────────────────── */

const finishRound = result => {
  if (state.settings.players === 1) {
    showModal1P(result);
    return;
  }
  if (state.currentRound < state.settings.rounds) {
    showModalRoundEnd(result);
  } else {
    showModalFinal();
  }
};

const nextRound = () => {
  closeModal();
  const savedResults = state.roundResults;
  state = {
    ...createState(state.settings),
    currentRound:  state.currentRound + 1,
    roundResults:  savedResults,
  };
  renderAll();
  startTimer();
};

/* ─── RENDER ─────────────────────────────────────────────────── */

const showScreen = id => {
  document.getElementById('setup-panel').classList.add('hidden');
  document.getElementById('game-area').classList.add('hidden');
  document.getElementById(id).classList.remove('hidden');
};

const renderAll = () => {
  renderTopbar();
  renderTimer();
  renderBoard();
  renderPlayerHud();
  renderCounters();
};

const renderTopbar = () => {
  document.getElementById('round-label').textContent =
    `Раунд ${state.currentRound}/${state.settings.rounds}`;
};

const renderTimer = () => {
  document.getElementById('timer-display').textContent = formatTime(state.timeLeft);

  const pct  = (state.timeLeft / state.totalTime) * 100;
  const fill = document.getElementById('timer-fill');
  fill.style.width = pct + '%';

  fill.classList.remove('warn', 'danger');
  if (state.timeLeft <= 15)      fill.classList.add('danger');
  else if (state.timeLeft <= 30) fill.classList.add('warn');
};

const renderCounters = () => {
  document.getElementById('moves-display').textContent = state.moves;
  document.getElementById('pairs-display').textContent =
    `${state.matchedUids.length / 2}/${totalPairs(state)}`;
};

const renderBoard = () => {
  const board = document.getElementById('board');
  const { rows, cols } = state.settings;

  // Responsive card size
  const cardSize = cols >= 6 ? 90 : cols >= 5 ? 100 : 110;
  document.documentElement.style.setProperty('--card-size', cardSize + 'px');
  board.style.gridTemplateColumns = `repeat(${cols}, ${cardSize}px)`;

  board.innerHTML = state.deck.map(card => `
    <div class="card" id="card-${card.uid}" onclick="handleCardClick('${card.uid}')">
      <div class="card-inner">
        <div class="card-face card-back"></div>
        <div class="card-face card-front">
          <span class="card-icon">${card.icon}</span>
          <span class="card-label">${card.label}</span>
        </div>
      </div>
    </div>
  `).join('');
};

const renderCard = uid => {
  const el = document.getElementById(`card-${uid}`);
  if (!el) return;
  const isFlipped = state.flippedUids.includes(uid);
  const isMatched = state.matchedUids.includes(uid);
  el.classList.toggle('flipped', isFlipped);
  el.classList.toggle('matched', isMatched);
};

const renderPlayerHud = () => {
  const hud = document.getElementById('player-hud');
  if (state.settings.players === 1) {
    hud.classList.add('hidden');
    return;
  }
  hud.classList.remove('hidden');

  document.getElementById('phud-name-0').textContent  = state.settings.p1name;
  document.getElementById('phud-name-1').textContent  = state.settings.p2name;
  document.getElementById('phud-score-0').textContent = state.scores[0];
  document.getElementById('phud-score-1').textContent = state.scores[1];
  document.getElementById('phud-moves-0').textContent = state.playerMoves[0];
  document.getElementById('phud-moves-1').textContent = state.playerMoves[1];

  [0, 1].forEach(i => {
    const card  = document.getElementById(`phud-${i}`);
    const arrow = card.querySelector('.turn-arrow');
    card.classList.toggle('active', state.currentPlayer === i);
    arrow.classList.toggle('hidden', state.currentPlayer !== i);
  });
};

/* ─── MODALS ─────────────────────────────────────────────────── */

const openModal = html => {
  document.getElementById('modal').innerHTML = html;
  document.getElementById('modal-overlay').classList.remove('hidden');
};

const closeModal = () => {
  document.getElementById('modal-overlay').classList.add('hidden');
};

const showModal1P = result => {
  const won  = result.reason === 'complete';
  const time = formatTime(result.elapsed);
  openModal(`
    <div class="modal-emoji">${won ? '🎉' : '😢'}</div>
    <h2>${won ? 'Перемога!' : 'Час вийшов'}</h2>
    <p class="modal-sub">
      ${won
        ? `Всі пари знайдено за ${time}`
        : `Знайдено ${state.matchedUids.length / 2} / ${totalPairs(state)} пар`}
    </p>
    <div class="stats-grid">
      <div class="stat-box">
        <div class="stat-box-label">Ходи</div>
        <div class="stat-box-value">${result.moves[0]}</div>
      </div>
      <div class="stat-box">
        <div class="stat-box-label">Пари</div>
        <div class="stat-box-value">${result.scores[0]}/${totalPairs(state)}</div>
      </div>
      <div class="stat-box">
        <div class="stat-box-label">Час</div>
        <div class="stat-box-value" style="font-size:1.1rem">${time}</div>
      </div>
    </div>
    <div class="modal-actions">
      <button class="btn btn-secondary" onclick="closeModal();goToSetup()">⚙ Налаштування</button>
      <button class="btn btn-primary" onclick="closeModal();restartRound()">↺ Ще раз</button>
    </div>
  `);
};

const showModalRoundEnd = result => {
  const { p1name, p2name } = state.settings;
  const winnerName =
    result.winner === 0 ? p1name :
    result.winner === 1 ? p2name : 'Нічия!';
  const winnerColor =
    result.winner === 0 ? 'var(--p1-color)' :
    result.winner === 1 ? 'var(--p2-color)' : 'var(--warn)';

  openModal(`
    <div class="modal-emoji">${result.winner === -1 ? '🤝' : '🏆'}</div>
    <h2>Раунд ${result.round} завершено</h2>
    <p class="modal-sub" style="color:${winnerColor};font-weight:700">
      ${result.winner === -1 ? 'Нічия!' : `Перемагає ${winnerName}!`}
    </p>
    <div class="stats-grid">
      <div class="stat-box">
        <div class="stat-box-label" style="color:var(--p1-color)">${p1name}</div>
        <div class="stat-box-value">${result.scores[0]} пар</div>
      </div>
      <div class="stat-box">
        <div class="stat-box-label">Час</div>
        <div class="stat-box-value" style="font-size:1rem">${formatTime(result.elapsed)}</div>
      </div>
      <div class="stat-box">
        <div class="stat-box-label" style="color:var(--p2-color)">${p2name}</div>
        <div class="stat-box-value">${result.scores[1]} пар</div>
      </div>
    </div>
    <div class="modal-actions">
      <button class="btn btn-secondary" onclick="closeModal();goToSetup()">⚙ Налаштування</button>
      <button class="btn btn-primary" onclick="nextRound()">
        ▶ Раунд ${state.currentRound + 1}/${state.settings.rounds}
      </button>
    </div>
  `);
};

const showModalFinal = () => {
  const { p1name, p2name, players } = state.settings;
  const results = state.roundResults;

  const totalScores = [
    results.reduce((s, r) => s + r.scores[0], 0),
    results.reduce((s, r) => s + r.scores[1], 0),
  ];
  const totalMoves = [
    results.reduce((s, r) => s + r.moves[0], 0),
    results.reduce((s, r) => s + r.moves[1], 0),
  ];
  const finalWinner =
    totalScores[0] > totalScores[1] ? 0 :
    totalScores[1] > totalScores[0] ? 1 : -1;

  const winnerLabel =
    players === 1 ? p1name :
    finalWinner === -1 ? 'Нічия!' :
    finalWinner === 0  ? p1name : p2name;

  const winnerColor =
    finalWinner === 0  ? 'var(--p1-color)' :
    finalWinner === 1  ? 'var(--p2-color)' : 'var(--warn)';

  // Build round rows
  const roundRows = results.map(r => {
    const rWin = r.winner;
    const rowClass = rWin !== -1 ? 'winner-row' : '';
    if (players === 1) {
      return `
        <tr class="${rowClass}">
          <td>Раунд ${r.round}</td>
          <td>${r.scores[0]} пар</td>
          <td>${r.moves[0]} ходів</td>
          <td>${formatTime(r.elapsed)}</td>
        </tr>`;
    }
    return `
      <tr class="${rowClass}">
        <td>Раунд ${r.round}</td>
        <td class="p1-cell">${r.scores[0]}п / ${r.moves[0]}х</td>
        <td class="p2-cell">${r.scores[1]}п / ${r.moves[1]}х</td>
        <td>${formatTime(r.elapsed)}</td>
      </tr>`;
  }).join('');

  const tableHead = players === 1
    ? `<tr><th>Раунд</th><th>Пари</th><th>Ходи</th><th>Час</th></tr>`
    : `<tr><th>Раунд</th><th style="color:var(--p1-color)">${p1name}</th><th style="color:var(--p2-color)">${p2name}</th><th>Час</th></tr>`;

  const summaryHtml = players === 2 ? `
    <div class="stats-grid" style="margin-bottom:16px">
      <div class="stat-box">
        <div class="stat-box-label" style="color:var(--p1-color)">${p1name}</div>
        <div class="stat-box-value">${totalScores[0]} пар</div>
        <div style="font-size:0.72rem;color:var(--text-muted);margin-top:4px">${totalMoves[0]} ходів</div>
      </div>
      <div class="stat-box" style="display:flex;align-items:center;justify-content:center;font-size:1.2rem;font-weight:800">vs</div>
      <div class="stat-box">
        <div class="stat-box-label" style="color:var(--p2-color)">${p2name}</div>
        <div class="stat-box-value">${totalScores[1]} пар</div>
        <div style="font-size:0.72rem;color:var(--text-muted);margin-top:4px">${totalMoves[1]} ходів</div>
      </div>
    </div>` : '';

  openModal(`
    <div class="modal-emoji">🏆</div>
    <h2 style="color:${winnerColor}">${winnerLabel}</h2>
    <p class="modal-sub">Фінальний результат · ${results.length} раунд(ів)</p>
    ${summaryHtml}
    <table class="round-table">
      <thead>${tableHead}</thead>
      <tbody>${roundRows}</tbody>
    </table>
    <div class="modal-actions">
      <button class="btn btn-secondary" onclick="closeModal();goToSetup()">⚙ Налаштування</button>
      <button class="btn btn-primary" onclick="closeModal();startGame()">▶ Нова гра</button>
    </div>
  `);
};

/* ─── INIT ───────────────────────────────────────────────────── */
document.getElementById('grid-rows').addEventListener('input', updateGridNote);
document.getElementById('grid-cols').addEventListener('input', updateGridNote);
updateGridNote();