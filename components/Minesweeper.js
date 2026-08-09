import { useState, useEffect, useRef, useCallback } from 'react';
import {
  DIFFICULTIES,
  createBoard,
  placeMines,
  revealCell,
  toggleFlag,
  checkWin,
  revealAllMines,
  countFlags,
  cloneBoard,
} from '../lib/gameLogic';

export default function Minesweeper({ user }) {
  const [difficulty, setDifficulty] = useState('easy');
  const [board, setBoard] = useState(() => createBoard(DIFFICULTIES.easy.rows, DIFFICULTIES.easy.cols));
  const [gameStatus, setGameStatus] = useState('ready'); // ready | playing | won | lost
  const [time, setTime] = useState(0);
  const [flagMode, setFlagMode] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const timerRef = useRef(null);
  const longPressRef = useRef(null);

  const config = DIFFICULTIES[difficulty];
  const totalMines = config.mines;
  const flagCount = countFlags(board);

  // 计时器
  useEffect(() => {
    if (gameStatus === 'playing') {
      timerRef.current = setInterval(() => {
        setTime((t) => t + 1);
      }, 1000);
      return () => clearInterval(timerRef.current);
    }
  }, [gameStatus]);

  // 格式化时间
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  // 格式化时间（秒）
  const formatScore = (seconds) => {
    return `${seconds}s`;
  };

  // 重新开始游戏
  const newGame = useCallback((diff) => {
    const cfg = DIFFICULTIES[diff || difficulty];
    setBoard(createBoard(cfg.rows, cfg.cols));
    setGameStatus('ready');
    setTime(0);
    setShowResult(false);
  }, [difficulty]);

  // 切换难度
  const changeDifficulty = (diff) => {
    setDifficulty(diff);
    newGame(diff);
  };

  // 处理左键点击（揭开格子）
  const handleCellClick = (row, col) => {
    if (gameStatus === 'won' || gameStatus === 'lost') return;

    const cell = board[row][col];

    // 标记模式下，左键也是标记/取消标记
    if (flagMode) {
      handleFlag(row, col);
      return;
    }

    // 如果已标记，不揭开
    if (cell.isFlagged) return;

    // 如果已揭开，不操作
    if (cell.isRevealed) return;

    // 第一次点击：放置地雷
    if (gameStatus === 'ready') {
      const newBoard = cloneBoard(board);
      placeMines(newBoard, totalMines, row, col);
      revealCell(newBoard, row, col);
      setBoard(newBoard);
      setGameStatus('playing');
      return;
    }

    // 揭开格子
    const newBoard = cloneBoard(board);
    revealCell(newBoard, row, col);

    // 检查是否踩雷
    if (newBoard[row][col].isMine) {
      revealAllMines(newBoard);
      setBoard(newBoard);
      setGameStatus('lost');
      setShowResult(true);
      return;
    }

    // 检查是否胜利
    if (checkWin(newBoard)) {
      setBoard(newBoard);
      setGameStatus('won');
      setShowResult(true);
      // 保存分数
      saveScore(time + 1);
      return;
    }

    setBoard(newBoard);
  };

  // 处理右键点击（标记旗帜）
  const handleFlag = (row, col) => {
    if (gameStatus === 'won' || gameStatus === 'lost') return;
    if (gameStatus === 'ready') return; // 第一次点击必须是揭开
    if (board[row][col].isRevealed) return;

    const newBoard = cloneBoard(board);
    toggleFlag(newBoard, row, col);
    setBoard(newBoard);
  };

  // 右键事件
  const handleContextMenu = (e, row, col) => {
    e.preventDefault();
    handleFlag(row, col);
  };

  // 长按检测（移动端标记）
  const handleTouchStart = (row, col) => {
    if (gameStatus === 'won' || gameStatus === 'lost') return;
    longPressRef.current = setTimeout(() => {
      handleFlag(row, col);
      longPressRef.current = null;
    }, 400);
  };

  const handleTouchEnd = (row, col) => {
    if (longPressRef.current) {
      clearTimeout(longPressRef.current);
      longPressRef.current = null;
      // 短按 = 揭开
      handleCellClick(row, col);
    }
  };

  const handleTouchCancel = () => {
    if (longPressRef.current) {
      clearTimeout(longPressRef.current);
      longPressRef.current = null;
    }
  };

  // 保存分数
  const saveScore = async (finalTime) => {
    try {
      await fetch('/api/scores', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ difficulty, time: finalTime }),
      });
    } catch (err) {
      // 分数保存失败不影响游戏体验
    }
  };

  // 获取格子显示内容
  const getCellContent = (cell) => {
    if (!cell.isRevealed) {
      return cell.isFlagged ? '\u{1F6A9}' : '';
    }
    if (cell.isMine) {
      return cell.isExploded ? '\u{1F4A5}' : '\u{1F4A3}';
    }
    if (cell.adjacentMines > 0) {
      return String(cell.adjacentMines);
    }
    return '';
  };

  // 获取格子样式类
  const getCellClass = (cell) => {
    const classes = ['cell'];
    if (cell.isRevealed) {
      classes.push('cell-revealed');
      if (cell.isMine) {
        classes.push(cell.isExploded ? 'cell-mine-exploded' : 'cell-mine');
      } else if (cell.adjacentMines > 0) {
        classes.push(`num-${cell.adjacentMines}`);
      }
    } else {
      classes.push('cell-unrevealed');
    }
    return classes.join(' ');
  };

  // 获取表情
  const getFace = () => {
    if (gameStatus === 'won') return '\u{1F60E}';
    if (gameStatus === 'lost') return '\u{1F635}';
    return '\u{1F642}';
  };

  return (
    <div className="game-page">
      {/* 难度选择 */}
      <div className="game-header">
        <div className="game-difficulty-selector">
          {Object.entries(DIFFICULTIES).map(([key, val]) => (
            <button
              key={key}
              className={`difficulty-btn ${difficulty === key ? 'active' : ''}`}
              onClick={() => changeDifficulty(key)}
            >
              {val.label} {val.rows}x{val.cols}
            </button>
          ))}
        </div>
        <button
          className={`flag-mode-toggle ${flagMode ? 'active' : ''}`}
          onClick={() => setFlagMode(!flagMode)}
        >
          {flagMode ? '\u{1F6A9} 标记模式' : '\u{1F642} 挖雷模式'}
        </button>
      </div>

      {/* 状态栏 */}
      <div className="game-status-bar">
        <div>
          <div className="status-counter">
            {String(totalMines - flagCount).padStart(3, '0')}
          </div>
          <div className="status-counter-label" style={{ textAlign: 'center', marginTop: '4px' }}>
            剩余地雷
          </div>
        </div>
        <button
          className="status-face"
          onClick={() => newGame()}
          title="重新开始"
        >
          {getFace()}
        </button>
        <div>
          <div className="status-counter">
            {formatTime(time)}
          </div>
          <div className="status-counter-label" style={{ textAlign: 'center', marginTop: '4px' }}>
            用时
          </div>
        </div>
      </div>

      {/* 游戏棋盘 */}
      <div className="game-board-wrapper">
        <div
          className="game-board"
          style={{
            gridTemplateColumns: `repeat(${config.cols}, 32px)`,
          }}
        >
          {board.map((row, rIdx) =>
            row.map((cell, cIdx) => (
              <button
                key={`${rIdx}-${cIdx}`}
                className={getCellClass(cell)}
                onClick={() => handleCellClick(rIdx, cIdx)}
                onContextMenu={(e) => handleContextMenu(e, rIdx, cIdx)}
                onTouchStart={() => handleTouchStart(rIdx, cIdx)}
                onTouchEnd={(e) => { e.preventDefault(); handleTouchEnd(rIdx, cIdx); }}
                onTouchCancel={handleTouchCancel}
                disabled={gameStatus === 'won' || gameStatus === 'lost'}
                style={{
                  fontSize: cell.isMine ? '1rem' : cell.adjacentMines > 0 ? '1.1rem' : '1rem',
                }}
              >
                {getCellContent(cell)}
              </button>
            ))
          )}
        </div>
      </div>

      {/* 游戏结果弹窗 */}
      {showResult && (
        <div className="game-result" onClick={() => setShowResult(false)}>
          <div className="game-result-card" onClick={(e) => e.stopPropagation()}>
            <div className="game-result-icon">
              {gameStatus === 'won' ? '\u{1F389}' : '\u{1F4A5}'}
            </div>
            <div className={`game-result-title ${gameStatus === 'won' ? 'game-result-win' : 'game-result-lose'}`}>
              {gameStatus === 'won' ? '胜利！' : '游戏结束'}
            </div>
            {gameStatus === 'won' && (
              <div className="game-result-time">
                用时：{formatScore(time)}
              </div>
            )}
            <div className="game-result-actions">
              <button className="btn-primary" onClick={() => newGame()}>
                再来一局
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
