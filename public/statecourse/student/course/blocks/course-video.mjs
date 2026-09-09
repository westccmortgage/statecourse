/* <course-video> supports legacy same-origin MP4s and private Cloudflare Stream delivery.
   Stream mode never receives a public video URL: it exchanges an authenticated enrollment and a
   server-owned asset key for a short-lived signed iframe URL, then records append-only playback
   evidence. Playback remains supplementary and never creates course credit by itself. */

const STREAM_SDK = "https://embed.cloudflarestream.com/embed/sdk.latest.js";
let streamSdkPromise;

function loadStreamSdk() {
  if (window.Stream) return Promise.resolve(window.Stream);
  if (streamSdkPromise) return streamSdkPromise;
  streamSdkPromise = new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[src="${STREAM_SDK}"]`);
    const script = existing || document.createElement("script");
    const ready = () => window.Stream ? resolve(window.Stream) : reject(new Error("stream_sdk_unavailable"));
    script.addEventListener("load", ready, { once: true });
    script.addEventListener("error", () => reject(new Error("stream_sdk_unavailable")), { once: true });
    if (!existing) {
      script.src = STREAM_SDK;
      script.async = true;
      script.referrerPolicy = "no-referrer";
      document.head.appendChild(script);
    }
  });
  return streamSdkPromise;
}

const nativeTemplate = `
  <figure class="course-video-frame">
    <video preload="metadata" playsinline></video>
    <div class="course-video-controls" role="group" aria-label="Video controls">
      <button type="button" data-action="play" aria-label="Play">Play</button>
      <button type="button" data-action="rewind" aria-label="Rewind ten seconds">⟲ 10s</button>
      <select data-action="speed" aria-label="Playback speed">
        <option value="0.75">0.75×</option>
        <option value="1" selected>1×</option>
        <option value="1.25">1.25×</option>
        <option value="1.5">1.5×</option>
      </select>
      <button type="button" data-action="captions" aria-pressed="true" aria-label="Toggle captions">Captions</button>
      <button type="button" data-action="transcript" aria-expanded="false" aria-label="Toggle transcript">Transcript</button>
    </div>
    <figcaption class="course-video-transcript" hidden></figcaption>
  </figure>`;

const streamTemplate = `
  <figure class="course-video-frame course-video-private">
    <div class="course-video-stream-shell" data-stream-shell>
      <p class="course-video-status" role="status">Preparing secure video…</p>
    </div>
    <div class="course-video-controls" role="group" aria-label="Video resources">
      <button type="button" data-action="transcript" aria-expanded="false" aria-label="Toggle transcript">Transcript</button>
    </div>
    <figcaption class="course-video-transcript" hidden></figcaption>
  </figure>`;

function transcriptControl(root, transcriptUrl) {
  const button = root.querySelector('[data-action="transcript"]');
  const panel = root.querySelector(".course-video-transcript");
  button.addEventListener("click", async () => {
    const open = !panel.hidden;
    if (!open && !panel.dataset.loaded && transcriptUrl) {
      panel.dataset.loaded = "1";
      panel.textContent = "Loading transcript…";
      try {
        const response = await fetch(transcriptUrl, { credentials: "same-origin", headers: { accept: "text/plain" } });
        panel.textContent = response.ok ? await response.text() : "Transcript unavailable.";
      } catch { panel.textContent = "Transcript unavailable."; }
    }
    panel.hidden = open;
    button.setAttribute("aria-expanded", String(!open));
  });
}

class CourseVideo extends HTMLElement {
  connectedCallback() {
    if (this.dataset.initialized) return;
    this.dataset.initialized = "1";
    if (this.getAttribute("provider") === "cloudflare-stream") this.connectStream();
    else this.connectNative();
  }

  disconnectedCallback() {
    clearInterval(this.heartbeat);
    this.heartbeat = null;
  }

  connectNative() {
    const source = this.getAttribute("src") || "";
    const captions = this.getAttribute("captions") || "";
    const transcriptSrc = this.getAttribute("transcript") || "";
    this.innerHTML = nativeTemplate;
    const video = this.querySelector("video");
    video.src = source;
    video.autoplay = false;
    video.removeAttribute("autoplay");
    if (captions) {
      const track = document.createElement("track");
      track.kind = "captions";
      track.src = captions;
      track.srclang = this.getAttribute("captions-lang") || "en";
      track.label = "Captions";
      track.default = true;
      video.appendChild(track);
    }
    const play = this.querySelector('[data-action="play"]');
    play.addEventListener("click", () => {
      if (video.paused) { video.play(); play.textContent = "Pause"; play.setAttribute("aria-label", "Pause"); }
      else { video.pause(); play.textContent = "Play"; play.setAttribute("aria-label", "Play"); }
    });
    this.querySelector('[data-action="rewind"]').addEventListener("click", () => {
      video.currentTime = Math.max(0, video.currentTime - 10);
    });
    this.querySelector('[data-action="speed"]').addEventListener("change", (event) => {
      video.playbackRate = Number(event.target.value) || 1;
    });
    const captionsButton = this.querySelector('[data-action="captions"]');
    captionsButton.addEventListener("click", () => {
      const track = video.textTracks?.[0];
      if (!track) return;
      const showing = track.mode === "showing";
      track.mode = showing ? "hidden" : "showing";
      captionsButton.setAttribute("aria-pressed", String(!showing));
    });
    transcriptControl(this, transcriptSrc);
  }

  async connectStream() {
    this.innerHTML = streamTemplate;
    const assetKey = this.getAttribute("asset-key") || "";
    const enrollmentId = this.getAttribute("enrollment-id") || "";
    const label = this.getAttribute("label") || "Course video";
    const expectedDuration = Number(this.getAttribute("duration-seconds") || 0);
    const shell = this.querySelector("[data-stream-shell]");
    const transcriptUrl = `/api/stream/transcript?asset=${encodeURIComponent(assetKey)}&enrollment_id=${encodeURIComponent(enrollmentId)}`;
    transcriptControl(this, transcriptUrl);
    try {
      const response = await fetch(`/api/stream/playback?asset=${encodeURIComponent(assetKey)}&enrollment_id=${encodeURIComponent(enrollmentId)}`, {
        credentials: "same-origin",
        headers: { accept: "application/json" },
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok || !payload.iframeUrl) throw new Error(payload.error || "stream_playback_unavailable");
      const iframe = document.createElement("iframe");
      iframe.src = payload.iframeUrl;
      iframe.title = label;
      iframe.loading = "eager";
      iframe.allow = "accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture";
      iframe.allowFullscreen = true;
      iframe.referrerPolicy = "strict-origin-when-cross-origin";
      shell.replaceChildren(iframe);
      const StreamPlayer = await loadStreamSdk();
      const player = StreamPlayer(iframe);
      this.player = player;
      this.playbackSessionId = crypto.randomUUID();
      this.clientSequence = 0;
      const send = (eventType) => this.sendEvidence(eventType, expectedDuration);
      player.addEventListener("play", () => {
        send("play");
        clearInterval(this.heartbeat);
        this.heartbeat = setInterval(() => send("heartbeat"), 15000);
      });
      player.addEventListener("pause", () => { clearInterval(this.heartbeat); send("pause"); });
      player.addEventListener("seeked", () => send("seeked"));
      player.addEventListener("ratechange", () => send("ratechange"));
      player.addEventListener("ended", () => { clearInterval(this.heartbeat); send("ended"); });
      player.addEventListener("error", () => { clearInterval(this.heartbeat); send("error"); });
    } catch {
      shell.innerHTML = '<p class="course-video-status course-video-error" role="alert">Secure video is temporarily unavailable. Your course progress is unaffected.</p>';
    }
  }

  sendEvidence(eventType, expectedDuration) {
    if (!this.player || !this.playbackSessionId) return;
    const position = Number(this.player.currentTime || 0);
    const duration = Number(this.player.duration || expectedDuration);
    const rate = Number(this.player.playbackRate || 1);
    if (!Number.isFinite(position) || !Number.isFinite(duration) || duration <= 0) return;
    const body = {
      assetKey: this.getAttribute("asset-key") || "",
      enrollmentId: this.getAttribute("enrollment-id") || "",
      eventType,
      sessionId: this.playbackSessionId,
      clientSequence: this.clientSequence++,
      positionSeconds: position,
      mediaDurationSeconds: duration,
      playbackRate: rate,
    };
    fetch("/api/stream/events", {
      method: "POST",
      credentials: "same-origin",
      keepalive: true,
      headers: { "content-type": "application/json", accept: "application/json" },
      body: JSON.stringify(body),
    }).catch(() => null);
  }
}

if (!customElements.get("course-video")) customElements.define("course-video", CourseVideo);
export {};
