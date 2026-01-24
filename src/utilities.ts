import { BrowserWindow, WebPreferences, WebContentsView } from "electron";
import { AIProvider, CustomBrowserView } from "./providers/AIProvider.js";
import { ChatGPTProvider } from "./providers/ChatGPTProvider.js";
import { ClaudeProvider } from "./providers/ClaudeProvider.js";
import { GeminiProvider } from "./providers/GeminiProvider.js";
import { GrokProvider } from "./providers/GrokProvider.js";
import { DeepSeekProvider } from "./providers/DeepSeekProvider.js";
import { CopilotProvider } from "./providers/CopilotProvider.js";
import { stripEmojis } from "./utils/text.js";

// Re-export stripEmojis for use in main.ts
export { stripEmojis };

export const CONTROLS_HEIGHT = 235;

const providers: AIProvider[] = [
  new ChatGPTProvider(),
  new ClaudeProvider(),
  new GeminiProvider(),
  new GrokProvider(),
  new DeepSeekProvider(),
  new CopilotProvider(),
];

function getProvider(view: CustomBrowserView): AIProvider | undefined {
  if (!view.id) return undefined;
  return providers.find((p) =>
    p.matches ? p.matches(view.id) : view.id.includes(p.urlId),
  );
}

/**
 * Creates and configures a new BrowserView for the main window
 * @param mainWindow - The main Electron window
 * @param url - The URL to load in the browser view
 * @param websites - Array of currently open website URLs
 * @param views - Array of currently open BrowserViews
 * @param webPreferences - Optional web preferences for the BrowserView
 * @returns The newly created BrowserView
 */
export function addBrowserView(
  mainWindow: BrowserWindow,
  url: string,
  websites: string[],
  views: CustomBrowserView[],
  webPreferences: WebPreferences = {},
): CustomBrowserView {
  const view: CustomBrowserView = new WebContentsView({
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      devTools: true,
      ...webPreferences,
    },
  }) as CustomBrowserView;

  // Set background color to prevent white flash while loading
  view.setBackgroundColor("#000000");

  view.id = url;
  mainWindow.contentView.addChildView(view);

  const { width, height } = mainWindow.getBounds();

  websites.push(url);
  const viewWidth = Math.floor(width / websites.length);

  // Update existing views
  views.forEach((v, index) => {
    v.setBounds({
      x: index * viewWidth,
      y: 0,
      width: viewWidth,
      height: height - CONTROLS_HEIGHT,
    });
  });

  // Set new view bounds
  view.setBounds({
    x: (websites.length - 1) * viewWidth,
    y: 0,
    width: viewWidth,
    height: height - CONTROLS_HEIGHT,
  });

  view.webContents.setZoomFactor(1.5);
  view.webContents.loadURL(url);

  // Open DevTools for debugging
  // view.webContents.openDevTools({ mode: "detach" });

  views.push(view);
  return view;
}

export function removeBrowserView(
  mainWindow: BrowserWindow,
  viewToRemove: CustomBrowserView,
  websites: string[],
  views: CustomBrowserView[],
): void {
  const viewIndex = views.indexOf(viewToRemove);
  if (viewIndex === -1) return;

  mainWindow.contentView.removeChildView(viewToRemove);

  const urlIndex = websites.findIndex((url) => url === viewToRemove.id);
  if (urlIndex !== -1) {
    websites.splice(urlIndex, 1);
  }

  views.splice(viewIndex, 1);

  if (views.length === 0) return;

  const { width, height } = mainWindow.getBounds();
  const viewWidth = Math.floor(width / views.length);

  views.forEach((v, index) => {
    v.setBounds({
      x: index * viewWidth,
      y: 0,
      width: viewWidth,
      height: height - CONTROLS_HEIGHT,
    });
  });
}

export function openNewChatInView(view: CustomBrowserView): void {
  const provider = getProvider(view);
  if (provider) {
    provider.handleNewChat(view);
  } else {
    console.warn(`No provider found for view: ${view.id}`);
  }
}

export function injectPromptIntoView(
  view: CustomBrowserView,
  prompt: string,
): void {
  const provider = getProvider(view);
  if (provider) {
    provider.injectPrompt(view, prompt);
  } else {
    console.warn(`No provider found for view: ${view.id}`);
  }
}

export function sendPromptInView(view: CustomBrowserView) {
  const provider = getProvider(view);
  if (provider) {
    provider.sendPrompt(view);
  } else {
    console.warn(`No provider found for view: ${view.id}`);
  }
}

export function injectImageIntoView(
  view: CustomBrowserView,
  imageData: string,
) {
  const provider = getProvider(view);
  if (provider) {
    provider.injectImage(view, imageData);
  } else {
    console.warn(`No provider found for view: ${view.id}`);
  }
}
