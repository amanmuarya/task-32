import React, { useState, useEffect, useCallback, useRef } from 'react';
const FILES = 'abcdefgh';
function initialBoard() {
  const b = Array.from
  ({ length: 8 }, () => Array(8).fill(null));
  // Create an empty 8x8 chess board
  // Set the initial position of all pieces
  const back = 
  ['R', 'N', 'B', 'Q', 'K', 'B', 'N', 'R'];
  for (let c = 0; c < 8; c++) {
    b[0][c] = 
    { type: back[c], color: 'b' };
    b[1][c] = { type: 'P', color: 'b' };
    b[6][c] = 
    { type: 'P', color: 'w' };
    b[7][c] = { type: back[c], color: 'w' };
  }
  return b;
}
function cloneBoard(b) { return b.map(row => row.map(p => (p ? { ...p } : null))); }
function inBounds(r, c) { return r >= 0 && r < 8 && c >= 0 && c < 8; }
function sq(r, c) { return FILES[c] + (8 - r); }
function opp(color) { return color === 'w' ? 'b' : 'w'; }
function isEnemy(p, color) { return p && p.color !== color; }
function isFriend(p, color) { return p && p.color === color; }

const KNIGHT_OFFS = [[-2, -1], [-2, 1], [-1, -2], [-1, 2], [1, -2], [1, 2], [2, -1], [2, 1]];
// Possible movement offsets for a king

const KING_OFFS = [[-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 1], [1, -1], [1, 0], [1, 1]];
const BISHOP_DIRS = [[-1, -1], [-1, 1], [1, -1], [1, 1]];

// Straight movement directions for a rook
const ROOK_DIRS = [[-1, 0], [1, 0], [0, -1], [0, 1]];

// Check if a square is attacked by a specific color
function isAttacked(board, r, c, byColor) {
  const pdir = byColor === 'w' ? -1 : 1;
  for (const dc of [-1, 1]) {
    const pr = r - pdir, pc = c - dc;
    // Check if the position is inside the board
    if (inBounds(pr, pc)) {
      const p = board[pr][pc];
      if (p && p.type === 'P' && p.color === byColor) return true;
    }
  }
  for (const [dr, dc] of KNIGHT_OFFS) {
    const nr = r + dr, nc = c + dc;
    if (inBounds(nr, nc)) {
      const p = board[nr][nc];
      if (p && p.type === 'N' && p.color === byColor) return true;
    }
  }
  for (const [dr, dc] of KING_OFFS) {
    const nr = r + dr, nc = c + dc;
    if (inBounds(nr, nc)) {
      const p = board[nr][nc];
      // Check if a bishop or queen of the given color is found
      if (p && p.type === 'K' && p.color === byColor) return true;
    }
  }
  for (const [dr, dc] of BISHOP_DIRS) {
    let nr = r + dr, nc = c + dc;
    while (inBounds(nr, nc)) {
      const p = board[nr][nc];
      if (p) { if (p.color === byColor && (p.type === 'B' || p.type === 'Q')) 
        return true; break; }
      nr += dr; nc += dc;
    }
  }
  for (const [dr, dc] of ROOK_DIRS) {
    let nr = r + dr, nc = c + dc;
    while (inBounds(nr, nc)) {
      const p = board[nr][nc];
      if (p) { if (p.color === byColor && (p.type === 'R' || p.type === 'Q')) return true; break; }
      // Move to the next square in the same direction
      nr += dr; nc += dc;
    }
  }
  return false;
}

function findKing(board, color) {
  for (let r = 0; r < 8; r++) for (let c = 0; c < 8; c++) {
    const p = board[r][c];
    if (p && p.type === 'K' && p.color === color) return { r, c };
  }
  return null;
}
// Generate possible moves for a piece without checking if the king is in check

function pseudoMoves(board, r, c, state) {
  const piece = board[r][c];
  // Return an empty array if there is no piece
  if (!piece) return [];
  const { type, color } = piece;
  const moves = [];
  const dir = color === 'w' ? -1 : 1;
  // Set the movement direction based on the piece color
  const startRow = color === 'w' ? 6 : 1;
  const lastRow = color === 'w' ? 0 : 7;

  if (type === 'P') {
    if (inBounds(r + dir, c) && !board[r + dir][c]) {
      moves.push({ r: r + dir, c, type: 'move', promotion: r + dir === lastRow });
      if (r === startRow && !board[r + 2 * dir][c]) {
        moves.push({ r: r + 2 * dir, c, type: 'double' });
      }
    }
 // Check both diagonal directions for a pawn
    for (const dc of [-1, 1]) {
      const nr = r + dir, nc = c + dc;
      if (inBounds(nr, nc)) {
        const target = board[nr][nc];
        if (isEnemy(target, color))
   // Check if en passant is possible
    {
    moves.push({ r: nr, c: nc, type: 'capture', promotion: nr === lastRow });
   } else if (state.enPassant && state.enPassant.r === nr && state.enPassant.c === nc) {
   moves.push({ r: nr, c: nc, type: 'enpassant' });
   }
   }
    }
  } else if (type === 'N') {
    for (const [dr, dc] of KNIGHT_OFFS) {
      const nr = r + dr, nc = c + dc;
      if (inBounds(nr, nc) && !isFriend(board[nr][nc], color)) {
   moves.push({ r: nr, c: nc, type: board[nr][nc] ? 'capture' : 'move' });
  }
    }
  } else if (type === 'B' || type === 'R' || type === 'Q') {
    const dirs = type === 'B' ? BISHOP_DIRS : type === 'R' ? ROOK_DIRS : [...BISHOP_DIRS, ...ROOK_DIRS];
    for (const [dr, dc] of dirs) {
      let nr = r + dr, nc = c + dc;
      while (inBounds(nr, nc)) {
    if (isFriend(board[nr][nc], color)) break;
     moves.push({ r: nr, c: nc, type: board[nr][nc] ? 'capture' : 'move' });
     if (board[nr][nc]) break;
     nr += dr; nc += dc;
      }
    }
  } else if (type === 'K') {
    for (const [dr, dc] of KING_OFFS) {
      const nr = r + dr, nc = c + dc;
      if (inBounds(nr, nc) && !isFriend(board[nr][nc], color)) {
        moves.push({ r: nr, c: nc, type: board[nr][nc] ? 'capture' : 'move' });
      }
    }
    // Get the castling rights from the game state
    const rights = state.castling;
    // Set the starting row based on the piece color
    const row = color === 'w' ? 7 : 0;
    if (r === row && c === 4)
      // Check if the king does not pass through an attacked square
      {
      if ((color === 'w' ? rights.wK : rights.bK) && !board[row][5] && !board[row][6] &&
        board[row][7] && board[row][7].type === 'R' && board[row][7].color === color) {
        if (!isAttacked(board, row, 4, opp(color)) && !isAttacked(board, row, 5, opp(color)) && !isAttacked(board, row, 6, opp(color))) {
          moves.push({ r: row, c: 6, type: 'castle-king' });
        }
      }
      if ((color === 'w' ? rights.wQ : rights.bQ) && !board[row][3] && !board[row][2] && !board[row][1] &&
        board[row][0] && board[row][0].type === 'R' && board[row][0].color === color) {
        if (!isAttacked(board, row, 4, opp(color)) && !isAttacked(board, row, 3, opp(color)) && !isAttacked(board, row, 2, opp(color))) {
     moves.push({ r: row, c: 2, type: 'castle-queen' });
    }
      }
    }
  }
  return moves;
}
// Apply a move and return the updated board
function applyMove(board, r, c, move, promoChoice) {
  const nb = cloneBoard(board);
  // Get the piece that is being moved
  const piece = nb[r][c];
  let captured = null;
  if (move.type === 'enpassant') {
    captured = nb[r][move.c];
    nb[r][move.c] = null;
  } else if (board[move.r][move.c]) {
    captured = board[move.r][move.c];
  }
  nb[move.r][move.c] = piece;
  nb[r][c] = null;
  if (move.promotion) {
    nb[move.r][move.c] = { type: promoChoice || 'Q', color: piece.color };
  }
  if (move.type === 'castle-king') {
    const row = r;
    nb[row][5] = nb[row][7];
    nb[row][7] = null;
  } else if (move.type === 'castle-queen') {
    const row = r;
    nb[row][3] = nb[row][0];
    nb[row][0] = null;
  }
  return { board: nb, captured };
}
// Generate all legal moves for a piece on the selected square
function legalMovesForSquare(board, r, c, state) {
  const piece = board[r][c];
  if (!piece) return [];
  const pseudo = pseudoMoves(board, r, c, state);
  const legal = [];
  // Check each possible move
  for (const m of pseudo) {
    const { board: nb } = applyMove(board, r, c, m, 'Q');
    const kingPos = findKing(nb, piece.color);
    // Add the move if the king is not in check
    if (!kingPos || !isAttacked(nb, kingPos.r, kingPos.c, opp(piece.color))) {
      legal.push(m);
    }
  }
  return legal;
}
// Check if the player has at least one legal move
function hasAnyLegalMove(board, color, state) {
  for (let r = 0; r < 8; r++) for (let c = 0; c < 8; c++) {
    const p = board[r][c];
    // Check if the piece belongs to the current player
    if (p && p.color === color) {
      if (legalMovesForSquare(board, r, c, state).length > 0) return true;
    }
  }
  return false;
}

function finalizeCheckSuffix(s, isCheck, isMate) {
  if (isMate) return s + '#';
  if (isCheck) return s + '+';
  return s;
}
// Create Standard Algebraic Notation (SAN) for a chess move
function sanForMove(board, state, fromR, fromC, move, promoChoice, isCheck, isMate) {
  const piece = board[fromR][fromC];
  if (move.type === 'castle-king') return finalizeCheckSuffix('O-O', isCheck, isMate);
  // Handle kingside castling notation
  if (move.type === 'castle-queen') return finalizeCheckSuffix('O-O-O', isCheck, isMate);
  const destSq = sq(move.r, move.c);
  const isCapture = move.type === 'capture' || move.type === 'enpassant';
  let s = '';
  if (piece.type === 'P') {
    if (isCapture) s += FILES[fromC] + 'x';
    s += destSq;
    if (move.promotion) s += '=' + (promoChoice || 'Q');
    // Handle moves for other pieces
  } else {
    s += piece.type;
    const others = [];
    for (let r = 0; r < 8; r++) for (let c = 0; c < 8; c++) {
      if (r === fromR && c === fromC) continue;
      const p = board[r][c];
      if (p && p.type === piece.type && p.color === piece.color) {
        const lm = legalMovesForSquare(board, r, c, state);
        if (lm.some(mm => mm.r === move.r && mm.c === move.c)) others.push({ r, c });
      }
    }
    if (others.length) {
      const sameFile = others.some(o => o.c === fromC);
      const sameRank = others.some(o => o.r === fromR);
      if (!sameFile) s += FILES[fromC];
      else if (!sameRank) s += (8 - fromR);
      else s += FILES[fromC] + (8 - fromR);
    }
    if (isCapture) s += 'x';
    s += destSq;
  }
  return finalizeCheckSuffix(s, isCheck, isMate);
}

/*
   UI CONSTANTS
 */

// Store Unicode symbols for white and black chess pieces
const SYMBOLS = {
  w: { K: '\u2654', Q: '\u2655', R: '\u2656', B: '\u2657', N: '\u2658', P: '\u2659' },
  // Black chess piece symbols
  b: { K: '\u265A', Q: '\u265B', R: '\u265C', B: '\u265D', N: '\u265E', P: '\u265F' },
};
const PIECE_NAMES = { K: 'King', Q: 'Queen', R: 'Rook', B: 'Bishop', N: 'Knight', P: 'Pawn' };
const PROMO_CHOICES = ['Q', 'R', 'B', 'N'];
// Available choices for pawn promotion
const TIME_OPTIONS = [
  { label: '3 min', value: 180 },
  { label: '5 min', value: 300 },
  { label: '10 min', value: 600 },
  { label: '15 min', value: 900 },
  // 30-minute game
  { label: '30 min', value: 1800 },
];

function fmtClock(s) {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${sec.toString().padStart(2, '0')}`;
}

// Main Chess Game component
export default function ChessGame() {
  const [timeControl, setTimeControl] = useState(600);
  // Store the selected time control
  const [board, setBoard] = useState(initialBoard);
  const [turn, setTurn] = useState('w');
  const [castling, setCastling] = useState({ wK: true, wQ: true, bK: true, bQ: true });
  const [enPassant, setEnPassant] = useState(null);
  // Store the currently selected square
  const [selected, setSelected] = useState(null);
  const [legalMoves, setLegalMoves] = useState([]);
  const [moveHistory, setMoveHistory] = useState([]);
  const [captured, setCaptured] = useState({ w: [], b: [] });
  const [status, setStatus] = useState('playing');
  // Store the winner of the game
  const [winner, setWinner] = useState(null);
  const [whiteTime, setWhiteTime] = useState(600);
  const [blackTime, setBlackTime] = useState(600);
  const [undoStack, setUndoStack] = useState([]);
  // Store the pending pawn promotion details
  const [pendingPromotion, setPendingPromotion] = useState(null);
  const [lastMove, setLastMove] = useState(null);
  const [flash, setFlash] = useState('');
  // Store the timer reference for flash messages
  const flashTimer = useRef(null);

  const gameOver = status === 'checkmate' || status === 'stalemate' || status === 'timeout';

  const showFlash = useCallback((msg) => {
    setFlash(msg);
    if (flashTimer.current) clearTimeout(flashTimer.current);
    flashTimer.current = setTimeout(() => setFlash(''), 2200);
  }, []);

  //  Clock ticking 
  useEffect(() => {
    if (gameOver || pendingPromotion || moveHistory.length === 0) return;
    const id = setInterval(() => {
      if (turn === 'w') setWhiteTime(t => Math.max(0, t - 1));
      else setBlackTime(t => Math.max(0, t - 1));
    }, 1000);
    return () => clearInterval(id);
  }, [turn, gameOver, pendingPromotion, moveHistory.length]);
  useEffect(() => {
    if (whiteTime === 0 && !gameOver) { setStatus('timeout'); setWinner('b'); }
  }, [whiteTime]); // eslint-disable-line
  useEffect(() => {
    if (blackTime === 0 && !gameOver) { setStatus('timeout'); setWinner('w'); }
  }, [blackTime]); // eslint-disable-line

  //  Reset 
  function resetGame(secs) {
    const t = secs != null ? secs : timeControl;
    setTimeControl(t);
    setBoard(initialBoard());
    setTurn('w');
    setCastling({ wK: true, wQ: true, bK: true, bQ: true });
    setEnPassant(null);
    setSelected(null);
    setLegalMoves([]);
    setMoveHistory([]);
    setCaptured({ w: [], b: [] });
    setStatus('playing');
    setWinner(null);
    setWhiteTime(t);
    setBlackTime(t);
    setUndoStack([]);
    setPendingPromotion(null);
    setLastMove(null);
    setFlash('');
  }
  // Commit the selected move and update the game state
  function commitMove(fromR, fromC, move, promoChoice) {
    // Save the current game state for undo
    const snapshot = {
      board: cloneBoard(board), turn, castling:
       { ...castling }, enPassant,
      // Save game timers and status
      moveHistory: [...moveHistory],
      captured: { w: [...captured.w], b: [...captured.b] },
      whiteTime, blackTime, status, winner,
      // Get the piece from the starting position
    };
    const piece = board[fromR][fromC];
    // Apply the move and get the updated board
    const stateForGen = { castling, enPassant };
    const { board: nb, captured: cap } = applyMove(board, fromR, fromC, move, promoChoice);

    let newCaptured = captured;
    if (cap) {
      newCaptured = { ...captured };
      newCaptured[piece.color] = [...newCaptured[piece.color], cap];
    }
    const newCastling = { ...castling };
    if (piece.type === 'K') {
      if (piece.color === 'w') { newCastling.wK = false; newCastling.wQ = false; }
      else { newCastling.bK = false; newCastling.bQ = false; }
    }
    // Update castling rights when a rook moves
    if (piece.type === 'R') {
      if (fromR === 7 && fromC === 0) newCastling.wQ = false;
      if (fromR === 7 && fromC === 7) newCastling.wK = false;
      if (fromR === 0 && fromC === 0) newCastling.bQ = false;
      // Remove White's kingside castling right
      if (fromR === 0 && fromC === 7) newCastling.bK = false;
    }
    // Remove castling rights if a rook is captured on its starting square
    if (move.r === 7 && move.c === 0) newCastling.wQ = false;
    if (move.r === 7 && move.c === 7) newCastling.wK = false;
    if (move.r === 0 && move.c === 0) newCastling.bQ = false;
    if (move.r === 0 && move.c === 7) newCastling.bK = false;

    const newEnPassant = move.type === 'double' ? { r: (fromR + move.r) / 2, c: fromC } : null;
    const nextTurn = opp(piece.color);
    const nextState = { castling: newCastling, enPassant: newEnPassant };
    const kingPos = findKing(nb, nextTurn);
    const inCheck = kingPos ? isAttacked(nb, kingPos.r, kingPos.c, piece.color) : false;
    const anyMoves = hasAnyLegalMove(nb, nextTurn, nextState);

    let newStatus = 'playing';
    if (inCheck && !anyMoves) newStatus = 'checkmate';
    else if (inCheck) newStatus = 'check';
    else if (!anyMoves) newStatus = 'stalemate';

    const san = sanForMove(board, stateForGen,    fromR, fromC, move, promoChoice, inCheck, newStatus === 'checkmate');
    setUndoStack(h => [...h, snapshot]);
    setBoard(nb);
    setCaptured(newCaptured);
    setCastling(newCastling);
    setEnPassant(newEnPassant);
    setMoveHistory(mh => [...mh, san]);
    setTurn(nextTurn);
    setStatus(newStatus);
    setWinner(newStatus === 'checkmate' ? piece.color : null);
    setLastMove({ from: { r: fromR, c: fromC }, to: { r: move.r, c: move.c } });
    setSelected(null);
    setLegalMoves([]);
    setPendingPromotion(null);
    if (newStatus === 'checkmate') showFlash(`Checkmate — ${piece.color === 'w' ? 'White' : 'Black'} wins!`);
    else if (newStatus === 'stalemate') showFlash('Stalemate — the game is drawn.');
    else if (newStatus === 'check') showFlash('Check!');
  }

  function handleSquareClick(r, c) {
    if (gameOver || pendingPromotion) return;
    const piece = board[r][c];

    if (selected) {
      const mv = legalMoves.find(m => m.r === r && m.c === c);
      if (mv) {
        if (mv.promotion) {
          setPendingPromotion({ fromR: selected.r, fromC: selected.c, move: mv });
        } else {
          commitMove(selected.r, selected.c, mv, null);
        }
        return;
      }
      if (piece && piece.color === turn) {
        const lm = legalMovesForSquare(board, r, c, { castling, enPassant });
        setSelected({ r, c });
        setLegalMoves(lm);
        return;
      }
      showFlash('Illegal move — pick a highlighted square.');
      setSelected(null);
      setLegalMoves([]);
      return;
    }

    if (piece) {
      if (piece.color !== turn) {
        showFlash(`It's ${turn === 'w' ? "White's" : "Black's"} move.`);
        return;
      }
      const lm = legalMovesForSquare(board, r, c, { castling, enPassant });
      if (lm.length === 0) { showFlash('That piece has no legal moves.'); return; }
      setSelected({ r, c });
      setLegalMoves(lm);
    }
  }
  function handlePromotionPick(choice) {
    if (!pendingPromotion) return;
    commitMove(pendingPromotion.fromR, 
      pendingPromotion.fromC, pendingPromotion.move, choice);
  }
  function handleUndo() {
    if (undoStack.length === 0 || pendingPromotion) return;
    const prev = undoStack[undoStack.length - 1];
    setUndoStack(h => h.slice(0, -1));
    setBoard(prev.board);
    setTurn(prev.turn);
    setCastling(prev.castling);
    setEnPassant(prev.enPassant);
    setMoveHistory(prev.moveHistory);
    setCaptured(prev.captured);
    setWhiteTime(prev.whiteTime);
    setBlackTime(prev.blackTime);
    setStatus(prev.status);
    setWinner(prev.winner);
    setSelected(null);
    setLegalMoves([]);
    setLastMove(null);
    setFlash('');
  }

  //  derive check-square for highlighting 
  let checkSquare = null;
  if (status === 'check' || status === 'checkmate') {
    const kp = findKing(board, turn);
    if (kp) checkSquare = kp;
  }
  const moveRows = [];
  for (let i = 0; i < moveHistory.length; i += 2) {
    moveRows.push({ num: i / 2 + 1, w: moveHistory[i],
       b: moveHistory[i + 1] });
  }

  // Store the text that describes the current game status
  
  let statusText;
  if (status === 'checkmate') statusText = `Checkmate — ${winner === 'w' ? 'White' : 'Black'} wins`;
  else if (status === 'stalemate') statusText = 'Stalemate — draw';
    // Show the winner when a player runs out of time
  else if (status === 'timeout') statusText = `Time's up — ${winner === 'w' ? 'White' : 'Black'} wins`;
    // Show a check message and the current player's turn
  else if (status === 'check') statusText = `Check — ${turn === 'w' ? 'White' : 'Black'} to move`;
  else statusText = `${turn === 'w' ? 'White' : 'Black'} to move`;

  return (
    <div className="cg-root">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500;600&display=swap');
        .cg-root {
          --bg: #17130F;
          --panel: #221C15;
          --panel-2: #2A2219;
          --line: #3A2F22;
          --bone: #ECE1C6;
          --walnut: #79523A;
          --brass: #C79A56;
          --brass-soft: rgba(199,154,86,0.18);
          --sage: #7C9473;
          --sage-soft: rgba(124,148,115,0.28);
          --danger: #B23A2E;
          --text: #EFE7D8;
          --text-muted: #A79A85;
          font-family: 'Inter', sans-serif;
          background: radial-gradient(ellipse at top, #211A13 0%, var(--bg) 60%);
          color: var(--text);
          min-height: 100%;
          padding: 28px 16px 48px;
          box-sizing: border-box;
        }
        .cg-root * { box-sizing: border-box; }
        .cg-shell {
          max-width: 1180px;
          margin: 0 auto;
        }
        .cg-header {
          text-align: center;
          margin-bottom: 22px;
        }
        .cg-title {
          font-family: 'Fraunces', serif;
          font-weight: 600;
          font-size: 34px;
          letter-spacing: 0.2px;
          margin: 0;
          color: var(--bone);
        }
        .cg-title span { color: var(--brass); }
        .cg-subtitle {
          font-size: 12.5px;
          letter-spacing: 2.5px;
          text-transform: uppercase;
          color: var(--text-muted);
          margin-top: 6px;
        }
        .cg-layout {
          display: grid;
          grid-template-columns: 240px minmax(0,1fr) 240px;
          gap: 20px;
          align-items: start;
        }
        @media (max-width: 940px) {
          .cg-layout { grid-template-columns: 1fr; }
        }
        .cg-card {
          background: linear-gradient(180deg, var(--panel), var(--panel-2));
          border: 1px solid var(-line);
          // hello
          border-radius: 10px;
          padding: 16px;
        }
        .cg-card + .cg-card { margin-top: 16px; }

        .cg-eyebrow {
          font-family: 'JetBrains Mono', monospace;
          font-size: 10.5px;
          letter-spacing: 2px;
          text-transform: uppercase;
          color: var(--brass);
          margin: 0 0 10px;
          border-bottom: 1px solid var(--line);
          padding-bottom 8px;
        }
// hello
        /* Board */
        .cg-board-wrap { display: flex; flex-direction: column; align-items: center; }
        .cg-board {
          display: grid;
          grid-template-columns: repeat(8, 1fr);
          grid-template-rows: repeat(8, 1fr);
     width: min(560px, 92vw);
     height: min(560px, 92vw);
    border: 10px solid #2E2419;
    border-radius: 6px;
    box-shadow: 0 18px 40px rgba(0,0,0,0.5), 
   inset 0 0 0 1px rgba(199,154,86,0.25);
     }
     .cg-sq {
    position: relative;
    display: flex;
    align-items: center;
      justify-content: center;cursor: pointer;
          user-select: none;
        }
        .cg-sq.light { background: var(--bone); }
        .cg-sq.dark { background: var(--walnut); }
        .cg-sq.selected::after {
          content: ''; position: absolute;
           inset: 0; background: var(--brass-soft);
          box-shadow: inset 0 0 0 3px var(--brass);
        }
        .cg-sq.lastmove::after {
          content: ''; position: absolute; 
          inset: 0; background: var(--sage-soft);
        }
        .cg-sq.check::after {
content: ''; position: absolute;
     inset: 0; box-shadow: inset 0 0 0 3px var(--danger); background: rgba(178,58,46,0.25);
 }
     .cg-dot {
     position: absolute; width: 26%; height: 26%; border-radius: 50%;
   background: rgba(40,30,20,0.38); pointer-events: none;
        }
        .cg-ring {
   position: absolute; inset: 8%; border-radius: 50%;
     box-shadow: inset 0 0 0 4px rgba(40,30,20,0.45); pointer-events: none;
        }
        .cg-piece {
     font-size: min(9vw, 50px);
     line-height: 1;
   filter: drop-shadow(0 2px 1px rgba(0,0,0,0.35));
     position: relative; z-index: 2;
       transition: transform 0.08s ease;
        }
      .cg-sq:hover .cg-piece { transform: scale(1.06); }
        .cg-coord {
position: absolute; font-family:
   'JetBrains Mono', monospace; font-size: 9px;
     opacity: 0.55; pointer-events: none; z-index: 1;
        }
        .cg-coord.file { bottom: 2px; right: 3px; }
        .cg-coord.rank { top: 2px; left: 3px; }
        .cg-sq.light .cg-coord { color: var(--walnut); }
        .cg-sq.dark .cg-coord { color: var(--bone); }
        .cg-status-bar {
          margin-top: 14px;
          font-family: 'Fraunces', serif;
          font-size: 17px;
          text-align: center;
          min-height: 24px;
          color: var(--bone);
        }
        .cg-status-bar.over { color: var(--brass); }
        .cg-flash {
   margin-top: 4px;
 font-size: 12.5px;
color: var(--text-muted);
 text-align: center;
   min-height: 16px;
     font-family: 'JetBrains Mono', monospace;
        }
        /* Clocks here status  */
        .cg-clock {
          display: flex; align-items: center; justify-content: space-between;
          padding: 10px 12px; border-radius: 8px; margin-bottom: 10px;
          border: 1px solid var(--line); 
          background: rgba(0,0,0,0.18);
        }
        .cg-clock.active { border-color: var(--brass); box-shadow: 0 0 0 1px var(--brass) inset; }
        .cg-clock-label { font-size: 12px;
         letter-spacing: 1px; text-transform: uppercase; color: var(--text-muted); }
        .cg-clock-time {
          font-family: 'JetBrains Mono', monospace; font-size: 24px; font-weight: 600;
          color: var(--bone); letter-spacing: 1px;
        }
        .cg-clock.low .cg-clock-time { color: var(--danger); }

        .cg-timecontrols { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 4px; }
        .cg-chip {
   font-family: 'JetBrains Mono', monospace; font-size: 11px;
   padding: 5px 9px; border-radius:
    5px; border: 1px solid var(--line);
 background: transparent; color: var(--text-muted); cursor: pointer;
        }
   .cg-chip.active { background: 
    var(--brass-soft); color: var(--brass); border-color: var(--brass); }
       .cg-chip:disabled { opacity: 0.4; cursor: not-allowed; }
        .cg-btn {
    width: 100%; padding: 9px 12px; border-radius: 7px; border: 1px solid var(--brass);
    background: var(--brass-soft); color:
    var(--brass); font-family: 'Inter', sans-serif;
    font-size: 13px; font-weight: 600;
cursor: pointer; letter-spacing: 0.3px;
     margin-top: 8px;
        }
    .cg-btn:hover { background: var(--brass); color: #1B1712; }
    .cg-btn:disabled { opacity: 0.35; cursor: not-allowed; background: var(--brass-soft); color: var(--brass); }
    .cg-btn.secondary { border-color: var(--line); background: transparent; color: var(--text-muted); }
  .cg-btn.secondary:hover { background: var(--panel-2); color: var(--text); }
        /* Captured pieces horizontal */
      .cg-captured-row { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; min-height: 26px; }
.cg-captured-row .cg-cap-piece { font-size: 19px; opacity: 0.85; }
  .cg-captured-label { font-size: 11px;
   color: var(--text-muted); text-transform: uppercase; letter-spacing: 1px; margin: 12px 0 4px; }

        /* Move list (scoresheet) */
        .cg-scoresheet {
   font-family: 'JetBrains Mono', monospace;
   font-size: 13px;
    max-height: 380px;
    overflow-y: auto;
      }
        .cg-score-row {
     display: grid; grid-template-columns: 28px 1fr 1fr; gap: 4px;
   padding: 4px 2px; border-bottom: 1px solid rgba(58,47,34,0.5);
        }
       .cg-score-row:last-child { border-bottom: none; }
     .cg-score-num { color: var(--brass); opacity: 0.8; }
     .cg-score-move { color: var(--text); }
   .cg-scoresheet::-webkit-scrollbar { width: 6px; }
   .cg-scoresheet::-webkit-scrollbar-thumb { background: var(--line); border-radius: 4px; }
     .cg-empty-note { color: var(--text-muted); font-size: 12.5px; font-style: italic; }

  /* Promotion modal */
        .cg-promo-overlay {
          position: fixed; inset: 0; background: rgba(10,8,5,0.72);
          display: flex; align-items: center; justify-content: center; z-index: 50;
        }
        .cg-promo-box {
          background: var(--panel-2); border: 1px solid var(--brass); border-radius: 10px;
          padding: 22px; text-align: center;
        }
        .cg-promo-title 
        { font-family: 'Fraunces', serif; font-size: 16px; margin-bottom: 14px; color: var(--bone); }
        .cg-promo-options { display: flex; gap: 10px; }
        .cg-promo-btn {
          width: 58px; height: 58px; font-size: 32px; border-radius: 8px;
          border: 1px solid var(--line); background: var(--bg); color: var(--bone);
          cursor: pointer; display: flex; align-items: center; justify-content: center;
        }
        .cg-promo-btn:hover { border-color: var(--brass); background: 
        var(--brass-soft); }
        .cg-rules-note { font-size: 11.5px; color: var(--text-muted); line-height: 1.5; margin-top: 4px; }
      `}</style>
      <div className="cg-shell">
        <div className="cg-header">
    <h1 className="cg-title">The Study <span>&mdash; Offline Chess</span></h1>
      <div className="cg-subtitle">Two players &middot; one board &middot; no engine</div>
        </div>
    <div className="cg-layout">
    {/* LEFT: Move list + captured */}
      <div>
      <div className="cg-card">
       <div className="cg-eyebrow">Scoresheet</div>
       <div className="cg-scoresheet">
    {moveRows.length === 0 && <div className="cg-empty-note">Moves will be recorded here in standard notation.</div>}
        // Loop through each move row and display it
          {moveRows.map(row => (
            // Create a row for each move number
    <div className="cg-score-row" key={row.num}>
      <div className="cg-score-num">{row.num}.</div>
     <div className="cg-score-move">{row.w}</div>
       {/* Display Black's move if available */}
        <div className="cg-score-move">{row.b || ''}</div>
  </div>
         ))}
      </div>
     </div>
    <div className="cg-card">
       <div className="cg-eyebrow">Captured Pieces</div>
       <div className="cg-captured-label">Taken by White</div>
       <div className="cg-captured-row">
        {captured.w.length === 0 && <span className="cg-empty-note">&mdash;</span>}
        {captured.w.map((p, i) => <span className="cg-cap-piece" key={i}>{SYMBOLS.b[p.type]}</span>)}
       </div>
       <div className="cg-captured-label">Taken by Black</div>
       <div className="cg-captured-row">
   {captured.b.length === 0 && <span className="cg-empty-note">&mdash;</span>}
        {captured.b.map((p, i) => <span className="cg-cap-piece" key={i}>{SYMBOLS.w[p.type]}</span>)}
    </div>
    </div>
       </div>

    {/* CENTER: Board */}
     <div className="cg-board-wrap">
      <div className="cg-board">
      {Array.from({ length: 8 }).map((_, r) =>
    Array.from({ length: 8 }).map((__, c) => {
       const piece = board[r][c];
         const isLight = (r + c) % 2 == 0; 
        //  hello
      // Check if the current square is selected
       const isSelected = selected && selected.r === r && selected.c === c;
       const isLegal = legalMoves.find(m => m.r === r && m.c === c);
      // Check if the current square is the starting square of the last move
       const isLastFrom = lastMove && lastMove.from.r === r && lastMove.from.c === c;
     const isLastTo = lastMove && lastMove.to.r === r && lastMove.to.c === c;
      // Check if the current square contains a king in check
        const isCheckSq = checkSquare && checkSquare.r === r && checkSquare.c === c;
         const cls = [
        'cg-sq', isLight ? 'light' : 'dark',
   // Highlight the last move
    isSelected ? 'selected' : '',
    (isLastFrom || isLastTo) && !isSelected ? 'lastmove' : '',
     isCheckSq ? 'check' : '',
     ].join(' ').trim();
       return (
    <div
      key={`${r}-${c}`}
className={cls}
     onClick={() => handleSquareClick(r, c)}
      title={sq(r, c)}
>
         {c === 0 && <span className="cg-coord rank">{8 - r}</span>}
          {r === 7 && <span className="cg-coord file">{FILES[c]}</span>}
          {piece && <span className="cg-piece">
            {SYMBOLS[piece.color][piece.type]}</span>}
          {isLegal && (piece ? <span className="cg-ring" /> : <span className="cg-dot" />)}
        </div>
         );
         })
       )}
      </div>
       <div className={`cg-status-bar ${gameOver 
        ? 'over' : ''}`}>{statusText}</div>
       <div className="cg-flash">{flash}</div>
     </div>
    {/* RIGHT: Clocks + controls */}
      <div>
            {/* Section title for the game clocks */}
      <div className="cg-card">
       <div className="cg-eyebrow">Clocks</div>
       <div className={`cg-clock ${turn === 'b' && 
        !gameOver ? 'active' : ''} ${blackTime <= 30 ? 'low' : ''}`}>
       <span className="cg-clock-label">Black</span>
         <span className="cg-clock-time">{fmtClock(blackTime)}</span>
       </div>
       <div className={`cg-clock ${turn === 'w' && !gameOver ? 'active' : ''} ${whiteTime <= 30 ? 'low' : ''}`}>
                {/* White player's clock */}
          <span className="cg-clock-label">White</span>
        <span className="cg-clock-time">{fmtClock(whiteTime)}</span>
        </div>
        <div className="cg-eyebrow" style=
        {{ marginTop: 14 }}>Time Control</div>
            {/* Container for time control buttons */}
        <div className="cg-timecontrols">
        {TIME_OPTIONS.map(opt => (
       <button
       key={opt.value}
    className={`cg-chip ${timeControl === 
      opt.value ? 'active' : ''}`}
   disabled={moveHistory.length > 0}
   onClick={() => resetGame(opt.value)}
            >
            {opt.label}
          </button>
          ))}
        </div>
        <div className="cg-rules-note">Pick a time control before the first move.</div>
         </div>
            <div className="cg-card">
        <div className="cg-eyebrow">Controls</div>
         <button className="cg-btn" onClick={() => resetGame()}>New Game</button>
         <button className="cg-btn secondary" onClick={handleUndo} disabled={undoStack.length === 
          0 || !!pendingPromotion}>
        Undo Last Move
        </button>
        <div className="cg-rules-note">
   Click a piece to see its legal moves highlighted, 
    the click a highlighted square to move.
      Check, checkmate, castling, en passant and promotion are all enforced automatically.
     </div>
       </div>
 </div>
   </div>
   </div>
   {pendingPromotion && (
<div className="cg-promo-overlay">
   <div className="cg-promo-box">
   <div className="cg-promo-title">Promote pawn to&hellip;</div>
   <div className="cg-promo-options">
      // Create a button for each pawn promotion choice
      {PROMO_CHOICES.map(choice => (
      <button key={choice} className="cg-promo-btn" onClick={() => handlePromotionPick   // Handle the selected promotion piece
      (choice)} title={PIECE_NAMES[choice]}>
     {SYMBOLS[board[pendingPromotion.fromR][pendingPromotion.fromC].color][choice]}
   </button>
   ))}
  </div>
  </div>
   </div>
  )}
</div>
  );
}