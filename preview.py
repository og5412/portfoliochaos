"""Local portfolio preview. Close the terminal window to stop the server."""
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
import threading
import webbrowser

root = Path(__file__).resolve().parent
for port in range(4186, 4200):
    try:
        server = ThreadingHTTPServer(('127.0.0.1', port), partial(SimpleHTTPRequestHandler, directory=str(root)))
        break
    except OSError:
        continue
else:
    raise SystemExit('No local preview port available.')
url = f'http://127.0.0.1:{port}/index.html#projects'
print(f'Portfolio preview: {url}\nClose this window to stop the preview.', flush=True)
threading.Timer(0.6, lambda: webbrowser.open(url)).start()
try:
    server.serve_forever()
except KeyboardInterrupt:
    pass
finally:
    server.server_close()
