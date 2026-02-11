import { AIProvider, CustomBrowserView } from "./AIProvider.js";
import { stripEmojis, escapeForJS } from "../utils/text.js";

export class CopilotProvider implements AIProvider {
  name = "Copilot";
  urlId = "copilot";

  injectPrompt(view: CustomBrowserView, prompt: string): void {
    const cleanPrompt = stripEmojis(prompt);
    const escapedPrompt = escapeForJS(cleanPrompt);

    view.webContents.executeJavaScript(`
            {
                var inputElement = document.querySelector('textarea[aria-label="Ask me anything..."]');
                if (!inputElement) inputElement = document.querySelector('textarea');
                if (inputElement) {
                    var nativeTextAreaValueSetter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, "value").set;
                    nativeTextAreaValueSetter.call(inputElement, \`${escapedPrompt}\`);
                    const inputEvent = new Event('input', { bubbles: true });
                    inputElement.dispatchEvent(inputEvent);
                }
            }
        `);
  }

  sendPrompt(view: CustomBrowserView): void {
    view.webContents.executeJavaScript(`
      (function() {
        const textarea = document.querySelector('textarea');
        const allButtons = document.querySelectorAll('button');

        var btn = Array.from(allButtons).find(b => {
          const label = b.getAttribute('aria-label');
          return label && label.toLowerCase().includes('submit');
        });

        if (!btn && textarea) {
          const form = textarea.closest('form');
          if (form) {
            const buttons = form.querySelectorAll('button');
            btn = Array.from(buttons).find(b => {
              const svg = b.querySelector('svg');
              const isSubmit = b.type === 'submit';
              return (svg || isSubmit) && !b.disabled;
            });
          }
        }

        if (btn) {
          btn.disabled = false;
          btn.click();
        } else if (textarea) {
          const enterEvent = new KeyboardEvent('keydown', {
            key: 'Enter',
            code: 'Enter',
            keyCode: 13,
            which: 13,
            bubbles: true,
            cancelable: true
          });
          textarea.dispatchEvent(enterEvent);
        }
      })();
    `);
  }

  handleNewChat(view: CustomBrowserView): void {
    view.webContents.executeJavaScript(`
      (function() {
        const selectors = [
          'button[aria-label="Start new chat"]',
          'button[aria-label*="new chat" i]',
          'button[aria-label*="New" i]',
          'button:has(svg)'
        ];

        for (const selector of selectors) {
          try {
            const elements = document.querySelectorAll(selector);
            for (const element of elements) {
              if (element.offsetParent !== null &&
                  element.getBoundingClientRect().width > 0 &&
                  !element.disabled) {
                const label = (element.getAttribute('aria-label') || '').toLowerCase();
                if (label.includes('new') || label.includes('start')) {
                  element.click();
                  return true;
                }
              }
            }
          } catch (e) {
            continue;
          }
        }

        // Fallback
        const newChatButtons = document.querySelectorAll('button[aria-label*="new" i], button[aria-label*="start" i]');
        for (const btn of newChatButtons) {
          if (!btn.disabled && btn.offsetParent !== null) {
            btn.click();
            break;
          }
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

        console.log('Attempting to inject image into Copilot...');

        // --- Primary Strategy: Directly manipulate the hidden file input ---
        try {
          const fileInput = document.querySelector('input[type="file"]');
          if (!fileInput) {
            throw new Error('File input not found for Copilot.');
          }

          console.log('Found file input. Assigning file directly...');

          const dataTransfer = new DataTransfer();
          dataTransfer.items.add(file);
          fileInput.files = dataTransfer.files;

          const changeEvent = new Event('change', { bubbles: true });
          fileInput.dispatchEvent(changeEvent);

          console.log('File input strategy dispatched for Copilot.');
          return true;

        } catch(e) {
          console.error('Direct file input strategy for Copilot failed:', e);
        }

        console.error('All image injection strategies for Copilot failed.');
        return false;
      })(); // Close the IIFE
    `,
    );
  }
}
