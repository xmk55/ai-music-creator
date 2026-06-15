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
    emojis: ["🎵", "🎹", "🎧", "✨", "🎶", "🎼", "🎤", "🔊", "💿", "🪩"],
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
    emojis: ["🐠", "🌊", "💧", "🌴", "☀️", "🦩", "🐚", "🏝️", "🥥", "🌺"],
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
    emojis: ["🚀", "🌌", "⭐", "🪐", "✨", "🌠", "👽", "🔮", "🛸", "🌙"],
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
    emojis: ["🌲", "🍃", "🦋", "🌿", "🐦", "🌸", "🍄", "🦌", "🐿️", "🌾"],
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
    emojis: ["🌅", "🔥", "🌇", "☁️", "🧡", "🌆", "✨", "🎸", "🌄", "🦜"],
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
    emojis: ["⚡", "🌃", "🎛️", "💿", "🔊", "🎤", "🪩", "💜", "🖥️", "🌈"],
  },
  sakura: {
    id: "sakura",
    name: "Sakura",
    icon: "🌸",
    bg: "#120810",
    surface: "#1e1020",
    surface2: "#2a1830",
    border: "rgba(244,114,182,0.15)",
    text: "#fff0f8",
    muted: "#c490a8",
    accent: "#f472b6",
    accent2: "#fda4af",
    glow: "rgba(244,114,182,0.35)",
    gradient1: "rgba(244,114,182,0.2)",
    gradient2: "rgba(253,164,175,0.14)",
    emojis: ["🌸", "🌷", "💮", "🎀", "✨", "🦢", "🍡", "🏯", "💕", "🌺"],
  },
  ocean: {
    id: "ocean",
    name: "Deep Ocean",
    icon: "🐋",
    bg: "#030818",
    surface: "#081428",
    surface2: "#0c2040",
    border: "rgba(56,189,248,0.15)",
    text: "#e0f4ff",
    muted: "#6aa0c0",
    accent: "#38bdf8",
    accent2: "#818cf8",
    glow: "rgba(56,189,248,0.35)",
    gradient1: "rgba(56,189,248,0.2)",
    gradient2: "rgba(129,140,248,0.14)",
    emojis: ["🐋", "🐙", "🦈", "🌊", "💧", "🐚", "🪸", "⚓", "🫧", "🐬"],
  },
  candy: {
    id: "candy",
    name: "Candy Pop",
    icon: "🍬",
    bg: "#100818",
    surface: "#1a1028",
    surface2: "#241838",
    border: "rgba(232,121,249,0.15)",
    text: "#fdf4ff",
    muted: "#c490d0",
    accent: "#e879f9",
    accent2: "#f472b6",
    glow: "rgba(232,121,249,0.35)",
    gradient1: "rgba(232,121,249,0.2)",
    gradient2: "rgba(244,114,182,0.14)",
    emojis: ["🍬", "🍭", "🧁", "🍩", "🍦", "🎂", "💖", "✨", "🌈", "🎀"],
  },
  winter: {
    id: "winter",
    name: "Winter Frost",
    icon: "❄️",
    bg: "#080c14",
    surface: "#101828",
    surface2: "#182438",
    border: "rgba(147,197,253,0.15)",
    text: "#f0f8ff",
    muted: "#90a8c8",
    accent: "#93c5fd",
    accent2: "#e0f2fe",
    glow: "rgba(147,197,253,0.35)",
    gradient1: "rgba(147,197,253,0.2)",
    gradient2: "rgba(224,242,254,0.12)",
    emojis: ["❄️", "⛄", "🌨️", "🧊", "🏔️", "🎿", "☃️", "🦌", "✨", "🌬️"],
  },
  desert: {
    id: "desert",
    name: "Desert Dunes",
    icon: "🏜️",
    bg: "#120e06",
    surface: "#201808",
    surface2: "#302410",
    border: "rgba(251,191,36,0.15)",
    text: "#fff8e8",
    muted: "#c0a878",
    accent: "#fbbf24",
    accent2: "#f97316",
    glow: "rgba(251,191,36,0.35)",
    gradient1: "rgba(251,191,36,0.2)",
    gradient2: "rgba(249,115,22,0.14)",
    emojis: ["🏜️", "🌵", "☀️", "🐪", "🦂", "🪶", "🏺", "🌾", "🔥", "⭐"],
  },
  aurora: {
    id: "aurora",
    name: "Aurora",
    icon: "🌌",
    bg: "#040810",
    surface: "#0a1420",
    surface2: "#102030",
    border: "rgba(52,211,153,0.15)",
    text: "#e8fff8",
    muted: "#70b8a0",
    accent: "#34d399",
    accent2: "#a78bfa",
    glow: "rgba(52,211,153,0.35)",
    gradient1: "rgba(52,211,153,0.18)",
    gradient2: "rgba(167,139,250,0.16)",
    emojis: ["🌌", "✨", "💚", "💜", "🌠", "⭐", "🌙", "🏔️", "❄️", "🔭"],
  },
  vinyl: {
    id: "vinyl",
    name: "Retro Vinyl",
    icon: "📻",
    bg: "#0c0806",
    surface: "#1a1410",
    surface2: "#282018",
    border: "rgba(217,119,6,0.15)",
    text: "#faf0e0",
    muted: "#b89870",
    accent: "#d97706",
    accent2: "#92400e",
    glow: "rgba(217,119,6,0.35)",
    gradient1: "rgba(217,119,6,0.2)",
    gradient2: "rgba(146,64,14,0.14)",
    emojis: ["📻", "💿", "🎷", "🎺", "🎸", "🎹", "🎤", "📼", "🕺", "✨"],
  },
  cyberpunk: {
    id: "cyberpunk",
    name: "Cyberpunk",
    icon: "🤖",
    bg: "#060010",
    surface: "#100020",
    surface2: "#180030",
    border: "rgba(255,0,128,0.15)",
    text: "#ffe0f8",
    muted: "#a070a0",
    accent: "#ff0080",
    accent2: "#00ffff",
    glow: "rgba(255,0,128,0.35)",
    gradient1: "rgba(255,0,128,0.18)",
    gradient2: "rgba(0,255,255,0.12)",
    emojis: ["🤖", "🦾", "👾", "💾", "🔌", "🌃", "⚡", "🕶️", "🖥️", "🔮"],
  },
  lava: {
    id: "lava",
    name: "Volcano",
    icon: "🌋",
    bg: "#100404",
    surface: "#200808",
    surface2: "#300c0c",
    border: "rgba(239,68,68,0.15)",
    text: "#fff0f0",
    muted: "#c08080",
    accent: "#ef4444",
    accent2: "#f97316",
    glow: "rgba(239,68,68,0.35)",
    gradient1: "rgba(239,68,68,0.22)",
    gradient2: "rgba(249,115,22,0.16)",
    emojis: ["🌋", "🔥", "💥", "🪨", "☄️", "🌡️", "🧨", "⚡", "🌅", "💢"],
  },
  royal: {
    id: "royal",
    name: "Royal",
    icon: "👑",
    bg: "#0a0614",
    surface: "#140c24",
    surface2: "#1e1234",
    border: "rgba(192,132,252,0.15)",
    text: "#f8f0ff",
    muted: "#a890c8",
    accent: "#c084fc",
    accent2: "#fbbf24",
    glow: "rgba(192,132,252,0.35)",
    gradient1: "rgba(192,132,252,0.22)",
    gradient2: "rgba(251,191,36,0.12)",
    emojis: ["👑", "💎", "🏰", "✨", "🎻", "🍷", "🦢", "🌹", "⭐", "🎭"],
  },
};

const ANIMATIONS = ["anim-float", "anim-drift", "anim-pulse", "anim-sway"];

function seededPosition(index, salt) {
  const x = ((index * 37 + salt * 13) % 92) + 2;
  const y = ((index * 53 + salt * 29) % 88) + 4;
  return { x, y };
}

function createEmojiElement(emoji, index, options = {}) {
  const { x, y, size, opacity, anim, delay, duration } = options;
  const span = document.createElement("span");
  span.className = `floating-emoji ${anim || ANIMATIONS[index % ANIMATIONS.length]}`;
  span.textContent = emoji;
  span.style.left = `${x}%`;
  span.style.top = `${y}%`;
  span.style.fontSize = `${size}rem`;
  span.style.opacity = String(opacity);
  span.style.animationDelay = `${delay}s`;
  span.style.animationDuration = `${duration}s`;
  return span;
}

function renderBackgroundEmojis(emojis) {
  const layer = document.getElementById("bgEmojiLayer");
  if (!layer) return;
  layer.innerHTML = "";

  const pool = [...emojis, ...emojis, ...emojis];
  const count = Math.min(28, pool.length);

  for (let i = 0; i < count; i++) {
    const pos = seededPosition(i, 7);
    const emoji = pool[i % pool.length];
    layer.appendChild(
      createEmojiElement(emoji, i, {
        x: pos.x,
        y: pos.y,
        size: 1.4 + (i % 5) * 0.45,
        opacity: 0.08 + (i % 6) * 0.025,
        anim: ANIMATIONS[i % ANIMATIONS.length],
        delay: (i * 0.55) % 6,
        duration: 5 + (i % 7),
      })
    );
  }
}

function renderPanelEmojis(emojis) {
  document.querySelectorAll(".emoji-decorations").forEach((container, panelIdx) => {
    container.innerHTML = "";
    const subset = emojis.slice(0, 8);
    subset.forEach((emoji, i) => {
      const pos = seededPosition(i, panelIdx + 3);
      container.appendChild(
        createEmojiElement(emoji, i, {
          x: pos.x * 0.85 + 5,
          y: pos.y * 0.75 + 8,
          size: 1.1 + (i % 3) * 0.3,
          opacity: 0.12 + (i % 4) * 0.04,
          anim: ANIMATIONS[(i + panelIdx) % ANIMATIONS.length],
          delay: i * 0.6,
          duration: 3.5 + (i % 4),
        })
      );
    });
  });
}

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
  renderBackgroundEmojis(theme.emojis);
  renderPanelEmojis(theme.emojis);
  localStorage.setItem("musicCreatorTheme", themeId);

  document.querySelectorAll(".theme-option").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.theme === themeId);
  });
}

function buildThemePicker() {
  const container = document.getElementById("themeOptions");
  if (!container) return;
  container.innerHTML = "";

  Object.values(THEMES).forEach((theme) => {
    const btn = document.createElement("button");
    btn.className = "theme-option";
    btn.dataset.theme = theme.id;
    btn.title = theme.name;
    btn.textContent = theme.icon;
    btn.addEventListener("click", () => applyTheme(theme.id));
    container.appendChild(btn);
  });
}

export function initTheme() {
  buildThemePicker();
  const saved = localStorage.getItem("musicCreatorTheme") || "midnight";
  applyTheme(saved in THEMES ? saved : "midnight");
}
