describe("CopilotProvider handleNewChat Benchmark", () => {
  beforeAll(() => {
    // Mock offsetParent for JSDOM as it returns null by default
    Object.defineProperty(HTMLElement.prototype, "offsetParent", {
      get() {
        return this.parentNode;
      },
    });
  });

  beforeEach(() => {
    document.body.innerHTML = "";
  });

  const setupDOM = (numButtons: number, targetIndex: number) => {
    const container = document.createElement("div");
    // Batch append for faster setup
    const fragment = document.createDocumentFragment();
    for (let i = 0; i < numButtons; i++) {
      const btn = document.createElement("button");
      if (i === targetIndex) {
        btn.setAttribute("aria-label", "Start new chat");
      } else {
        btn.setAttribute("aria-label", "Some other action");
      }
      fragment.appendChild(btn);
    }
    container.appendChild(fragment);
    document.body.appendChild(container);
  };

  const currentImplementation = () => {
    // Fallback logic from CopilotProvider.ts
    const buttons = Array.from(document.querySelectorAll("button"));
    const newChatBtn = buttons.find((btn) => {
      // In the real code: if (btn.disabled || btn.offsetParent === null) return false;
      // We cast to any because TS might complain about offsetParent on Element if not typed as HTMLElement,
      // but querySelectorAll returns NodeList<Element>. Array.from gives Element[].
      const el = btn as HTMLButtonElement;
      if (el.disabled || el.offsetParent === null) return false;
      const label = (el.getAttribute("aria-label") || "").toLowerCase();
      return label.includes("new") || label.includes("start");
    });
    return newChatBtn;
  };

  const optimizedImplementation = () => {
    // Proposed optimization
    const selector =
      'button[aria-label*="new" i], button[aria-label*="start" i]';
    const buttons = document.querySelectorAll(selector);

    for (const btn of buttons) {
      const el = btn as HTMLButtonElement;
      if (el.disabled || el.offsetParent === null) continue;
      return el;
    }
    return undefined;
  };

  test("Performance comparison", () => {
    const numButtons = 10000;
    const targetIndex = 9999; // Place it at the end
    setupDOM(numButtons, targetIndex);

    const startCurrent = performance.now();
    const resultCurrent = currentImplementation();
    const endCurrent = performance.now();
    const timeCurrent = endCurrent - startCurrent;

    const startOptimized = performance.now();
    const resultOptimized = optimizedImplementation();
    const endOptimized = performance.now();
    const timeOptimized = endOptimized - startOptimized;

    console.log(
      `Current Implementation (10k buttons): ${timeCurrent.toFixed(3)}ms`,
    );
    console.log(
      `Optimized Implementation (10k buttons): ${timeOptimized.toFixed(3)}ms`,
    );

    expect(resultCurrent).toBeDefined();
    expect(resultOptimized).toBeDefined();
    expect((resultCurrent as Element).getAttribute("aria-label")).toBe(
      "Start new chat",
    );
    expect(resultCurrent).toBe(resultOptimized);

    // Expect significant improvement
    expect(timeOptimized).toBeLessThan(timeCurrent);
  });
});
