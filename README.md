# Categories

A simple word puzzle game. You're given 16 words and have to group them into four sets of four connected words.

You can also make your own puzzles, share them with friends using a link (like `svenja.dev/c/mygame`), and see friend leaderboards.

The site is built with plain HTML, CSS, and JavaScript. No build steps, no frameworks, no dependencies.

## Running it locally

You can serve it with any local static server:

```bash
python3 -m http.server 8080
```

Then open `http://localhost:8080` in your browser.

## Google Sheets backend (optional)

Out of the box, everything runs locally and saves custom puzzles and scores in your browser's local storage.

If you want custom puzzles and scores to sync across different devices and friends, you can use a Google Sheet as a free backend:

1. Create a new spreadsheet at [sheets.new](https://sheets.new).
2. In the top menu, click **Extensions** > **Apps Script**.
3. Replace any code in the editor with the script in [`google-apps-script/Code.gs`](google-apps-script/Code.gs).
4. Run the `initSpreadsheet` function once from the toolbar to set up the `Games` and `Results` tabs.
5. Click **Deploy** > **New deployment**, choose **Web app**, and set:
   - **Execute as:** Me
   - **Who has access:** Anyone
6. Copy the resulting Web app URL.
7. In the game, click the **⚙** button at the bottom right, paste the URL, and click save.

## Deploying to GitHub Pages

A GitHub Actions workflow is included in `.github/workflows/deploy.yml`. When you push to `main`, it deploys the site to GitHub Pages automatically. Custom short links (`/c/<id>`) are handled by `404.html`.
