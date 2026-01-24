import { AIProvider, CustomBrowserView } from "./AIProvider.js";
import { stripEmojis, escapeForJS } from "../utils/text.js";

export class GeminiProvider implements AIProvider {
  name = "Gemini";
  urlId = "gemini";

  matches(url: string): boolean {
    return url.includes("gemini") || url.includes("bard");
  }

  injectPrompt(view: CustomBrowserView, prompt: string): void {
    const cleanPrompt = stripEmojis(prompt);
    const escapedPrompt = escapeForJS(cleanPrompt);

    view.webContents.executeJavaScript(`
            {
                var inputElement = document.querySelector(".ql-editor.textarea");
                if (!inputElement) {
                    inputElement = document.querySelector("rich-textarea textarea");
                }
                if (!inputElement) {
                    inputElement = document.querySelector("[contenteditable='true']");
                }
                if (inputElement) {
                    const inputEvent = new Event('input', { bubbles: true });
                    if (inputElement.tagName === 'TEXTAREA') {
                        inputElement.value = \`${escapedPrompt}\`;
                    } else {
                        inputElement.innerText = \`${escapedPrompt}\`;
                    }
                    inputElement.dispatchEvent(inputEvent);
                }
            }
        `);
  }

  sendPrompt(view: CustomBrowserView): void {
    view.webContents.executeJavaScript(`
      (function() {
        var btn = document.querySelector("button[aria-label*='Send message']");
        if (!btn) btn = document.querySelector("button[aria-label*='Send']");
        if (!btn) btn = document.querySelector("button[mattooltip*='Send']");
        if (!btn) btn = document.querySelector("button.send-button");
        if (!btn) {
          const textarea = document.querySelector('rich-textarea, textarea, [contenteditable="true"]');
          if (textarea) {
            const form = textarea.closest('form');
            if (form) {
              const buttons = form.querySelectorAll('button');
              btn = Array.from(buttons).find(b => {
                const svg = b.querySelector('svg');
                return svg && !b.disabled;
              });
            }
          }
        }

        if (btn) {
          btn.setAttribute("aria-disabled", "false");
          btn.disabled = false;
          btn.click();
        }
      })();
    `);
  }

  handleNewChat(view: CustomBrowserView): void {
    view.webContents.executeJavaScript(`
      (function() {
        // Try to find button with aria-label="Nowy czat" or text="Nowy czat"
        const allButtons = document.querySelectorAll('button');

        let foundButtons = [];
        for (const btn of allButtons) {
          const label = (btn.getAttribute('aria-label') || '').toLowerCase();
          const text = (btn.textContent || '').toLowerCase().trim();

          // Check for "new chat" in various languages
          if (label.includes('nowy czat') || text.includes('nowy czat') ||
              label.includes('new chat') || text.includes('new chat')) {

            foundButtons.push({
              visible: btn.offsetParent !== null,
              disabled: btn.disabled,
              element: btn
            });
          }
        }

        // Try to click ANY button (visible or not, enabled or disabled)
        if (foundButtons.length > 0) {
          const info = foundButtons[0]; // Take the first one

          // Force enable the button if it's disabled
          if (info.element.disabled) {
            info.element.disabled = false;
            info.element.removeAttribute('disabled');
            info.element.removeAttribute('aria-disabled');
          }

          // Click the button
          info.element.click();

          // If normal click doesn't work, try dispatching event
          const clickEvent = new MouseEvent('click', {
            bubbles: true,
            cancelable: true,
            view: window
          });
          info.element.dispatchEvent(clickEvent);

          return true;
        }

        return false;
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

        console.log('Attempting to inject image into Gemini/Bard...');

        const inputElement = document.querySelector("[contenteditable='true']");
        if (!inputElement) {
          console.error('Gemini/Bard contenteditable input not found.');
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

          // Wait for the UI to update
          await new Promise(resolve => setTimeout(resolve, 300));

          // Check if the image was successfully added
          const imageAdded = inputElement.querySelector('img') ||
                           document.querySelector('img[alt*="pasted" i]') ||
                           document.querySelector('[data-testid*="image" i]');

          if (imageAdded) {
            console.log('Image injection successful (verified by thumbnail).');
            return true;
          } else {
            console.log('Primary paste strategy did not add image, trying fallback...');
          }
        } catch (e) {
          console.error('Paste event strategy failed:', e);
        }

        // --- Fallback Strategy: Use the file input directly (no button click) ---
        console.log('Trying file input fallback...');
        try {
          const fileInput = document.querySelector('images-files-uploader');

          if (!fileInput) {
            console.error('File input not found for fallback strategy.');
            return false;
          }

          console.log('Found file input. Assigning file directly...');

          const dataTransfer = new DataTransfer();
          dataTransfer.items.add(file);
          fileInput.files = dataTransfer.files;

          const changeEvent = new Event('change', { bubbles: true });
          fileInput.dispatchEvent(changeEvent);

          // Also try dispatching 'input' event
          const inputEvent = new Event('input', { bubbles: true });
          fileInput.dispatchEvent(inputEvent);

          console.log('File input strategy dispatched.');

          // Verify fallback success
          await new Promise(resolve => setTimeout(resolve, 300));
          const imageAddedFallback = inputElement.querySelector('img') ||
                                    document.querySelector('img[alt*="pasted" i]') ||
                                    document.querySelector('[data-testid*="image" i]');

          if (imageAddedFallback) {
            console.log('Fallback strategy successful.');
            return true;
          }
        } catch(e) {
          console.error('File input strategy failed:', e);
        }

        console.error('All image injection strategies for Gemini/Bard failed.');
        return false;
      })(); // Close the IIFE
    `,
    );
  }
}
