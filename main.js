    const howToPlayPage = document.getElementById("howToPlayPage");
    const namePage = document.getElementById("namePage");
    const gamePage = document.getElementById("gamePage");
    const playerNameInput = document.getElementById("playerName");
    const grid = document.getElementById("grid");
    const timerDisplay = document.getElementById("timer");
    const levelDisplay = document.getElementById("level");
    const scoreDisplay = document.getElementById("score");
    const historyInNamePageBody = document.querySelector("#historyInNamePage tbody");
    const goToNameBtn = document.getElementById("goToNameBtn");
    const startBtn = document.getElementById("startBtn");
    const backToHowToBtn = document.getElementById("backToHowToBtn");
    const exitBtn = document.getElementById("exitBtn");
    const restartBtn = document.getElementById("restartBtn");
    const customAlertBtn = document.getElementById("customAlertBtn");

    let level = 1, score = 0, diffColorIndex;
    let gameTimer = 30, gameInterval, playing = false;
    let history = [], currentPlayer = "";

    function loadHistory() {
      const saved = localStorage.getItem("spotcolor_history");
      if (saved) history = JSON.parse(saved) || [];
    }
    function saveHistory() {
      localStorage.setItem("spotcolor_history", JSON.stringify(history));
    }

    function showCustomAlert(msg, callback = null, showRestart = false) {
      document.getElementById("customAlertMsg").innerHTML = msg;
      restartBtn.classList.toggle("hidden", !showRestart);
      document.getElementById("customAlert").classList.remove("hidden");

      customAlertBtn.onclick = () => {
        document.getElementById("customAlert").classList.add("hidden");
        if (callback) callback();
      };

      restartBtn.onclick = () => {
        document.getElementById("customAlert").classList.add("hidden");
        gamePage.classList.remove("hidden");
        grid.classList.remove("hidden");
        startGame();
      };
    }

    goToNameBtn.onclick = () => {
      howToPlayPage.classList.add("hidden");
      namePage.classList.remove("hidden");
      playerNameInput.value = "";
      updateHistoryInNamePage();
      playerNameInput.focus();
    };

    backToHowToBtn.onclick = () => {
      namePage.classList.add("hidden");
      howToPlayPage.classList.remove("hidden");
    };

    startBtn.onclick = () => {
      const name = playerNameInput.value.trim();
      if (!name) return showCustomAlert("กรุณากรอกชื่อก่อนเริ่มเกม");
      currentPlayer = name;
      namePage.classList.add("hidden");
      gamePage.classList.remove("hidden");
      grid.classList.remove("hidden");
      startGame();
    };

    exitBtn.onclick = () => {
      stopGame();
      gamePage.classList.add("hidden");
      namePage.classList.remove("hidden");
      updateHistoryInNamePage();
    };

    function startGame() {
      clearInterval(gameInterval);
      level = 1;
      score = 0;
      playing = true;
      let timeLeft = gameTimer;

      scoreDisplay.textContent = score;
      levelDisplay.textContent = level;

      gameInterval = setInterval(() => {
        timeLeft -= 0.01;
        if (timeLeft <= 0) { endGame(false); timeLeft = 0; }
        timerDisplay.textContent = timeLeft.toFixed(2);
      }, 10);

      generateGrid();
    }

    function stopGame() {
      playing = false;
      clearInterval(gameInterval);
      grid.innerHTML = "";
      grid.classList.add("hidden");
    }

    function generateGrid() {
      grid.innerHTML = "";
      const isMobile = window.innerWidth <= 600;
      const gridSize = Math.min(7, 4 + Math.floor((level - 1) / 3));
      const totalSquares = gridSize * gridSize;
      const squareSize = Math.max((isMobile ? 40 : 60) - (gridSize - 4) * 5, 25);
      grid.style.gridTemplateColumns = `repeat(${gridSize}, ${squareSize}px)`;
      diffColorIndex = Math.floor(Math.random() * totalSquares);
      const r = Math.floor(Math.random() * 200);
      const g = Math.floor(Math.random() * 200);
      const b = Math.floor(Math.random() * 200);
      const baseColor = `rgb(${r}, ${g}, ${b})`;
      const colorDiff = Math.max(50 - level * 2, 5);
      const diffColor = `rgb(${Math.min(r + colorDiff, 255)}, ${g}, ${b})`;

      for (let i = 0; i < totalSquares; i++) {
        const square = document.createElement("div");
        square.classList.add("square");
        square.style.width = squareSize + "px";
        square.style.height = squareSize + "px";
        square.style.backgroundColor = i === diffColorIndex ? diffColor : baseColor;
        square.addEventListener("click", () => handleClick(i));
        grid.appendChild(square);
      }
    }

    function handleClick(index) {
      if (!playing) return;
      if (index === diffColorIndex) {
        level++;
        score += 10;
        scoreDisplay.textContent = score;
        levelDisplay.textContent = level;
        generateGrid();
      } else {
        endGame(true);
      }
    }

    function endGame(isWrong) {
      playing = false;
      clearInterval(gameInterval);
      grid.classList.add("hidden");

      const finalLevel = level - 1;
      const existing = history.find(h => h.name === currentPlayer);

      if (!existing) {
        history.push({ name: currentPlayer, level: finalLevel, score });
      } else if (score > existing.score) {
        existing.level = finalLevel;
        existing.score = score;
      }

      saveHistory();

      showCustomAlert(
        isWrong ? `❌ ผิดจ้าาา<br>คะแนนของคุณ: ${score}` : `⏰ หมดเวลาแล้ว!<br>คะแนนของคุณ: ${score}`,
        () => { gamePage.classList.add("hidden"); namePage.classList.remove("hidden"); updateHistoryInNamePage(); },
        true
      );
    }

    function renderHistory(targetBody) {
      targetBody.innerHTML = "";
      const sorted = history.slice().sort((a, b) => b.score - a.score);
      if (sorted.length === 0) {
        targetBody.innerHTML = `<tr><td colspan="4" style="text-align:center;color:#94a3b8;">ยังไม่มีประวัติการเล่น</td></tr>`;
        return;
      }
      sorted.forEach((item, i) => {
        const row = document.createElement("tr");
        row.innerHTML = `<td>${i + 1}</td><td>${item.name}</td><td>${item.level}</td><td class="score-cell">${item.score}</td>`;
        targetBody.appendChild(row);
      });
    }

    function updateHistoryInNamePage() { renderHistory(historyInNamePageBody); }

    loadHistory();
    updateHistoryInNamePage();  