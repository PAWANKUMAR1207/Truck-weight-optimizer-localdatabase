from flask import Flask, send_from_directory, request, jsonify
import subprocess
import threading
import time
import requests
import os

app = Flask(__name__, static_folder='.', static_url_path='')

# Start Node.js server in background
def start_node_server():
    subprocess.run(['node', 'server.js'])

# Start the Node.js server in a separate thread
threading.Thread(target=start_node_server, daemon=True).start()
time.sleep(3)

@app.route('/')
def index():
    return send_from_directory('.', 'index.html')

# Proxy all API requests to Node.js server on port 9000
@app.route('/api/<path:path>', methods=['GET', 'POST'])
def proxy_api(path):
    try:
        url = f'http://localhost:9000/api/{path}'
        if request.method == 'POST':
            resp = requests.post(url, json=request.get_json(), headers={'Content-Type': 'application/json'})
        else:
            resp = requests.get(url)
        return jsonify(resp.json()), resp.status_code
    except Exception as e:
        return jsonify({'error': f'API connection failed: {str(e)}'}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)