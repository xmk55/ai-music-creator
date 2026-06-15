/** Visual theme definitions — colors, gradients, and decorative emojis */

export const THEMES = {
  midnight: {
    id: "midnight",
    name: "Midnight Studio",
    icon: "🌙",
    bg: "#08080e",
    surface: "#111118",
    surface2: "#1a1a24",
    border: "rgba(255,255,255,0.08)",
    text: "#f2f2f8",
    muted: "#8a8aa0",
    accent: "#7c5cff",
    accent2: "#ff6bcb",
    glow: "rgba(124,92,255,0.35)",
    gradient1: "rgba(124,92,255,0.2)",
    gradient2: "rgba(255,107,203,0.12)",
    emojis: ["🎵", "🎹", "🎧", "✨", "🎶", "🎼"],
  },
  tropical: {
    id: "tropical",
    name: "Tropical",
    icon: "🌴",
    bg: "#061420",
    surface: "#0a2438",
    surface2: "#0f3350",
    border: "rgba(0,212,170,0.15)",
    text: "#e8fff8",
    muted: "#7ec8b8",
    accent: "#00d4aa",
    accent2: "#ffb347",
    glow: "rgba(0,212,170,0.35)",
    gradient1: "rgba(0,180,160,0.22)",
    gradient2: "rgba(255,179,71,0.14)",
    emojis: ["🐠", "🌊", "💧", "🌴", "☀️", "🦩", "🐚", "🏝️"],
  },
  cosmic: {
    id: "cosmic",
    name: "Cosmic",
    icon: "🚀",
    bg: "#0b0618",
    surface: "#150d28",
    surface2: "#1f1440",
    border: "rgba(167,139,250,0.15)",
    text: "#f0ebff",
    muted: "#a89cc8",
    accent: "#a78bfa",
    accent2: "#f472b6",
    glow: "rgba(167,139,250,0.4)",
    gradient1: "rgba(167,139,250,0.25)",
    gradient2: "rgba(244,114,182,0.15)",
    emojis: ["🚀", "🌌", "⭐", "🪐", "✨", "🌠", "👽", "🔮"],
  },
  forest: {
    id: "forest",
    name: "Forest",
    icon: "🌲",
    bg: "#071008",
    surface: "#0f1f14",
    surface2: "#162a1c",
    border: "rgba(74,222,128,0.12)",
    text: "#ecfdf0",
    muted: "#86b896",
    accent: "#4ade80",
    accent2: "#a3e635",
    glow: "rgba(74,222,128,0.3)",
    gradient1: "rgba(74,222,128,0.18)",
    gradient2: "rgba(163,230,53,0.12)",
    emojis: ["🌲", "🍃", "🦋", "🌿", "🐦", "🌸", "🍄", "🦌"],
  },
  sunset: {
    id: "sunset",
    name: "Sunset",
    icon: "🌅",
    bg: "#140808",
    surface: "#241010",
    surface2: "#341818",
    border: "rgba(251,146,60,0.15)",
    text: "#fff5f0",
    muted: "#c9a090",
    accent: "#fb923c",
    accent2: "#f43f5e",
    glow: "rgba(251,146,60,0.35)",
    gradient1: "rgba(251,146,60,0.22)",
    gradient2: "rgba(244,63,94,0.15)",
    emojis: ["🌅", "🔥", "🌇", "☁️", "🧡", "🌆", "✨", "🎸"],
  },
  neon: {
    id: "neon",
    name: "Neon City",
    icon: "⚡",
    bg: "#050510",
    surface: "#0c0c1a",
    surface2: "#14142a",
    border: "rgba(0,255,200,0.12)",
    text: "#e0fff8",
    muted: "#70a0a0",
    accent: "#00ffc8",
    accent2: "#ff00aa",
    glow: "rgba(0,255,200,0.35)",
    gradient1: "rgba(0,255,200,0.15)",
    gradient2: "rgba(255,0,170,0.12)",
    emojis: ["⚡", "🌃", "🎛️", "💿", "🔊", "🎤", "🪩", "💜"],
  },
};

export function applyTheme(themeId) {
  const theme = THEMES[themeId] || THEMES.midnight;
  const root = document.documentElement;

  root.dataset.theme = themeId;
  root.style.setProperty("--bg", theme.bg);
  root.style.setProperty("--surface", theme.surface);
  root.style.setProperty("--surface-2", theme.surface2);
  root.style.setProperty("--border", theme.border);
  root.style.setProperty("--text", theme.text);
  root.style.setProperty("--muted", theme.muted);
  root.style.setProperty("--accent", theme.accent);
  root.style.setProperty("--accent-2", theme.accent2);
  root.style.setProperty("--accent-glow", theme.glow);
  root.style.setProperty("--gradient-1", theme.gradient1);
  root.style.setProperty("--gradient-2", theme.gradient2);

  document.getElementById("themeLabel").textContent = theme.name;
  renderDecorations(theme.emojis);
  localStorage.setItem("musicCreatorTheme", themeId);
}

function renderDecorations(emojis) {
  document.querySelectorAll(".emoji-decorations").forEach((container) => {
    container.innerHTML = "";
    emojis.forEach((emoji, i) => {
      const span = document.createElement("span");
      span.className = "floating-emoji";
      span.textContent = emoji;
      span.style.left = `${8 + (i * 11) % 84}%`;
      span.style.top = `${10 + (i * 17) % 70}%`;
      span.style.animationDelay = `${i * 0.7}s`;
      span.style.animationDuration = `${4 + (i % 3)}s`;
      span.style.fontSize = `${1.2 + (i % 3) * 0.35}rem`;
      span.style.opacity = `${0.15 + (i % 4) * 0.05}`;
      container.appendChild(span);
    });
  });
}

export function initTheme() {
  const saved = localStorage.getItem("musicCreatorTheme") || "midnight";
  applyTheme(saved in THEMES ? saved : "midnight");

  document.querySelectorAll(".theme-option").forEach((btn) => {
    btn.addEventListener("click", () => {
      applyTheme(btn.dataset.theme);
      document.querySelectorAll(".theme-option").forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
    });
  });

  const activeBtn = document.querySelector(`.theme-option[data-theme="${saved}"]`);
  if (activeBtn) activeBtn.classList.add("active");
}
