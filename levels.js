/*
 * Sucoban — stage & level data.
 *
 * Map legend:
 *   #  wall            (space) sand / jungle floor
 *   .  target          $  crate
 *   *  crate on target @  player
 *   +  player on target
 *
 * Rows need not be padded to equal length — the loader handles it.
 * Every level here is verified solvable + well-formed by verify.js.
 */
const STAGES = [
  {
    name: "Beach",
    theme: "beach",
    title: "Beach Sucoban",
    emoji: "🏖️",
    wall: "🌴",
    player: "🦀",
    skyItems: ["☁️", "☁️", "🕊️"],
    confetti: ["🏖️", "🐚", "⭐", "🌴", "🦀", "🥥", "🌊", "☀️", "🏐"],
    decor: {
      swimmers: [
        { e: "🦈", y: 43, size: 50, dur: 30, dir: 1, delay: -4 },
        { e: "🐳", y: 52, size: 70, dur: 54, dir: -1, delay: -28 },
        { e: "🐬", y: 47, size: 40, dur: 36, dir: 1, delay: -30 },
        { e: "🐠", y: 45, size: 26, dur: 17, dir: 1, delay: -2 },
        { e: "🐟", y: 56, size: 24, dur: 21, dir: -1, delay: -11 },
        { e: "🐡", y: 40, size: 24, dur: 25, dir: 1, delay: -16 },
        { e: "🐠", y: 58, size: 22, dur: 19, dir: -1, delay: -6 },
      ],
      ground: [
        { e: "🦀", x: 6, b: 7, size: 32 },
        { e: "🐚", x: 16, b: 4, size: 22 },
        { e: "⭐", x: 25, b: 9, size: 26 },
        { e: "🦞", x: 81, b: 6, size: 32 },
        { e: "🪸", x: 70, b: 9, size: 28 },
        { e: "⭐", x: 90, b: 5, size: 24 },
        { e: "🐚", x: 95, b: 12, size: 20 },
      ],
    },
    song: {
      tempo: 104, root: 261.63, lead: "triangle", pad: "sine",
      prog: [[0, "maj"], [7, "maj"], [9, "min"], [5, "maj"]],
      scale: [0, 2, 4, 5, 7, 9, 11], perc: false, cutoff: 2600,
    },
    levels: [
      {
        name: "First Steps",
        map: ["#######", "#     #", "#@$  .#", "#     #", "#######"],
      },
      {
        name: "Tide Pool",
        map: ["########", "#      #", "# @$ . #", "# $  . #", "#      #", "########"],
      },
      {
        name: "Sandbar",
        map: ["######", "#  . #", "# #$ #", "# $@.#", "#  ###", "####"],
      },
      {
        name: "Lagoon",
        map: ["  ####", "###  ####", "#     $ #", "# #  #$ #", "# . .#@ #", "#########"],
      },
      {
        name: "Coral Maze",
        map: ["########", "#  .   #", "# $$ . #", "# @    #", "#  #   #", "########"],
      },
      {
        name: "Driftwood",
        map: ["####", "# .#", "#  ###", "#*@  #", "#  $ #", "#  ###", "####"],
      },
      {
        name: "Coconut Run",
        map: ["######", "#    #", "# #@ #", "# $* #", "# .* #", "#    #", "######"],
      },
      {
        name: "High Tide",
        map: ["########", "#  #   #", "# .$ . #", "## $@$ #", "#  .$. #", "#   #  #", "########"],
      },
    ],
  },

  {
    name: "Jungle",
    theme: "jungle",
    title: "Jungle Sucoban",
    emoji: "🌴",
    wall: "🌳",
    player: "🐒",
    invertFacing: true, // 🐒 emoji faces the opposite way to 🦀
    skyItems: ["🦜", "🦋", "🍃"],
    confetti: ["🍌", "🐒", "🌴", "🍃", "🦜", "🌺", "🪵", "🐯", "🥭"],
    decor: {
      swimmers: [
        { e: "🦋", y: 30, size: 26, dur: 22, dir: 1, delay: -3 },
        { e: "🦜", y: 24, size: 30, dur: 28, dir: -1, delay: -14 },
        { e: "🦋", y: 36, size: 22, dur: 18, dir: -1, delay: -8 },
        { e: "🐊", y: 53, size: 52, dur: 40, dir: 1, delay: -20 },
      ],
      ground: [
        { e: "🐢", x: 8, b: 6, size: 30 },
        { e: "🌺", x: 18, b: 4, size: 24 },
        { e: "🐍", x: 80, b: 5, size: 30 },
        { e: "🍄", x: 71, b: 8, size: 24 },
        { e: "🌿", x: 92, b: 4, size: 26 },
      ],
    },
    song: {
      tempo: 112, root: 196, lead: "triangle", pad: "triangle",
      prog: [[0, "min"], [5, "min"], [3, "maj"], [7, "maj"]],
      scale: [0, 3, 5, 7, 10], perc: true, cutoff: 2000,
    },
    levels: [
      {
        name: "Jungle Path",
        map: ["#######", "#     #", "# @$ .#", "#     #", "#######"],
      },
      {
        name: "Twin Vines",
        map: ["########", "#      #", "# .$@$.#", "#      #", "########"],
      },
      {
        name: "Forked Trail",
        map: ["######", "#  . #", "#  $ #", "#.$@ #", "#    #", "######"],
      },
      {
        name: "Temple Cross",
        map: ["#######", "#  .  #", "#  $  #", "#.$@$.#", "#  $  #", "#  .  #", "#######"],
      },
      {
        name: "Hidden Hollow",
        map: ["#######", "#     #", "#.$ $.#", "# #@# #", "#.$ $.#", "#     #", "#######"],
      },
      {
        name: "Vine Tangle",
        map: ["########", "# @    #", "# $#$# #", "# . .  #", "# $#$# #", "# . .  #", "########"],
      },
      {
        name: "Canopy Climb",
        map: ["  #####", "###   #", "#   $.#", "# .$$.#", "# @ ###", "#####"],
      },
      {
        name: "River Crossing",
        map: ["#######", "#     #", "# $$$ #", "# ... #", "#  @  #", "#######"],
      },
      {
        name: "Ancient Idol",
        map: ["#######", "#.   .#", "# $ $ #", "#  @  #", "# $ $ #", "#.   .#", "#######"],
      },
      {
        name: "Lost City",
        map: ["#########", "#       #", "# $$$$$ #", "# ..... #", "#   @   #", "#########"],
      },
    ],
  },

  {
    name: "Desert",
    theme: "desert",
    title: "Desert Sucoban",
    emoji: "🏜️",
    wall: "🌵",
    player: "🐫",
    invertFacing: true, // 🐫 emoji faces left by default
    skyItems: ["🦅", "🦅", "☁️"],
    confetti: ["🏜️", "🐫", "🌵", "☀️", "🦂", "🏺", "💎", "🪙", "🌅"],
    decor: {
      swimmers: [
        { e: "🦅", y: 16, size: 34, dur: 34, dir: 1, delay: -5 },
        { e: "🦅", y: 22, size: 28, dur: 44, dir: -1, delay: -22 },
        { e: "🪁", y: 12, size: 26, dur: 30, dir: 1, delay: -16 },
      ],
      ground: [
        { e: "🌵", x: 7, b: 5, size: 34 },
        { e: "🦂", x: 19, b: 4, size: 26 },
        { e: "🦎", x: 80, b: 5, size: 28 },
        { e: "🐍", x: 70, b: 7, size: 28 },
        { e: "🌵", x: 92, b: 4, size: 30 },
      ],
    },
    song: {
      tempo: 88, root: 220, lead: "sawtooth", pad: "sine",
      prog: [[0, "min"], [1, "maj"], [0, "min"], [8, "maj"]],
      scale: [0, 1, 4, 5, 7, 8, 11], perc: true, cutoff: 1500, vibrato: true,
    },
    levels: [
      {
        name: "Oasis",
        map: [
          "#######",
          "#   . #",
          "#   $ #",
          "#@    #",
          "#######",
        ],
      },
      {
        name: "Twin Dunes",
        map: [
          "########",
          "#.@. $ #",
          "# $    #",
          "#      #",
          "#      #",
          "########",
        ],
      },
      {
        name: "Sun-Baked",
        map: [
          "########",
          "#      #",
          "#.  .$@#",
          "# $  # #",
          "#      #",
          "########",
        ],
      },
      {
        name: "Caravan",
        map: [
          "#########",
          "#    @  #",
          "# $. .$ #",
          "#  .$   #",
          "#       #",
          "#########",
        ],
      },
      {
        name: "Scarab",
        map: [
          "#########",
          "#       #",
          "#  .. . #",
          "##$$$   #",
          "#  @    #",
          "#########",
        ],
      },
      {
        name: "Sandstorm",
        map: [
          "#########",
          "#       #",
          "#$   .  #",
          "#.     ##",
          "##$$  @.#",
          "#       #",
          "#########",
        ],
      },
      {
        name: "Mirage",
        map: [
          "##########",
          "#        #",
          "#     $@.#",
          "# $# $   #",
          "#    ..  #",
          "##########",
        ],
      },
      {
        name: "Sphinx",
        map: [
          "#########",
          "#       #",
          "# *  . $#",
          "#       #",
          "# $#  $.#",
          "#      +#",
          "#########",
        ],
      },
      {
        name: "Buried Tomb",
        map: [
          "##########",
          "#        #",
          "# $. #   #",
          "#    . * #",
          "#@$#     #",
          "#.$      #",
          "##########",
        ],
      },
      {
        name: "Pharaoh's Vault",
        map: [
          "##########",
          "#        #",
          "#@$. #   #",
          "#    . * #",
          "# $#     #",
          "#.$      #",
          "##########",
        ],
      },
    ],
  },

  {
    name: "City",
    theme: "city",
    title: "City Sucoban",
    emoji: "🏙️",
    wall: "🏢",
    player: "🚶",
    skyItems: ["🚁", "🕊️", "🎈"],
    confetti: ["🏙️", "🚕", "🚦", "🏢", "🎉", "🚗", "🌆", "🛵", "🏬"],
    decor: {
      swimmers: [
        { e: "🚁", y: 12, size: 34, dur: 32, dir: 1, delay: -6 },
        { e: "🕊️", y: 20, size: 24, dur: 26, dir: -1, delay: -12 },
        { e: "🎈", y: 16, size: 26, dur: 40, dir: 1, delay: -20 },
        { e: "✈️", y: 8, size: 30, dur: 50, dir: -1, delay: -30 },
      ],
      ground: [
        { e: "🚗", x: 7, b: 4, size: 30 },
        { e: "🚕", x: 19, b: 5, size: 28 },
        { e: "🚦", x: 30, b: 6, size: 26 },
        { e: "🌳", x: 80, b: 4, size: 30 },
        { e: "🛵", x: 70, b: 5, size: 26 },
        { e: "🚌", x: 92, b: 4, size: 30 },
      ],
    },
    song: {
      tempo: 120, root: 246.94, lead: "square", pad: "sawtooth",
      prog: [[0, "min"], [3, "maj"], [5, "min"], [7, "maj"]],
      scale: [0, 2, 3, 5, 7, 9, 10], perc: true, cutoff: 1900,
    },
    levels: [
      {
        name: "Downtown",
        map: [
          "#######",
          "#     #",
          "# $   #",
          "#@.   #",
          "#######",
        ],
      },
      {
        name: "Crossroads",
        map: [
          "########",
          "#      #",
          "# $   .#",
          "#@$    #",
          "#.#    #",
          "########",
        ],
      },
      {
        name: "Subway",
        map: [
          "#########",
          "#   $  +#",
          "# #     #",
          "#   $   #",
          "#    .  #",
          "#########",
        ],
      },
      {
        name: "Skyline",
        map: [
          "#########",
          "#.$   # #",
          "# $    .#",
          "#.      #",
          "#     $ #",
          "#    @  #",
          "#########",
        ],
      },
      {
        name: "Traffic Jam",
        map: [
          "#########",
          "#       #",
          "#+  $  .#",
          "# $    ##",
          "# $     #",
          "# # .   #",
          "#########",
        ],
      },
      {
        name: "City Park",
        map: [
          "##########",
          "#   .  $+#",
          "#       $#",
          "#  . . $ #",
          "#  #   $ #",
          "# #      #",
          "##########",
        ],
      },
      {
        name: "Rooftops",
        map: [
          "##########",
          "# ..$   @#",
          "# $    $ #",
          "#  .    ##",
          "# $#  .  #",
          "#     #  #",
          "##########",
        ],
      },
      {
        name: "Old Town",
        map: [
          "##########",
          "#        #",
          "# $     *#",
          "#     .# #",
          "#     .  #",
          "##$#  $@.#",
          "#.   $   #",
          "##########",
        ],
      },
      {
        name: "Grand Plaza",
        map: [
          "###########",
          "#   #  .  #",
          "# $ $  $  #",
          "# $   .  .#",
          "#.#    #@##",
          "# *#      #",
          "#       # #",
          "###########",
        ],
      },
      {
        name: "Metropolis",
        map: [
          "###########",
          "###       #",
          "# .$  $  $#",
          "#     .   #",
          "#   .     #",
          "# $  #* # #",
          "##@##    .#",
          "###########",
        ],
      },
    ],
  },
];

// Stable level ids ("beach:first-steps") key saved progress, so levels can be
// reordered or inserted freely. Renaming a level's English name changes its id
// and resets its progress — set an explicit `id` on the level to keep it.
STAGES.forEach((stage) => {
  stage.levels.forEach((lv) => {
    if (!lv.id) {
      const slug = lv.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
      lv.id = stage.theme + ":" + slug;
    }
  });
});

if (typeof module !== "undefined" && module.exports) {
  module.exports = STAGES;
}
