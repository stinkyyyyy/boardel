import { WebContentsView } from "electron";

export interface CustomBrowserView extends WebContentsView {
  id: string;
}

export interface AIProvider {
  /**
   * The display name of the provider
   */
  name: string;

  /**
   * The string to match against the view's ID (URL) to identify this provider.
   * e.g., "chatgpt", "claude", "gemini"
   */
  urlId: string;

  /**
   * Optional custom matching logic if urlId simple include is not enough
   */
  matches?(url: string): boolean;

  /**
   * Injects the text prompt into the provider's input area
   */
  injectPrompt(view: CustomBrowserView, prompt: string): Promise<void> | void;

  /**
   * Triggers the "Send" action
   */
  sendPrompt(view: CustomBrowserView): Promise<void> | void;

  /**
   * Initiates a new chat session
   */
  handleNewChat(view: CustomBrowserView): Promise<void> | void;

  /**
   * Injects an image into the chat
   */
  injectImage(view: CustomBrowserView, imageData: string): Promise<void> | void;
}
