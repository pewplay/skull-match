/*
 * Skull Match - board logic.
 * Based on "Deathmatch" by Jorge Rubiano (js13kGames 2022), MIT License.
 */
const MAX = 5;
const SIZE = 7;
const HEIGHT = 732;
const WIDTH = 412;
const CELL = WIDTH / 7;

/**
 * Random integer in [min, max]
 * @param {*} min
 * @param {*} max
 * @returns
 */
const rnd = (min, max) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

/**
 * Randomly assigns each player a colour and picks who starts.
 * @param {*} users
 * @returns
 */
const setOrder = (users = []) => {
  const color = rnd(0, 1);
  const turn = rnd(0, 1);
  users[0][2] = color ? "r": "b";
  users[1][2] = color ? "b": "r";

  return {
    users,
    turn: users[turn][1],
  };
};

/**
 * True when (r, c) is inside the board.
 * @param {*} r
 * @param {*} c
 * @returns
 */
const isValidIndex = (r, c) => r >= 0 && r < SIZE && c >= 0 && c < SIZE;

/**
 * Returns every cell of the given type.
 * @param {*} board
 * @param {*} type
 * @returns
 */
const eBoard = (board = [], type = 0) => {
  const elements = [];
  for (let i = 0; i < SIZE; i++) {
    for (let c = 0; c < SIZE; c++) {
      if (board[i][c].v === type) {
        elements.push({
          type,
          i,
          c,
        });
      }
    }
  }

  return elements;
};

/**
 * Checks whether a board still has at least one possible move.
 * @param {*} board
 * @returns
 */
const isValidBoard = (board = []) => {
  const getThree = () => {
    const lines = [];

    for (let i = 0; i < SIZE; i++) {
      for (let c = 0; c < SIZE; c++) {
        const value = board[i][c].v;
        /**
         * 0 and 1: coordinates that complete the three
         * 2: cell to move into
         * 3: candidate cells of the same type that can move there
         */
        const previus = [
          [
            i - 1,
            c,
            [i - 2, c],
            [
              [i - 2, c - 1],
              [i - 3, c],
              [i - 2, c + 1],
            ],
          ],
          [
            i,
            c - 1,
            [i, c - 2],
            [
              [i, c - 3],
              [i - 1, c - 2],
              [i + 1, c - 2],
            ],
          ],
          [
            i + 1,
            c,
            [i + 2, c],
            [
              [i + 3, c],
              [i + 2, c - 1],
              [i + 2, c + 1],
            ],
          ],
          [
            i,
            c + 1,
            [i, c + 2],
            [
              [i, c + 3],
              [i - 1, c + 2],
              [i + 1, c + 2],
            ],
          ],
          [
            i - 2,
            c,
            [i - 1, c],
            [
              [i - 1, c - 1],
              [i - 1, c + 1],
            ],
          ],
          [
            i + 2,
            c,
            [i + 1, c],
            [
              [i + 1, c - 1],
              [i + 1, c + 1],
            ],
          ],
          [
            i,
            c + 2,
            [i, c + 1],
            [
              [i - 1, c + 1],
              [i + 1, c + 1],
            ],
          ],
          [
            i,
            c - 2,
            [i, c - 1],
            [
              [i - 1, c - 1],
              [i + 1, c - 1],
            ],
          ],
        ]
          .filter((v) => isValidIndex(v[2][0], v[2][1]))
          .filter((v) => board?.[v[0]]?.[v[1]]?.v === value)
          .map((v) => [
            v[0],
            v[1],
            v[2],
            v[3].filter((p) => board?.[p[0]]?.[p[1]]?.v === value),
          ])
          .filter((v) => v[3].length !== 0);

        if (previus.length !== 0) {
          lines.push(previus);
        }
      }
    }

    return lines;
  };

  const getFour = () => {
    const lines = [];
    for (let i = 0; i < SIZE; i++) {
      for (let c = 0; c < SIZE; c++) {
        const value = board[i][c].v;
        /**
         * 0: the other two cells of the square
         * 1: target cell that completes the square
         * 2: candidate cells of the same type that can move there
         */
        const previus = [
          [
            [
              [i - 1, c],
              [i, c - 1],
            ],
            [i - 1, c - 1],
            [
              [i - 2, c - 1],
              [i - 1, c - 2],
            ],
          ],
          [
            [
              [i + 1, c],
              [i, c - 1],
            ],
            [i + 1, c - 1],
            [
              [i + 2, c - 1],
              [i + 1, c - 2],
            ],
          ],
          [
            [
              [i + 1, c],
              [i, c + 1],
            ],
            [i + 1, c + 1],
            [
              [i + 2, c + 1],
              [i + 1, c + 2],
            ],
          ],
          [
            [
              [i - 1, c],
              [i, c + 1],
            ],
            [i - 1, c + 1],
            [
              [i - 2, c + 1],
              [i - 1, c + 2],
            ],
          ],
        ]
          .filter((v) => isValidIndex(v[1][0], v[1][1]))
          .filter(
            (v) =>
              board?.[v[0][0][0]]?.[v[0][0][1]]?.v === value &&
              board?.[v[0][1][0]]?.[v[0][1][1]]?.v === value
          )
          .map((v) => [
            v[0],
            v[1],
            v[2].filter((p) => board?.[p[0]]?.[p[1]]?.v === value),
          ])
          .filter((v) => v[2].length !== 0);

        if (previus.length !== 0) {
          lines.push(previus);
        }
      }
    }

    return lines;
  };

  // Power-ups on the board: dynamite (6), axe (7), rocket (8), bomb (9)
  const dynamite = eBoard(board, 6); // 🧨
  const axe = eBoard(board, 7); // 🪓 // Horizontal...
  const rocket = eBoard(board, 8); // 🚀 // vertical...
  const bomb = eBoard(board, 9); // 💣
  const three = getThree();
  const four = getFour();

  return {
    isValid:
      [dynamite, axe, rocket, bomb, three, four].filter((v) => v.length !== 0)
        .length !== 0,
    values: {
      axe,
      bomb,
      four,
      dynamite,
      rocket,
      three,
    },
  };
};

/**
 * Generates a new board with no ready-made matches.
 * @param {*} skip
 * @returns
 */
const genBoard = (skip = []) => {
  const board = [];

  const is3Lines = (r, c, value) =>
    [board?.[r - 2]?.[c]?.v, board?.[r - 1]?.[c]?.v].every(
      (v) => v === value
    ) ||
    [board?.[r]?.[c - 2]?.v, board?.[r]?.[c - 1]?.v].every((v) => v === value);

  const isSquare = (r, c, value) =>
    [
      [
        board?.[r - 1]?.[c]?.v,
        board?.[r - 1]?.[c + 1]?.v,
        board?.[r]?.[c + 1]?.v,
      ],
      [
        board?.[r + 1]?.[c]?.v,
        board?.[r + 1]?.[c + 1]?.v,
        board?.[r]?.[c + 1]?.v,
      ],
      [
        board?.[r - 1]?.[c]?.v,
        board?.[r - 1]?.[c + 1]?.v,
        board?.[r]?.[c + 1]?.v,
      ],
      [
        board?.[r - 1]?.[c]?.v,
        board?.[r - 1]?.[c - 1]?.v,
        board?.[r]?.[c - 1]?.v,
      ],
    ]
      .map((item) => item.every((v) => v === value))
      .filter((v) => v).length !== 0;

  for (let i = 0; i < SIZE; i++) {
    board[i] = [];

    for (let c = 0; c < SIZE; c++) {
      let value = rnd(1, MAX);

      do {
        if (
          is3Lines(i, c, value) ||
          isSquare(i, c, value) ||
          skip.includes(value)
        ) {
          value = rnd(1, MAX);
        } else {
          break;
        }
      } while (1);

      board[i][c] = {
        v: value,
        i: i * SIZE + c,
        l: Math.round(CELL * c),
        t: Math.round(CELL * i),
        p: { i, c },
      };
    }
  }

  return board;
};

/**
 * Generates a board that has at least one possible move.
 * @param {*} skip
 * @returns
 */
const newBoard = (skip = []) => {
  let board = genBoard(skip);

  do {
    if (!isValidBoard(board).isValid) {
      board = genBoard(skip);
    } else {
      break;
    }
  } while (1);

  return board;
};
