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

app = Client("my_bot", bot_token=BOT_TOKEN, api_id=API_ID, api_hash=API_HASH)

# --- HLS download / MP4 convert functions ---
def download_hls(url, mkv_file):
    subprocess.run(["ffmpeg", "-i", url, "-c", "copy", "-bsf:a", "aac_adtstoasc", mkv_file])

def convert_to_mp4(mkv_file, mp4_file):
    subprocess.run(["ffmpeg", "-i", mkv_file, "-c", "copy", mp4_file])

def process_url(url, index):
    mkv_file = f"temp_{index}.mkv"
    mp4_file = f"video_{index}.mp4"
    download_hls(url, mkv_file)
    convert_to_mp4(mkv_file, mp4_file)
    os.remove(mkv_file)
    return mp4_file

# --- Telegram command handlers ---
@app.on_message(filters.command("start"))
def start(client, message):
    message.reply_text("Bot is running! Send /download to start video download.")

@app.on_message(filters.command("download"))
def download_videos(client, message):
    urls_env = os.environ.get("URLS")
    urls = []
    if urls_env:
        urls = [u.strip() for u in urls_env.split(",") if u.strip()]
    elif os.path.exists("urls.txt"):
        with open("urls.txt","r") as f:
            urls = [line.strip() for line in f if line.strip()]
    else:
        message.reply_text("No URLs found! Provide them in URLS env or urls.txt")
        return

    message.reply_text(f"Starting download of {len(urls)} videos...")
    for idx, url in enumerate(urls, start=1):
        mp4_file = process_url(url, idx)
        message.reply_text(f"Downloaded & converted: {mp4_file}")

# --- Dummy HTTP server (Render Web Service) ---
class Handler(BaseHTTPRequestHandler):
    def do_GET(self):
        self.send_response(200)
        self.end_headers()
        self.wfile.write(b"Bot/Downloader is running!")

def start_http_server():
    PORT = int(os.environ.get("PORT", 10000))
    server = HTTPServer(('', PORT), Handler)
    print(f"Listening on port {PORT} for Render")
    server.serve_forever()

# --- Start HTTP server in separate thread ---
Thread(target=start_http_server, daemon=True).start()

# --- Start Telegram bot in main thread ---
app.run()
                    
