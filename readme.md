# LLM-God: The Ultimate AI Browser

<p align="center">
  <img src="image-1.png" alt="LLM-God Interface" width="800" />
</p>

**LLM-God** is a powerful desktop application that revolutionizes how you interact with AI. Built with Electron and TypeScript, it allows you to simultaneously prompt multiple Large Language Models (LLMs) in a single, unified interface. Whether you're coding, researching, or just exploring, save hours of copy-pasting and boost your productivity.

## ✨ Key Features

-   **Multi-Model Prompting:** Send one prompt to ChatGPT, Gemini, Claude, Grok, DeepSeek, and Copilot simultaneously.
-   **🔄 Loop Mode (New!):** Create a continuous conversation loop between two AI models. Watch them debate, collaborate, or refine ideas automatically!
-   **Modern Glass UI:** A stunning interface featuring transparency, blur effects, and native OS integration (Windows Acrylic / macOS Vibrancy).
-   **Dark/Light Mode:** Seamless theme switching to match your workflow.
-   **Modular Architecture:** Robust and stable injection logic for reliable performance.
-   **Image Support:** Paste images directly into the prompt area for supported models.

## 🚀 Supported Models

-   ChatGPT
-   Google Gemini
-   Anthropic Claude
-   X.ai Grok
-   DeepSeek
-   Microsoft Copilot

---

## 📥 Installation

### Windows

1.  **Download:** Go to the [Releases](../../releases) section and download the latest `Setup.exe` or portable `.zip` file.
2.  **Install/Run:**
    -   **Installer:** Run `Setup.exe`. (Ignore Windows warning by clicking "More info" -> "Run anyway").
    -   **Portable:** Extract the `.zip` file and run `llm-god.exe`.

### Linux

1.  **Download:** Get the latest `.zip` or `.AppImage` from the [Releases](../../releases) section.
2.  **Run:** Extract and execute the binary.

---

## 📖 How to Use

### Basic Prompting
1.  **Select Models:** Use the "Show Models" dropdown to toggle which AI interfaces are visible.
2.  **Type & Send:** Enter your prompt in the bottom text area.
3.  **Launch:** Press `Ctrl + Enter` to send the prompt to all active models.

### 🔄 Using Loop Mode
*Exclusive feature for power users!*

1.  **Open Two Models:** Ensure exactly **two** AI models are visible (e.g., ChatGPT and Claude).
2.  **Start Loop:** A "Start Loop" button will appear in the control bar. Click it.
3.  **Initiate:** Type a starting prompt in the main text box and hit `Ctrl + Enter`.
4.  **Watch the Magic:** The models will start talking to each other! The output of one becomes the input of the other.
5.  **Stop:** Click "Stop Loop" at any time to end the conversation.

### Customization
-   **Theme:** Click the moon/sun icon to toggle Dark Mode.
-   **Settings:** Configure default models in the Settings menu.

---

## 🛠️ Development

Want to contribute? Here's how to build it yourself:

1.  **Clone the Repo:**
    ```bash
    git clone https://github.com/czhou578/llm-god.git
    cd llm-god
    ```

2.  **Install Dependencies:**
    ```bash
    npm install
    ```

3.  **Run in Dev Mode:**
    Open two terminals:
    -   Terminal 1: `npx tsc --watch`
    -   Terminal 2: `npm start`

4.  **Build:**
    ```bash
    npm run make
    ```
    Build artifacts will be in the `/out` directory.

---

## ⚠️ Disclaimer

This app is a browser wrapper that automates interactions with AI web interfaces.
-   **Login Required:** You must be logged into your respective AI accounts within the app.
-   **Usage Limits:** Free tier users are subject to the standard rate limits of each provider.
-   **Safety:** The app is open source and local-first. Your data stays on your machine.

---

## ⭐ Star History

[![Star History Chart](https://api.star-history.com/svg?repos=czhou578/llm-god&type=date&legend=top-left)](https://www.star-history.com/#czhou578/llm-god&type=date&legend=top-left)
