/* CA-BLOCK-1 — <course-video>, the reusable course video component.
   Contract (enforced here and validated in config by validateCourseVideo):
     - never autoplays;
     - play/pause, rewind 10s, playback speed, captions toggle, keyboard accessible, responsive;
     - captions track and transcript are REQUIRED for a production-ready video — a video may never
       be the only place a legal rule appears, so the transcript/text equivalent always exists;
     - carries data-video-id, data-block-id and data-concepts so evidence and analytics can map
       playback to the block and concepts it supports.
   No video ships in the Assignment 1 pilot; the component exists so the architecture does. */

const template = `
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

class CourseVideo extends HTMLElement {
  connectedCallback() {
    const source = this.getAttribute("src") || "";
    const captions = this.getAttribute("captions") || "";
    const transcriptSrc = this.getAttribute("transcript") || "";
    this.innerHTML = template;
    const video = this.querySelector("video");
    video.src = source;
    video.autoplay = false;              /* contract: never autoplay */
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
    const transcriptButton = this.querySelector('[data-action="transcript"]');
    const transcriptPanel = this.querySelector(".course-video-transcript");
    transcriptButton.addEventListener("click", async () => {
      const open = !transcriptPanel.hidden;
      if (!open && !transcriptPanel.textContent && transcriptSrc) {
        try {
          const response = await fetch(transcriptSrc, { credentials: "same-origin" });
          transcriptPanel.textContent = response.ok ? await response.text() : "Transcript unavailable.";
        } catch { transcriptPanel.textContent = "Transcript unavailable."; }
      }
      transcriptPanel.hidden = open;
      transcriptButton.setAttribute("aria-expanded", String(!open));
    });
  }
}

if (!customElements.get("course-video")) customElements.define("course-video", CourseVideo);
export {};
