/**
 * Google Apps Script backend for Custom Categories Web Game
 * 
 * Setup Instructions:
 * 1. Create a new Google Sheet (e.g. named "Categories Game Backend").
 * 2. In Google Sheets, click "Extensions" > "Apps Script".
 * 3. Replace any code in Code.gs with this entire file.
 * 4. Run `initSpreadsheet()` once in the Apps Script editor to create required sheets & headers.
 * 5. Click "Deploy" > "New deployment".
 * 6. Select type "Web app".
 * 7. Set:
 *    - Description: "Categories Game API"
 *    - Execute as: "Me"
 *    - Who has access: "Anyone" (crucial so players can fetch games & save scores without signing in)
 * 8. Click "Deploy" and authorize the script permissions.
 * 9. Copy the "Web app URL" (looks like: https://script.google.com/macros/s/.../exec).
 * 10. Paste this URL into your app's Settings.
 */

const SHEET_GAMES = 'Games';
const SHEET_RESULTS = 'Results';

/**
 * Initializes the spreadsheet with required sheets and header columns
 */
function initSpreadsheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  // Initialize Games sheet
  let gamesSheet = ss.getSheetByName(SHEET_GAMES);
  if (!gamesSheet) {
    gamesSheet = ss.insertSheet(SHEET_GAMES);
    gamesSheet.appendRow(['id', 'title', 'data', 'created_at']);
    gamesSheet.setFrozenRows(1);
    gamesSheet.getRange('1:1').setFontWeight('bold');
  }

  // Initialize Results sheet
  let resultsSheet = ss.getSheetByName(SHEET_RESULTS);
  if (!resultsSheet) {
    resultsSheet = ss.insertSheet(SHEET_RESULTS);
    resultsSheet.appendRow(['id', 'game_id', 'player_name', 'solved', 'mistakes_remaining', 'guess_count', 'emojis', 'completed_at']);
    resultsSheet.setFrozenRows(1);
    resultsSheet.getRange('1:1').setFontWeight('bold');
  }

  return 'Initialization complete.';
}

/**
 * Helper to build JSON responses with CORS headers
 */
function jsonResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * Handles GET requests
 * Parameters:
 *  - action: 'getGame' | 'checkId' | 'listRecent'
 *  - id: game ID slug
 */
function doGet(e) {
  try {
    const params = (e && e.parameter) || {};
    const action = params.action;
    const ss = SpreadsheetApp.getActiveSpreadsheet();

    if (action === 'getGame') {
      const gameId = (params.id || '').trim().toLowerCase();
      if (!gameId) {
        return jsonResponse({ success: false, error: 'Game ID required' });
      }

      const gamesSheet = ss.getSheetByName(SHEET_GAMES);
      if (!gamesSheet) {
        return jsonResponse({ success: false, error: 'Games sheet not found. Run initSpreadsheet() first.' });
      }

      const gamesData = gamesSheet.getDataRange().getValues();
      let foundGame = null;

      // Skip header row
      for (let i = 1; i < gamesData.length; i++) {
        if (String(gamesData[i][0]).toLowerCase() === gameId) {
          foundGame = {
            id: gamesData[i][0],
            title: gamesData[i][1],
            data: JSON.parse(gamesData[i][2]),
            createdAt: gamesData[i][3]
          };
          break;
        }
      }

      if (!foundGame) {
        return jsonResponse({ success: false, error: 'Game not found' });
      }

      // Fetch friends' results for this game
      const resultsSheet = ss.getSheetByName(SHEET_RESULTS);
      const results = [];
      if (resultsSheet) {
        const resultsData = resultsSheet.getDataRange().getValues();
        for (let i = 1; i < resultsData.length; i++) {
          if (String(resultsData[i][1]).toLowerCase() === gameId) {
            results.push({
              id: resultsData[i][0],
              gameId: resultsData[i][1],
              playerName: resultsData[i][2],
              solved: Boolean(resultsData[i][3]),
              mistakesRemaining: Number(resultsData[i][4]),
              guessCount: Number(resultsData[i][5]),
              emojis: resultsData[i][6],
              completedAt: resultsData[i][7]
            });
          }
        }
      }

      // Sort results by most recent
      results.sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime());

      return jsonResponse({
        success: true,
        game: foundGame.data,
        results: results
      });
    }

    if (action === 'checkId') {
      const gameId = (params.id || '').trim().toLowerCase();
      if (!gameId) {
        return jsonResponse({ success: false, error: 'ID required' });
      }

      const gamesSheet = ss.getSheetByName(SHEET_GAMES);
      if (!gamesSheet) return jsonResponse({ success: true, exists: false });

      const gamesData = gamesSheet.getDataRange().getValues();
      let exists = false;
      for (let i = 1; i < gamesData.length; i++) {
        if (String(gamesData[i][0]).toLowerCase() === gameId) {
          exists = true;
          break;
        }
      }
      return jsonResponse({ success: true, exists: exists });
    }

    if (action === 'listRecent') {
      const gamesSheet = ss.getSheetByName(SHEET_GAMES);
      if (!gamesSheet) return jsonResponse({ success: true, games: [] });

      const gamesData = gamesSheet.getDataRange().getValues();
      const recent = [];
      const start = Math.max(1, gamesData.length - 20);
      for (let i = gamesData.length - 1; i >= start; i--) {
        if (gamesData[i][0]) {
          recent.push({
            id: gamesData[i][0],
            title: gamesData[i][1],
            createdAt: gamesData[i][3]
          });
        }
      }
      return jsonResponse({ success: true, games: recent });
    }

    return jsonResponse({ success: false, error: 'Invalid action. Use getGame, checkId, or listRecent.' });
  } catch (err) {
    return jsonResponse({ success: false, error: err.message });
  }
}

/**
 * Handles POST requests
 */
function doPost(e) {
  try {
    const rawContent = e.postData ? e.postData.contents : '{}';
    const payload = JSON.parse(rawContent);
    const action = payload.action;
    const ss = SpreadsheetApp.getActiveSpreadsheet();

    // Make sure sheets exist
    initSpreadsheet();

    if (action === 'createGame') {
      const gameId = (payload.id || '').trim().toLowerCase();
      const title = (payload.title || 'Untitled Puzzle').trim();
      const categories = payload.categories;

      if (!gameId || !/^[a-z0-9-_]+$/.test(gameId)) {
        return jsonResponse({ success: false, error: 'Invalid ID. Use lowercase letters, numbers, hyphens, and underscores only.' });
      }

      if (!Array.isArray(categories) || categories.length !== 4) {
        return jsonResponse({ success: false, error: 'Must provide exactly 4 categories.' });
      }

      // Check if ID already exists
      const gamesSheet = ss.getSheetByName(SHEET_GAMES);
      const gamesData = gamesSheet.getDataRange().getValues();
      for (let i = 1; i < gamesData.length; i++) {
        if (String(gamesData[i][0]).toLowerCase() === gameId) {
          return jsonResponse({ success: false, error: 'A game with this ID already exists. Please choose a different ID.' });
        }
      }

      const gameRecord = {
        id: gameId,
        title: title,
        categories: categories,
        createdAt: new Date().toISOString()
      };

      gamesSheet.appendRow([
        gameId,
        title,
        JSON.stringify(gameRecord),
        gameRecord.createdAt
      ]);

      return jsonResponse({ success: true, id: gameId, message: 'Game published successfully!' });
    }

    if (action === 'submitResult') {
      const gameId = (payload.gameId || '').trim().toLowerCase();
      const playerName = (payload.playerName || 'Anonymous').trim().slice(0, 50);
      const solved = Boolean(payload.solved);
      const mistakesRemaining = Number(payload.mistakesRemaining ?? 0);
      const guessCount = Number(payload.guessCount ?? 0);
      const emojis = String(payload.emojis || '').trim();
      const completedAt = new Date().toISOString();
      const resultId = Utilities.getUuid();

      if (!gameId) {
        return jsonResponse({ success: false, error: 'Missing gameId' });
      }

      const resultsSheet = ss.getSheetByName(SHEET_RESULTS);
      resultsSheet.appendRow([
        resultId,
        gameId,
        playerName,
        solved,
        mistakesRemaining,
        guessCount,
        emojis,
        completedAt
      ]);

      return jsonResponse({ success: true, resultId: resultId });
    }

    return jsonResponse({ success: false, error: 'Unknown action: ' + action });
  } catch (err) {
    return jsonResponse({ success: false, error: err.message });
  }
}
