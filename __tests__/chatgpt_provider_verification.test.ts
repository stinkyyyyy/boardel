/**
 * @jest-environment jsdom
 */
import { ChatGPTProvider } from "../src/providers/ChatGPTProvider";

// Mock electron module to avoid load issues
jest.mock("electron", () => ({
  WebContentsView: class {},
  app: {},
  BrowserWindow: class {},
}));

describe("ChatGPTProvider Verification", () => {
  let provider: ChatGPTProvider;
  let layoutAccessCount = 0;
  let container: HTMLElement;

  beforeEach(() => {
    provider = new ChatGPTProvider();
    layoutAccessCount = 0;
    document.body.innerHTML = "";
    container = document.createElement("div");
    document.body.appendChild(container);
    jest.clearAllMocks();
  });

  afterEach(() => {
    document.body.removeChild(container);
    jest.restoreAllMocks();
  });

  const mockLayout = (element: Element) => {
    Object.defineProperty(element, "offsetParent", {
      get: jest.fn(() => {
        layoutAccessCount++;
        return document.body;
      }),
      configurable: true,
    });

    Object.defineProperty(element, "getBoundingClientRect", {
      value: jest.fn(() => {
        layoutAccessCount++;
        return { width: 100, height: 20, top: 0, left: 0 };
      }),
      configurable: true,
    });
  };

  const setupDOM = (numLinks = 100) => {
    // Create many distractors (links that match the 3rd selector but not the text)
    for (let i = 0; i < numLinks; i++) {
      const link = document.createElement("a");
      link.href = "/chat/" + i;
      link.textContent = "Some random chat history";
      mockLayout(link);
      container.appendChild(link);
    }

    // Create the target button (also matching 3rd selector)
    const targetLink = document.createElement("a");
    targetLink.href = "/new-chat";
    targetLink.textContent = "New chat";
    mockLayout(targetLink);
    container.appendChild(targetLink);

    return targetLink;
  };

  test("handleNewChat code should prioritize text checks over layout checks", () => {
    const target = setupDOM(100);
    const clickSpy = jest.spyOn(target, "click");
    let injectedScript = "";

    const mockView = {
      webContents: {
        executeJavaScript: jest.fn((script: string) => {
          injectedScript = script;
        }),
      },
    };

    // Call the method to capture the script
    // @ts-ignore
    provider.handleNewChat(mockView);

    expect(mockView.webContents.executeJavaScript).toHaveBeenCalled();

    // Now execute the captured script in JSDOM environment
    // The script is an IIFE: (function() { ... })();
    // Evaluating it should run the logic against our JSDOM setup.
    // We use eval() because it executes in the current scope (where document/window exist).

    // Note: The script uses `const selectors = ...` which might conflict if run multiple times in same scope?
    // But inside eval, variables declared with const are block-scoped if inside a block, or global if top level.
    // The script is wrapped in `(function() { ... })();`, so scope is contained.

    // eslint-disable-next-line no-eval
    eval(injectedScript);

    expect(clickSpy).toHaveBeenCalled();

    // Check layout accesses.
    // Optimized version: ~2 accesses.
    // Unoptimized version: ~202 accesses.
    expect(layoutAccessCount).toBeLessThan(10);
    console.log("Layout accesses:", layoutAccessCount);
  });
});
