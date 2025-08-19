const videoEl = document.getElementById('video');
let videoQueue = [];
let idx = 0;

async function fetchBatch(teachxToken){
  const res = await fetch('/batch', { headers: { 'teachx-token': teachxToken }});
  const data = await res.json();
  videoQueue = data.map(item => item.hls_url); // map API response to HLS URLs
  playNext();
}

const playNext = () => {
  if (idx >= videoQueue.length) return;
  const url = videoQueue[idx];
  if (Hls.isSupported()) {
    const hls = new Hls();
    hls.loadSource(url);
    hls.attachMedia(videoEl);
    hls.on(Hls.Events.MANIFEST_PARSED, () => videoEl.play());
  } else {
    videoEl.src = url;
  }
  idx++;
  videoEl.onended = playNext;
}

// Example: after login, call fetchBatch with teachxToken
// fetchBatch('YOUR_TEACHX_TOKEN');