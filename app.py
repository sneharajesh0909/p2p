from flask import Flask, render_template
from backend.node import app, blockchain
import threading

def run_flask_app():
    app.run(port=5000)

if __name__ == '__main__':
    # Start Flask server in a separate thread
    flask_thread = threading.Thread(target=run_flask_app)
    flask_thread.daemon = True
    flask_thread.start()
    
    # Start the frontend server
    import http.server
    import socketserver
    import os
    
    os.chdir('frontend')
    PORT = 8000
    Handler = http.server.SimpleHTTPRequestHandler
    with socketserver.TCPServer(("", PORT), Handler) as httpd:
        print(f"Serving frontend at http://localhost:{PORT}")
        httpd.serve_forever()