/*
 * Lightweight i18n for the game. Two locales: English (en) and
 * Portuguese of Portugal (pt). No dependencies.
 *
 * Usage:
 *   I18n.t("play")                       → translated string
 *   I18n.stageTitle("beach")             → translated stage title
 *   I18n.levelName("beach", 0)           → translated level name
 *   I18n.setLang("pt"), I18n.getLang()
 *   I18n.apply()                         → fills [data-i18n*] elements
 *   I18n.onChange(fn)                    → run fn whenever language changes
 *
 * Markup hooks:
 *   data-i18n="key"        → element.textContent = t(key)
 *   data-i18n-html="key"   → element.innerHTML  = t(key)
 *   data-i18n-title="key"  → element.title      = t(key)
 *   data-i18n-aria="key"   → element aria-label = t(key)
 */
const I18n = (() => {
  "use strict";

  const STRINGS = {
    en: {
      docTitle: "Sokoban — Crate Puzzle",

      // Entry screen
      entryTagline: "Push every crate onto a glowing target. Pure puzzle bliss.",
      play: "Play",
      continueGame: "Continue",
      entryControls: "Arrow keys / WASD to move · Swipe on touch",

      // Stat labels
      moves: "Moves",
      pushes: "Pushes",
      crates: "Crates",
      best: "Best",

      // Level pill
      stage: "Stage",
      lvl: "Lvl",

      // Win card
      levelCleared: "Level Cleared!",
      replay: "↺ Replay",
      nextLevel: "Next Level →",
      finish: "🏁 Finish",
      newBest: "🏆 new best!",
      movesUnit: "moves",
      pushesUnit: "pushes",

      // Control button tooltips
      tipChooseLevel: "Choose level",
      tipUndo: "Undo (U)",
      tipRestart: "Restart (R)",
      tipPrev: "Previous level",
      tipNext: "Next level",
      tipSound: "Music on/off",
      tipHelp: "Help & controls",
      hint: "Swipe on the board or tap <b>❓</b> for the control pad",

      // Level select modal
      chooseLevel: "🗺️ Choose a Level",
      bestPrefix: "Best:",
      notCleared: "Not cleared",
      locked: "Locked",
      uncharted: "Uncharted territory…",
      unchartedSub: "Clear every level above to discover what's next",

      // Help modal
      howToPlay: "❓ How to Play",
      closeLabel: "Close",
      helpIntro: "Push every <b>crate</b> onto a glowing <b>target spot</b>. You can only push — never pull — and just one crate at a time.",
      helpMove: "move",
      helpMoveTouch: "move on touch screens",
      helpUndo: "undo last move",
      helpRestart: "restart the level",
      helpNext: "next level",
      helpTip: "Stuck? Use <b>Undo</b> freely — there's no penalty.",
      language: "Language",

      stages: {
        beach: { title: "Beach Sokoban", name: "Beach" },
        jungle: { title: "Jungle Sokoban", name: "Jungle" },
        desert: { title: "Desert Sokoban", name: "Desert" },
      },
      levels: {
        beach: ["First Steps", "Tide Pool", "Sandbar", "Lagoon", "Coral Maze",
          "Driftwood", "Coconut Run", "High Tide"],
        jungle: ["Jungle Path", "Twin Vines", "Forked Trail", "Temple Cross",
          "Hidden Hollow", "Vine Tangle", "Canopy Climb", "River Crossing",
          "Ancient Idol", "Lost City"],
        desert: ["Oasis", "Twin Dunes", "Sun-Baked", "Caravan", "Scarab",
          "Sandstorm", "Mirage", "Sphinx", "Buried Tomb", "Pharaoh's Vault"],
      },
    },

    pt: {
      docTitle: "Sokoban — Puzzle de Caixotes",

      // Ecrã de entrada
      entryTagline: "Empurra cada caixote para um alvo luminoso. Puro prazer de puzzle.",
      play: "Jogar",
      continueGame: "Continuar",
      entryControls: "Setas / WASD para mover · Desliza no ecrã tátil",

      // Etiquetas de estatísticas
      moves: "Jogadas",
      pushes: "Empurrões",
      crates: "Caixotes",
      best: "Recorde",

      // Pílula do nível
      stage: "Etapa",
      lvl: "Nível",

      // Cartão de vitória
      levelCleared: "Nível Concluído!",
      replay: "↺ Repetir",
      nextLevel: "Seguinte →",
      finish: "🏁 Terminar",
      newBest: "🏆 novo recorde!",
      movesUnit: "jogadas",
      pushesUnit: "empurrões",

      // Tooltips dos botões
      tipChooseLevel: "Escolher nível",
      tipUndo: "Anular (U)",
      tipRestart: "Reiniciar (R)",
      tipPrev: "Nível anterior",
      tipNext: "Nível seguinte",
      tipSound: "Música ligada/desligada",
      tipHelp: "Ajuda e controlos",
      hint: "Desliza no tabuleiro ou toca em <b>❓</b> para o comando direcional",

      // Modal de seleção de nível
      chooseLevel: "🗺️ Escolher Nível",
      bestPrefix: "Recorde:",
      notCleared: "Por concluir",
      locked: "Bloqueado",
      uncharted: "Território inexplorado…",
      unchartedSub: "Conclui todos os níveis acima para descobrir o que vem a seguir",

      // Modal de ajuda
      howToPlay: "❓ Como Jogar",
      closeLabel: "Fechar",
      helpIntro: "Empurra cada <b>caixote</b> para um <b>alvo</b> luminoso. Só podes empurrar — nunca puxar — e apenas um caixote de cada vez.",
      helpMove: "mover",
      helpMoveTouch: "mover em ecrãs táteis",
      helpUndo: "anular a última jogada",
      helpRestart: "reiniciar o nível",
      helpNext: "nível seguinte",
      helpTip: "Encravado? Usa <b>Anular</b> à vontade — não há penalização.",
      language: "Idioma",

      stages: {
        beach: { title: "Sokoban da Praia", name: "Praia" },
        jungle: { title: "Sokoban da Selva", name: "Selva" },
        desert: { title: "Sokoban do Deserto", name: "Deserto" },
      },
      levels: {
        beach: ["Primeiros Passos", "Poça de Maré", "Banco de Areia", "Lagoa",
          "Labirinto de Coral", "Madeira à Deriva", "Corrida do Coco", "Maré Alta"],
        jungle: ["Trilho da Selva", "Lianas Gémeas", "Trilho Bifurcado",
          "Cruz do Templo", "Clareira Secreta", "Emaranhado de Lianas",
          "Subida à Copa", "Travessia do Rio", "Ídolo Antigo", "Cidade Perdida"],
        desert: ["Oásis", "Dunas Gémeas", "Escaldado pelo Sol", "Caravana",
          "Escaravelho", "Tempestade de Areia", "Miragem", "Esfinge",
          "Túmulo Soterrado", "Câmara do Faraó"],
      },
    },
  };

  const LANG_KEY = "sokoban-lang";
  const SUPPORTED = ["en", "pt"];
  const listeners = [];

  function detect() {
    const saved = localStorage.getItem(LANG_KEY);
    if (saved && SUPPORTED.includes(saved)) return saved;
    const nav = (navigator.language || navigator.userLanguage || "en").toLowerCase();
    return nav.startsWith("pt") ? "pt" : "en";
  }

  let lang = detect();

  const dict = () => STRINGS[lang] || STRINGS.en;

  function t(key) {
    const d = dict();
    return key in d ? d[key] : (key in STRINGS.en ? STRINGS.en[key] : key);
  }

  function stageTitle(themeKey) {
    return (dict().stages[themeKey] || {}).title
      || (STRINGS.en.stages[themeKey] || {}).title || themeKey;
  }
  function stageName(themeKey) {
    return (dict().stages[themeKey] || {}).name
      || (STRINGS.en.stages[themeKey] || {}).name || themeKey;
  }
  function levelName(themeKey, i, fallback) {
    const arr = dict().levels[themeKey] || STRINGS.en.levels[themeKey] || [];
    return arr[i] || fallback || "";
  }

  function apply(root) {
    const scope = root || document;
    scope.querySelectorAll("[data-i18n]").forEach((el) => {
      el.textContent = t(el.getAttribute("data-i18n"));
    });
    scope.querySelectorAll("[data-i18n-html]").forEach((el) => {
      el.innerHTML = t(el.getAttribute("data-i18n-html"));
    });
    scope.querySelectorAll("[data-i18n-title]").forEach((el) => {
      el.title = t(el.getAttribute("data-i18n-title"));
    });
    scope.querySelectorAll("[data-i18n-aria]").forEach((el) => {
      el.setAttribute("aria-label", t(el.getAttribute("data-i18n-aria")));
    });
    document.title = t("docTitle");
    document.documentElement.lang = lang === "pt" ? "pt-PT" : "en";
  }

  function setLang(l) {
    if (!SUPPORTED.includes(l) || l === lang) return;
    lang = l;
    localStorage.setItem(LANG_KEY, lang);
    apply();
    listeners.forEach((fn) => fn(lang));
  }

  const getLang = () => lang;
  const onChange = (fn) => { if (typeof fn === "function") listeners.push(fn); };

  return { t, stageTitle, stageName, levelName, apply, setLang, getLang, onChange,
    supported: SUPPORTED.slice() };
})();

if (typeof module !== "undefined" && module.exports) module.exports = I18n;
