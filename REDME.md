# React.js Mini Project: Offline Chess Game

## Here's how I'd approach planning any chess game (or similar rule-heavy simulation) from scratch.

# 1. Separate "the rules" from "the picture"

Before touching UI, decide that chess logic lives in pure functions that know nothing about React, pixels, or clicks. They just take a board + a move and return a new board or a yes/no. This separation is the single most important decision — it means you can test the hard part (rules) without a browser, and swap the UI later without touching logic.

# 2. Pick your data model first

Everything else depends on this. Ask:

How do I represent the board? (8x8 array is simplest — board[row][col])
How do I represent a square? (row/col numbers vs. algebraic string "e4" — pick one as canonical, convert at the edges)
How do I represent a piece? ({type, color} object is usually enough)
What "state" exists beyond the board itself? Whose turn it is, castling rights, en passant target square — these aren't captured by the board alone, so they need their own variables.

Getting this right early avoids painful rewrites later.

# 3. Build in layers of increasing difficulty

Don't try to write "checkmate detection" on day one. Order matters:

Render a static board with pieces in starting position — no interaction yet.
Pseudo-legal moves per piece — "where can this piece physically move," ignoring check entirely (pawns, knights, sliding pieces, king).
Click-to-move using only pseudo-legal moves — get the interaction loop working even if it's not fully correct yet.
Special cases last — castling, en passant, promotion. These are edge cases on top of a working core, not part of the core itself.

# 4. Think in "what could go wrong" checklists
For a rules-heavy domain, brainstorm edge cases before coding:

Can a pinned piece still "capture the pinner"? (No, if it exposes the king — the generic simulate-and-check approach handles this automatically)
What happens if a rook that could castle gets captured on its home square, not moved?
Does en passant only work immediately after the double-step, not later?
Two identical pieces can move to the same square — does your notation disambiguate correctly?

Writing these down before coding turns "debugging surprises" into "features you built on purpose."

# 5. Test the logic in isolation

Since the engine is pure functions, you can test it with plain scripts — no UI needed. Good test cases to hand-verify:

A known short forced checkmate (Fool's Mate, Scholar's Mate) — cheap way to validate your whole pipeline (move gen → check → checkmate) in one shot.
A manually constructed pin — one piece should have zero legal moves.
A manually constructed en passant / promotion position.

# 6. Only then layer on UI state

Once the engine is trustworthy, UI state is "just bookkeeping": which square is selected, which moves to highlight, timers, move history, undo stack. None of it needs new chess thinking — it's wiring the engine's outputs to what's on screen.

# 7. Undo/history as a side effect of good state design

If your engine functions are pure (oldBoard → newBoard, no mutation), undo becomes trivial: snapshot the full state before every move and push it onto a stack. You don't need a special "undo algorithm" — you get it for free from the way you structured step 1.

# The Study — Offline Chess (React)
A fully offline, two-player chess game built from scratch in React — no chess libraries, no engine. All move generation, check/checkmate detection, and notation are hand-implemented.

## Features

- **8x8 board** with standard starting position
- **Full legal move enforcement** for every piece (pawns, knights, bishops, rooks, queens, kings), including pins — a piece can't move if it would expose its own king to check
- **Check / checkmate / stalemate detection**, with the king's square highlighted when in check and a status banner announcing the result
- **Special moves**: castling (kingside & queenside, with all safety checks), en passant, and pawn promotion (with a piece-choice popup)
- **Turn-based play** — illegal or out-of-turn clicks show a brief inline message instead of failing silently
- **Countdown timers** for both players (3/5/10/15/30 min options), with the inactive player's clock paused automatically
- **Move list in standard algebraic notation** (e.g. `e4`, `Nf3`, `O-O`, `Qxh4#`), including disambiguation (`Nbd7`) when needed
- **Undo** — reverts the board, clocks, and move list to the previous state
- **Legal-move highlighting** for the selected piece (dots for empty squares, rings for captures)
- **Captured pieces tray** for each side

## Project structure

```
ChessGame.jsx   # Single self-contained component — engine + UI + styles
```
## How to play

1. Pick a time control (before the first move — it locks in once the game starts).
2. Click a piece belonging to the player whose turn it is. Its legal moves light up on the board.
3. Click a highlighted square to move there. Click another one of your own pieces to change your selection.
4. If a pawn reaches the last rank, a popup lets you choose what to promote it to.
5. The game announces check, checkmate, stalemate, or a timeout automatically.
6. Use **Undo Last Move** to take back a move, or **New Game** to start over.

## Notes / possible extensions

- Promotion currently opens a picker (Queen/Rook/Bishop/Knight) rather than auto-promoting to a queen.
- Draw conditions implemented: stalemate and timeout. Threefold repetition and the fifty-move rule are not implemented.
- The board doesn't flip between turns — White is always shown at the bottom.
- Because everything is client-side and in-memory, refreshing the page resets the game (no persistence/save is built in).


# Run your app as usual (`npm start` / `npm run dev`).