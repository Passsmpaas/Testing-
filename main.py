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

# --- HLS download and MP4 convert functions ---
def download_hls(url, mkv_file):
    command = [
        "ffmpeg",
        "-i", url,
        "-c", "copy",
        "-bsf:a", "aac_adtstoasc",
        mkv_file
    ]
    subprocess.run(command)

def convert_to_mp4(mkv_file, mp4_file):
    command = [
        "ffmpeg",
        "-i", mkv_file,
        "-c", "copy",
        mp4_file
    ]
    subprocess.run(command)

def process_url(url, index):
    mkv_file = f"temp_{index}.mkv"
    mp4_file = f"video_{index}.mp4"
    print(f"[{index}] Downloading MKV...")
    download_hls(url, mkv_file)
    print(f"[{index}] Converting to MP4...")
    convert_to_mp4(mkv_file, mp4_file)
    print(f"[{index}] Done! Saved as {mp4_file}")
    os.remove(mkv_file)
    return mp4_file

# --- Telegram command handlers ---
@app.on_message(filters.command("start"))
def start(client, message):
    message.reply_text("Bot is running! Send /download to start video download.")

@app.on_message(filters.command("download"))
def download_videos(client, message):
    # URLs from environment variable
    urls_env = os.environ.get("URLS")
    urls = []

    if urls_env:
        urls = [u.strip() for u in urls_env.split(",") if u.strip()]
    elif os.path.exists("urls.txt"):
        with open("urls.txt", "r") as f:
            urls = [line.strip() for line in f if line.strip()]
    else:
        message.reply_text("No URLs found! Please provide them in URLs env variable or urls.txt")
        return

    message.reply_text(f"Starting download of {len(urls)} videos...")

    for idx, url in enumerate(urls, start=1):
        mp4_file = process_url(url, idx)
        message.reply_text(f"Downloaded and converted: {mp4_file}")

# --- Start Pyrogram bot in separate thread ---
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
        
