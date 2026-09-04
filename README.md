# Custom Connections Game

A lightweight, zero-dependency custom clone of the popular **NYT Connections** word puzzle game. 

Make your own custom boards, give each puzzle an ID (e.g. `svenja.dev/c/mygame`), share with friends, and see their names and scores on the leaderboard — powered by **Google Sheets** via **Google Apps Script** as a free, serverless backend.

---

## ✨ Features

- **Classic Connections Gameplay**:
  - 16 words shuffled on a responsive 4x4 grid
  - 4 mistakes allowed with visual dot indicators
  - Helpful **"One away..."** feedback when 3 of 4 words match
  - **"Already guessed!"** duplicate guess prevention
  - Shuffle, deselect, and shake animations
  - Sequential reveal of remaining answers on loss
- **Custom Puzzle Creator**:
  - 4 difficulty levels: Yellow (Straightforward), Green (Intermediate), Blue (Hard), Purple (Tricky)
  - Live duplicate word detector across all 16 items
  - Custom game ID slugs (e.g. `svenja.dev/c/mygame`)
  - "Fill with Example" button for quick testing
  - Instant shareable link generator with copy button
- **Leaderboards & Results**:
  - Generates the iconic emoji grid (`🟨🟩🟦🟪`)
  - One-click copy results for sharing on WhatsApp, iMessage, Discord, etc.
  - Asks players for their name upon completion and records results
  - Friend leaderboard modal showing who solved it, mistakes remaining, date, and emoji attempts
- **Free Google Sheets Backend**:
  - Google Apps Script Web App handles saving games and friend scores
  - No database costs, no authentication or account setup required
  - **Local Mode Fallback**: Works immediately out-of-the-box even before setting up Google Sheets!
- **Zero Build Overhead**:
  - Pure Vanilla HTML5, CSS3, and modern ES6 JavaScript
  - No `node_modules`, no framework baggage, ~100 KB total size
  - Blazing fast page loads on desktop and mobile

---

## 🚀 GitHub Pages & Custom Domain Setup

This project requires **no build step**. GitHub Pages can serve it directly:

1. Push this repository to GitHub on branch `main`.
2. On GitHub, go to **Settings** > **Pages**.
3. Under **Build and deployment**:
   - **Source**: Select `Deploy from a branch`.
   - **Branch**: Select `main` / `/(root)`.
   - Click **Save**.
4. Under **Custom domain**:
   - Verify `svenja.dev` is listed (the included `CNAME` file configures this automatically).
   - Check **Enforce HTTPS**.
5. Your site is live! Routes like `svenja.dev/c/mygame` work seamlessly thanks to the included `404.html` redirect handler.

---

## 📊 Free Google Sheets Backend Setup

To store custom games and friend scores across devices in your own Google Sheet:

1. Open [Google Sheets](https://sheets.new) and create a new spreadsheet.
2. In the menu, go to **Extensions** > **Apps Script**.
3. Copy the code from [`google-apps-script/Code.gs`](google-apps-script/Code.gs) and paste it into the editor.
4. In the Apps Script toolbar, run the **`initSpreadsheet`** function once and approve permissions. This will create the `Games` and `Results` sheets with header rows.
5. Click **Deploy** > **New deployment** > Select type **Web app**.
   - **Execute as**: `Me`
   - **Who has access**: `Anyone` *(Crucial: Allows players to load boards and submit scores without signing into Google)*
6. Copy your **Web app URL** (e.g. `https://script.google.com/macros/s/.../exec`).
7. Open your deployed website, click the **⚙ Settings** icon in the top header, and paste your URL.

For detailed screenshots and troubleshooting, see the [Google Apps Script Setup Guide](google-apps-script/README.md).

---

## 💻 Local Development

Since this project has no build dependencies, you can run it with any static web server:

```bash
# Using Python 3:
python3 -m http.server 8080

# Or using Node:
npx serve .
```

Then visit `http://localhost:8080/`.
