import { initTheme } from "./themes.js";

const state = {
  createPoll: null,
  remixPoll: null,
  remixFile: null,
};

const $ = (id) => document.getElementById(id);

function formatError(detail) {
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail)) return detail.map((d) => d.msg || d).join(", ");
  return "Request failed";
}

async function checkHealth() {
  try {
    const res = await fetch("/api/health");
    const data = await res.json();
    const gpu = data.cuda_available ? "GPU accelerated" : "CPU mode";
    $("systemInfo").textContent = `v${data.version} · ${gpu} · Create + Remix ready`;
  } catch {
    $("systemInfo").textContent = "Connecting to server...";
  }
}

function initTabs() {
  document.querySelectorAll(".tab-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const tab = btn.dataset.tab;
      document.querySelectorAll(".tab-btn").forEach((b) => b.classList.remove("active"));
      document.querySelectorAll(".tab-panel").forEach((p) => p.classList.remove("active"));
      btn.classList.add("active");
      $(`${tab}Panel`).classList.add("active");
    });
  });
}

function bindSliders() {
  const pairs = [
    ["duration", "durationLabel", (v) => `${v}s`],
    ["guidance", "guidanceLabel", (v) => v],
    ["temperature", "temperatureLabel", (v) => v],
    ["remixDuration", "remixDurationLabel", (v) => `${v}s`],
    ["remixGuidance", "remixGuidanceLabel", (v) => v],
    ["remixTemperature", "remixTemperatureLabel", (v) => v],
  ];

  pairs.forEach(([inputId, labelId, fmt]) => {
    const input = $(inputId);
    const label = $(labelId);
    if (!input || !label) return;
    input.addEventListener("input", () => {
      label.textContent = fmt(input.value);
    });
  });
}

function bindExampleChips() {
  document.querySelectorAll(".example-chip").forEach((chip) => {
    chip.addEventListener("click", () => {
      const target = chip.dataset.target || "prompt";
      const el = $(target);
      if (el) {
        el.value = chip.dataset.prompt;
        el.focus();
      }
    });
  });
}

function showError(boxId, msg) {
  const box = $(boxId);
  box.textContent = msg;
  box.classList.add("visible");
}

function hideError(boxId) {
  $(boxId).classList.remove("visible");
}

function setBusy(section, active) {
  const btn = section === "create" ? $("generateBtn") : $("remixBtn");
  const panel = section === "create" ? $("createStatusPanel") : $("remixStatusPanel");
  btn.disabled = active;
  panel.classList.toggle("visible", active);
  if (active) {
    $(section === "create" ? "createPlayerPanel" : "remixPlayerPanel").classList.remove("visible");
  }
}

async function pollJob(jobId, section) {
  const res = await fetch(`/api/status/${jobId}`);
  const data = await res.json();

  const statusText = $(section === "create" ? "createStatusText" : "remixStatusText");
  const statusMeta = $(section === "create" ? "createStatusMeta" : "remixStatusMeta");
  const playerPanel = $(section === "create" ? "createPlayerPanel" : "remixPlayerPanel");
  const audioPlayer = $(section === "create" ? "createAudioPlayer" : "remixAudioPlayer");
  const trackPrompt = $(section === "create" ? "createTrackPrompt" : "remixTrackPrompt");
  const downloadBtn = $(section === "create" ? "createDownloadBtn" : "remixDownloadBtn");
  const errorBox = section === "create" ? "createErrorBox" : "remixErrorBox";
  const pollKey = section === "create" ? "createPoll" : "remixPoll";

  if (data.status === "queued") {
    statusText.textContent = section === "remix"
      ? "Queued — loading remix model (first run downloads ~1.5 GB)..."
      : "Queued — loading AI model (first run may take a minute)...";
  } else if (data.status === "generating") {
    statusText.textContent = section === "remix" ? "Remixing your track..." : "Composing your track...";
    statusMeta.textContent = "Generating full audio buffer for smooth playback";
  } else if (data.status === "complete") {
    clearInterval(state[pollKey]);
    state[pollKey] = null;
    setBusy(section, false);
    $(section === "create" ? "createStatusPanel" : "remixStatusPanel").classList.remove("visible");

    const url = `${data.download_url}?t=${Date.now()}`;
    audioPlayer.src = url;
    trackPrompt.textContent = `"${data.prompt}"`;
    downloadBtn.href = url;
    playerPanel.classList.add("visible");
    statusMeta.textContent = `${data.duration_seconds}s · ${data.model_name.split("/").pop()} · ${data.device}`;
    audioPlayer.play().catch(() => {});
  } else if (data.status === "failed") {
    clearInterval(state[pollKey]);
    state[pollKey] = null;
    setBusy(section, false);
    $(section === "create" ? "createStatusPanel" : "remixStatusPanel").classList.remove("visible");
    showError(errorBox, data.error || "Generation failed. Try a different prompt.");
  }
}

async function startCreate() {
  const prompt = $("prompt").value.trim();
  if (prompt.length < 3) {
    showError("createErrorBox", "Please enter a prompt (at least 3 characters).");
    return;
  }

  hideError("createErrorBox");
  setBusy("create", true);
  $("createStatusText").textContent = "Sending prompt to AI...";
  $("createStatusMeta").textContent = "";

  try {
    const res = await fetch("/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        prompt,
        duration: parseFloat($("duration").value),
        guidance_scale: parseFloat($("guidance").value),
        temperature: parseFloat($("temperature").value),
      }),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(formatError(err.detail));
    }

    const { job_id } = await res.json();
    state.createPoll = setInterval(() => pollJob(job_id, "create"), 1500);
    pollJob(job_id, "create");
  } catch (err) {
    setBusy("create", false);
    $("createStatusPanel").classList.remove("visible");
    showError("createErrorBox", err.message);
  }
}

function initUpload() {
  const dropzone = $("uploadDropzone");
  const fileInput = $("remixFile");
  const fileName = $("uploadFileName");
  const filePreview = $("uploadPreview");

  function setFile(file) {
    if (!file) return;
    const ext = file.name.split(".").pop().toLowerCase();
    if (!["mp3", "wav", "m4a", "ogg", "flac"].includes(ext)) {
      showError("remixErrorBox", "Supported formats: MP3, WAV, M4A, OGG, FLAC.");
      return;
    }
    if (file.size > 25 * 1024 * 1024) {
      showError("remixErrorBox", "File too large (max 25 MB).");
      return;
    }
    state.remixFile = file;
    fileName.textContent = file.name;
    dropzone.classList.add("has-file");
    hideError("remixErrorBox");

    const url = URL.createObjectURL(file);
    filePreview.src = url;
    filePreview.classList.add("visible");
  }

  fileInput.addEventListener("change", () => {
    if (fileInput.files[0]) setFile(fileInput.files[0]);
  });

  dropzone.addEventListener("click", () => fileInput.click());

  dropzone.addEventListener("dragover", (e) => {
    e.preventDefault();
    dropzone.classList.add("dragover");
  });

  dropzone.addEventListener("dragleave", () => dropzone.classList.remove("dragover"));

  dropzone.addEventListener("drop", (e) => {
    e.preventDefault();
    dropzone.classList.remove("dragover");
    if (e.dataTransfer.files[0]) setFile(e.dataTransfer.files[0]);
  });
}

async function startRemix() {
  const prompt = $("remixPrompt").value.trim();
  if (prompt.length < 3) {
    showError("remixErrorBox", "Please describe how you want the remix to sound.");
    return;
  }
  if (!state.remixFile) {
    showError("remixErrorBox", "Please upload a song to remix.");
    return;
  }

  hideError("remixErrorBox");
  setBusy("remix", true);
  $("remixStatusText").textContent = "Uploading and starting remix...";
  $("remixStatusMeta").textContent = "";

  const form = new FormData();
  form.append("prompt", prompt);
  form.append("duration", $("remixDuration").value);
  form.append("guidance_scale", $("remixGuidance").value);
  form.append("temperature", $("remixTemperature").value);
  form.append("file", state.remixFile);

  try {
    const res = await fetch("/api/remix", { method: "POST", body: form });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(formatError(err.detail));
    }

    const { job_id } = await res.json();
    state.remixPoll = setInterval(() => pollJob(job_id, "remix"), 1500);
    pollJob(job_id, "remix");
  } catch (err) {
    setBusy("remix", false);
    $("remixStatusPanel").classList.remove("visible");
    showError("remixErrorBox", err.message);
  }
}

function initActions() {
  $("generateBtn").addEventListener("click", startCreate);
  $("remixBtn").addEventListener("click", startRemix);

  $("createNewBtn").addEventListener("click", () => {
    $("createPlayerPanel").classList.remove("visible");
    $("createAudioPlayer").pause();
    $("createAudioPlayer").src = "";
    $("prompt").focus();
  });

  $("remixNewBtn").addEventListener("click", () => {
    $("remixPlayerPanel").classList.remove("visible");
    $("remixAudioPlayer").pause();
    $("remixAudioPlayer").src = "";
    $("remixPrompt").focus();
  });
}

document.addEventListener("DOMContentLoaded", () => {
  initTheme();
  initTabs();
  bindSliders();
  bindExampleChips();
  initUpload();
  initActions();
  checkHealth();
});
