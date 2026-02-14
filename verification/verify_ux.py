import http.server
import socketserver
import threading
import os
import time
from playwright.sync_api import sync_playwright

PORT = 8000

def start_server():
    # os.chdir(".") # Already in root
    Handler = http.server.SimpleHTTPRequestHandler
    # Allow reuse address to avoid "Address already in use"
    socketserver.TCPServer.allow_reuse_address = True
    with socketserver.TCPServer(("", PORT), Handler) as httpd:
        print(f"serving at port {PORT}")
        httpd.serve_forever()

def run(playwright):
    browser = playwright.chromium.launch()
    page = browser.new_page()

    # Mock window.electron
    page.add_init_script("""
        window.electron = {
            ipcRenderer: {
                send: () => {},
                on: () => {},
                invoke: () => Promise.resolve([])
            }
        };
    """)

    try:
        page.goto(f"http://localhost:{PORT}/index.html")

        # Wait for the button to be visible
        new_chat_btn = page.locator('.new-chat-toggle')
        new_chat_btn.wait_for()

        # Check aria-label
        aria_label = new_chat_btn.get_attribute("aria-label")
        print(f"ARIA Label: {aria_label}")
        if aria_label != "New Chat (Ctrl + N)":
            print("FAIL: Incorrect ARIA label")
        else:
            print("PASS: Correct ARIA label")

        # Hover to see tooltip
        # Find the tooltip container that contains the new chat button
        # The structure is: div.tooltip-container > button + span.tooltip
        # So we can find the button, go to parent, then find tooltip
        container = new_chat_btn.locator('..')
        tooltip = container.locator('.tooltip')

        print("Hovering over button...")
        new_chat_btn.hover()
        time.sleep(1) # Wait for transition

        if tooltip.is_visible():
            print("Tooltip is visible")
        else:
            print("Tooltip is NOT visible")

        # Use text_content to retrieve text even if hidden, to debug content
        tooltip_text = tooltip.text_content()
        print(f"Tooltip Text: {tooltip_text}")

        if tooltip_text and "Open New Chat (Ctrl + N)" in tooltip_text:
            print("PASS: Correct tooltip text")
        else:
            print("FAIL: Incorrect tooltip text")

        # Screenshot with tooltip visible
        page.screenshot(path="verification/ux_verification.png")
        print("Screenshot saved to verification/ux_verification.png")

    except Exception as e:
        print(f"Error: {e}")
    finally:
        browser.close()

if __name__ == "__main__":
    server_thread = threading.Thread(target=start_server)
    server_thread.daemon = True
    server_thread.start()

    # Give server a moment to start
    time.sleep(1)

    with sync_playwright() as playwright:
        run(playwright)
