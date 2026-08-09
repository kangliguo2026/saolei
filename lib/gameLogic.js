/**
 * 扫雷游戏核心逻辑
 */

// 难度配置
export const DIFFICULTIES = {
  easy: { rows: 9, cols: 9, mines: 10, label: '简单' },
  medium: { rows: 16, cols: 16, mines: 40, label: '中等' },
  hard: { rows: 16, cols: 30, mines: 99, label: '困难' },
};

/**
 * 创建空棋盘
 */
export function createBoard(rows, cols) {
  const board = [];
  for (let r = 0; r < rows; r++) {
    const row = [];
    for (let c = 0; c < cols; c++) {
      row.push({
        row: r,
        col: c,
        isMine: false,
        isRevealed: false,
        isFlagged: false,
        isExploded: false,
        adjacentMines: 0,
      });
    }
    board.push(row);
  }
  return board;
}

/**
 * 放置地雷（避开第一次点击的格子及其邻居）
 */
export function placeMines(board, mineCount, firstRow, firstCol) {
  const rows = board.length;
  const cols = board[0].length;

  // 收集安全区域（第一次点击的格子及周围 8 格）
  const safeCells = new Set();
  for (let dr = -1; dr <= 1; dr++) {
    for (let dc = -1; dc <= 1; dc++) {
      const r = firstRow + dr;
      const c = firstCol + dc;
      if (r >= 0 && r < rows && c >= 0 && c < cols) {
        safeCells.add(r * cols + c);
      }
    }
  }

  // 收集可放置地雷的位置（排除安全区域）
  const possiblePositions = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (!safeCells.has(r * cols + c)) {
        possiblePositions.push({ r, c });
      }
    }
  }

  // 随机打乱并放置地雷
  shuffle(possiblePositions);
  const actualMineCount = Math.min(mineCount, possiblePositions.length);
  for (let i = 0; i < actualMineCount; i++) {
    const { r, c } = possiblePositions[i];
    board[r][c].isMine = true;
  }

  // 计算每个非地雷格子的相邻地雷数
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (!board[r][c].isMine) {
        board[r][c].adjacentMines = countAdjacentMines(board, r, c);
      }
    }
  }

  return board;
}

/**
 * 计算相邻地雷数
 */
function countAdjacentMines(board, row, col) {
  let count = 0;
  for (let dr = -1; dr <= 1; dr++) {
    for (let dc = -1; dc <= 1; dc++) {
      if (dr === 0 && dc === 0) continue;
      const r = row + dr;
      const c = col + dc;
      if (r >= 0 && r < board.length && c >= 0 && c < board[0].length) {
        if (board[r][c].isMine) count++;
      }
    }
  }
  return count;
}

/**
 * 揭开格子（带洪水填充，自动展开空白区域）
 */
export function revealCell(board, row, col) {
  const cell = board[row][col];
  if (cell.isRevealed || cell.isFlagged) return board;

  cell.isRevealed = true;

  // 如果是地雷，标记为已爆炸
  if (cell.isMine) {
    cell.isExploded = true;
    return board;
  }

  // 如果是空白格子（0 个相邻地雷），自动展开周围格子
  if (cell.adjacentMines === 0) {
    for (let dr = -1; dr <= 1; dr++) {
      for (let dc = -1; dc <= 1; dc++) {
        if (dr === 0 && dc === 0) continue;
        const r = row + dr;
        const c = col + dc;
        if (r >= 0 && r < board.length && c >= 0 && c < board[0].length) {
          if (!board[r][c].isRevealed && !board[r][c].isFlagged) {
            revealCell(board, r, c);
          }
        }
      }
    }
  }

  return board;
}

/**
 * 切换标记旗帜
 */
export function toggleFlag(board, row, col) {
  const cell = board[row][col];
  if (cell.isRevealed) return board;
  cell.isFlagged = !cell.isFlagged;
  return board;
}

/**
 * 检查是否胜利（所有非地雷格子都已揭开）
 */
export function checkWin(board) {
  for (let r = 0; r < board.length; r++) {
    for (let c = 0; c < board[0].length; c++) {
      const cell = board[r][c];
      if (!cell.isMine && !cell.isRevealed) return false;
    }
  }
  return true;
}

/**
 * 揭开所有地雷（游戏失败时）
 */
export function revealAllMines(board) {
  for (let r = 0; r < board.length; r++) {
    for (let c = 0; c < board[0].length; c++) {
      if (board[r][c].isMine) {
        board[r][c].isRevealed = true;
      }
    }
  }
  return board;
}

/**
 * 统计已使用的旗帜数
 */
export function countFlags(board) {
  let count = 0;
  for (let r = 0; r < board.length; r++) {
    for (let c = 0; c < board[0].length; c++) {
      if (board[r][c].isFlagged) count++;
    }
  }
  return count;
}

/**
 * 深拷贝棋盘
 */
export function cloneBoard(board) {
  return board.map((row) => row.map((cell) => ({ ...cell })));
}

/**
 * 数组随机打乱
 */
function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}
