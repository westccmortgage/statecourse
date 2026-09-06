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

const STATE_ACCESS = Object.freeze({
  available: {
    optionLabel: "Available",
    message: (state) => `${state.state_name}: Available. Review the current approved offering and enrollment status.`,
  },
  development: {
    optionLabel: "In development · Free practice",
    message: (state) => `${state.state_name}: In development — free practice access only. No payment, enrollment, licensing credit, or certificate.`,
  },
  coming: {
    optionLabel: "Coming soon",
    message: (state) => `${state.state_name}: Coming soon. This state is listed for visibility but is not open yet.`,
  },
});

function classifyStateAccess(state, catalogStateCodes) {
  if (state.public_status === "Approved") return "available";
  if (catalogStateCodes.has(state.state_code)) return "development";
  return "coming";
}

function setFinderMessage(text, access = "") {
  message.textContent = text;
  message.dataset.access = access;
}

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
    const [registryResponse, catalogResponse] = await Promise.all([
      fetch(new URL("data/state-registry.json", platformRoot)),
      fetch(new URL("data/course-catalog.json", platformRoot)),
    ]);
    if (!registryResponse.ok || !catalogResponse.ok) throw new Error("State availability unavailable");
    const { states } = await registryResponse.json();
    const catalog = await catalogResponse.json();
    const catalogStateCodes = new Set(
      (catalog.categories || [])
        .flatMap((category) => category.programs || [])
        .flatMap((program) => (program.courses || []).map((course) => course.state_id || program.state_code))
    );
    const jurisdictions = [...states].sort((a, b) => a.state_name.localeCompare(b.state_name));
    for (const state of jurisdictions) {
      const access = classifyStateAccess(state, catalogStateCodes);
      const option = document.createElement("option");
      option.value = state.state_code;
      option.dataset.slug = slugify(state.state_name);
      option.dataset.stateName = state.state_name;
      option.dataset.access = access;
      option.textContent = `${state.state_name} — ${STATE_ACCESS[access].optionLabel}`;
      option.disabled = access === "coming";
      stateSelect.append(option);
    }
  } catch (error) {
    console.error(error);
    setFinderMessage("State selection is temporarily unavailable. Please use State Requirements.");
  }
}

stateSelect?.addEventListener("change", () => {
  const selected = stateSelect.selectedOptions[0];
  const access = selected?.dataset.access;
  if (!selected?.value || !STATE_ACCESS[access]) {
    setFinderMessage("Choose an Available or In development state. Coming soon states are listed but cannot be selected.");
    return;
  }
  setFinderMessage(STATE_ACCESS[access].message({ state_name: selected.dataset.stateName }), access);
});

document.querySelectorAll('input[name="intent"]').forEach((radio) => radio.addEventListener("change", () => updateGoalOptions(radio.value)));

finder?.addEventListener("submit", (event) => {
  event.preventDefault();
  const selected = stateSelect.selectedOptions[0];
  if (!selected?.value) {
    setFinderMessage("Choose an Available or In development state to continue.");
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
