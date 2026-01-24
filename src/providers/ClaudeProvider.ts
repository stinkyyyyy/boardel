import { AIProvider, CustomBrowserView } from "./AIProvider.js";
import { stripEmojis, escapeForJS } from "../utils/text.js";

export class ClaudeProvider implements AIProvider {
  name = "Claude";
  urlId = "claude";

  injectPrompt(view: CustomBrowserView, prompt: string): void {
    const cleanPrompt = stripEmojis(prompt);
    const escapedPrompt = escapeForJS(cleanPrompt);

    view.webContents.executeJavaScript(`
            {
                var inputElement = document.querySelector('div.ProseMirror');
                if (inputElement) {
                    inputElement.innerHTML = \`${escapedPrompt}\`;
                }
            }
        `);
  }

  sendPrompt(view: CustomBrowserView): void {
    view.webContents.executeJavaScript(`
      (function() {
        var btn = document.querySelector("button[aria-label*='Send message']");
        if (!btn) btn = document.querySelector("button[aria-label*='Send Message']");
        if (!btn) btn = document.querySelector('button:has(div svg)');
        if (!btn) btn = document.querySelector('button:has(svg)');
        if (!btn) {
          const inputArea = document.querySelector('[contenteditable="true"]');
          if (inputArea) {
            const container = inputArea.closest('div[class*="composer"]') || inputArea.closest('form') || inputArea.parentElement;
            if (container) {
              const buttons = container.querySelectorAll('button');
              btn = Array.from(buttons).find(b => {
                const svg = b.querySelector('svg');
                return svg && !b.disabled;
              });
            }
          }
        }

        if (btn) {
          btn.disabled = false;
          btn.click();
        }
      })();
    `);
  }

  handleNewChat(view: CustomBrowserView): void {
    view.webContents.executeJavaScript(`
      (function() {
        const selectors = [
          'a[aria-label="New chat"]',
          'button[aria-label="New chat"]',
          'a[href*="new"]',
          'div[role="button"]:has-text("New")'
        ];

        for (const selector of selectors) {
          try {
            const element = document.querySelector(selector);
            if (element && element.offsetParent !== null &&
                element.getBoundingClientRect().width > 0) {
              element.click();
              return true;
            }
          } catch (e) {
            continue;
          }
        }

        // Fallback
        const clickables = Array.from(document.querySelectorAll('a, button, div[role="button"]'));
        const newChatBtn = clickables.find(el => {
          if (el.offsetParent === null) return false;
          const label = (el.getAttribute('aria-label') || '').toLowerCase();
          const text = (el.textContent || '').toLowerCase();
          return label.includes('new') || text.trim().includes('new chat');
        });
        if (newChatBtn) {
          newChatBtn.click();
        }
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

        console.log('Attempting to inject image into Claude...');

        const inputElement = document.querySelector('div.ProseMirror') || document.querySelector("[contenteditable='true']");
        if (!inputElement) {
          console.error('Claude contenteditable input not found.');
          return false;
        }

        // --- Primary Strategy: Simulate a paste event ---
        try {
          console.log('Focusing input and attempting paste event...');
          inputElement.focus();

          const dataTransfer = new DataTransfer();
          dataTransfer.items.add(file);

          const pasteEvent = new ClipboardEvent('paste', {
            bubbles: true,
            cancelable: true,
            clipboardData: dataTransfer,
          });

          inputElement.dispatchEvent(pasteEvent);
          console.log('Paste event dispatched.');

          await new Promise(resolve => setTimeout(resolve, 200));

          if (document.querySelector('[data-testid="file-previews"]')) {
            console.log('Image injection successful (verified by thumbnail).');
            return true;
          }
        } catch (e) {
          console.error('Paste event strategy failed:', e);
        }

        // --- Fallback Strategy: Use the file input ---
        console.log('Paste strategy may have failed, trying file input fallback...');
        try {

          const fileInput = document.querySelector('input[type="file"]');
          if (fileInput) {
            const dataTransfer = new DataTransfer();
            dataTransfer.items.add(file);
            fileInput.files = dataTransfer.files;

            const changeEvent = new Event('change', { bubbles: true });
            fileInput.dispatchEvent(changeEvent);
            console.log('File input strategy dispatched.');
            return true;
          }
        } catch(e) {
          console.error('File input strategy failed:', e);
        }

        console.error('All image injection strategies for Claude failed.');
        return false;
      })(); // Close the IIFE
    `,
    );
  }
}
