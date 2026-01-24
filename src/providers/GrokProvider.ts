import { AIProvider, CustomBrowserView } from "./AIProvider.js";
import { stripEmojis, escapeForJS } from "../utils/text.js";

export class GrokProvider implements AIProvider {
  name = "Grok";
  urlId = "grok";

  injectPrompt(view: CustomBrowserView, prompt: string): void {
    const cleanPrompt = stripEmojis(prompt);
    const escapedPrompt = escapeForJS(cleanPrompt);

    view.webContents.executeJavaScript(`
            {
                var inputElement = document.querySelector('div.ProseMirror > p');
                if (inputElement) {
                    inputElement.innerHTML = \`${escapedPrompt}\`;
                }
            }
        `);
  }

  sendPrompt(view: CustomBrowserView): void {
    view.webContents.executeJavaScript(`
      (function() {
        const textarea = document.querySelector('textarea');
        var btn = document.querySelector('button[aria-label*="Submit"]');
        if (!btn) btn = document.querySelector('button[aria-label*="Send"]');
        if (!btn) btn = document.querySelector('button[data-testid="send-button"]');
        if (!btn && textarea) {
          const form = textarea.closest('form');
          if (form) {
            const buttons = form.querySelectorAll('button');
            btn = Array.from(buttons).find(b => {
              const svg = b.querySelector('svg');
              return svg && !b.disabled;
            });
          }
        }

        if (btn) {
          btn.disabled = false;
          btn.click();

          setTimeout(() => {
            const clickEvent = new MouseEvent('click', {
              bubbles: true,
              cancelable: true,
              view: window
            });
            btn.dispatchEvent(clickEvent);
          }, 50);

          if (textarea) {
            setTimeout(() => {
              const enterEvent = new KeyboardEvent('keydown', {
                key: 'Enter',
                code: 'Enter',
                keyCode: 13,
                bubbles: true,
                cancelable: true
              });
              textarea.dispatchEvent(enterEvent);
            }, 100);
          }
        }
      })();
    `);
  }

  handleNewChat(view: CustomBrowserView): void {
    view.webContents.executeJavaScript(`
      (function() {
        // For Grok, clicking the "Home" link creates a new chat
        const allLinks = document.querySelectorAll('a');

        for (const link of allLinks) {
          const label = (link.getAttribute('aria-label') || '').toLowerCase();
          const href = link.href || '';

          // Check for home page link (Polish: "Strona główna", English: "Home")
          if ((label.includes('strona główna') || label.includes('home')) &&
              href.includes('grok.com/') &&
              !href.includes('sign-in') &&
              !href.includes('sign-up')) {

            if (link.offsetParent !== null) {
              link.click();
              return true;
            }
          }
        }

        // Fallback: just navigate to grok.com homepage
        window.location.href = 'https://grok.com/';
        return true;
      })();
    `);
  }

  injectImage(view: CustomBrowserView, imageData: string): void {
    const base64Data = imageData.includes("base64,")
      ? imageData.split("base64,")[1]
      : imageData;

    const base64toBlobFnString = `
      (async function() {
        const base64toBlob = (base64, type = 'image/png') => {
          const byteString = atob(base64);
          const ab = new ArrayBuffer(byteString.length);
          const ia = new Uint8Array(ab);
          for (let i = 0; i < byteString.length; i++) {
            ia[i] = byteString.charCodeAt(i);
          }
          return new Blob([ab], { type });
        };

        // Generate unique filename
        const timestamp = Date.now();
        const randomId = Math.random().toString(36).substring(2, 9);
        const uniqueFilename = \`pasted-image-\${timestamp}-\${randomId}.png\`;
    `;

    view.webContents.executeJavaScript(
      base64toBlobFnString +
        `
        const blob = base64toBlob('${base64Data}');
        const file = new File([blob], uniqueFilename, { type: 'image/png' });

        console.log('Attempting to inject image into Grok...');

        // --- Primary Strategy: Directly manipulate the hidden file input ---
        try {
          const fileInput = document.querySelector('input[type="file"]');
          if (!fileInput) {
            throw new Error('File input not found for Grok.');
          }

          console.log('Found file input. Assigning file directly...');

          const dataTransfer = new DataTransfer();
          dataTransfer.items.add(file);
          fileInput.files = dataTransfer.files;

          // Dispatch multiple events to ensure Grok detects the file
          const changeEvent = new Event('change', { bubbles: true });
          fileInput.dispatchEvent(changeEvent);

          const inputEvent = new Event('input', { bubbles: true });
          fileInput.dispatchEvent(inputEvent);

          console.log('File input strategy dispatched for Grok.');

          // Verify success
          await new Promise(resolve => setTimeout(resolve, 300));
          const imageAdded = document.querySelector('img[src*="blob:"]') ||
                           document.querySelector('[data-testid*="image" i]') ||
                           document.querySelector('img[alt*="image" i]');

          if (imageAdded) {
            console.log('Image injection successful for Grok.');
            return true;
          }

        } catch(e) {
          console.error('Direct file input strategy for Grok failed:', e);
        }

        console.error('All image injection strategies for Grok failed.');
        return false;
      })(); // Close the IIFE
    `,
    );
  }
}
