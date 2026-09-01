const stateSelect = document.querySelector("#homeStateSelect");
const goalSelect = document.querySelector("#homeGoalSelect");
const finder = document.querySelector("#licensing-finder");
const message = document.querySelector("#finderMessage");
const platformRoot = new URL("./", document.currentScript.src);
const introVideo = document.querySelector("#statecourseIntroVideo");
const introFrame = document.querySelector("#introVideoFrame");
const introPlay = document.querySelector("#introPlay");
const introEndCard = document.querySelector("#introEndCard");
const introReplay = document.querySelector("#introReplay");
const introCaptions = document.querySelector("#statecourseIntroCaptions");
const introConfig = {
  videoId: "statecourse-national-introduction",
  src: "https://statecourse.com/media/statecourse-intro.mp4",
  poster: new URL("media/statecourse-intro-poster.webp", platformRoot).href,
  captions: new URL("media/statecourse-intro.vtt", platformRoot).href,
  regulatedInstruction: false,
};
const videoMilestones = new Set();
let videoVisibleTracked = false;
let videoPlayTracked = false;

const slugify = (name) => name.toLowerCase().replaceAll(/[^a-z0-9]+/g, "-").replaceAll(/^-|-$/g, "");

function trackMarketingVideo(action,detail={}) {
  const payload = {
    event: `statecourse_intro_${action}`,
    video_id: introConfig.videoId,
    placement: "national_home_below_finder",
    marketing_only: true,
    regulated_progress: false,
    ...detail,
  };
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push(payload);
  window.dispatchEvent(new CustomEvent("statecourse:marketing-video",{ detail:payload }));
}

async function loadIntroConfiguration() {
  if (!introVideo) return;
  try {
    const response = await fetch(new URL("data/homepage-video.json",platformRoot));
    if (!response.ok) throw new Error("Video configuration unavailable");
    const configuration = await response.json();
    if (configuration.src) introConfig.src = new URL(configuration.src,platformRoot).href;
    if (configuration.poster) introConfig.poster = new URL(configuration.poster,platformRoot).href;
    if (configuration.captions) introConfig.captions = new URL(configuration.captions,platformRoot).href;
    if (configuration.videoId) introConfig.videoId = configuration.videoId;
    introConfig.regulatedInstruction = configuration.regulatedInstruction === true;
    if (!introVideo.currentSrc) introVideo.poster = introConfig.poster;
    if (introCaptions) introCaptions.src = introConfig.captions;
  } catch (error) {
    console.warn(error);
  }
}

function prepareIntroVideo() {
  if (!introVideo || introVideo.getAttribute("src")) return;
  introVideo.setAttribute("src",introConfig.src);
  introVideo.controls = true;
  introVideo.load();
}

function playIntroVideo({ restart=false }={}) {
  if (!introVideo) return;
  prepareIntroVideo();
  if (restart) introVideo.currentTime = 0;
  introEndCard.hidden = true;
  introFrame.classList.remove("has-ended");
  introFrame.classList.add("is-playing");
  introVideo.controls = true;
  introVideo.removeAttribute("aria-hidden");
  const playRequest = introVideo.play();
  if (playRequest?.catch) playRequest.catch(() => {
    introFrame.classList.remove("is-playing");
    introVideo.controls = true;
  });
}

function initializeIntroVideo() {
  if (!introVideo) return;
  loadIntroConfiguration();

  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver((entries) => {
      if (!videoVisibleTracked && entries.some((entry) => entry.isIntersecting && entry.intersectionRatio >= .45)) {
        videoVisibleTracked = true;
        trackMarketingVideo("visible");
        observer.disconnect();
      }
    },{ threshold:[.45] });
    observer.observe(introFrame);
  }

  introPlay?.addEventListener("click",() => playIntroVideo());
  introReplay?.addEventListener("click",() => playIntroVideo({ restart:true }));

  introVideo.addEventListener("loadedmetadata",() => {
    if (introVideo.textTracks?.[0]) introVideo.textTracks[0].mode = "showing";
  });
  introVideo.addEventListener("play",() => {
    introFrame.classList.add("is-playing");
    if (!videoPlayTracked) {
      videoPlayTracked = true;
      trackMarketingVideo("play");
    }
  });
  introVideo.addEventListener("timeupdate",() => {
    if (!introVideo.duration) return;
    const progress = introVideo.currentTime / introVideo.duration;
    [[.25,"25_percent"],[.5,"50_percent"],[.75,"75_percent"]].forEach(([threshold,label]) => {
      if (progress >= threshold && !videoMilestones.has(label)) {
        videoMilestones.add(label);
        trackMarketingVideo(label,{ percent:Math.round(threshold*100) });
      }
    });
  });
  introVideo.addEventListener("ended",() => {
    trackMarketingVideo("completed",{ percent:100 });
    introVideo.controls = false;
    introVideo.setAttribute("aria-hidden","true");
    introFrame.classList.add("has-ended");
    introEndCard.hidden = false;
    introEndCard.querySelector("a")?.focus();
  });

  document.querySelectorAll("[data-video-cta]").forEach((link) => link.addEventListener("click",(event) => {
    const action = link.dataset.videoCta;
    trackMarketingVideo(action === "choose-state" ? "choose_state_after_video" : "explore_requirements_after_video");
    if (action === "choose-state") {
      event.preventDefault();
      finder.scrollIntoView({ behavior:window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",block:"center" });
      window.setTimeout(() => stateSelect.focus(),300);
    }
  }));
}

function updateGoalOptions(intent) {
  const options = {
    licensed: [["first-license", "First real estate license"], ["broker", "Broker education"], ["requirements", "Understand requirements"]],
    /* Two of these options used to name products that exist in no jurisdiction — a
       practice-question bank and a certificate lookup — and neither destination page
       could honour them. Each option now describes something the destination can
       actually answer for the selected state. */
    exam: [["exam-rules", "Understand my state's examination"], ["exam-education", "See the education required before the exam"], ["exam-availability", "Check StateCourse exam preparation availability"]],
    renew: [["renewal-rules", "Understand my state's renewal requirements"], ["ce-availability", "Check StateCourse continuing-education availability"], ["ce-regulator", "Find the regulator's renewal instructions"]],
  };
  goalSelect.innerHTML = options[intent].map(([value, label]) => `<option value="${value}">${label}</option>`).join("");
}

async function loadStates() {
  try {
    const response = await fetch(new URL("data/state-registry.json", platformRoot));
    if (!response.ok) throw new Error("State registry unavailable");
    const { states } = await response.json();
    const jurisdictions = [...states].sort((a, b) => a.state_name.localeCompare(b.state_name));
    stateSelect.insertAdjacentHTML("beforeend", jurisdictions.map((state) => `<option value="${state.state_code}" data-slug="${slugify(state.state_name)}">${state.state_name}</option>`).join(""));
  } catch (error) {
    console.error(error);
    message.textContent = "State selection is temporarily unavailable. Please use State Requirements.";
  }
}

document.querySelectorAll('input[name="intent"]').forEach((radio) => radio.addEventListener("change", () => updateGoalOptions(radio.value)));

finder?.addEventListener("submit", (event) => {
  event.preventDefault();
  const selected = stateSelect.selectedOptions[0];
  if (!selected?.value) {
    message.textContent = "Choose a state to continue.";
    stateSelect.focus();
    return;
  }
  const intent = document.querySelector('input[name="intent"]:checked')?.value || "licensed";
  if (intent === "exam") window.location.href = new URL(`exam-prep/?state=${encodeURIComponent(selected.value)}`, platformRoot);
  else if (intent === "renew") window.location.href = new URL(`continuing-education/?state=${encodeURIComponent(selected.value)}`, platformRoot);
  else window.location.href = new URL(`real-estate/${selected.dataset.slug}/`, platformRoot);
});

loadStates();
initializeIntroVideo();
