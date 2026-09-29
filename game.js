/*
 * Skull Match - a two-player match-3 duel.
 * Based on "Deathmatch" by Jorge Rubiano (js13kGames 2022), MIT License.
 *
 * Adapted for static hosting: the online modes (socket.io) were removed,
 * leaving "Two Players" (same device) and "Vs Bot".
 */

// ---------------------------------------------------------------------------
// ZzFX - Zuper Zmall Zound Zynth by Frank Force (MIT), used for all sounds.
// The AudioContext is created lazily, on the first sound after a user gesture.
// ---------------------------------------------------------------------------
let zzfxX = null;
const zzfxV = 0.3;
const zzfxR = 44100;
const zzfx = (
  z = 1,
  t = 0.05,
  f = 220,
  x = 0,
  a = 0,
  e = 0.1,
  n = 0,
  h = 1,
  M = 0,
  R = 0,
  i = 0,
  r = 0,
  s = 0,
  o = 0,
  u = 0,
  c = 0,
  d = 0,
  X = 1,
  b = 0,
  w = 0
) => {
  if (!zzfxX) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    zzfxX = new AC();
  }
  if (zzfxX.state === "suspended") zzfxX.resume();
  let l,
    m,
    C = 2 * Math.PI,
    V = (M *= (500 * C) / zzfxR ** 2),
    A = ((0 < u ? 1 : -1) * C) / 4,
    B = (f *= ((1 + 2 * t * Math.random() - t) * C) / zzfxR),
    I = [],
    P = 0,
    g = 0,
    k = 0,
    D = 1,
    S = 0,
    j = 0,
    p = 0;
  for (
    R *= (500 * C) / zzfxR ** 3,
      u *= C / zzfxR,
      i *= C / zzfxR,
      r *= zzfxR,
      s = (zzfxR * s) | 0,
      m =
        ((x = 99 + zzfxR * x) +
          (b *= zzfxR) +
          (a *= zzfxR) +
          (e *= zzfxR) +
          (d *= zzfxR)) |
        0;
    k < m;
    I[k++] = p
  )
    ++j % ((100 * c) | 0) ||
      ((p = n
        ? 1 < n
          ? 2 < n
            ? 3 < n
              ? Math.sin((P % C) ** 3)
              : Math.max(Math.min(Math.tan(P), 1), -1)
            : 1 - (((((2 * P) / C) % 2) + 2) % 2)
          : 1 - 4 * Math.abs(Math.round(P / C) - P / C)
        : Math.sin(P)),
      (p =
        (s ? 1 - w + w * Math.sin((2 * Math.PI * k) / s) : 1) *
        (0 < p ? 1 : -1) *
        Math.abs(p) ** h *
        z *
        zzfxV *
        (k < x
          ? k / x
          : k < x + b
          ? 1 - ((k - x) / b) * (1 - X)
          : k < x + b + a
          ? X
          : k < m - d
          ? ((m - k - d) / e) * X
          : 0)),
      (p = d
        ? p / 2 +
          (d > k ? 0 : ((k < m - d ? 1 : (m - k) / d) * I[(k - d) | 0]) / 2)
        : p)),
      (P +=
        (l = (f += M += R) * Math.sin(g * u - A)) -
        l * o * (1 - ((1e9 * (Math.sin(k) + 1)) % 2))),
      (g += l - l * o * (1 - ((1e9 * (Math.sin(k) ** 2 + 1)) % 2))),
      D && ++D > r && ((f += i), (B += i), (D = 0)),
      !s || ++S % s || ((f = B), (M = V), (D = D || 1));
  const buffer = zzfxX.createBuffer(1, m, zzfxR);
  buffer.getChannelData(0).set(I);
  const source = zzfxX.createBufferSource();
  source.buffer = buffer;
  source.connect(zzfxX.destination);
  source.start();
  return source;
};

(() => {
  // -------------------------------------------------------------------------
  // Utilities
  // -------------------------------------------------------------------------
  const CACHE_KEY = "skull-match:data";
  const COLOR = { b: "#1e90ff", r: "#e91e63" };
  const SOUNDS = {
    b: [, , 333, 0.01, 0, 0.9, 4, 1.9, , , , , , 0.5, , 0.6],
    c: [, 0.1, 75, 0.03, 0.08, 0.17, 1, 1.88, 7.83, , , , , 0.4],
    t: [, , 20, 0.04, , 0.6, , 1.31, , , -990, 0.06, 0.17, , , 0.04, 0.07],
    l: [, , 925, 0.04, 0.3, 0.6, 1, 0.3, , 6.27, -184, 0.09, 0.17],
    w: [, , 172, 0.8, , 0.8, 1, 0.76, 7.7, 3.73, -482, 0.08, 0.15, , 0.14],
  };
  // Logical layout sizes (see style.css)
  const PORTRAIT = { w: WIDTH, h: HEIGHT };
  const LANDSCAPE = { w: 780, h: WIDTH };

  const $ = document.querySelector.bind(document);
  const $$ = document.querySelectorAll.bind(document);
  const setHtml = (element, html) => {
    if (element) element.innerHTML = html;
  };
  const ObjectKeys = (o) => Object.keys(o);
  const delay = (m) => new Promise((resolve) => setTimeout(resolve, m));
  const clone = (v) => JSON.parse(JSON.stringify(v));

  /** Escapes text before it is placed in HTML. */
  const esc = (text = "") =>
    String(text).replace(
      /[&<>"']/g,
      (ch) =>
        ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[
          ch
        ])
    );

  // Current scale of #root (needed to convert pointer coordinates).
  let scale = 1;

  // --- localStorage (all keys prefixed with "skull-match:") ---
  let memoryCache = {};
  const saveCache = (data) => {
    memoryCache = data;
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify(data));
    } catch (e) {
      /* storage unavailable: keep values in memory */
    }
  };

  const getDataCache = () => {
    try {
      const raw = localStorage.getItem(CACHE_KEY);
      if (raw) return JSON.parse(raw) || {};
    } catch (e) {
      /* ignore */
    }
    return { ...memoryCache };
  };

  const savePropierties = (property, value) => {
    const localCache = getDataCache();
    localCache[property] = value;
    saveCache(localCache);
  };

  const getValueFromCache = (key = "", initial) =>
    getDataCache()[key] || initial;

  /** [name, token] of the local player. */
  const getUser = () => [getValueFromCache("name", "Player 1"), "p1"];

  /**
   * Debounced function with a way to cancel it.
   */
  const debounce = (fn, wait) => {
    let t;
    return {
      cls: () => clearTimeout(t),
      fn: () => {
        clearTimeout(t);
        t = setTimeout(fn, wait);
      },
    };
  };

  const $on = (target, type, callback, parameter = {}) => {
    if (target) target.addEventListener(type, callback, parameter);
  };

  const addStyle = (target, styles) => {
    if (target) {
      for (let style in styles) {
        target.style[style] = styles[style];
      }
    }
  };

  const hasClass = (target, className) =>
    target ? target.classList.contains(className) : false;

  const classList = (target, className, type = "add") => {
    if (target) {
      className.split(" ").forEach((classText) => {
        target.classList[type](classText);
      });
    }
  };

  const inlineStyles = (styles) =>
    ObjectKeys(styles).length
      ? `style='${ObjectKeys(styles)
          .map((v) => `${v}:${styles[v]}`)
          .join(";")}'`
      : "";

  /**
   * Removes duplicated coordinate pairs / arrays.
   */
  const uniqueValues = (value = []) => {
    const newValue = [];
    for (let i = 0; i < value.length; i++) {
      let exist = false;

      for (let c = 0; c < newValue.length; c++) {
        let counter = 0;
        for (let d = 0; d < newValue[c].length; d++) {
          counter += +(newValue[c][d] === value[i][d]);
        }

        if (counter === value[i].length) {
          exist = true;
          break;
        }
      }

      if (!exist) {
        newValue.push(value[i]);
      }
    }

    return newValue;
  };

  let localSound = getValueFromCache("sound", "yes") === "yes";
  const playSound = (type = "") => {
    if (!localSound) return;
    try {
      zzfx(...SOUNDS[type]);
    } catch (e) {
      /* audio not available */
    }
  };

  /**
   * Interval-based countdown that can be paused and resumed.
   */
  const chronometer = (cb, options) => {
    const { base = 100, inc = -1, int = 250 } = options || {};
    let interval = null;
    let counter = base;

    const pause = () => {
      if (interval) {
        clearInterval(interval);
        interval = null;
      }
    };

    const tick = () => {
      pause();

      interval = setInterval(() => {
        counter += inc;
        if (counter <= 0) {
          pause();
        }

        cb(counter, interval);
      }, int);
    };

    const change = (newValue) => (counter = newValue);

    const start = () => {
      pause();
      counter = base;
      tick();
    };

    return {
      tick,
      start,
      pause,
      change,
      running: () => interval !== null,
    };
  };

  const newArray = (size = 2, cb) =>
    new Array(size)
      .fill(null)
      .map((_, i) => cb(i, (v) => v))
      .join("");

  const Back = () =>
    `<button id=back class=ib aria-label="Back" title="Back">⬅️</button>`;
  const Sound = () =>
    `<button id=bso class=ib aria-label="Sound on/off" title="Sound on/off">${
      localSound ? "🔈" : "🔇"
    }</button>`;

  // Hooks used to pause/resume the active match when the page is hidden.
  let visibilityHooks = null;

  // -------------------------------------------------------------------------
  // In-page modal (replaces alert/confirm/prompt)
  // -------------------------------------------------------------------------
  const Modal = {
    show({ txt, icon = "", yes = "OK", no = "NO", cb, timer = 0, input = null }) {
      $(".txt").innerHTML =
        (icon
          ? `<p ${inlineStyles({
              "font-size": "3rem",
              "font-family": "var(--emoji)",
            })}>${icon}</p>`
          : "") +
        txt +
        (input !== null
          ? `<input id=min type=text maxlength=12 autocomplete=off spellcheck=false value="${esc(
              input
            )}">`
          : "");
      newArray(2, (i) => {
        addStyle($(`modal #btn${i + 1}`), {
          display: (!i ? yes : no) ? "block" : "none",
        });
        $(`modal #btn${i + 1}`).textContent = !i ? yes : no;
      });
      this.change();
      if (this.interval) {
        clearTimeout(this.interval);
      }
      if (timer) {
        this.interval = setTimeout(() => {
          this.hide();
        }, timer);
      }

      this.callback = cb;
      const field = $("#min");
      if (field) {
        field.focus();
        field.select();
        $on(field, "keydown", (e) => {
          if (e.key === "Enter") this.answer(true);
          if (e.key === "Escape") this.answer(false);
        });
      }
    },
    change(show = true) {
      classList($("modal"), "hide", show ? "remove" : "add");
      classList($("modal"), "show", !show ? "remove" : "add");
    },
    isOpen: () => hasClass($("modal"), "show"),
    hide() {
      this.change(false);
      if (this.interval) {
        clearTimeout(this.interval);
      }
    },
    answer(yes) {
      const value = $("#min") ? $("#min").value : undefined;
      this.hide();
      const cb = this.callback;
      this.callback = null;
      cb && cb(yes, value);
    },
    render: () =>
      `<modal class="hide"><div class="ms wi he"></div><div class="df a c mw wi he"><div class=mc role=dialog><div class="df a wi txt"></div><div class="df mb wi">${newArray(
        2,
        (i) => `<button id=btn${i + 1}></button>`
      )}</div></div></div></modal>`,
    events() {
      $$("modal button").forEach((btn) =>
        $on(btn, "click", (e) => this.answer(e.currentTarget.id === "btn1"))
      );
    },
  };

  /*
   * typeGame:
   * 1: two players on the same device
   * 2: vs bot
   */
  const Game = ({
    BOARD = newBoard(),
    typeGame = 1,
    users = {},
    level = 0,
    maxRounds = 5,
  }) => {
    const BOARD_ELEMENTS = [
      "💀",
      "🎃",
      "🧛‍♂️",
      "🧠",
      "👹",
      "🧨",
      "🪓",
      "🚀",
      "💣",
    ];

    let validateRounds = 0;
    const indexCurrentUser = users.users.findIndex(
      (v) => v[1] === getUser()[1]
    );
    const orderUsers = [indexCurrentUser, !indexCurrentUser ? 1 : 0];
    const userData = ["one", "two"]
      .map((v, i) => ({
        [v]: {
          p: 0,
          m: 2,
          c: COLOR[users.users[orderUsers[i]][2]],
          n: users.users[orderUsers[i]][0],
          t: users.users[orderUsers[i]][1],
        },
      }))
      .reduce((a, s) => ({ ...a, ...s }), {});
    userData.mode = typeGame;

    let counterTimer = 0;
    let playerHasTurn = users.turn === userData.one.t ? "one" : "two";
    const initialPlayerTurn = playerHasTurn;
    let botPending = false;
    // Set while the page is hidden (see visibilityHooks below)
    let paused = null;

    let progress = chronometer((counter, interval) => {
      if ($("bo")) {
        if (counter > 10) {
          counterTimer = counter;
          $("progress").value = counter;
        } else {
          validateTurn();
        }
      } else {
        clearInterval(interval);
      }
    });

    /**
     * Shows the remaining moves of both players.
     */
    const showMovements = () => {
      for (let i = 1; i <= 2; i++) {
        for (let d = 0; d < 2; d++) {
          const { m, c } = userData[i === 1 ? "one" : "two"];
          addStyle($(`#mov-${i}-${d}`), { background: m > d ? c : "none" });
        }
      }
    };

    /**
     * Shows or hides the banner over the board.
     */
    const turnsMessage = (txt = "", show = false) => {
      classList($("#msb"), "sh", show ? "add" : "remove");
      setHtml($("#msb"), txt);
    };

    const turnLabel = () => {
      if (typeGame === 2) {
        return playerHasTurn === "one" ? "Your Turn" : "Bot's Turn";
      }
      return `${esc(userData[playerHasTurn].n)}'s Turn`;
    };

    /**
     * Passes the turn (or starts the first one) and handles the rounds.
     */
    const validateTurn = async (initial = false) => {
      if (!$("bo") || !progress) return;
      playerHasTurn = !initial
        ? playerHasTurn === "one"
          ? "two"
          : "one"
        : playerHasTurn;

      blockBoard(true, true);
      progress?.pause();
      $("progress").value = 100;

      if (playerHasTurn === initialPlayerTurn) {
        validateRounds++;
        if (validateRounds <= maxRounds) {
          for (let i = 1; i <= maxRounds; i++) {
            classList(
              $(`#in-${i}`),
              "ac",
              i === validateRounds ? "add" : "remove"
            );
          }

          // Both players get two moves again
          userData.one.m = userData.two.m = 2;
          showMovements();
          turnsMessage(
            validateRounds < maxRounds
              ? `Round ${validateRounds}`
              : "FINAL ROUND",
            true
          );
          await delay(1000);
        }
      }

      if (!progress) return;

      if (validateRounds <= maxRounds) {
        playSound("t");
        const txtTurn = turnLabel();
        setHtml($("#tupl"), txtTurn);
        turnsMessage(txtTurn, true);
        await delay(1000);
        if (!progress) return;
        turnsMessage();

        const isBoardBlocked = typeGame !== 1 ? playerHasTurn === "two" : false;
        blockBoard(isBoardBlocked, isBoardBlocked);

        runClock(true);

        if (typeGame === 2 && playerHasTurn === "two") {
          scheduleBot();
        }
      } else {
        await delay(500);
        exitGame("EndGame");
      }
    };

    /**
     * Bot move: picks a possible move depending on the difficulty.
     */
    const { fn: playIA, cls: cancelPlayIA } = debounce(() => {
      botPending = false;
      if (playerHasTurn === "one" || !$("bo") || !progress) return;
      const moves = isValidBoard(BOARD).values;
      const difficulty = level === 2 ? (rnd(0, 1) ? 1 : 3) : level;
      const elements = ["three", "dynamite", "axe", "rocket", "four", "bomb"];
      const order =
        difficulty === 1
          ? [0, 1, 2, 3, 4, 5]
          : counterTimer <= 30
          ? [5, 3, 2, 1, 4, 0]
          : [4, 5, 3, 2, 1, 0];
      const posible = {};
      for (let i = 0; i < order.length; i++) {
        if (moves[elements[order[i]]].length !== 0) {
          posible.type = elements[order[i]];
          posible.value = moves[elements[order[i]]];
          break;
        }
      }
      if (!posible.value) return;
      const indexLaunch = rnd(0, posible.value.length - 1);
      if (["three", "four"].includes(posible.type)) {
        const randomPosition = rnd(0, posible.value[indexLaunch].length - 1);
        const indexes = posible.type === "three" ? [2, 3] : [1, 2];
        const indexCanMove = rnd(
          0,
          posible.value[indexLaunch][randomPosition][indexes[1]].length - 1
        );
        const origin = posible.value[indexLaunch][randomPosition][indexes[0]];
        const destinity =
          posible.value[indexLaunch][randomPosition][indexes[1]][indexCanMove];
        validateMove([
          BOARD[origin[0]][origin[1]],
          BOARD[destinity[0]][destinity[1]],
        ]);
      }

      if (["dynamite", "axe", "rocket", "bomb"].includes(posible.type)) {
        validateClick(
          BOARD[posible.value[indexLaunch].i][posible.value[indexLaunch].c]
        );
      }
    }, [25, 15, 7][level - 1] * 100 || 1500);

    const scheduleBot = () => {
      botPending = true;
      if (paused) paused.bot = true;
      else playIA();
    };

    /**
     * Starts (fresh) or resumes the turn clock, unless the page is hidden.
     */
    const runClock = (fresh) => {
      if (!progress) return;
      if (fresh) progress.change(100);
      if (paused) paused.progress = true;
      else progress.tick();
    };

    /**
     * Blocks the board (d) and optionally dims it (o).
     */
    const blockBoard = (d = false, o = false) =>
      classList(
        $("bo"),
        `d${o || hasClass($("bo"), "o") ? " o" : ""}`,
        d || o ? "add" : "remove"
      );

    /**
     * Finds every match on the board and the power-ups they create.
     */
    const validateMatch = (copyBoard = []) => {
      const validateLine = (r = 0, c = 0, v = 0, horizontal = true) => {
        const cells = [[r, c]];
        for (let times = 0; times < 2; times++) {
          let counter = 1;
          do {
            const increase = counter * (!times ? -1 : 1);
            const row = horizontal ? r : r + increase;
            const col = horizontal ? c + increase : c;
            if (
              col >= 0 &&
              col < SIZE &&
              row >= 0 &&
              row < SIZE &&
              copyBoard[row][col].v === v
            ) {
              cells.push([row, col]);
            } else {
              break;
            }
            counter++;
          } while (1);
        }
        return cells;
      };

      const validateSquare = (f = 0, c = 0, v = 0) => [
        [f, c],
        ...([
          [
            [f + 1, c],
            [f + 1, c + 1],
            [f, c + 1],
          ],
          [
            [f - 1, c],
            [f - 1, c + 1],
            [f, c + 1],
          ],
          [
            [f - 1, c],
            [f - 1, c - 1],
            [f, c - 1],
          ],
          [
            [f + 1, c],
            [f + 1, c - 1],
            [f, c - 1],
          ],
        ].find((s) => s.every((p) => copyBoard?.[p[0]]?.[p[1]]?.v === v)) ||
          []),
      ];

      // Check every cell for horizontal, vertical, square and L matches
      const validations = [];
      for (let i = 0; i < SIZE; i++) {
        for (let c = 0; c < SIZE; c++) {
          const position = [i, c];
          const horizontal = validateLine(i, c, copyBoard[i][c].v);
          const vertical = validateLine(i, c, copyBoard[i][c].v, false);
          const square = validateSquare(i, c, copyBoard[i][c].v);
          const isSquare = square.length === 4;
          const isHorizontal = horizontal.length >= 4;
          const isVertical = vertical.length >= 4;
          const isL = horizontal.length >= 3 && vertical.length >= 3;
          const prize = isL
            ? 9
            : isHorizontal
            ? 7
            : isVertical
            ? 8
            : isSquare
            ? 6
            : 0;
          const itemsRemove = uniqueValues([
            ...(horizontal.length >= 3 ? horizontal : []),
            ...(vertical.length >= 3 ? vertical : []),
            ...(square.length >= 3 ? square : []),
          ]);
          validations.push({
            itemsRemove,
            position,
            prize,
          });
        }
      }

      // Keep only the cells that earn a power-up
      const prizes = validations
        .map((v) => (v.prize ? v : []))
        .filter((v) => v.length !== 0);
      let listPrizes = [];

      // Group power-ups that belong to the same match
      for (let i = 0; i < prizes.length; i++) {
        const baseItems = prizes[i].itemsRemove;
        listPrizes.push([i]);

        for (let c = 0; c < prizes.length; c++) {
          if (c !== i) {
            const position = prizes[c].position;
            const exist =
              (
                baseItems.find(
                  (v) => v[0] === position[0] && v[1] === position[1]
                ) || []
              ).length !== 0;
            if (exist) {
              listPrizes[listPrizes.length - 1].push(c);
            }
          }
        }
      }

      listPrizes = uniqueValues(listPrizes.map((v) => v.sort()));
      const removePrizes = [];
      // Drop groups contained in other groups
      for (let i = 0; i < listPrizes.length; i++) {
        for (let c = 0; c < listPrizes.length; c++) {
          if (c !== i) {
            if (listPrizes[i].every((elem) => listPrizes[c].includes(elem))) {
              removePrizes.push(i);
            }
          }
        }
      }
      listPrizes = listPrizes.filter((_, i) => !removePrizes.includes(i));
      const finalPrizez = [];
      // One random cell of each group becomes the power-up
      for (let i = 0; i < listPrizes.length; i++) {
        const randomPrize = rnd(0, listPrizes[i].length - 1);
        const prize = prizes[listPrizes[i][randomPrize]];
        finalPrizez.push([prize.position, prize.prize]);
      }

      // Cells to clear (the power-up cells stay on the board)
      const itemsRemove = uniqueValues(
        validations
          .map((v) => v.itemsRemove)
          .flat()
          .filter(
            (r) =>
              !(
                (
                  finalPrizez?.find(
                    (v) => v?.[0]?.[0] === r[0] && v?.[0]?.[1] === r[1]
                  ) || []
                ).length !== 0
              )
          )
      );

      return {
        itemsRemove,
        prizes: finalPrizez,
      };
    };

    /**
     * Cells destroyed by a power-up. Power-ups caught in the blast are
     * triggered recursively.
     */
    const removeItemsFromPrize = (
      prize = [],
      copyBoard = [],
      previusPrizes = []
    ) => {
      let itemsRemove = [[prize[0][0], prize[0][1]]];
      // 🧨 dynamite: the 8 surrounding cells
      if (prize[1] === 6) {
        const items = [
          [-1, 0],
          [-1, -1],
          [0, -1],
          [1, -1],
          [1, 0],
          [-1, 1],
          [0, 1],
          [1, 1],
        ];

        for (let i = 0; i < items.length; i++) {
          const row = prize[0][0] + items[i][0];
          const col = prize[0][1] + items[i][1];
          if (copyBoard?.[row]?.[col]) {
            itemsRemove.push([row, col]);
          }
        }
      }

      // 🪓 axe (row) or 🚀 rocket (column)
      if (prize[1] === 7 || prize[1] === 8) {
        const base = prize[0][prize[1] === 8 ? 1 : 0];
        for (let counter = 0; counter < SIZE; counter++) {
          const row = prize[1] === 7 ? base : counter;
          const col = prize[1] === 7 ? counter : base;
          if (copyBoard?.[row]?.[col]) {
            itemsRemove.push([row, col]);
          }
        }
      }

      // 💣 bomb: 5x5 area
      if (prize[1] === 9) {
        const initialRow = prize[0][0] - 2;
        const initialCol = prize[0][1] - 2;

        for (let i = initialRow; i < initialRow + 5; i++) {
          for (let c = initialCol; c < initialCol + 5; c++) {
            if (copyBoard?.[i]?.[c]) {
              itemsRemove.push([i, c]);
            }
          }
        }
      }

      itemsRemove = uniqueValues(itemsRemove);
      let newItemsRemove = [];
      for (let i = 0; i < itemsRemove.length; i++) {
        const position = itemsRemove[i];
        const value = copyBoard[position[0]][position[1]].v;

        if (itemIsPrize(value)) {
          const isCurretPrize =
            position[0] === prize[0][0] && position[1] === prize[0][1];
          let prizeProcessed = false;

          if (!isCurretPrize) {
            for (let d = 0; d < previusPrizes.length; d++) {
              const previusPosition = previusPrizes[d][0];

              if (
                previusPosition[0] === position[0] &&
                previusPosition[1] === position[1]
              ) {
                prizeProcessed = true;
                break;
              }
            }
          }

          if (!isCurretPrize && !prizeProcessed) {
            newItemsRemove.push(
              removeItemsFromPrize([position, value], copyBoard, [
                ...previusPrizes,
                ...[prize],
              ])
            );
          }
        }
      }
      itemsRemove = uniqueValues([...itemsRemove, ...newItemsRemove.flat()]);
      return itemsRemove;
    };

    /**
     * Swaps two pieces on screen (or puts them back).
     */
    const changePositionElements = (move = [], reverse = false) => {
      for (let i = 0; i < 2; i++) {
        addStyle($(`#t-${move[i].i}`), {
          left: `${move[reverse ? i : +!i].l}px`,
          top: `${move[reverse ? i : +!i].t}px`,
        });
      }
    };

    /**
     * Floating "EXTRA MOVE!" label next to a new power-up.
     */
    const renderExtraMove = async (row = 0, col = 0) => {
      const element = document.createElement("div");
      const id = `ex-${rnd(1, 100000)}`;
      element.innerHTML = "EXTRA MOVE!";
      element.className = "df a c pa extra";
      const posiblePositions = [
        [-1, -1],
        [1, -1],
        [1, 1],
        [-1, 1],
      ];
      for (let i = 0; i < posiblePositions.length; i++) {
        const newRow = row + posiblePositions[i][0];
        const newCol = col + posiblePositions[i][1];
        if (newRow >= 0 && newRow < SIZE && newCol >= 0 && newCol < SIZE) {
          element.style.left = Math.round(CELL * newCol) + "px";
          element.style.top = Math.round(CELL * newRow) + "px";
          break;
        }
      }
      element.setAttribute("id", id);
      if ($("bo")) {
        $("bo").appendChild(element);
        await delay(10);
        classList($(`#${id}`), "s");
        await delay(1000);
        classList($(`#${id}`), "h");
        await delay(500);
        $(`#${id}`)?.remove();
      }
    };

    /**
     * Clears the matched cells, scores them, drops the remaining pieces,
     * fills the gaps and checks for chain reactions.
     */
    const removeAnimateBoardElements = async (
      copyBoard = [],
      itemsRemove = [],
      prizes = [],
      move = []
    ) => {
      progress?.pause();
      // Place the new power-ups
      for (let i = 0; i < prizes.length; i++) {
        copyBoard[prizes[i][0][0]][prizes[i][0][1]].v = prizes[i][1];
        setHtml(
          $(`#t-${copyBoard[prizes[i][0][0]][prizes[i][0][1]].i}`),
          BOARD_ELEMENTS[prizes[i][1] - 1]
        );

        // Power-ups made by the player (not by falling pieces) give an extra move
        if (itemIsPrize(prizes[i][1]) && move.length !== 0) {
          renderExtraMove(prizes[i][0][0], prizes[i][0][1]);
          userData[playerHasTurn].m++;
          showMovements();
        }
      }

      // Explode the cleared pieces
      const originalItemsRemove = [];
      for (let i = 0; i < itemsRemove.length; i++) {
        const { i: id = 0 } = copyBoard[itemsRemove[i][0]][itemsRemove[i][1]];
        originalItemsRemove.push(id);
        classList($(`#t-${id}`), "h");
        copyBoard[itemsRemove[i][0]][itemsRemove[i][1]].v = 0;
      }

      // Score
      userData[playerHasTurn].p += itemsRemove.length;
      setHtml(
        $(`#scv-${playerHasTurn === "one" ? 1 : 2}`),
        userData[playerHasTurn].p
      );

      playSound("b");

      // New pieces avoid the most common type when it is already abundant
      const newBoardItems = newBoard(
        new Array(MAX)
          .fill(null)
          .map((_, i) => [i + 1, eBoard(copyBoard, i + 1).length])
          .sort((a, b) => b[1] - a[1])
          .slice(0, 1)
          .filter((v) => v[1] >= 4)
          .map((v) => v?.[0])
      );

      // Let the pieces fall into the empty cells
      for (let i = 0; i < SIZE; i++) {
        for (let c = 0; c < SIZE; c++) {
          if (
            c + 1 < SIZE &&
            copyBoard[c][i].v &&
            !copyBoard?.[c + 1]?.[i]?.v
          ) {
            for (let d = c; d >= 0; d--) {
              if (d + 1 < SIZE && copyBoard?.[d]?.[i]?.v) {
                copyBoard[d + 1][i].v = copyBoard[d][i].v;
                copyBoard[d + 1][i].i = copyBoard[d][i].i;
                copyBoard[d][i].v = 0;
              }
            }
          }
        }
      }

      // Empty cells per column (start height of the new pieces)
      const spaces = [];
      for (let i = 0; i < SIZE; i++) {
        let counter = 0;
        for (let c = 0; c < SIZE; c++) {
          counter += +!copyBoard[c][i].v;
        }
        spaces.push(counter);
      }

      const positionsItemsRemove = [];
      const newIndexItemsBoard = [];
      let counterItems = 0;
      // Fill the gaps, reusing the DOM nodes of the cleared pieces
      for (let i = 0; i < SIZE; i++) {
        for (let c = 0; c < SIZE; c++) {
          if (!copyBoard[i][c].v) {
            copyBoard[i][c].v = newBoardItems[i][c].v;
            copyBoard[i][c].i = originalItemsRemove[counterItems];
            newIndexItemsBoard.push([i, c]);
            positionsItemsRemove.push({
              i: originalItemsRemove[counterItems],
              l: Math.round(CELL * c),
              t: Math.round(CELL * (spaces[c] - i) * -1),
            });

            counterItems++;
          }
        }
      }
      // If no move is possible, drop a random power-up among the new pieces
      if (!isValidBoard(copyBoard).isValid) {
        const randomPosition = rnd(0, newIndexItemsBoard.length - 1);
        const positions = newIndexItemsBoard[randomPosition];
        copyBoard[positions[0]][positions[1]].v = rnd(7, 9);
      }

      await delay(100);
      for (let i = 0; i < positionsItemsRemove.length; i++) {
        classList($(`#t-${positionsItemsRemove[i].i}`), "v");
        addStyle($(`#t-${positionsItemsRemove[i].i}`), {
          left: `${positionsItemsRemove[i].l}px`,
          top: `${positionsItemsRemove[i].t}px`,
        });
      }
      await delay(100);
      for (let i = 0; i < positionsItemsRemove.length; i++) {
        classList($(`#t-${positionsItemsRemove[i].i}`), "h", "remove");
      }

      await delay(100);

      // Fall animation
      for (let i = 0; i < SIZE; i++) {
        for (let c = 0; c < SIZE; c++) {
          if (copyBoard[i][c].v) {
            const item = $(`#t-${copyBoard[i][c].i}`);
            if (hasClass(item, "v")) {
              classList(item, "v", "remove");
              setHtml(item, BOARD_ELEMENTS[copyBoard[i][c].v - 1]);
            }

            if (hasClass(item, "h")) {
              classList(item, "h", "remove");
            }

            addStyle(item, {
              left: `${copyBoard[i][c].l}px`,
              top: `${copyBoard[i][c].t}px`,
            });
          }
        }
      }

      BOARD = copyBoard;

      await delay(200);
      if (!progress) return;
      const { itemsRemove: newItemsRemove = [], prizes: newPrizes = [] } =
        validateMatch(BOARD);
      if (newItemsRemove.length !== 0) {
        removeAnimateBoardElements(BOARD, newItemsRemove, newPrizes);
      } else {
        if (userData[playerHasTurn].m === 0) {
          progress.pause();
          validateTurn();
        } else {
          runClock(false);
          if (typeGame === 1 || playerHasTurn === "one") {
            blockBoard();
          }

          if (typeGame === 2 && playerHasTurn === "two") {
            scheduleBot();
          }
        }
      }
    };

    const itemIsPrize = (value) => [6, 7, 8, 9].includes(value);

    /**
     * Tapping a power-up triggers it.
     */
    const validateClick = (element = {}) => {
      if (itemIsPrize(element?.v)) {
        blockBoard(true);
        userData[playerHasTurn].m--;
        showMovements();
        removeAnimateBoardElements(
          BOARD,
          removeItemsFromPrize([[element.p.i, element.p.c], element.v], BOARD)
        );
      }
    };

    /**
     * Swaps two neighbouring pieces and checks for a match.
     */
    const validateMove = async (move = []) => {
      blockBoard(true);
      changePositionElements(move);
      const copyBoard = clone(BOARD);
      const movesPrizes = [];
      for (let i = 0; i < 2; i++) {
        const row = move[i].p.i;
        const col = move[i].p.c;
        const value = move[+!i].v;
        const id = move[+!i].i;
        copyBoard[row][col] = {
          ...copyBoard[row][col],
          v: value,
          i: id,
        };

        if (itemIsPrize(value)) {
          movesPrizes.push([[row, col], value]);
        }
      }
      await delay(200);
      if (!progress) return;
      let { itemsRemove = [], prizes = [] } = validateMatch(copyBoard);
      // Moved power-ups go off at their new position
      if (movesPrizes.length !== 0) {
        for (let i = 0; i < movesPrizes.length; i++) {
          itemsRemove = uniqueValues([
            ...itemsRemove,
            ...removeItemsFromPrize(movesPrizes[i], copyBoard),
          ]);
        }

        itemsRemove = itemsRemove.filter(
          (r) =>
            !(
              (
                prizes?.find(
                  (v) => v?.[0]?.[0] === r[0] && v?.[0]?.[1] === r[1]
                ) || []
              ).length !== 0
            )
        );
      }

      if (itemsRemove.length !== 0) {
        userData[playerHasTurn].m--;
        showMovements();
        removeAnimateBoardElements(copyBoard, itemsRemove, prizes, move);
      } else {
        // No match: put the pieces back
        changePositionElements(move, true);
        if (typeGame === 2 && playerHasTurn === "two") {
          scheduleBot();
        } else {
          blockBoard();
        }
      }
    };

    const RenderScore = () =>
      `<div class="sc df a c f wi pa"><div class=scn><div class="df wi he">${newArray(
        2,
        (i) =>
          `<div class="scv df a c" id=scv-${i + 1} ${inlineStyles({
            background: userData[!i ? "one" : "two"].c,
          })}>0</div>`
      )}</div><div class="sci wi df a s">${newArray(
        maxRounds,
        (i) => `<div class="scin df a c" id=in-${i + 1}>${i + 1}</div>`
      )}</div></div></div>`;

    const RenderTurn = () => {
      const Names = (name = "", id = 1) =>
        `<div class="tuna" id="na-${id}" ${inlineStyles({
          background: userData[id === 1 ? "one" : "two"].c,
        })}>${esc(name)}</div>`;

      const Turns = (p) =>
        newArray(
          2,
          (i) =>
            `<div class=tuni id=mov-${p}-${p === 2 ? +!i : i} ${inlineStyles({
              background: userData[p === 1 ? "one" : "two"].c,
            })}></div>`
        );

      return `<div class="tu wi pa"><div class="tun df a s wi">${Names(
        userData.one.n
      )}<div class=df>${newArray(
        2,
        (i) => `<div class=df>${Turns(i + 1)}</div>`
      )}</div>${Names(
        userData.two.n,
        2
      )}</div><div class="tup pr wi"><progress class="bp wi pr" value="100" max="100"></progress><div class="wi pa" id="tupl"></div></div></div>`;
    };

    const RenderTop = () =>
      `<top class="wi pr">${RenderScore()}${RenderTurn()}</top>`;

    const RenderBoard = () =>
      `<bo class=pr>${BOARD.map((cell) =>
        cell
          .map(
            (v) =>
              `<div class="it df a c pa" id="t-${`${v.i}`}" ${inlineStyles({
                left: `${v.l}px`,
                top: `${v.t}px`,
              })}>${BOARD_ELEMENTS[v.v - 1]}</div>`
          )
          .join("")
      ).join("")}</bo>`;

    const Overlay = () => `<div class="df a c wi he pa" id=ov></div>`;
    const Messages = () => `<div class="df a c wi pa" id=msb></div>`;

    setHtml(
      $("#render"),
      `<div class="ba df f wi he gm">${Messages()}${Overlay()}${Back()}${Sound()}${RenderTop()}${RenderBoard()}</div>`
    );

    /**
     * Returns the cell under the given board coordinates.
     */
    const getIndexCell = ({ x = 0, y = 0 }) => {
      const c = Math.floor(x / CELL);
      const i = Math.floor(y / CELL);
      return isValidIndex(i, c) ? BOARD[i][c] : undefined;
    };

    /**
     * Pointer position in board (unscaled) coordinates.
     */
    const getPosition = (e) => {
      const { left, top } = $("bo").getBoundingClientRect();
      return {
        x: (e.clientX - left) / scale,
        y: (e.clientY - top) / scale,
      };
    };

    // Board input (mouse, touch and pen through Pointer Events)
    let eventMove = {};
    const canPlay = () =>
      typeGame === 1 || (typeGame === 2 && playerHasTurn === "one");
    const handleEvent = {
      start: (e) => {
        if (e.button > 0 || !canPlay()) return;
        const position = getPosition(e);
        if (!getIndexCell(position)) return;
        eventMove = { start: position, id: e.pointerId };
        try {
          $("bo").setPointerCapture(e.pointerId);
        } catch (err) {
          /* ignore */
        }
      },
      move: (e) => {
        if (!eventMove.start || eventMove.end || e.pointerId !== eventMove.id)
          return;
        const current = getPosition(e);
        const dx = current.x - eventMove.start.x;
        const dy = current.y - eventMove.start.y;
        // A swipe of about a third of a cell picks the direction
        if (Math.max(Math.abs(dx), Math.abs(dy)) < CELL * 0.35) return;
        const origin = getIndexCell(eventMove.start);
        const dir =
          Math.abs(dx) > Math.abs(dy)
            ? [0, Math.sign(dx)]
            : [Math.sign(dy), 0];
        const target = BOARD?.[origin.p.i + dir[0]]?.[origin.p.c + dir[1]];
        if (target) {
          eventMove.end = current;
          validateMove([origin, target]);
        } else {
          // Swiping off the board still triggers a power-up
          validateClick(origin);
          eventMove = { end: true };
        }
      },
      end: (e) => {
        if (eventMove.id !== undefined && e.pointerId !== eventMove.id) return;
        if (eventMove.start && !eventMove.end && e.type === "pointerup") {
          validateClick(getIndexCell(eventMove.start));
        }
        eventMove = {};
      },
    };

    const board = $("bo");
    $on(board, "pointerdown", handleEvent.start);
    $on(board, "pointermove", handleEvent.move);
    $on(board, "pointerup", handleEvent.end);
    $on(board, "pointercancel", handleEvent.end);

    playSound("c");
    const initialCounter = 3;
    setHtml($("#ov"), initialCounter);
    const initialTimer = chronometer(
      (counter) => {
        setHtml($("#ov"), counter);
        playSound("c");
        if (counter === 0) {
          $("#ov")?.remove();
          validateTurn(true);
        }
      },
      { base: initialCounter, int: 1000 }
    );
    initialTimer.start();

    // Pause the clocks while the page is hidden
    visibilityHooks = {
      pause() {
        if (paused) return;
        paused = {
          progress: progress?.running(),
          initial: initialTimer.running(),
          bot: botPending,
        };
        progress?.pause();
        initialTimer.pause();
        cancelPlayIA();
      },
      resume() {
        if (!paused) return;
        const p = paused;
        paused = null;
        if (p.progress) progress?.tick();
        if (p.initial) initialTimer.tick();
        if (p.bot) scheduleBot();
      },
    };

    const exitGame = (screen = "Lobby") => {
      visibilityHooks = null;
      cancelPlayIA();
      initialTimer.pause();
      progress?.pause();
      progress = null;
      Screen(screen, userData);
    };

    $on($("#back"), "click", () =>
      Modal.show({
        icon: "⚠️",
        txt: "<p>Leave this match?</p>",
        yes: "LEAVE",
        no: "STAY",
        cb(answer) {
          if (answer) exitGame();
        },
      })
    );

    $on($("#bso"), "click", () => {
      localSound = !localSound;
      savePropierties("sound", localSound ? "yes" : "no");
      setHtml($("#bso"), localSound ? "🔈" : "🔇");
    });
  };

  // -------------------------------------------------------------------------
  // Menus
  // -------------------------------------------------------------------------
  const RenderListButtons = (btns = []) =>
    `<div class="df a c f mBs">${btns
      .map((v, i) => `<button id=el-${i} class="mB wi">${v}</button>`)
      .join("")}</div>`;

  const evenListButtons = (cb) =>
    $$(".mBs > button").forEach((btn) =>
      $on(btn, "click", (e) => cb(+e.currentTarget.id.split("-")[1]))
    );

  const Logo = () =>
    `<div class="lg df a c f"><div class=sk>💀</div><h1><span>SKULL</span> <span>MATCH</span></h1></div>`;

  const UserName = () =>
    `<div class="wnuse wi df a c"><button class="mB pr" id=nuse title="Change your name">${esc(
      getUser()[0]
    )}</button></div>`;

  const EndGame = (data) => {
    const p1 = data.one.p;
    const p2 = data.two.p;
    const result = p1 === p2 ? "tie" : p1 > p2 ? "win" : "lose";
    let title;
    let icon;
    let small = false;
    if (result === "tie") {
      title = "IT'S A TIE!";
      icon = "👻";
    } else if (data.mode === 2) {
      title = result === "win" ? "YOU WIN!" : "YOU LOST!";
      icon = result === "win" ? "🏆" : "☠️";
    } else {
      title = `${esc(data[result === "win" ? "one" : "two"].n)} WINS!`;
      icon = "🏆";
      small = true;
    }
    playSound(result === "lose" && data.mode === 2 ? "l" : "w");
    setHtml(
      $("#render"),
      `<div class="ba df f a wi he"><div class="eg df a c f wi he">${Logo()}<h2${
        small ? " class=sm" : ""
      }>${title}</h2><span>${icon}</span><div class="egp df a c">${newArray(
        2,
        (i) =>
          `<div class="egu wi"><div class=egn>${esc(
            data[!i ? "one" : "two"].n
          )}</div><div ${inlineStyles({
            color: data[!i ? "one" : "two"].c,
          })}>${data[!i ? "one" : "two"].p}</div></div>`
      )}</div><button class=mB id=cancel>HOME</button></div></div>`
    );
    $on($("#cancel"), "click", () => Screen());
  };

  const Difficulty = () => {
    setHtml(
      $("#render"),
      `<div class="ba df f a wi he menu"><div class="df a c f wi he">${Back()}${Logo()}<p class=hint>Choose the bot's difficulty</p>${RenderListButtons(
        ["EASY", "MEDIUM", "HARD"]
      )}</div></div>`
    );

    evenListButtons((type) => {
      Screen("Game", {
        typeGame: 2,
        level: type + 1,
        users: setOrder([getUser(), ["Bot", "bot"]]),
      });
    });

    $on($("#back"), "click", () => Screen());
  };

  const Lobby = () => {
    setHtml(
      $("#render"),
      `<div class="ba df f a wi he menu"><div class="df a c f wi he">
      ${UserName()}${Logo()}${RenderListButtons([
        "TWO PLAYERS",
        "VS BOT",
      ])}<p class=ab>by Jorge Rubiano</p></div></div>`
    );

    $on($("#nuse"), "click", () => {
      Modal.show({
        txt: "<h2>Your name</h2>",
        yes: "SAVE",
        no: "CANCEL",
        input: getUser()[0],
        cb(ok, value) {
          const newName = (value || "").replace(/<\/?[^>]+(>|$)/g, "").trim();
          if (ok && newName) {
            const shortName =
              newName.length > 10 ? newName.substring(0, 10) + "..." : newName;
            savePropierties("name", shortName);
            if ($("#nuse")) $("#nuse").textContent = shortName;
          }
        },
      });
    });

    evenListButtons((type) => {
      if (type === 0) {
        return Screen("Game", {
          typeGame: 1,
          users: setOrder([getUser(), ["Guest", "guest"]]),
        });
      }
      Screen("Difficulty");
    });
  };

  const Screen = (screen = "Lobby", params = {}) => {
    const Handler = {
      Game,
      EndGame,
      Lobby,
      Difficulty,
    };
    if (Modal.isOpen()) Modal.hide();
    Handler[screen](params);
  };

  // -------------------------------------------------------------------------
  // Responsive scaling: pick the layout (portrait/landscape) that gives the
  // biggest board, then scale and centre it in the window.
  // -------------------------------------------------------------------------
  const onWindowResize = () => {
    const root = $("#root");
    const W = document.documentElement.clientWidth || window.innerWidth;
    const H = document.documentElement.clientHeight || window.innerHeight;
    const sP = Math.min(W / PORTRAIT.w, H / PORTRAIT.h);
    const sL = Math.min(W / LANDSCAPE.w, H / LANDSCAPE.h);
    const landscape = sL > sP * 1.05;
    const size = landscape ? LANDSCAPE : PORTRAIT;
    scale = landscape ? sL : sP;
    classList(root, "L", landscape ? "add" : "remove");
    // Use any spare vertical space (taller HUD / centred board)
    const h = Math.max(size.h, Math.floor((H / scale) * 100) / 100);
    root.style.setProperty("--w", `${size.w}px`);
    root.style.setProperty("--h", `${h}px`);
    const x = Math.round((W - size.w * scale) / 2);
    const y = Math.round((H - h * scale) / 2);
    root.style.transform = `translate(${x}px, ${y}px) scale(${scale})`;
    document.documentElement.style.setProperty("--s", scale);
    classList(root, "ready");
  };

  if (!getValueFromCache("name")) {
    savePropierties("name", `Zombie ${rnd(100, 999)}`);
  }

  setHtml($("#root"), `<div id=render class="df c"></div>`);
  // The modal lives outside #root so its backdrop covers the whole window
  document.body.insertAdjacentHTML("beforeend", Modal.render());
  Modal.events();
  $on(document, "contextmenu", (e) => e.preventDefault());
  $on(window, "resize", onWindowResize);
  $on(window, "orientationchange", () => setTimeout(onWindowResize, 100));
  if (window.visualViewport) {
    $on(window.visualViewport, "resize", onWindowResize);
  }
  $on(document, "visibilitychange", () => {
    if (!visibilityHooks) return;
    if (document.hidden) visibilityHooks.pause();
    else visibilityHooks.resume();
  });

  onWindowResize();
  Screen();
})();
