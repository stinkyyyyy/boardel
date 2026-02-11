# LLM-God (Your Quick AI Browser)

## Screenshot

![New Glass UI Placeholder](image-1.png)
_(Note: Screenshot to be updated to show the new Glass/Acrylic Hybrid UI)_

This is a desktop app for Windows machines (and now Linux/macOS) that allows users to simultaneously prompt multiple LLM's at once in one environment. I use this app every day, for coding or non coding purposes. It has saved me countless hours of copypasting and is just so much more efficient. You can paste text or screenshots directly into the bottom text area.

**New in v0.2.0:**

- **Glass/Acrylic Hybrid UI:** A stunning new modern interface featuring transparency, blur effects, and native OS integration (Windows Acrylic / macOS Vibrancy).
- **Modular Architecture:** Completely refactored injection logic for better stability and faster updates.
- **Dark/Light Mode:** Seamless switching with improved theming support.

Currently, the following LLM web interfaces are supported:

- ChatGPT
- Google Gemini
- Anthropic Claude
- X.ai Grok
- DeepSeek
- Copilot

## Downloading the App for Personal Use

### Option 1: Installer (Recommended if available)

Go to the Releases section, and download the `Setup.exe`. It is going to say that Microsoft has flagged this as untrusted. Windows codesigning has not been done yet, so for now, ignore the warning and proceed to installation.

### Option 2: Portable Zip (Universal)

If the installer is not available or if you prefer a portable version:

1. Download the `.zip` file from the Releases section (e.g., `llm-god-win32-x64-x.x.x.zip`).
2. Right-click the zip file and select **Extract All**.
3. Open the extracted folder and double-click `llm-god.exe`.
4. If you see a "Windows protected your PC" popup, click **More info** -> **Run anyway**.

I faithfully swear that this app has no malware and does not intend to hurt anybody. The code is open source, so please feel free to review it thoroughly at your discretion; I have nothing to hide.

## How to Use the App

### Selecting the Model

Use the dropdown at the bottom right corner to add and remove LLM web consoles. By default, ChatGPT, Gemini, and Llama are there by default and cannot be changed.

\*Note that if you are on free tier, then you will face the typical usage limits as specified by the LLM provider.

To launch the prompt to all the LLM's, press `Ctrl + Enter` on your keyboard

If you want to close the app, press `Ctrl + W` on your keyboard.

**Important Note:** If you experience issues with the "New Chat" button, make sure your AI chat interface is set to English language. The button may not work properly in other languages.

**Important Note:** You must be logged into the respective LLM web interfaces in the browserviews for the app to work properly. In the future, functionality to support usage without logging in may be added, although it is not currently a high priority.

## Disclaimer

I did find out about the [GodMode](https://github.com/smol-ai/GodMode) project, but I felt that people needed an app that just provided the models from the few big companies like OpenAI and Anthropic. Many of the other smaller models are not very useful. In addition, that project doesn't seem to be very well maintained anymore and doesn't have some of the new models like Grok.

## Contributing

New contributions are welcome!

1. Clone the project and navigate to root directory

```
git clone https://github.com/czhou578/llm-god.git
cd llm-god
```

2. Install all dependencies

```
npm install
```

3. Start the app, which will create the shortcut that will also appear on your computer

```
npm run start
```

When developing, instead of running the command above, I like to have two terminals open. One terminal should run the command:

```
npx tsc --watch
```

and the other terminal should run the command:

```
npx electronmon dist/main.js
```

4. To check if the build works properly, run the following command in the root folder

```
npm run make
```

This will create a launchable app in the `/out` path. You can then add this to your task bar for daily use outside of development!

Please check out the Issues tab for existing issues to tackle, and feel free to suggest new issues as well! Make a pull request to this repo once a feature or bug fix is done.

When submitting pull requests, please make sure to list the changes made using bullet points. A screenshot showing that the app functionality works as intended would be good too, and lead to faster reviews.

## Debugging Tools

While developing, I liked to have the devtools of the app be visible and also have the option to have hot reloading on every save.
For hot reloading, we are using the `electron-reload` package. On windows, you will need to have the `cross-env` package installed as a dev dependency to set the NODE_ENV variable properly.

```
npm install --save-dev cross-env
```

Then, in the `package.json` file, set the start script to the following:

```json
"start": "cross-env NODE_ENV=development electron .",
```

Finally, in the `src/main.ts` file, uncomment the following code to open the devtools and enable hot reloading:

```
 mainWindow.webContents.openDevTools({ mode: "detach" });
```

## Relevant links:

- Quick App Demo: https://www.youtube.com/watch?v=YxqWUp0Wmi0
- Code Walkthrough Video: https://www.youtube.com/watch?v=bkSRSUMsh10

## Updates

- 5/17: Migrated to using TypeScript across the app.
- 6/15: Added support for LMArena and also for adding custom prompts that can be saved.
- 10/10: Removed support for Perplexity and LMArena (due to incompatibility) and added more contextual searching for JavaScript injection logic. Added Copilot support.
- 11/22: Fixed bug with Grok injection, added unit testing for all files, new chat button support, multi-platform build workflows, and dark mode have been added.
- 12/21: Added support for pasting images into the prompt area for all models.
- **Current (Refactor)**: Major UI overhaul with Glass/Acrylic design, and complete backend refactor to modular provider system.

## Star History

[![Star History Chart](https://api.star-history.com/svg?repos=czhou578/llm-god&type=date&legend=top-left)](https://www.star-history.com/#czhou578/llm-god&type=date&legend=top-left)
