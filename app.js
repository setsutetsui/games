/**
 * Custom Connections — Pure Vanilla JavaScript Game Engine
 * Free, lightweight, zero dependencies, hosted on GitHub Pages
 */

(function () {
  'use strict';

  // ================= CONSTANTS & DEMO DATA =================
  const STORAGE_GAS_URL = 'connections_gas_url';
  const STORAGE_GAMES_PREFIX = 'connections_game_';
  const STORAGE_RESULTS_PREFIX = 'connections_results_';
  const STORAGE_MY_GAMES = 'connections_my_games';
  const STORAGE_PLAYER_NAME = 'connections_player_name';

  const COLOR_EMOJIS = {
    yellow: '🟨',
    green: '🟩',
    blue: '🟦',
    purple: '🟪'
  };

  const COLOR_LABELS = {
    yellow: 'Straightforward',
    green: 'Intermediate',
    blue: 'Hard',
    purple: 'Tricky'
  };

  const DEMO_GAMES = {
    demo: {
      id: 'demo',
      title: 'Classic Connections Starter',
      categories: [
        { id: 'c1', color: 'yellow', name: 'WET WEATHER', words: ['HAIL', 'RAIN', 'SLEET', 'SNOW'] },
        { id: 'c2', color: 'green', name: 'TYPES OF COFFEE', words: ['AMERICANO', 'ESPRESSO', 'LATTE', 'MOCHA'] },
        { id: 'c3', color: 'blue', name: '___ BOARD', words: ['CHESS', 'DART', 'KEY', 'SURF'] },
        { id: 'c4', color: 'purple', name: 'PALINDROMES', words: ['KAYAK', 'LEVEL', 'RADAR', 'ROTATOR'] }
      ]
    },
    tech: {
      id: 'tech',
      title: 'Tech & Dev Edition',
      categories: [
        { id: 't1', color: 'yellow', name: 'WEB BROWSERS', words: ['CHROME', 'EDGE', 'FIREFOX', 'SAFARI'] },
        { id: 't2', color: 'green', name: 'PROGRAMMING LANGUAGES NAMED AFTER THINGS', words: ['DART', 'GO', 'PYTHON', 'RUST'] },
        { id: 't3', color: 'blue', name: 'THINGS WITH KEYS', words: ['DATABASE', 'DICTIONARY', 'KEYCHAIN', 'PIANO'] },
        { id: 't4', color: 'purple', name: 'SYNONYMS FOR BUGS / ERRORS', words: ['DEFECT', 'FAULT', 'GLITCH', 'SNAG'] }
      ]
    }
  };

  const EXAMPLE_CREATOR_DATA = {
    title: 'Weekend Wordplay',
    categories: [
      { color: 'yellow', name: 'CAMPING GEAR', words: ['TENT', 'LANTERN', 'SLEEPING BAG', 'STOVE'] },
      { color: 'green', name: 'TYPES OF SHOES', words: ['BOOT', 'LOAFER', 'PUMP', 'SNEAKER'] },
      { color: 'blue', name: 'WORDS BEFORE "CAKE"', words: ['CUP', 'PAN', 'PATTY', 'SHORT'] },
      { color: 'purple', name: 'CONTAINING ROMAN NUMERALS', words: ['CLIMAX', 'DIVIDE', 'MIX', 'SIX'] }
    ]
  };

  // ================= STATE =================
  let currentGame = null;
  let currentResults = [];
  let tiles = [];
  let selectedWords = [];
  let solvedCategories = [];
  let mistakesRemaining = 4;
  let guessHistory = [];
  let isRevealing = false;

  // ================= DOM ELEMENTS =================
  const views = {
    home: document.getElementById('view-home'),
    play: document.getElementById('view-play'),
    create: document.getElementById('view-create')
  };

  const nav = {
    logo: document.getElementById('nav-logo'),
    homeBtn: document.getElementById('nav-home-btn'),
    createBtn: document.getElementById('nav-create-btn'),
    helpBtn: document.getElementById('nav-help-btn'),
    settingsBtn: document.getElementById('nav-settings-btn'),
    gameIndicator: document.getElementById('header-game-indicator'),
    gameIdText: document.getElementById('header-game-id-text')
  };

  const home = {
    gasNotice: document.getElementById('home-gas-notice'),
    configureBackendBtn: document.getElementById('home-configure-backend-btn'),
    playForm: document.getElementById('play-id-form'),
    playSlugInput: document.getElementById('play-slug-input'),
    heroCreateBtn: document.getElementById('hero-create-btn'),
    myPuzzlesSection: document.getElementById('my-puzzles-section'),
    myPuzzlesList: document.getElementById('my-puzzles-list')
  };

  const play = {
    loading: document.getElementById('game-loading'),
    loadingId: document.getElementById('loading-game-id'),
    error: document.getElementById('game-error'),
    errorText: document.getElementById('error-message-text'),
    errorCreateBtn: document.getElementById('error-create-btn'),
    errorHomeBtn: document.getElementById('error-home-btn'),
    board: document.getElementById('game-board'),
    solvedList: document.getElementById('solved-categories-list'),
    tileGrid: document.getElementById('tile-grid'),
    mistakesDots: document.getElementById('mistakes-dots'),
    btnShuffle: document.getElementById('btn-shuffle'),
    btnDeselect: document.getElementById('btn-deselect'),
    btnSubmit: document.getElementById('btn-submit'),
    btnViewLeaderboard: document.getElementById('btn-view-leaderboard-inline')
  };

  const creator = {
    form: document.getElementById('creator-form'),
    publishedBox: document.getElementById('creator-published'),
    publishedUrl: document.getElementById('published-share-url'),
    publishedCopyBtn: document.getElementById('published-copy-btn'),
    publishedPlayBtn: document.getElementById('published-play-btn'),
    publishedAnotherBtn: document.getElementById('published-create-another-btn'),
    btnFillExample: document.getElementById('btn-fill-example'),
    btnCancel: document.getElementById('btn-cancel-create'),
    errorBox: document.getElementById('creator-error-box'),
    errorText: document.getElementById('creator-error-text'),
    gameIdInput: document.getElementById('create-game-id'),
    titleInput: document.getElementById('create-game-title')
  };

  const modals = {
    gameOver: document.getElementById('modal-game-over'),
    leaderboard: document.getElementById('modal-leaderboard'),
    howToPlay: document.getElementById('modal-how-to-play'),
    settings: document.getElementById('modal-settings')
  };

  const results = {
    badge: document.getElementById('results-badge'),
    headline: document.getElementById('results-headline'),
    gameTitle: document.getElementById('results-game-title'),
    emojiGrid: document.getElementById('results-emoji-grid'),
    scoreForm: document.getElementById('score-form'),
    playerNameInput: document.getElementById('player-name-input'),
    scoreSubmittedSuccess: document.getElementById('score-submitted-success'),
    btnShare: document.getElementById('btn-share-results'),
    btnShareText: document.getElementById('btn-share-text'),
    btnOpenLeaderboard: document.getElementById('btn-open-leaderboard-from-results'),
    btnPlayAgain: document.getElementById('btn-play-again'),
    btnCreate: document.getElementById('btn-create-from-results')
  };

  const leaderboard = {
    subtitle: document.getElementById('leaderboard-subtitle'),
    empty: document.getElementById('leaderboard-empty'),
    list: document.getElementById('leaderboard-list'),
    btnRefresh: document.getElementById('btn-refresh-leaderboard')
  };

  const settings = {
    gasUrlInput: document.getElementById('settings-gas-url'),
    btnTest: document.getElementById('btn-test-gas-connection'),
    testBadge: document.getElementById('gas-test-badge'),
    btnSave: document.getElementById('btn-save-settings')
  };

  const toast = {
    container: document.getElementById('toast-container'),
    message: document.getElementById('toast-message')
  };

  // ================= TOAST NOTIFICATION =================
  let toastTimeout = null;
  function showToast(msg, duration = 2200) {
    if (toastTimeout) clearTimeout(toastTimeout);
    toast.message.textContent = msg;
    toast.container.classList.remove('hidden');
    toastTimeout = setTimeout(() => {
      toast.container.classList.add('hidden');
      toastTimeout = null;
    }, duration);
  }

  // ================= STORAGE & BACKEND API =================
  function getGasUrl() {
    return (localStorage.getItem(STORAGE_GAS_URL) || '').trim();
  }

  function setGasUrl(url) {
    if (!url || !url.trim()) {
      localStorage.removeItem(STORAGE_GAS_URL);
    } else {
      localStorage.setItem(STORAGE_GAS_URL, url.trim());
    }
    updateGasBanner();
  }

  function updateGasBanner() {
    const hasUrl = Boolean(getGasUrl());
    if (home.gasNotice) {
      if (hasUrl) {
        home.gasNotice.classList.add('hidden');
      } else {
        home.gasNotice.classList.remove('hidden');
      }
    }
  }

  function getLocalGame(id) {
    try {
      const raw = localStorage.getItem(`${STORAGE_GAMES_PREFIX}${id.toLowerCase()}`);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  function saveLocalGame(game) {
    try {
      const cleanId = game.id.toLowerCase();
      localStorage.setItem(`${STORAGE_GAMES_PREFIX}${cleanId}`, JSON.stringify(game));

      const rawMy = localStorage.getItem(STORAGE_MY_GAMES);
      const myGames = rawMy ? JSON.parse(rawMy) : [];
      if (!myGames.includes(cleanId)) {
        myGames.unshift(cleanId);
        localStorage.setItem(STORAGE_MY_GAMES, JSON.stringify(myGames.slice(0, 50)));
      }
    } catch {}
  }

  function getLocalResults(gameId) {
    try {
      const raw = localStorage.getItem(`${STORAGE_RESULTS_PREFIX}${gameId.toLowerCase()}`);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  function saveLocalResult(gameId, result) {
    try {
      const cleanId = gameId.toLowerCase();
      const existing = getLocalResults(cleanId);
      existing.unshift(result);
      localStorage.setItem(`${STORAGE_RESULTS_PREFIX}${cleanId}`, JSON.stringify(existing.slice(0, 100)));
    } catch {}
  }

  function getMyCreatedPuzzles() {
    try {
      const raw = localStorage.getItem(STORAGE_MY_GAMES);
      const ids = raw ? JSON.parse(raw) : [];
      const list = [];
      for (const id of ids) {
        const g = getLocalGame(id);
        if (g) list.push({ id: g.id, title: g.title });
      }
      return list;
    } catch {
      return [];
    }
  }

  async function apiFetchGame(id) {
    const cleanId = id.trim().toLowerCase();

    // 1. Built-in demo puzzles
    if (DEMO_GAMES[cleanId]) {
      return {
        game: DEMO_GAMES[cleanId],
        results: getLocalResults(cleanId)
      };
    }

    // 2. Google Apps Script Web App
    const gasUrl = getGasUrl();
    if (gasUrl) {
      try {
        const res = await fetch(`${gasUrl}?action=getGame&id=${encodeURIComponent(cleanId)}`);
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.game) {
            saveLocalGame(data.game);
            return {
              game: data.game,
              results: data.results || []
            };
          }
        }
      } catch (err) {
        console.warn('Google Sheets fetch failed, falling back to local cache:', err);
      }
    }

    // 3. LocalStorage fallback
    const localGame = getLocalGame(cleanId);
    if (localGame) {
      return {
        game: localGame,
        results: getLocalResults(cleanId)
      };
    }

    throw new Error(`Puzzle "${cleanId}" not found. Check the ID or create it!`);
  }

  async function apiCheckIdExists(id) {
    const cleanId = id.trim().toLowerCase();
    if (DEMO_GAMES[cleanId] || getLocalGame(cleanId)) return true;

    const gasUrl = getGasUrl();
    if (gasUrl) {
      try {
        const res = await fetch(`${gasUrl}?action=checkId&id=${encodeURIComponent(cleanId)}`);
        if (res.ok) {
          const data = await res.json();
          if (data.success) return Boolean(data.exists);
        }
      } catch (err) {
        console.warn('Google Sheets checkId failed:', err);
      }
    }
    return false;
  }

  async function apiSaveGame(game) {
    const cleanId = game.id.trim().toLowerCase();
    const gameRecord = { ...game, id: cleanId };

    // Always cache locally
    saveLocalGame(gameRecord);

    const gasUrl = getGasUrl();
    if (gasUrl) {
      // NOTE: Using text/plain skips CORS preflight OPTIONS request
      // which Google Apps Script Web Apps do not support.
      const res = await fetch(gasUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({
          action: 'createGame',
          id: cleanId,
          title: game.title,
          categories: game.categories
        })
      });

      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to save puzzle to Google Sheets.');
      }
    }

    return cleanId;
  }

  async function apiSubmitResult(gameId, playerName, solved, mistakesLeft, guessCount, emojis) {
    const cleanId = gameId.trim().toLowerCase();
    const resultObj = {
      id: `local_${Date.now()}`,
      gameId: cleanId,
      playerName: playerName.trim() || 'Anonymous Player',
      solved: Boolean(solved),
      mistakesRemaining: Number(mistakesLeft),
      guessCount: Number(guessCount),
      emojis: emojis,
      completedAt: new Date().toISOString()
    };

    saveLocalResult(cleanId, resultObj);

    const gasUrl = getGasUrl();
    if (gasUrl) {
      try {
        await fetch(gasUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify({
            action: 'submitResult',
            gameId: cleanId,
            playerName: resultObj.playerName,
            solved: resultObj.solved,
            mistakesRemaining: resultObj.mistakesRemaining,
            guessCount: resultObj.guessCount,
            emojis: resultObj.emojis
          })
        });
      } catch (err) {
        console.warn('Failed to submit score to Google Sheets, saved locally:', err);
      }
    }

    return resultObj;
  }

  // ================= ROUTING & NAVIGATION =================
  function navigateTo(path, pushState = true) {
    if (pushState) {
      window.history.pushState(null, '', path);
    }
    handleRoute();
  }

  function handleRoute() {
    // Check if redirect query param was passed from 404.html (e.g. /?c=mygame)
    const urlParams = new URLSearchParams(window.location.search);
    const querySlug = urlParams.get('c');
    if (querySlug) {
      window.history.replaceState(null, '', `/c/${encodeURIComponent(querySlug.toLowerCase())}`);
    }

    const path = window.location.pathname;
    const match = path.match(/^\/c\/([a-zA-Z0-9-_]+)/);

    if (match && match[1]) {
      showView('play');
      loadGame(match[1].toLowerCase());
    } else if (path === '/create' || path === '/new' || urlParams.get('view') === 'create') {
      showView('create');
    } else {
      showView('home');
    }
  }

  function showView(viewName) {
    Object.keys(views).forEach((name) => {
      if (name === viewName) {
        views[name].classList.remove('hidden');
      } else {
        views[name].classList.add('hidden');
      }
    });

    // Update Header
    if (viewName === 'home') {
      nav.homeBtn.classList.add('hidden');
      nav.createBtn.classList.remove('hidden');
      nav.gameIndicator.classList.add('hidden');
      renderMyPuzzles();
      updateGasBanner();
    } else if (viewName === 'create') {
      nav.homeBtn.classList.remove('hidden');
      nav.createBtn.classList.add('hidden');
      nav.gameIndicator.classList.add('hidden');
      resetCreatorForm();
    } else if (viewName === 'play') {
      nav.homeBtn.classList.remove('hidden');
      nav.createBtn.classList.remove('hidden');
      nav.gameIndicator.classList.remove('hidden');
    }

    window.scrollTo(0, 0);
  }

  window.addEventListener('popstate', () => handleRoute());

  // ================= GAME ENGINE =================
  async function loadGame(id) {
    const cleanId = id.trim().toLowerCase();
    nav.gameIdText.textContent = cleanId;

    play.loading.classList.remove('hidden');
    play.loadingId.textContent = cleanId;
    play.error.classList.add('hidden');
    play.board.classList.add('hidden');
    closeModal(modals.gameOver);

    try {
      const data = await apiFetchGame(cleanId);
      currentGame = data.game;
      currentResults = data.results || [];
      initGameBoard(currentGame);
      play.loading.classList.add('hidden');
      play.board.classList.remove('hidden');
    } catch (err) {
      play.loading.classList.add('hidden');
      play.error.classList.remove('hidden');
      play.errorText.textContent = err.message || 'Puzzle could not be loaded.';
      play.errorCreateBtn.onclick = () => {
        creator.gameIdInput.value = cleanId;
        navigateTo('/create');
      };
    }
  }

  function initGameBoard(game) {
    selectedWords = [];
    solvedCategories = [];
    mistakesRemaining = 4;
    guessHistory = [];
    isRevealing = false;

    // Build 16 tiles
    tiles = [];
    game.categories.forEach((cat) => {
      cat.words.forEach((word) => {
        tiles.push({
          word: word.trim().toUpperCase(),
          categoryId: cat.id,
          color: cat.color
        });
      });
    });

    // Shuffle tiles
    shuffleTiles();
    renderSolvedCategories();
    renderTiles();
    updateMistakesDisplay();
    updateButtonsState();
  }

  function shuffleTiles() {
    tiles.sort(() => Math.random() - 0.5);
  }

  function renderTiles() {
    play.tileGrid.innerHTML = '';
    tiles.forEach((tile) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'tile-btn';
      if (selectedWords.includes(tile.word)) {
        btn.classList.add('selected');
      }
      btn.innerHTML = `<span class="tile-word">${tile.word}</span>`;
      btn.onclick = () => onTileClick(tile.word);
      play.tileGrid.appendChild(btn);
    });
  }

  function onTileClick(word) {
    if (isRevealing) return;

    if (selectedWords.includes(word)) {
      selectedWords = selectedWords.filter((w) => w !== word);
    } else {
      if (selectedWords.length < 4) {
        selectedWords.push(word);
      }
    }
    renderTiles();
    updateButtonsState();
  }

  function updateButtonsState() {
    play.btnDeselect.disabled = selectedWords.length === 0 || isRevealing;
    play.btnSubmit.disabled = selectedWords.length !== 4 || isRevealing;
  }

  function renderSolvedCategories() {
    play.solvedList.innerHTML = '';
    solvedCategories.forEach((cat) => {
      const card = document.createElement('div');
      card.className = `solved-category-card ${cat.color}`;
      card.innerHTML = `
        <div class="solved-category-title">${cat.name}</div>
        <div class="solved-category-words">${cat.words.map((w) => w.toUpperCase()).join(', ')}</div>
      `;
      play.solvedList.appendChild(card);
    });
  }

  function updateMistakesDisplay() {
    const dots = play.mistakesDots.querySelectorAll('.mistake-dot');
    dots.forEach((dot, idx) => {
      if (idx < mistakesRemaining) {
        dot.className = 'mistake-dot remaining';
      } else {
        dot.className = 'mistake-dot spent';
      }
    });
  }

  // Submit a 4-word guess
  function handleGuessSubmit() {
    if (selectedWords.length !== 4 || isRevealing) return;

    // Check duplicate guess
    const sortedGuess = [...selectedWords].sort();
    const alreadyGuessed = guessHistory.some((g) => {
      const sortedHistory = [...g.words].sort();
      return sortedHistory.every((w, i) => w === sortedGuess[i]);
    });

    if (alreadyGuessed) {
      showToast('Already guessed!');
      return;
    }

    // Determine category matching
    const selectedTiles = tiles.filter((t) => selectedWords.includes(t.word));
    const guessColors = selectedTiles.map((t) => t.color);

    const countMap = {};
    selectedTiles.forEach((t) => {
      countMap[t.categoryId] = (countMap[t.categoryId] || 0) + 1;
    });

    const solvedCatId = Object.keys(countMap).find((id) => countMap[id] === 4);
    const isCorrect = Boolean(solvedCatId);

    guessHistory.push({
      words: selectedWords,
      colors: guessColors,
      isCorrect
    });

    if (isCorrect) {
      const solvedCat = currentGame.categories.find((c) => c.id === solvedCatId);
      solvedCategories.push(solvedCat);

      // Remove solved tiles
      tiles = tiles.filter((t) => t.categoryId !== solvedCatId);
      selectedWords = [];

      renderSolvedCategories();
      renderTiles();
      updateButtonsState();

      // Win check
      if (solvedCategories.length === 4) {
        setTimeout(() => triggerGameOver(true), 800);
      }
    } else {
      // Shake tiles
      play.tileGrid.classList.add('shake');
      setTimeout(() => play.tileGrid.classList.remove('shake'), 550);

      // "One away..." check
      const hasThree = Object.values(countMap).some((count) => count === 3);
      if (hasThree) {
        showToast('One away...');
      }

      mistakesRemaining -= 1;
      updateMistakesDisplay();

      if (mistakesRemaining <= 0) {
        // Loss: Reveal remaining categories sequentially
        isRevealing = true;
        updateButtonsState();
        showToast('Better luck next time!', 2500);

        const remainingCats = currentGame.categories.filter(
          (c) => !solvedCategories.some((sc) => sc.id === c.id)
        );

        remainingCats.forEach((cat, index) => {
          setTimeout(() => {
            solvedCategories.push(cat);
            tiles = tiles.filter((t) => t.categoryId !== cat.id);
            renderSolvedCategories();
            renderTiles();
          }, (index + 1) * 700);
        });

        setTimeout(() => {
          triggerGameOver(false);
          isRevealing = false;
        }, (remainingCats.length + 1) * 750);
      }
    }
  }

  function triggerGameOver(won) {
    // Generate emoji grid
    const emojiLines = guessHistory.map((g) => {
      return g.colors.map((c) => COLOR_EMOJIS[c] || '⬜').join('');
    });
    const emojiString = emojiLines.join('\n');

    // Title / Headline
    results.badge.textContent = won ? 'VICTORY' : 'GAME OVER';
    results.badge.style.background = won ? '#16a34a' : '#121212';
    
    if (won) {
      if (mistakesRemaining === 4) results.headline.textContent = 'Perfect! Not a single mistake!';
      else if (mistakesRemaining === 3) results.headline.textContent = 'Splendid!';
      else if (mistakesRemaining === 2) results.headline.textContent = 'Great Job!';
      else results.headline.textContent = 'Phew! That was close!';
    } else {
      results.headline.textContent = 'Better luck next time!';
    }

    results.gameTitle.textContent = currentGame.title || `Game #${currentGame.id}`;
    results.emojiGrid.textContent = emojiString;

    // Reset score submission form
    const savedName = localStorage.getItem(STORAGE_PLAYER_NAME) || '';
    results.playerNameInput.value = savedName;
    results.scoreForm.classList.remove('hidden');
    results.scoreSubmittedSuccess.classList.add('hidden');

    openModal(modals.gameOver);
  }

  // ================= MODALS & POPUPS =================
  function openModal(modalEl) {
    if (modalEl) modalEl.classList.remove('hidden');
  }

  function closeModal(modalEl) {
    if (modalEl) modalEl.classList.add('hidden');
  }

  // Bind modal close buttons
  document.querySelectorAll('[data-close]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const modalId = btn.getAttribute('data-close');
      const modal = document.getElementById(modalId);
      closeModal(modal);
    });
  });

  // Close modal when clicking dark overlay
  Object.values(modals).forEach((modal) => {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModal(modal);
    });
  });

  // ================= RESULTS & LEADERBOARD =================
  results.scoreForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = results.playerNameInput.value.trim();
    if (!name || !currentGame) return;

    localStorage.setItem(STORAGE_PLAYER_NAME, name);
    const won = solvedCategories.length === 4;
    const emojiString = results.emojiGrid.textContent;

    const btn = results.scoreForm.querySelector('button[type="submit"]');
    btn.disabled = true;
    btn.textContent = 'Saving...';

    try {
      const newRecord = await apiSubmitResult(
        currentGame.id,
        name,
        won,
        mistakesRemaining,
        guessHistory.length,
        emojiString
      );
      currentResults.unshift(newRecord);
      results.scoreForm.classList.add('hidden');
      results.scoreSubmittedSuccess.classList.remove('hidden');
    } catch (err) {
      console.error(err);
      results.scoreForm.classList.add('hidden');
      results.scoreSubmittedSuccess.classList.remove('hidden');
    } finally {
      btn.disabled = false;
      btn.textContent = 'Save';
    }
  });

  results.btnShare.addEventListener('click', async () => {
    if (!currentGame) return;
    const url = `https://svenja.dev/c/${currentGame.id}`;
    const text = [
      `Connections Custom #${currentGame.id}`,
      currentGame.title ? `"${currentGame.title}"` : '',
      results.emojiGrid.textContent,
      `Play: ${url}`
    ]
      .filter(Boolean)
      .join('\n');

    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        const ta = document.createElement('textarea');
        ta.value = text;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
      }
      results.btnShareText.textContent = 'Copied to Clipboard!';
      setTimeout(() => {
        results.btnShareText.textContent = 'Share Results';
      }, 2200);
    } catch (err) {
      showToast('Could not copy to clipboard');
    }
  });

  results.btnOpenLeaderboard.addEventListener('click', () => {
    closeModal(modals.gameOver);
    openLeaderboard();
  });

  results.btnPlayAgain.addEventListener('click', () => {
    closeModal(modals.gameOver);
    if (currentGame) initGameBoard(currentGame);
  });

  results.btnCreate.addEventListener('click', () => {
    closeModal(modals.gameOver);
    navigateTo('/create');
  });

  play.btnViewLeaderboard.addEventListener('click', () => {
    openLeaderboard();
  });

  function openLeaderboard() {
    if (!currentGame) return;
    leaderboard.subtitle.textContent = currentGame.title ? `"${currentGame.title}"` : `Game #${currentGame.id}`;
    renderLeaderboardList();
    openModal(modals.leaderboard);
  }

  function renderLeaderboardList() {
    leaderboard.list.innerHTML = '';
    if (!currentResults || currentResults.length === 0) {
      leaderboard.empty.classList.remove('hidden');
      return;
    }

    leaderboard.empty.classList.add('hidden');
    currentResults.forEach((res, index) => {
      const card = document.createElement('div');
      card.className = 'leaderboard-card';

      const dateText = new Date(res.completedAt).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });

      const statusBadge = res.solved
        ? `<span class="status-won">✓ Solved (${res.mistakesRemaining} left)</span>`
        : `<span class="status-lost">✕ Failed</span>`;

      card.innerHTML = `
        <div class="player-info-row">
          <div class="player-rank">#${index + 1}</div>
          <div class="player-details">
            <span class="player-name">${res.playerName}</span>
            <span class="player-time">${dateText}</span>
          </div>
          <div>${statusBadge}</div>
        </div>
        ${res.emojis ? `<div class="player-emoji-preview"><pre class="player-emojis">${res.emojis}</pre></div>` : ''}
      `;
      leaderboard.list.appendChild(card);
    });
  }

  leaderboard.btnRefresh.addEventListener('click', async () => {
    if (!currentGame) return;
    leaderboard.btnRefresh.classList.add('spin-icon');
    try {
      const data = await apiFetchGame(currentGame.id);
      currentResults = data.results || [];
      renderLeaderboardList();
    } catch (err) {
      console.warn('Failed to refresh leaderboard:', err);
    } finally {
      setTimeout(() => leaderboard.btnRefresh.classList.remove('spin-icon'), 500);
    }
  });

  // ================= CREATOR FORM =================
  creator.gameIdInput.addEventListener('input', (e) => {
    const slug = e.target.value
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-_]/g, '');
    creator.gameIdInput.value = slug;
    creator.errorBox.classList.add('hidden');
  });

  // Duplicate word validation on input
  document.querySelectorAll('.cat-word').forEach((input) => {
    input.addEventListener('input', () => {
      validateCreatorDuplicates();
    });
  });

  function validateCreatorDuplicates() {
    const wordInputs = Array.from(document.querySelectorAll('.cat-word'));
    const wordCounts = {};

    wordInputs.forEach((inp) => {
      const w = inp.value.trim().toUpperCase();
      if (w) wordCounts[w] = (wordCounts[w] || 0) + 1;
    });

    let hasDuplicate = false;
    wordInputs.forEach((inp) => {
      const w = inp.value.trim().toUpperCase();
      if (w && wordCounts[w] > 1) {
        inp.classList.add('duplicate-input');
        hasDuplicate = true;
      } else {
        inp.classList.remove('duplicate-input');
      }
    });

    return hasDuplicate;
  }

  creator.btnFillExample.addEventListener('click', () => {
    creator.titleInput.value = EXAMPLE_CREATOR_DATA.title;
    creator.gameIdInput.value = `puzzle-${Math.floor(100 + Math.random() * 900)}`;

    const colors = ['yellow', 'green', 'blue', 'purple'];
    colors.forEach((col, idx) => {
      const catData = EXAMPLE_CREATOR_DATA.categories[idx];
      const nameInput = document.getElementById(`cat-${col}-name`);
      if (nameInput) nameInput.value = catData.name;

      const wordsInp = document.querySelectorAll(`.cat-word[data-cat="${col}"]`);
      wordsInp.forEach((inp, wIdx) => {
        inp.value = catData.words[wIdx];
      });
    });

    validateCreatorDuplicates();
    creator.errorBox.classList.add('hidden');
  });

  creator.btnCancel.addEventListener('click', () => {
    navigateTo('/');
  });

  creator.form.addEventListener('submit', async (e) => {
    e.preventDefault();
    creator.errorBox.classList.add('hidden');

    const cleanId = creator.gameIdInput.value.trim().toLowerCase();
    if (!cleanId || cleanId.length < 3) {
      creator.errorText.textContent = 'Game ID must be at least 3 characters.';
      creator.errorBox.classList.remove('hidden');
      return;
    }

    if (validateCreatorDuplicates()) {
      creator.errorText.textContent = 'Duplicate words detected. All 16 words must be completely unique!';
      creator.errorBox.classList.remove('hidden');
      return;
    }

    // Build categories
    const colors = ['yellow', 'green', 'blue', 'purple'];
    const categories = [];

    for (let i = 0; i < colors.length; i++) {
      const col = colors[i];
      const name = document.getElementById(`cat-${col}-name`).value.trim().toUpperCase();
      const wordsInps = Array.from(document.querySelectorAll(`.cat-word[data-cat="${col}"]`));
      const words = wordsInps.map((inp) => inp.value.trim().toUpperCase());

      if (!name) {
        creator.errorText.textContent = `Please enter a category name for ${col.toUpperCase()}.`;
        creator.errorBox.classList.remove('hidden');
        return;
      }

      if (words.some((w) => !w)) {
        creator.errorText.textContent = `Please fill all 4 words in the ${col.toUpperCase()} category.`;
        creator.errorBox.classList.remove('hidden');
        return;
      }

      categories.push({
        id: `cat_${i + 1}`,
        color: col,
        name: name,
        words: words
      });
    }

    const submitBtn = document.getElementById('btn-submit-publish');
    submitBtn.disabled = true;
    submitBtn.querySelector('span').textContent = 'Publishing...';

    try {
      const exists = await apiCheckIdExists(cleanId);
      if (exists) {
        throw new Error(`The ID "${cleanId}" is already in use. Please pick a different ID.`);
      }

      const newGame = {
        id: cleanId,
        title: creator.titleInput.value.trim() || `Game #${cleanId}`,
        categories: categories
      };

      await apiSaveGame(newGame);

      // Show published card
      const shareUrl = `https://svenja.dev/c/${cleanId}`;
      creator.publishedUrl.value = shareUrl;
      creator.form.classList.add('hidden');
      creator.publishedBox.classList.remove('hidden');

      creator.publishedPlayBtn.onclick = () => {
        navigateTo(`/c/${cleanId}`);
      };

      creator.publishedAnotherBtn.onclick = () => {
        resetCreatorForm();
      };
    } catch (err) {
      creator.errorText.textContent = err.message || 'Failed to save puzzle.';
      creator.errorBox.classList.remove('hidden');
    } finally {
      submitBtn.disabled = false;
      submitBtn.querySelector('span').textContent = 'Publish Puzzle';
    }
  });

  creator.publishedCopyBtn.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(creator.publishedUrl.value);
      creator.publishedCopyBtn.querySelector('span').textContent = 'Copied!';
      setTimeout(() => {
        creator.publishedCopyBtn.querySelector('span').textContent = 'Copy';
      }, 2000);
    } catch {}
  });

  function resetCreatorForm() {
    creator.form.reset();
    creator.form.classList.remove('hidden');
    creator.publishedBox.classList.add('hidden');
    creator.errorBox.classList.add('hidden');
    document.querySelectorAll('.cat-word').forEach((inp) => inp.classList.remove('duplicate-input'));
  }

  // ================= HOME HUB =================
  home.playForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const raw = home.playSlugInput.value.trim();
    const slug = raw.replace(/^https?:\/\/[^/]+\/c\//i, '').toLowerCase();
    if (slug) {
      navigateTo(`/c/${slug}`);
    }
  });

  home.heroCreateBtn.addEventListener('click', () => navigateTo('/create'));
  home.configureBackendBtn.addEventListener('click', () => openModal(modals.settings));

  // Clickable sample puzzles
  document.querySelectorAll('.puzzle-card').forEach((card) => {
    card.addEventListener('click', () => {
      const slug = card.getAttribute('data-slug');
      if (slug) navigateTo(`/c/${slug}`);
    });
  });

  function renderMyPuzzles() {
    const list = getMyCreatedPuzzles();
    if (!list || list.length === 0) {
      home.myPuzzlesSection.classList.add('hidden');
      return;
    }

    home.myPuzzlesSection.classList.remove('hidden');
    home.myPuzzlesList.innerHTML = '';

    list.forEach((g) => {
      const item = document.createElement('div');
      item.className = 'my-game-item';
      item.innerHTML = `
        <div class="my-game-info">
          <span class="my-game-title">${g.title || g.id}</span>
          <span class="my-game-url">svenja.dev/c/${g.id}</span>
        </div>
        <div class="my-game-actions">
          <button type="button" class="icon-btn-small" title="Copy share link">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
          </button>
          <button type="button" class="btn-secondary-small">Play</button>
        </div>
      `;

      item.querySelector('.icon-btn-small').onclick = async (e) => {
        e.stopPropagation();
        try {
          await navigator.clipboard.writeText(`https://svenja.dev/c/${g.id}`);
          showToast('Copied link!');
        } catch {}
      };

      item.onclick = () => navigateTo(`/c/${g.id}`);
      home.myPuzzlesList.appendChild(item);
    });
  }

  // ================= SETTINGS MODAL =================
  nav.settingsBtn.addEventListener('click', () => {
    settings.gasUrlInput.value = getGasUrl();
    settings.testBadge.classList.add('hidden');
    openModal(modals.settings);
  });

  settings.btnSave.addEventListener('click', () => {
    setGasUrl(settings.gasUrlInput.value);
    closeModal(modals.settings);
    showToast('Settings saved!');
  });

  settings.btnTest.addEventListener('click', async () => {
    const url = settings.gasUrlInput.value.trim();
    if (!url) {
      settings.testBadge.className = 'status-badge error';
      settings.testBadge.textContent = 'Please enter a URL first.';
      settings.testBadge.classList.remove('hidden');
      return;
    }

    settings.btnTest.disabled = true;
    settings.btnTest.textContent = 'Testing...';

    try {
      const res = await fetch(`${url}?action=listRecent`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (data && data.success !== undefined) {
        settings.testBadge.className = 'status-badge success';
        settings.testBadge.textContent = 'Connected to Google Sheets!';
      } else {
        throw new Error('Unexpected response format.');
      }
    } catch (err) {
      settings.testBadge.className = 'status-badge error';
      settings.testBadge.textContent = 'Failed to connect. Check script deployment.';
    } finally {
      settings.testBadge.classList.remove('hidden');
      settings.btnTest.disabled = false;
      settings.btnTest.textContent = 'Test Connection';
    }
  });

  // ================= HEADER & HELP =================
  nav.logo.addEventListener('click', () => navigateTo('/'));
  nav.homeBtn.addEventListener('click', () => navigateTo('/'));
  nav.createBtn.addEventListener('click', () => navigateTo('/create'));
  nav.helpBtn.addEventListener('click', () => openModal(modals.howToPlay));

  play.errorHomeBtn.addEventListener('click', () => navigateTo('/'));

  // Game Board action buttons
  play.btnShuffle.addEventListener('click', () => {
    shuffleTiles();
    renderTiles();
  });

  play.btnDeselect.addEventListener('click', () => {
    selectedWords = [];
    renderTiles();
    updateButtonsState();
  });

  play.btnSubmit.addEventListener('click', handleGuessSubmit);

  // ================= INITIALIZATION =================
  handleRoute();
})();
