/*
 * Administration console.
 *
 * Two rules this file follows and the server does not trust it to follow:
 *   - it never sends an actor identity; who acted comes from the session cookie;
 *   - it never claims a release; it shows what the gate ledger says and asks the server.
 *
 * Every refusal is rendered with the server's own reason. "Placement failed" sends an
 * operator to look for a bug; "the accessibility review has not been recorded" sends them
 * to do the review.
 */

const SESSION = "/api/admin/session";
const CATALOG = "/api/admin/catalog";
const VIDEO = "/api/admin/video";

const $ = (selector) => document.querySelector(selector);
const esc = (value = "") => String(value ?? "").replace(
  /[&<>'"]/g,
  (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[character],
);
const words = (value) => String(value || "").replaceAll("_", " ");

const state = { roles: [], canPlace: false, targets: [], gateDefinitions: [], assets: [] };

async function api(path, options = {}) {
  const response = await fetch(path, {
    credentials: "same-origin",
    ...options,
    headers: { accept: "application/json", ...(options.headers || {}) },
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(body.error || `request_${response.status}`);
    error.status = response.status;
    error.detail = body.detail || null;
    throw error;
  }
  return body;
}

function send(path, payload) {
  return api(path, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(payload),
  });
}

/* ── session ───────────────────────────────────────────────────────────────────────────── */

function renderSession(session) {
  state.roles = session?.roles || [];
  const signedIn = Boolean(session?.user?.id);
  $("#signInForm").hidden = signedIn;
  $("#signOut").hidden = !signedIn;
  $("#sessionRoles").hidden = !signedIn;
  $("#console").hidden = !(signedIn && state.roles.length);

  if (!signedIn) {
    $("#sessionState").textContent = "Sign in with the account that carries your role binding.";
    return;
  }
  if (!state.roles.length) {
    /* The credential worked. Saying so, and naming what is missing, is the difference
       between "my password is broken" and "someone has to grant me a role". */
    $("#sessionState").textContent =
      `Signed in as ${session.user.email}. This account carries no staff role binding, so the console has nothing to show it.`;
    $("#sessionRoles").innerHTML = "";
    return;
  }
  $("#sessionState").textContent = `Signed in as ${session.user.email}.`;
  $("#sessionRoles").innerHTML = session.bindings.map((binding) => `
    <span class="role-chip">${esc(words(binding.actorRole))}${binding.scopeState ? ` · ${esc(binding.scopeState)}` : ""}</span>
  `).join("");
}

async function loadSession() {
  try {
    renderSession(await api(SESSION));
    if (state.roles.length) { loadCatalog(); loadVideo(); }
  } catch (error) {
    if (error.status === 401) renderSession(null);
    else $("#sessionState").textContent = `Session unavailable: ${words(error.message)}.`;
  }
}

$("#signInForm").addEventListener("submit", async (event) => {
  event.preventDefault();
  $("#sessionState").textContent = "Signing in…";
  try {
    const session = await send(SESSION, {
      email: $("#signInEmail").value.trim(),
      password: $("#signInPassword").value,
    });
    $("#signInPassword").value = "";
    renderSession(session);
    if (state.roles.length) { loadCatalog(); loadVideo(); }
  } catch (error) {
    $("#sessionState").textContent = `Sign-in failed: ${words(error.message)}.`;
  }
});

$("#signOut").addEventListener("click", async () => {
  await api(SESSION, { method: "DELETE" }).catch(() => null);
  renderSession(null);
});

/* ── tabs ──────────────────────────────────────────────────────────────────────────────── */

for (const tab of document.querySelectorAll(".tab")) {
  tab.addEventListener("click", () => {
    for (const other of document.querySelectorAll(".tab")) {
      const selected = other === tab;
      other.setAttribute("aria-selected", String(selected));
      $(`#${other.dataset.panel}`).hidden = !selected;
    }
  });
}

/* ── catalog ───────────────────────────────────────────────────────────────────────────── */

function sourceCard(name, source) {
  const available = source?.available !== false;
  const count = source?.courseCount ?? source?.rowCount ?? source?.assetCount ?? "—";
  return `<div class="source ${available ? "" : "source-down"}">
    <strong>${esc(words(name))}</strong>
    <span>${available ? esc(String(count)) : "unavailable"}</span>
    ${source?.error ? `<small>${esc(words(source.error))}</small>` : ""}
  </div>`;
}

function say(value) {
  if (value === true) return "yes";
  if (value === false) return "no";
  return value == null || value === "" ? "—" : String(value);
}

function catalogRow(row) {
  const video = row.video || {};
  const videoCell = [
    video.codeRegistry?.length ? `${video.codeRegistry.length} in code` : "",
    video.console?.length ? `${video.console.length} in console` : "",
    video.console?.some((asset) => asset.placement === "placed") ? "placed" : "",
  ].filter(Boolean).join(" · ") || "none";

  return `<tr class="${row.discrepancies.length ? "has-issues" : ""}">
    <td>${esc(say(row.state))}</td>
    <td><strong>${esc(say(row.name))}</strong><small class="mono">${esc(row.key)}</small>
      <small>${esc(words(row.matchedBy))}</small></td>
    <td>${row.publicEntry
      ? `listed<small>enrollment ${esc(say(row.publicEntry.enrollmentEnabled))}</small>`
      : "<em>absent</em>"}</td>
    <td>${row.payment
      ? `${esc(say(row.payment.approvalStatus))}<small>enrollment ${esc(say(row.payment.enrollmentEnabled))}</small>`
      : "<em>not sellable</em>"}</td>
    <td>${row.dbCourse
      ? `${esc(say(row.dbCourse.approval_status))}<small>enrollment ${esc(say(row.dbCourse.enrollment_enabled))}</small>`
      : "<em>no row</em>"}</td>
    <td>${esc(videoCell)}</td>
    <td>${row.discrepancies.length
      ? `<ul class="issues">${row.discrepancies.map((item) =>
        `<li><strong>${esc(words(item.code))}</strong> ${esc(item.detail)}</li>`).join("")}</ul>`
      : "<span class=\"agrees\">agrees</span>"}</td>
  </tr>`;
}

async function loadCatalog() {
  $("#catalogMessage").textContent = "Loading the catalog from every source…";
  try {
    const body = await api(CATALOG);
    const summary = body.summary;
    $("#catalogSummary").innerHTML = [
      ["Rows", summary.rows],
      ["Publicly listed", summary.publiclyListed],
      ["Sellable at checkout", summary.sellable],
      ["Enrollment enabled", summary.enrollmentEnabled],
      ["Approved in environment", summary.approvedInEnvironment],
      ["Rows with disagreements", summary.rowsWithDiscrepancies],
    ].map(([label, value]) => `<div class="stat"><span>${esc(label)}</span><strong>${esc(String(value))}</strong></div>`).join("");
    $("#catalogSummary").hidden = false;
    $("#catalogSources").innerHTML = Object.entries(body.sources)
      .map(([name, source]) => sourceCard(name, source)).join("");
    $("#catalogSources").hidden = false;
    $("#catalogRows").innerHTML = body.rows.map(catalogRow).join("");
    $("#catalogTable").hidden = false;
    $("#catalogMessage").textContent = `${body.disclaimer} Read at ${new Date(body.generatedAt).toLocaleString()}.`;
  } catch (error) {
    $("#catalogMessage").textContent = `Catalog unavailable: ${words(error.message)}.`;
  }
}

$("#reloadCatalog").addEventListener("click", loadCatalog);

/* ── video ─────────────────────────────────────────────────────────────────────────────── */

function gateRow(asset, definition) {
  const recorded = (asset.gates || []).find((gate) => gate.gate === definition.gate);
  const machine = definition.recordedBy === "stream_api";
  const outcome = recorded ? recorded.outcome : "not recorded";
  return `<tr class="gate-${esc(outcome.replace(/\s/g, "-"))}">
    <td>${esc(String(definition.sequence))}</td>
    <td><strong>${esc(words(definition.gate))}</strong><small>${esc(definition.description)}</small></td>
    <td>${esc(outcome)}${recorded?.reviewed_at ? `<small>${esc(new Date(recorded.reviewed_at).toLocaleString())}</small>` : ""}</td>
    <td>${machine
      ? "<em>recorded from the Stream API</em>"
      : `<form class="gate-form" data-asset="${esc(asset.asset_key)}" data-gate="${esc(definition.gate)}">
          <textarea name="note" rows="2" minlength="10" maxlength="2000" required
            placeholder="What was checked, and against what"></textarea>
          <div class="gate-actions">
            <button type="submit" value="pass" name="outcome">Record pass</button>
            <button type="submit" value="fail" name="outcome" class="secondary-button">Record fail</button>
          </div>
        </form>`}</td>
  </tr>`;
}

function assetCard(asset) {
  const readiness = asset.readiness || {};
  const outstanding = readiness.outstanding_gates || [];
  const placed = asset.placement?.placement_status === "placed";
  return `<article class="card asset" data-asset="${esc(asset.asset_key)}">
    <header class="asset-heading">
      <div>
        <h3>${esc(asset.label)}</h3>
        <p class="mono">${esc(asset.asset_key)} · ${esc(asset.course_id)} · ${esc(asset.delivery_id)} · ${esc(asset.screen_id)}</p>
      </div>
      <span class="stage stage-${esc(asset.stage)}">${esc(words(asset.stage))}</span>
    </header>
    <p class="note">
      ${esc(String(readiness.passed_gates ?? 0))} of ${esc(String(readiness.required_gates ?? "?"))} release conditions pass.
      ${outstanding.length ? `Outstanding: ${esc(outstanding.map(words).join(", "))}.` : "Nothing outstanding."}
    </p>
    ${asset.stream_uid
      ? ""
      : `<div class="confirm-row">
          <button type="button" class="confirm-upload" data-asset="${esc(asset.asset_key)}">
            Check what Cloudflare received
          </button>
          <small>Records the upload, signed-playback and origin conditions from the API response.</small>
        </div>`}
    <details ${outstanding.length ? "open" : ""}>
      <summary>Release conditions</summary>
      <div class="table-wrap">
        <table class="data-table">
          <thead><tr><th>#</th><th>Condition</th><th>Current</th><th>Record</th></tr></thead>
          <tbody>${state.gateDefinitions.map((definition) => gateRow(asset, definition)).join("")}</tbody>
        </table>
      </div>
    </details>
    ${state.canPlace ? `<div class="place-row">
      ${placed
        ? `<form class="withdraw-form" data-asset="${esc(asset.asset_key)}">
             <label><span>Reason for withdrawal</span>
               <textarea name="reason" rows="2" minlength="10" maxlength="2000" required></textarea></label>
             <button type="submit" class="secondary-button">Withdraw from students</button>
           </form>`
        : `<button type="button" class="place" data-asset="${esc(asset.asset_key)}"
             ${readiness.release_ready ? "" : "disabled"}>Place on the instruction screen</button>
           ${readiness.release_ready ? "" : "<small>Every release condition has to pass first.</small>"}`}
    </div>` : ""}
  </article>`;
}

function fillCourses(courseIds) {
  const select = $("#reserveCourse");
  const chosen = select.value;
  select.innerHTML = '<option value="">Select a course…</option>'
    + courseIds.map((id) => `<option value="${esc(id)}">${esc(id)}</option>`).join("");
  if (courseIds.includes(chosen)) select.value = chosen;
}

async function loadVideo(courseId) {
  $("#videoMessage").textContent = "Loading the video chain…";
  try {
    const query = courseId ? `?course_id=${encodeURIComponent(courseId)}` : "";
    const body = await api(`${VIDEO}${query}`);
    state.canPlace = body.viewer?.canPlace === true;
    state.gateDefinitions = body.gateDefinitions || [];
    state.assets = body.assets || [];
    state.targets = body.placementTargets || [];
    fillCourses([...new Set([...(body.placeableCourses || []), ...state.assets.map((asset) => asset.course_id)])].sort());
    $("#assetList").innerHTML = state.assets.length
      ? state.assets.map(assetCard).join("")
      : '<p class="note">No console-managed video yet. Reserve an upload to start one.</p>';
    $("#videoMessage").textContent = `${state.assets.length} asset(s). Placement ${state.canPlace ? "is" : "is not"} available to your roles.`;
  } catch (error) {
    $("#videoMessage").textContent = `Video console unavailable: ${words(error.message)}.`;
  }
}

$("#reloadVideo").addEventListener("click", () => loadVideo($("#reserveCourse").value || undefined));

/* Course, delivery unit and screen are chosen from what the block maps actually contain, so
   a placement cannot name a screen that does not exist. */
$("#reserveCourse").addEventListener("change", async (event) => {
  const courseId = event.target.value;
  const delivery = $("#reserveDelivery");
  const screen = $("#reserveScreen");
  delivery.disabled = true; screen.disabled = true;
  delivery.innerHTML = '<option value="">Loading…</option>';
  screen.innerHTML = '<option value="">Select a delivery unit first</option>';
  if (!courseId) { delivery.innerHTML = '<option value="">Select a course first</option>'; return; }
  await loadVideo(courseId);
  delivery.innerHTML = '<option value="">Select a delivery unit…</option>'
    + state.targets.map((target) =>
      `<option value="${esc(target.deliveryId)}">${esc(target.deliveryId)} (${target.instructionScreens.length} instruction screens)</option>`).join("");
  delivery.disabled = false;
});

$("#reserveDelivery").addEventListener("change", (event) => {
  const target = state.targets.find((entry) => entry.deliveryId === event.target.value);
  const screen = $("#reserveScreen");
  screen.innerHTML = '<option value="">Select an instruction screen…</option>'
    + (target?.instructionScreens || []).map((entry) =>
      `<option value="${esc(entry.screenId)}">${esc(entry.screenId)} — ${esc(entry.title || entry.blockId)}${entry.videoAssetKeys.length ? " (already carries video)" : ""}</option>`).join("");
  screen.disabled = !target;
});

async function sha256Hex(file) {
  const digest = await crypto.subtle.digest("SHA-256", await file.arrayBuffer());
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

/* The file goes to Cloudflare, not through us. XHR rather than fetch only because it
   reports upload progress, and a silent multi-minute upload looks like a hang. */
function putToCloudflare(url, file, onProgress) {
  return new Promise((resolve, reject) => {
    const form = new FormData();
    form.append("file", file);
    const request = new XMLHttpRequest();
    request.open("POST", url, true);
    request.upload.addEventListener("progress", (event) => {
      if (event.lengthComputable) onProgress(Math.round((event.loaded / event.total) * 100));
    });
    request.addEventListener("load", () => {
      if (request.status >= 200 && request.status < 300) resolve();
      else reject(new Error(`cloudflare_upload_failed_${request.status}`));
    });
    request.addEventListener("error", () => reject(new Error("cloudflare_upload_network_error")));
    request.send(form);
  });
}

$("#reserveForm").addEventListener("submit", async (event) => {
  event.preventDefault();
  const progress = $("#uploadProgress");
  const file = $("#reserveFile").files?.[0];
  if (!file) return;
  /* Held before the form is reset, so the reload afterwards still shows the course the
     operator was working in. */
  const courseId = $("#reserveCourse").value;
  progress.hidden = false;
  progress.textContent = "Reserving the upload…";
  try {
    const reservation = await send(VIDEO, {
      action: "reserve_upload",
      assetKey: $("#reserveAssetKey").value.trim(),
      courseId: $("#reserveCourse").value,
      deliveryId: $("#reserveDelivery").value,
      screenId: $("#reserveScreen").value,
      label: $("#reserveLabel").value.trim(),
      durationSeconds: Number($("#reserveDuration").value),
      transcriptPath: $("#reserveTranscript").value.trim(),
      captionsPath: $("#reserveCaptions").value.trim(),
    });
    progress.textContent = "Computing the file digest…";
    const digest = await sha256Hex(file);
    await putToCloudflare(reservation.uploadUrl, file, (percent) => {
      progress.textContent = `Uploading to Cloudflare… ${percent}%`;
    });
    progress.textContent = "Upload sent. Asking Cloudflare what it received…";
    const confirmation = await send(VIDEO, {
      action: "confirm_upload",
      assetKey: reservation.assetKey,
      sourceSha256: digest,
    });
    progress.textContent = confirmation.uploadState === "ready"
      ? `Cloudflare reports ready. ${confirmation.gatesRecorded.filter((gate) => gate.outcome === "pass").length} of the three delivery conditions pass.`
      : `Cloudflare is still encoding (${words(confirmation.uploadState)}). Use “Check what Cloudflare received” in a moment.`;
    event.currentTarget.reset();
    await loadVideo(courseId || undefined);
  } catch (error) {
    const detail = error.detail ? ` (${esc(JSON.stringify(error.detail))})` : "";
    progress.textContent = `Upload refused: ${words(error.message)}${detail}.`;
  }
});

/* One listener for the asset list, because its contents are replaced on every reload. */
$("#assetList").addEventListener("click", async (event) => {
  const confirmButton = event.target.closest(".confirm-upload");
  if (confirmButton) {
    $("#videoMessage").textContent = "Asking Cloudflare…";
    try {
      const body = await send(VIDEO, { action: "confirm_upload", assetKey: confirmButton.dataset.asset });
      $("#videoMessage").textContent = `Cloudflare reports ${words(body.uploadState)}.`;
    } catch (error) {
      $("#videoMessage").textContent = `Refused: ${words(error.message)}.`;
    }
    await loadVideo($("#reserveCourse").value || undefined);
    return;
  }
  const placeButton = event.target.closest(".place");
  if (placeButton) {
    $("#videoMessage").textContent = "Placing…";
    try {
      await send(VIDEO, { action: "place", assetKey: placeButton.dataset.asset });
      $("#videoMessage").textContent = "Placed. The delivery path will serve it to enrolled students on that screen.";
    } catch (error) {
      const outstanding = error.detail?.outstandingGates;
      $("#videoMessage").textContent = outstanding
        ? `Placement refused. Outstanding: ${outstanding.map(words).join(", ")}.`
        : `Placement refused: ${words(error.message)}.`;
    }
    await loadVideo($("#reserveCourse").value || undefined);
  }
});

$("#assetList").addEventListener("submit", async (event) => {
  const form = event.target;
  event.preventDefault();
  const data = new FormData(form, event.submitter);
  if (form.classList.contains("gate-form")) {
    try {
      await send(VIDEO, {
        action: "record_gate",
        assetKey: form.dataset.asset,
        gate: form.dataset.gate,
        outcome: data.get("outcome"),
        note: data.get("note"),
      });
      $("#videoMessage").textContent = `Recorded ${words(form.dataset.gate)}.`;
    } catch (error) {
      $("#videoMessage").textContent = `Refused: ${words(error.message)}.`;
    }
  } else if (form.classList.contains("withdraw-form")) {
    try {
      await send(VIDEO, { action: "withdraw", assetKey: form.dataset.asset, reason: data.get("reason") });
      $("#videoMessage").textContent = "Withdrawn. Students no longer receive it.";
    } catch (error) {
      $("#videoMessage").textContent = `Refused: ${words(error.message)}.`;
    }
  } else return;
  await loadVideo($("#reserveCourse").value || undefined);
});

loadSession();
