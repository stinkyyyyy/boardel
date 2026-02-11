import { GrokProvider } from "../src/providers/GrokProvider";

// Mock CustomBrowserView
const mockView = {
  webContents: {
    executeJavaScript: jest.fn(),
  },
} as any;

describe("GrokProvider", () => {
  let provider: GrokProvider;

  beforeEach(() => {
    provider = new GrokProvider();
    jest.clearAllMocks();
  });

  test("handleNewChat injects direct navigation script", () => {
    provider.handleNewChat(mockView);
    expect(mockView.webContents.executeJavaScript).toHaveBeenCalled();
    const injectedScript =
      mockView.webContents.executeJavaScript.mock.calls[0][0];

    // Check for the optimized implementation
    expect(injectedScript).toContain(
      "window.location.href = 'https://grok.com/';",
    );

    // Verify it does NOT contain the old loop
    expect(injectedScript).not.toContain("document.querySelectorAll");
  });
});
