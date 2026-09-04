# Google Sheets & Google Apps Script Backend Setup

This custom Categories game uses a free Google Sheet connected to a Google Apps Script Web App as its database. No servers or paid backends are needed!

---

## Step 1: Create a Google Sheet

1. Go to [Google Sheets](https://sheets.new) and create a new spreadsheet.
2. Name it something like **Categories Game DB**.

---

## Step 2: Open Google Apps Script

1. In your Google Sheet, click on **Extensions** in the top menu.
2. Select **Apps Script**. A new browser tab will open with the script editor.
   *(Tip: If you see "Datei kann nicht geöffnet werden" / "File cannot be opened", open the sheet in an Incognito window with only that single Google account logged in).*
3. Rename the project (top left) from *Untitled project* to **Categories Game API**.

---

## Step 3: Paste the Code

1. Delete any boilerplate code in `Code.gs`.
2. Copy the entire contents of [`Code.gs`](./Code.gs) and paste it into the editor. Notice the line at the very top:
   ```javascript
   /** @OnlyCurrentDoc */
   ```
   This annotation tells Google to restrict the script's permissions strictly to this one spreadsheet. It prevents the script from having access to any other files in your Google Drive.
3. Press **Ctrl + S** (or **Cmd + S**) to save.

---

## Step 4: Initialize Sheets & Columns

1. In the Apps Script toolbar, locate the function dropdown (it usually defaults to `myFunction` or `initSpreadsheet`).
2. Select **`initSpreadsheet`**.
3. Click the **▷ Run** button.
4. Google will show an **"Authorization required"** prompt:
   - Click **Review permissions**.
   - Select your Google account.
   - Click **Advanced** (bottom left of the modal).
   - Click **Go to Categories Game API (unsafe)**.
   - Click **Allow**.
   *(Note: You are only granting your own script permission to write to this one spreadsheet. No external service or other players get access to your account.)*
5. Once the execution finishes, switch back to your Google Sheet tab. You will see two sheets: **`Games`** and **`Results`** with their column headers automatically created!

---

## Step 5: Deploy as a Web App

1. In the Apps Script editor, click the blue **Deploy** button (top right) > **New deployment**.
2. Click the gear icon next to "Select type" and choose **Web app**.
3. Fill in the deployment configuration:
   - **Description**: `Categories Game API`
   - **Execute as**: `Me (your-email@gmail.com)`
   - **Who has access**: `Anyone` *(Crucial: This lets anyone playing your game load boards and submit their results without requiring a Google sign-in)*
4. Click **Deploy**.
5. Copy the **Web app URL** that ends with `/exec` (e.g. `https://script.google.com/macros/s/.../exec`).

---

## Step 6: Connect to the Game

1. On your game website, click the **⚙** settings button in the bottom right corner.
2. Paste your Google Apps Script Web App URL into the box.
3. Click **Save**. Your custom puzzles and friend leaderboards will now sync automatically to your Google Sheet!
