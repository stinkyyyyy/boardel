import { AIProvider, CustomBrowserView } from "./AIProvider.js";
import { stripEmojis, escapeForJS } from "../utils/text.js";

export class ChatGPTProvider implements AIProvider {
  name = "ChatGPT";
  urlId = "chatgpt";

  injectPrompt(view: CustomBrowserView, prompt: string): void {
    const cleanPrompt = stripEmojis(prompt);
    const escapedPrompt = escapeForJS(cleanPrompt);

    view.webContents.executeJavaScript(`
        (function() {
            const inputElement = document.querySelector('#prompt-textarea > p');
            if (inputElement) {
                const inputEvent = new Event('input', { bubbles: true });
                inputElement.innerText = \`${escapedPrompt}\`;
                inputElement.dispatchEvent(inputEvent);
            }
        })();
    `);
  }

  sendPrompt(view: CustomBrowserView): void {
    view.webContents.executeJavaScript(`
        (function() {
            var btn = document.querySelector('button[data-testid="send-button"]');
            if (!btn) btn = document.querySelector('button[aria-label*="Send"]');
            if (!btn) btn = document.querySelector('button[data-testid="fruitjuice-send-button"]');
            if (!btn) {
                const buttons = Array.from(document.querySelectorAll('button'));
                btn = buttons.find(b => {
                    const svg = b.querySelector('svg');
                    return svg && b.closest('form') && !b.disabled;
                });
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
          'a[href*="/"]', // ChatGPT new chat links
          'button:has(svg[class*="icon"])'
        ];

        for (const selector of selectors) {
          try {
            const elements = document.querySelectorAll(selector);
            for (const element of elements) {
              const text = element.textContent?.toLowerCase() || '';
              const label = element.getAttribute('aria-label')?.toLowerCase() || '';

              if (label.includes('new') || text.includes('new chat')) {
                // Check if visible and interactable
                if (element.offsetParent !== null &&
                    element.getBoundingClientRect().width > 0) {
                  element.click();
                  return true;
                }
              }
            }
          } catch (e) {
            continue;
          }
        }

        // Final fallback: look for any clickable element with "new chat" text
        const allClickable = document.querySelectorAll('a, button');
        for (const el of allClickable) {
          if (el.offsetParent !== null) {
            const text = (el.textContent || '').toLowerCase();
            const label = (el.getAttribute('aria-label') || '').toLowerCase();
            if (label === 'new chat' || text.trim() === 'new chat') {
              el.click();
              return true;
            }
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

        // Find the primary input area
        const textarea = document.querySelector('#prompt-textarea');
        if (!textarea) {
          console.error('ChatGPT prompt textarea not found.');
          return false;
        }

        // --- Primary Strategy: Simulate a paste event ---
        try {
          console.log('Focusing textarea and attempting paste event...');
          textarea.focus();

          const dataTransfer = new DataTransfer();
          dataTransfer.items.add(file);

          const pasteEvent = new ClipboardEvent('paste', {
            bubbles: true,
            cancelable: true,
            clipboardData: dataTransfer,
          });

          textarea.dispatchEvent(pasteEvent);
          console.log('Paste event dispatched.');

          // Wait longer for UI to update and check for image preview
          await new Promise(resolve => setTimeout(resolve, 500));

          // Check for image preview with updated selectors

          const imagePreview = document.querySelector('span[style*="background-image"]');

          if (imagePreview) {
            console.log('Image injection successful (verified by thumbnail).');
            return true;
          }

          console.log('Paste event verification did not detect image, trying fallback...');
        } catch (e) {
          console.error('Paste event strategy failed:', e);
        }


        // --- Fallback Strategy: Use the file input ---
        console.log('Paste strategy may have failed, trying file input fallback...');
        try {
          const uploadButton = document.querySelector('button[aria-label*="Attach" i]');
          if (uploadButton) {
            console.log('Clicking attach button...');
            uploadButton.click();
            await new Promise(resolve => setTimeout(resolve, 100));
          }

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

        console.error('All image injection strategies for ChatGPT failed.');
        return false;
      })(); // Close the IIFE
    `,
    );
  }

  async getLastResponse(view: CustomBrowserView): Promise<string | null> {
    return view.webContents.executeJavaScript(`
      (function() {
        const responses = document.querySelectorAll('div[data-message-author-role="assistant"]');
        if (responses.length > 0) {
          const lastResponse = responses[responses.length - 1];
          return lastResponse.innerText;
        }
        return null;
      })();
    `);
  }

  async isGenerationComplete(view: CustomBrowserView): Promise<boolean> {
    return view.webContents.executeJavaScript(`
      (function() {
        var btn = document.querySelector('button[data-testid="send-button"]');
        if (!btn) btn = document.querySelector('button[aria-label*="Send"]');
        if (!btn) btn = document.querySelector('button[data-testid="fruitjuice-send-button"]');
        if (!btn) {
             const buttons = Array.from(document.querySelectorAll('button'));
             btn = buttons.find(b => {
                 const svg = b.querySelector('svg');
                 return svg && b.closest('form') && !b.disabled;
             });
        }
        if (btn && !btn.disabled) {
            return true;
        }
        // Fallback: check if stop button exists
        const stopButton = document.querySelector('button[aria-label="Stop generating"]');
        return !stopButton;
      })();
    `);
  }
}
