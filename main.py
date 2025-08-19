import os
import subprocess
from pyrogram import Client, filters
from dotenv import load_dotenv
from threading import Thread
from http.server import HTTPServer, BaseHTTPRequestHandler

# Load environment variables
load_dotenv()

BOT_TOKEN = os.environ.get("BOT_TOKEN")
API_ID = int(os.environ.get("API_ID"))
API_HASH = os.environ.get("API_HASH")

# Initialize bot client
app = Client("my_bot", bot_token=BOT_TOKEN, api_id=API_ID, api_hash=API_HASH)

@app.on_message(filters.command("start"))
def start(client, message):
    message.reply_text("Bot is working!")

@app.on_message(filters.command("download"))
def download_video(client, message):
    message.reply_text("Download function placeholder.")

# Start Pyrogram bot in separate thread
def start_bot():
    app.run()

Thread(target=start_bot).start()

# --- Dummy HTTP server for Render Web Service ---
PORT = int(os.environ.get("PORT", 10000))

class Handler(BaseHTTPRequestHandler):
    def do_GET(self):
        self.send_response(200)
        self.end_headers()
        self.wfile.write(b"Bot/Downloader is running!")

server = HTTPServer(('', PORT), Handler)
print(f"Listening on port {PORT} for Render Web Service")
server.serve_forever()
