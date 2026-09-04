/**
 * Categories — Barebones Minimalist Game Engine
 */

(function () {
  'use strict';

  // Constants
  const STORAGE_GAS_URL = 'categories_gas_url';
  const STORAGE_GAMES_PREFIX = 'categories_game_';
  const STORAGE_RESULTS_PREFIX = 'categories_results_';
  const STORAGE_PLAYER_NAME = 'categories_player_name';

  const COLOR_EMOJIS = {
    yellow: '🟨',
    green: '🟩',
    blue: '🟦',
    purple: '🟪'
  };

  const DEFAULT_GAME = {
    id: 'demo',
    title: 'Starter Puzzle',
    categories: [
      { id: 'c1', color: 'yellow', name: 'WET WEATHER', words: ['HAIL', 'RAIN', 'SLEET', 'SNOW'] },
      { id: 'c2', color: 'green', name: 'TYPES OF COFFEE', words: ['AMERICANO', 'ESPRESSO', 'LATTE', 'MOCHA'] },
      { id: 'c3', color: 'blue', name: 'WORDS BEFORE "BOARD"', words: ['CHESS', 'DART', 'KEY', 'SURF'] },
      { id: 'c4', color: 'purple', name: 'PALINDROMES', words: ['KAYAK', 'LEVEL', 'RADAR', 'ROTATOR'] }
    ]
  };

  const SAMPLE_DATA = {
    title: 'Weekend Wordplay',
    categories: [
      { color: 'yellow', name: 'CAMPING GEAR', words: ['TENT', 'LANTERN', 'SLEEPING BAG', 'STOVE'] },
      { color: 'green', name: 'TYPES OF SHOES', words: ['BOOT', 'LOAFER', 'PUMP', 'SNEAKER'] },
      { color: 'blue', name: 'WORDS BEFORE "CAKE"', words: ['CUP', 'PAN', 'PATTY', 'SHORT'] },
      { color: 'purple', name: 'CONTAINING ROMAN NUMERALS', words: ['CLIMAX', 'DIVIDE', 'MIX', 'SIX'] }
    ]
  };

  // State
  let currentGame = null;
  let currentResults = [];
  let tiles = [];
  let selectedWords = [];
  let solvedCategories = [];
  let mistakesRemaining = 4;
  let guessHistory = [];
  let isRevealing = false;

  // DOM Elements
  const views = {
    play: document.getElementById('view-play'),
    create: document.getElementById('view-create')
  };

  const header = {
    logo: document.getElementById('nav-logo'),
    puzzleIdTag: document.getElementById('current-puzzle-id'),
    btnNavCreate: document.getElementById('btn-nav-create'),
    btnNavHelp: document.getElementById('btn-nav-help'),
    btnNavSettings: document.getElementById('btn-nav-settings'),
    quickPlayBar: document.getElementById('quick-play-bar'),
    quickPlayForm: document.getElementById('quick-play-form'),
    quickPlayInput: document.getElementById('quick-play-input')
  };

  const play = {
    solvedList: document.getElementById('solved-categories'),
    tileGrid: document.getElementById('tile-grid'),
    mistakesDots: document.getElementById('mistakes-dots'),
    btnShuffle: document.getElementById('btn-shuffle'),
    btnDeselect: document.getElementById('btn-deselect'),
    btnSubmit: document.getElementById('btn-submit'),
    btnViewLeaderboard: document.getElementById('btn-view-leaderboard'),
    btnBoardQr: document.getElementById('btn-board-qr')
  };

  const creator = {
    form: document.getElementById('create-form'),
    slugInput: document.getElementById('create-slug'),
    titleInput: document.getElementById('create-title'),
    errorBox: document.getElementById('create-error'),
    btnFillExample: document.getElementById('btn-fill-example'),
    btnCancel: document.getElementById('btn-cancel-create'),
    publishSuccess: document.getElementById('publish-success'),
    shareLinkInput: document.getElementById('share-link-input'),
    btnCopyShareLink: document.getElementById('btn-copy-share-link'),
    publishQrcode: document.getElementById('publish-qrcode'),
    btnPlayPublished: document.getElementById('btn-play-published'),
    btnMakeAnother: document.getElementById('btn-make-another')
  };

  const modals = {
    results: document.getElementById('modal-results'),
    leaderboard: document.getElementById('modal-leaderboard'),
    help: document.getElementById('modal-help'),
    settings: document.getElementById('modal-settings'),
    qr: document.getElementById('modal-qr')
  };

  const results = {
    headline: document.getElementById('results-headline'),
    sub: document.getElementById('results-sub'),
    grid: document.getElementById('results-grid'),
    scoreSavedMsg: document.getElementById('score-saved-msg'),
    scoreForm: document.getElementById('score-form'),
    playerNameInput: document.getElementById('player-name'),
    btnShare: document.getElementById('btn-share-results'),
    btnToggleQr: document.getElementById('btn-toggle-results-qr'),
    qrWrap: document.getElementById('results-qr-wrap'),
    qrcode: document.getElementById('results-qrcode'),
    btnOpenLeaderboard: document.getElementById('btn-open-leaderboard'),
    btnPlayAgain: document.getElementById('btn-play-again')
  };

  const leaderboard = {
    title: document.getElementById('leaderboard-title'),
    empty: document.getElementById('leaderboard-empty'),
    list: document.getElementById('leaderboard-list')
  };

  const settings = {
    gasUrlInput: document.getElementById('gas-url-input'),
    btnTest: document.getElementById('btn-test-gas'),
    testResult: document.getElementById('gas-test-result'),
    btnSave: document.getElementById('btn-save-settings')
  };

  const toast = document.getElementById('toast');
  let toastTimer = null;

  function showToast(text, duration = 2000) {
    if (toastTimer) clearTimeout(toastTimer);
    toast.textContent = text;
    toast.classList.remove('hidden');
    toastTimer = setTimeout(() => {
      toast.classList.add('hidden');
      toastTimer = null;
    }, duration);
  }

  // ================= STORAGE & BACKEND =================
  function getGasUrl() {
    return (localStorage.getItem(STORAGE_GAS_URL) || '').trim();
  }

  function setGasUrl(url) {
    if (!url || !url.trim()) localStorage.removeItem(STORAGE_GAS_URL);
    else localStorage.setItem(STORAGE_GAS_URL, url.trim());
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
      localStorage.setItem(`${STORAGE_GAMES_PREFIX}${game.id.toLowerCase()}`, JSON.stringify(game));
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

  function saveLocalResult(gameId, res) {
    try {
      const list = getLocalResults(gameId);
      list.unshift(res);
      localStorage.setItem(`${STORAGE_RESULTS_PREFIX}${gameId.toLowerCase()}`, JSON.stringify(list.slice(0, 100)));
    } catch {}
  }

  async function fetchGame(id) {
    const cleanId = id.trim().toLowerCase();

    if (cleanId === 'demo') {
      return { game: DEFAULT_GAME, results: getLocalResults('demo') };
    }

    const gasUrl = getGasUrl();
    if (gasUrl) {
      try {
        const r = await fetch(`${gasUrl}?action=getGame&id=${encodeURIComponent(cleanId)}`);
        if (r.ok) {
          const data = await r.json();
          if (data.success && data.game) {
            saveLocalGame(data.game);
            return { game: data.game, results: data.results || [] };
          }
        }
      } catch (err) {
        console.warn('Backend fetch failed, trying local:', err);
      }
    }

    const local = getLocalGame(cleanId);
    if (local) {
      return { game: local, results: getLocalResults(cleanId) };
    }

    throw new Error(`Puzzle "${cleanId}" not found.`);
  }

  async function saveGame(game) {
    const cleanId = game.id.trim().toLowerCase();
    const gameRecord = { ...game, id: cleanId };
    saveLocalGame(gameRecord);

    const gasUrl = getGasUrl();
    if (gasUrl) {
      const r = await fetch(gasUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({
          action: 'createGame',
          id: cleanId,
          title: game.title,
          categories: game.categories
        })
      });
      const data = await r.json();
      if (!data.success) throw new Error(data.error || 'Failed to save to Google Sheets');
    }
    return cleanId;
  }

  async function submitScore(gameId, playerName, solved, mistakesLeft, guessCount, emojis) {
    const cleanId = gameId.trim().toLowerCase();
    const item = {
      id: `local_${Date.now()}`,
      gameId: cleanId,
      playerName: playerName.trim() || 'Anonymous',
      solved: Boolean(solved),
      mistakesRemaining: Number(mistakesLeft),
      guessCount: Number(guessCount),
      emojis: emojis,
      completedAt: new Date().toISOString()
    };
    saveLocalResult(cleanId, item);

    const gasUrl = getGasUrl();
    if (gasUrl) {
      try {
        await fetch(gasUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify({
            action: 'submitResult',
            gameId: cleanId,
            playerName: item.playerName,
            solved: item.solved,
            mistakesRemaining: item.mistakesRemaining,
            guessCount: item.guessCount,
            emojis: item.emojis
          })
        });
      } catch (e) {
        console.warn('Could not post score to Google Sheets:', e);
      }
    }
    return item;
  }

  // ================= ROUTING =================
  function navigate(path, pushState = true) {
    if (pushState) window.history.pushState(null, '', path);
    route();
  }

  function route() {
    const urlParams = new URLSearchParams(window.location.search);
    const querySlug = urlParams.get('c');
    if (querySlug) {
      window.history.replaceState(null, '', `/c/${encodeURIComponent(querySlug.toLowerCase())}`);
    }

    const path = window.location.pathname;
    const match = path.match(/^\/c\/([a-zA-Z0-9-_]+)/);

    if (match && match[1]) {
      showPlayView(match[1].toLowerCase());
    } else if (path === '/create' || path === '/new' || urlParams.get('view') === 'create') {
      showCreateView();
    } else {
      // Default: play demo puzzle immediately on home
      showPlayView('demo');
    }
  }

  window.addEventListener('popstate', route);

  function showPlayView(id) {
    views.play.classList.remove('hidden');
    views.create.classList.add('hidden');

    if (id !== 'demo') {
      header.puzzleIdTag.textContent = `#${id}`;
      header.puzzleIdTag.classList.remove('hidden');
      header.quickPlayInput.value = id;
    } else {
      header.puzzleIdTag.classList.add('hidden');
      header.quickPlayInput.value = '';
    }

    loadPuzzle(id);
  }

  function showCreateView() {
    views.play.classList.add('hidden');
    views.create.classList.remove('hidden');
    header.puzzleIdTag.classList.add('hidden');
    resetCreateForm();
  }

  // ================= GAME ENGINE =================
  async function loadPuzzle(id) {
    try {
      const data = await fetchGame(id);
      currentGame = data.game;
      currentResults = data.results || [];
      initBoard(currentGame);
    } catch (err) {
      showToast(err.message || 'Puzzle not found');
      // If custom not found, open create view with that slug pre-filled
      creator.slugInput.value = id;
      showCreateView();
    }
  }

  function initBoard(game) {
    selectedWords = [];
    solvedCategories = [];
    mistakesRemaining = 4;
    guessHistory = [];
    isRevealing = false;

    tiles = [];
    game.categories.forEach((cat) => {
      cat.words.forEach((w) => {
        tiles.push({
          word: w.trim().toUpperCase(),
          categoryId: cat.id,
          color: cat.color
        });
      });
    });

    shuffleTiles();
    renderSolved();
    renderTiles();
    updateMistakes();
    updateButtons();
  }

  function shuffleTiles() {
    let attempts = 0;
    do {
      for (let i = tiles.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        const temp = tiles[i];
        tiles[i] = tiles[j];
        tiles[j] = temp;
      }
      attempts++;
    } while (attempts < 10 && hasFullCategoryInRow(tiles));
  }

  function hasFullCategoryInRow(arr) {
    if (arr.length < 16) return false;
    for (let r = 0; r < 4; r++) {
      const row = arr.slice(r * 4, r * 4 + 4);
      if (row.length === 4 && row.every((t) => t.categoryId === row[0].categoryId)) {
        return true;
      }
    }
    return false;
  }

  function renderTiles() {
    play.tileGrid.innerHTML = '';
    tiles.forEach((tile) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'tile';
      if (selectedWords.includes(tile.word)) {
        btn.classList.add('selected');
      }
      btn.textContent = tile.word;
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
    updateButtons();
  }

  function updateButtons() {
    play.btnDeselect.disabled = selectedWords.length === 0 || isRevealing;
    play.btnSubmit.disabled = selectedWords.length !== 4 || isRevealing;
  }

  function renderSolved() {
    play.solvedList.innerHTML = '';
    solvedCategories.forEach((cat) => {
      const box = document.createElement('div');
      box.className = `solved-cat-box ${cat.color}`;
      box.innerHTML = `
        <div class="solved-cat-title">${cat.name}</div>
        <div class="solved-cat-words">${cat.words.map((w) => w.toUpperCase()).join(', ')}</div>
      `;
      play.solvedList.appendChild(box);
    });
  }

  function updateMistakes() {
    const dots = play.mistakesDots.querySelectorAll('.dot');
    dots.forEach((dot, idx) => {
      dot.className = idx < mistakesRemaining ? 'dot remaining' : 'dot spent';
    });
  }

  function submitGuess() {
    if (selectedWords.length !== 4 || isRevealing) return;

    const sortedGuess = [...selectedWords].sort();
    const duplicate = guessHistory.some((g) => {
      const s = [...g.words].sort();
      return s.every((w, i) => w === sortedGuess[i]);
    });

    if (duplicate) {
      showToast('Already guessed!');
      return;
    }

    const selectedTiles = tiles.filter((t) => selectedWords.includes(t.word));
    const guessColors = selectedTiles.map((t) => t.color);

    const counts = {};
    selectedTiles.forEach((t) => {
      counts[t.categoryId] = (counts[t.categoryId] || 0) + 1;
    });

    const solvedId = Object.keys(counts).find((id) => counts[id] === 4);
    const isCorrect = Boolean(solvedId);

    guessHistory.push({
      words: selectedWords,
      colors: guessColors,
      isCorrect
    });

    if (isCorrect) {
      const cat = currentGame.categories.find((c) => c.id === solvedId);
      solvedCategories.push(cat);
      tiles = tiles.filter((t) => t.categoryId !== solvedId);
      selectedWords = [];

      renderSolved();
      renderTiles();
      updateButtons();

      if (solvedCategories.length === 4) {
        setTimeout(() => triggerGameOver(true), 600);
      }
    } else {
      play.tileGrid.classList.add('shake');
      setTimeout(() => play.tileGrid.classList.remove('shake'), 450);

      const hasThree = Object.values(counts).some((cnt) => cnt === 3);
      if (hasThree) showToast('One away...');

      mistakesRemaining -= 1;
      updateMistakes();

      if (mistakesRemaining <= 0) {
        isRevealing = true;
        updateButtons();
        showToast('Better luck next time!', 2000);

        const remaining = currentGame.categories.filter(
          (c) => !solvedCategories.some((sc) => sc.id === c.id)
        );

        remaining.forEach((cat, idx) => {
          setTimeout(() => {
            solvedCategories.push(cat);
            tiles = tiles.filter((t) => t.categoryId !== cat.id);
            renderSolved();
            renderTiles();
          }, (idx + 1) * 600);
        });

        setTimeout(() => {
          triggerGameOver(false);
          isRevealing = false;
        }, (remaining.length + 1) * 650);
      }
    }
  }

  function triggerGameOver(won) {
    const lines = guessHistory.map((g) => {
      return g.colors.map((c) => COLOR_EMOJIS[c] || '⬜').join('');
    });
    const emojiStr = lines.join('\n');

    results.headline.textContent = won ? 'Splendid!' : 'Next time!';
    results.sub.textContent = currentGame.title || `Puzzle #${currentGame.id}`;
    results.grid.textContent = emojiStr;

    const savedName = localStorage.getItem(STORAGE_PLAYER_NAME) || '';
    results.playerNameInput.value = savedName;
    results.scoreForm.classList.remove('hidden');
    results.scoreSavedMsg.classList.add('hidden');
    if (results.qrWrap) results.qrWrap.classList.add('hidden');
    if (results.btnToggleQr) results.btnToggleQr.textContent = 'Show QR Code';

    openModal(modals.results);
  }

  function renderQrCode(container, url, size = 160) {
    if (!container || typeof QRCode === 'undefined') return;
    container.innerHTML = '';
    new QRCode(container, {
      text: url,
      width: size,
      height: size,
      colorDark: '#000000',
      colorLight: '#ffffff',
      correctLevel: QRCode.CorrectLevel.M
    });
  }

  // ================= MODALS =================
  function openModal(el) {
    if (el) el.classList.remove('hidden');
  }

  function closeModal(el) {
    if (el) el.classList.add('hidden');
  }

  document.querySelectorAll('[data-close]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-close');
      closeModal(document.getElementById(id));
    });
  });

  Object.values(modals).forEach((m) => {
    m.addEventListener('click', (e) => {
      if (e.target === m) closeModal(m);
    });
  });

  // ================= RESULTS & LEADERBOARD =================
  results.scoreForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = results.playerNameInput.value.trim();
    if (!name || !currentGame) return;

    localStorage.setItem(STORAGE_PLAYER_NAME, name);
    const won = solvedCategories.length === 4;
    const btn = results.scoreForm.querySelector('button[type="submit"]');
    btn.disabled = true;

    try {
      const item = await submitScore(
        currentGame.id,
        name,
        won,
        mistakesRemaining,
        guessHistory.length,
        results.grid.textContent
      );
      currentResults.unshift(item);
      results.scoreForm.classList.add('hidden');
      results.scoreSavedMsg.classList.remove('hidden');
    } catch {
      results.scoreForm.classList.add('hidden');
      results.scoreSavedMsg.classList.remove('hidden');
    } finally {
      btn.disabled = false;
    }
  });

  results.btnShare.addEventListener('click', async () => {
    if (!currentGame) return;
    const url = `https://svenja.dev/c/${currentGame.id}`;
    const text = [
      `Categories #${currentGame.id}`,
      results.grid.textContent,
      url
    ].join('\n');

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
      showToast('Copied results to clipboard!');
    } catch {
      showToast('Failed to copy');
    }
  });

  if (results.btnToggleQr) {
    results.btnToggleQr.addEventListener('click', () => {
      const isHidden = results.qrWrap.classList.toggle('hidden');
      results.btnToggleQr.textContent = isHidden ? 'Show QR Code' : 'Hide QR Code';
      if (!isHidden && currentGame) {
        const url = currentGame.id !== 'demo' ? `https://svenja.dev/c/${currentGame.id}` : window.location.origin;
        renderQrCode(results.qrcode, url, 150);
      }
    });
  }

  results.btnOpenLeaderboard.addEventListener('click', () => {
    closeModal(modals.results);
    openLeaderboard();
  });

  results.btnPlayAgain.addEventListener('click', () => {
    closeModal(modals.results);
    if (currentGame) initBoard(currentGame);
  });

  play.btnViewLeaderboard.addEventListener('click', openLeaderboard);

  function openLeaderboard() {
    if (!currentGame) return;
    leaderboard.title.textContent = `Scores — ${currentGame.title || currentGame.id}`;
    leaderboard.list.innerHTML = '';

    if (!currentResults || currentResults.length === 0) {
      leaderboard.empty.classList.remove('hidden');
    } else {
      leaderboard.empty.classList.add('hidden');
      currentResults.forEach((res, i) => {
        const row = document.createElement('div');
        row.className = 'leaderboard-item';
        row.innerHTML = `
          <div class="leaderboard-item-row">
            <span class="lb-player">${i + 1}. ${res.playerName}</span>
            <span class="lb-status">${res.solved ? 'Solved' : 'Failed'} (${res.mistakesRemaining} left)</span>
          </div>
          ${res.emojis ? `<pre class="lb-emojis">${res.emojis}</pre>` : ''}
        `;
        leaderboard.list.appendChild(row);
      });
    }

    openModal(modals.leaderboard);
  }

  // ================= CREATOR =================
  creator.slugInput.addEventListener('input', (e) => {
    creator.slugInput.value = e.target.value
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-_]/g, '');
    creator.errorBox.classList.add('hidden');
  });

  document.querySelectorAll('.word-input').forEach((inp) => {
    inp.addEventListener('input', checkDuplicateWords);
  });

  function checkDuplicateWords() {
    const inputs = Array.from(document.querySelectorAll('.word-input'));
    const counts = {};
    inputs.forEach((inp) => {
      const w = inp.value.trim().toUpperCase();
      if (w) counts[w] = (counts[w] || 0) + 1;
    });

    let hasDupe = false;
    inputs.forEach((inp) => {
      const w = inp.value.trim().toUpperCase();
      if (w && counts[w] > 1) {
        inp.classList.add('duplicate-input');
        hasDupe = true;
      } else {
        inp.classList.remove('duplicate-input');
      }
    });
    return hasDupe;
  }

  creator.btnFillExample.addEventListener('click', () => {
    creator.titleInput.value = SAMPLE_DATA.title;
    creator.slugInput.value = `game-${Math.floor(100 + Math.random() * 900)}`;

    const colors = ['yellow', 'green', 'blue', 'purple'];
    colors.forEach((col, idx) => {
      const cat = SAMPLE_DATA.categories[idx];
      document.getElementById(`name-${col}`).value = cat.name;
      const inputs = document.querySelectorAll(`.word-input[data-color="${col}"]`);
      inputs.forEach((inp, wIdx) => {
        inp.value = cat.words[wIdx];
      });
    });

    checkDuplicateWords();
    creator.errorBox.classList.add('hidden');
  });

  creator.btnCancel.addEventListener('click', () => {
    navigate('/');
  });

  creator.form.addEventListener('submit', async (e) => {
    e.preventDefault();
    creator.errorBox.classList.add('hidden');

    const slug = creator.slugInput.value.trim().toLowerCase();
    if (slug.length < 2) {
      creator.errorBox.textContent = 'Game ID must be at least 2 characters.';
      creator.errorBox.classList.remove('hidden');
      return;
    }

    if (checkDuplicateWords()) {
      creator.errorBox.textContent = 'Duplicate words detected. All 16 words must be unique!';
      creator.errorBox.classList.remove('hidden');
      return;
    }

    const colors = ['yellow', 'green', 'blue', 'purple'];
    const categories = [];

    for (let i = 0; i < colors.length; i++) {
      const col = colors[i];
      const name = document.getElementById(`name-${col}`).value.trim().toUpperCase();
      const inps = Array.from(document.querySelectorAll(`.word-input[data-color="${col}"]`));
      const words = inps.map((inp) => inp.value.trim().toUpperCase());

      if (!name || words.some((w) => !w)) {
        creator.errorBox.textContent = `Please fill in all words and name for ${col.toUpperCase()}.`;
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

    const btn = document.getElementById('btn-publish-submit');
    btn.disabled = true;
    btn.textContent = 'Publishing...';

    try {
      const newGame = {
        id: slug,
        title: creator.titleInput.value.trim() || `Game #${slug}`,
        categories: categories
      };
      await saveGame(newGame);

      const url = `https://svenja.dev/c/${slug}`;
      creator.shareLinkInput.value = url;
      renderQrCode(creator.publishQrcode, url, 160);
      creator.form.classList.add('hidden');
      creator.publishSuccess.classList.remove('hidden');

      creator.btnPlayPublished.onclick = () => {
        navigate(`/c/${slug}`);
      };
      creator.btnMakeAnother.onclick = () => {
        resetCreateForm();
      };
    } catch (err) {
      creator.errorBox.textContent = err.message || 'Error saving puzzle.';
      creator.errorBox.classList.remove('hidden');
    } finally {
      btn.disabled = false;
      btn.textContent = 'Save & Publish';
    }
  });

  creator.btnCopyShareLink.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(creator.shareLinkInput.value);
      showToast('Copied link!');
    } catch {}
  });

  function resetCreateForm() {
    creator.form.reset();
    creator.form.classList.remove('hidden');
    creator.publishSuccess.classList.add('hidden');
    creator.errorBox.classList.add('hidden');
    document.querySelectorAll('.word-input').forEach((inp) => inp.classList.remove('duplicate-input'));
  }

  // ================= HEADER CONTROLS =================
  header.logo.addEventListener('click', (e) => {
    e.preventDefault();
    navigate('/');
  });

  header.btnNavCreate.addEventListener('click', () => {
    navigate('/create');
  });

  function openQrModal() {
    if (!currentGame) return;
    const url = currentGame.id !== 'demo' ? `https://svenja.dev/c/${currentGame.id}` : window.location.origin;
    const modalQrEl = document.getElementById('modal-qrcode');
    const modalQrLink = document.getElementById('modal-qr-link');
    const modalQrTitle = document.getElementById('qr-modal-title');
    if (modalQrTitle) modalQrTitle.textContent = `Share #${currentGame.id}`;
    if (modalQrLink) modalQrLink.value = url;
    renderQrCode(modalQrEl, url, 180);
    openModal(modals.qr);
  }

  if (header.puzzleIdTag) {
    header.puzzleIdTag.style.cursor = 'pointer';
    header.puzzleIdTag.title = 'Click to show QR code';
    header.puzzleIdTag.addEventListener('click', openQrModal);
  }

  if (play.btnBoardQr) {
    play.btnBoardQr.addEventListener('click', openQrModal);
  }

  const btnCopyModalQr = document.getElementById('btn-copy-modal-qr');
  if (btnCopyModalQr) {
    btnCopyModalQr.addEventListener('click', async () => {
      const link = document.getElementById('modal-qr-link');
      if (link && link.value) {
        try {
          await navigator.clipboard.writeText(link.value);
          showToast('Copied puzzle link!');
        } catch {
          showToast('Failed to copy');
        }
      }
    });
  }

  header.btnNavHelp.addEventListener('click', () => {
    openModal(modals.help);
  });

  header.btnNavSettings.addEventListener('click', () => {
    settings.gasUrlInput.value = getGasUrl();
    settings.testResult.textContent = '';
    openModal(modals.settings);
  });

  header.quickPlayForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const raw = header.quickPlayInput.value.trim().replace(/^https?:\/\/[^/]+\/c\//i, '').toLowerCase();
    if (raw) {
      navigate(`/c/${raw}`);
    }
  });

  // Game buttons
  play.btnShuffle.addEventListener('click', () => {
    shuffleTiles();
    renderTiles();
  });

  play.btnDeselect.addEventListener('click', () => {
    selectedWords = [];
    renderTiles();
    updateButtons();
  });

  play.btnSubmit.addEventListener('click', submitGuess);

  // Settings
  settings.btnSave.addEventListener('click', () => {
    setGasUrl(settings.gasUrlInput.value);
    closeModal(modals.settings);
    showToast('Saved');
  });

  settings.btnTest.addEventListener('click', async () => {
    const url = settings.gasUrlInput.value.trim();
    if (!url) {
      settings.testResult.className = 'test-result error';
      settings.testResult.textContent = 'Enter URL first';
      return;
    }
    settings.btnTest.disabled = true;
    settings.testResult.textContent = 'Testing...';
    try {
      const res = await fetch(`${url}?action=listRecent`);
      if (res.ok) {
        settings.testResult.className = 'test-result success';
        settings.testResult.textContent = '✓ Connected';
      } else {
        throw new Error();
      }
    } catch {
      settings.testResult.className = 'test-result error';
      settings.testResult.textContent = '✕ Failed';
    } finally {
      settings.btnTest.disabled = false;
    }
  });

  const btnCopyGasCode = document.getElementById('btn-copy-gas-code');
  if (btnCopyGasCode) {
    btnCopyGasCode.addEventListener('click', async () => {
      btnCopyGasCode.disabled = true;
      btnCopyGasCode.textContent = 'Copying...';
      try {
        const res = await fetch('google-apps-script/Code.gs');
        if (!res.ok) throw new Error();
        const code = await res.text();
        await navigator.clipboard.writeText(code);
        showToast('Code.gs copied to clipboard!');
        btnCopyGasCode.textContent = '✓ Copied!';
      } catch {
        showToast('See google-apps-script/Code.gs in repo');
        btnCopyGasCode.textContent = 'Copy Code.gs Script to Clipboard';
      } finally {
        setTimeout(() => {
          btnCopyGasCode.disabled = false;
          btnCopyGasCode.textContent = 'Copy Code.gs Script to Clipboard';
        }, 2200);
      }
    });
  }

  // Start
  route();
})();
