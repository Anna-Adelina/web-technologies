const board = document.getElementById("gameBoard");
const timerEl = document.getElementById("timer");
const movesP1El = document.getElementById("movesP1");
const movesP2El = document.getElementById("movesP2");
const currentPlayerEl = document.getElementById("currentPlayer");
const modeRadios = document.querySelectorAll('input[name="mode"]');
const p2Input = document.getElementById("p2");

modeRadios.forEach(radio => {
    radio.addEventListener("change", () => {
        if (radio.value === "2" && radio.checked) {
            p2Input.style.display = "inline-block";
            p2Input.value = "Player 2";
        } else if (radio.value === "1" && radio.checked) {
            p2Input.style.display = "none";
        }
    });
});

let firstCard = null;
let secondCard = null;
let lock = false;

let startTime = 0;
let playerMoves = [0, 0];
let timer;
let timeLeft = 0;

let players = [
    { name: "Player 1", results: [] },
    { name: "Player 2", results: [] }
];
let currentPlayer = 0;
let totalRounds = 1;
let currentRound = 1;

const shuffle = (array) => array.sort(() => Math.random() - 0.5);

const createValues = (count) => {
    const values = [];
    for (let i = 1; i <= count / 2; i++) {
        values.push(i, i);
    }
    return shuffle(values);
};

const createCard = (value) => {
    const card = document.createElement("div");
    card.classList.add("card");

    card.innerHTML = `
        <div class="inner">
            <div class="front">?</div>
            <div class="back">${value}</div>
        </div>
    `;

    card.addEventListener("click", () => handleClick(card, value));
    return card;
};

const handleClick = (card, value) => {
    if (lock || card.classList.contains("flipped")) return;

    card.classList.add("flipped");

    if (!firstCard) {
        firstCard = { card, value };
    } else {
        secondCard = { card, value };

        playerMoves[currentPlayer]++;
        updateMovesUI();
        checkMatch();
    }
};

const updateMovesUI = () => {
    movesP1El.textContent = playerMoves[0];
    movesP2El.textContent = playerMoves[1];
};

const checkMatch = () => {
    lock = true;

    if (firstCard.value === secondCard.value) {

        checkWin();
        resetTurn();

    } else {
        setTimeout(() => {
            firstCard.card.classList.remove("flipped");
            secondCard.card.classList.remove("flipped");
            switchPlayer();
            resetTurn();
        }, 800);
    }
};

const switchPlayer = () => {
    if (players.length === 2) {
        currentPlayer = currentPlayer === 0 ? 1 : 0;
        updatePlayerUI();
    }
};

const updatePlayerUI = () => {
    currentPlayerEl.textContent =
        "Хід: " + players[currentPlayer].name;
};

const resetTurn = () => {
    [firstCard, secondCard] = [null, null];
    lock = false;
};

const checkWin = () => {
    const flipped = document.querySelectorAll(".flipped").length;
    const total = document.querySelectorAll(".card").length;

    if (flipped === total) {
        clearInterval(timer);

        setTimeout(() => {
            alert("Раунд завершено!");
            nextRound();
        }, 500);
    }
};

const nextRound = () => {
  saveRound();

    if (currentRound < totalRounds) {
        currentRound++;
        startGame();
    } else {
        showWinner();
    }
};

const showWinner = () => {
    let result = "Результати:\n\n";

    players.forEach(p => {
        result += `${p.name}:\n`;

        p.results.forEach(r => {
            result += `Раунд ${r.round}: ${r.moves} ходів, ${r.time} сек\n`;
        });

        result += "\n";
    });

    alert(result);
};

const saveRound = () => {
  players.forEach((p, index) => {
    p.results.push({
      round: currentRound,
      moves: playerMoves[index],
      time: startTime - timeLeft
    });
  });
};

const startGame = () => {
    clearInterval(timer);

    const rows = +document.getElementById("rows").value;
    const cols = +document.getElementById("cols").value;

    if ((rows * cols) % 2 !== 0) {
        alert("Кількість карток повинна бути парною!");
        return;
    }

    startTime = +document.getElementById("difficulty").value;
    timeLeft = startTime;

    totalRounds = +document.getElementById("rounds").value;

    const mode = document.querySelector('input[name="mode"]:checked').value;

    players = [
      { name: document.getElementById("p1").value || "Player 1", results: [] }
    ];

    if (mode === "2") {
      players.push({
          name: document.getElementById("p2").value || "Player 2",
          results: []
      });
    }

    currentPlayer = 0;

    playerMoves = [0, 0];
    movesP1El.textContent = 0;
    movesP2El.textContent = 0;

    board.innerHTML = "";
    board.style.gridTemplateColumns = `repeat(${cols}, 80px)`;

    const values = createValues(rows * cols);
    values.forEach(v => board.appendChild(createCard(v)));

    updatePlayerUI();

    timer = setInterval(() => {
        timeLeft--;
        timerEl.textContent = timeLeft;

        if (timeLeft <= 0) {
            clearInterval(timer);
            alert("Час вийшов!");
            nextRound();
        }
    }, 1000);
};

document.getElementById("start").onclick = startGame;

document.getElementById("reset").onclick = () => {
    document.getElementById("rows").value = 4;
    document.getElementById("cols").value = 4;
    document.getElementById("difficulty").value = 180;
    document.getElementById("rounds").value = 1;

    p2Input.style.display = "none";

    document.querySelector('input[value="1"]').checked = true;
};
document.getElementById("restart").onclick = startGame;