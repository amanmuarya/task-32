# React.js Mini Project: Offline Chess Game

## Here's how I'd approach planning any chess game (or similar rule-heavy simulation) from scratch.
# 1. Separate "the rules" from "the picture"
# Chess Game — React

This is a two-player chess game made using React. I built the chess board, piece movement, game rules, and other features without using a chess library or chess engine.

The main purpose of this project was to understand how chess rules can be implemented using JavaScript and React state.

## Main Features

* 8x8 chess board with the normal starting position
* Two-player gameplay: White and Black
* Legal movement for all chess pieces
* Turn changes after every valid move
* Check, checkmate, and stalemate detection
* Castling on both sides
* En passant
* Pawn promotion
* Legal move highlighting
* Captured pieces display
* Move history
* Chess notation such as `e4`, `Nf3`, and `O-O`
* Undo last move
* Timer for both players
* New Game option
* Different time controls
* Message shown when an invalid move or wrong turn is selected

## How the Game Works

The board is represented using rows and columns. Each square can either contain a chess piece or be empty.

Each chess piece has two main properties:

* Type — pawn, rook, knight, bishop, queen, or king
* Color — white or black

When a player clicks a piece, the game first checks whether that piece belongs to the current player. After that, the possible moves for the piece are calculated.

For example:

* A rook can move horizontally and vertically.
* A bishop can move diagonally.
* A knight moves in an L shape.
* A queen can move like a rook or bishop.
* A king moves one square at a time.
* A pawn moves forward and captures diagonally.

After calculating the possible moves, the game also checks whether moving the piece would leave its own king in check. If that happens, the move is not allowed.

## Check and Checkmate

After each move, the game checks the position of the king.

If the king is attacked, the game shows a check message and highlights the king's square.

If the player is in check and has no legal move left, the game declares checkmate.

The game also checks for stalemate when the player has no legal moves but the king is not in check.

## Special Chess Moves

The game supports some of the special rules of chess.

### Castling

Castling is allowed only when the required conditions are satisfied. The king and rook must have the correct movement history, the squares between them must be empty, and the king cannot castle through check.

### En Passant

The game keeps track of the previous pawn move so that an en passant capture can only be made at the correct time.

### Pawn Promotion

When a pawn reaches the opposite end of the board, a small selection appears. The player can promote the pawn to a:

* Queen
* Rook
* Bishop
* Knight


If a player's time reaches zero, the game ends by timeout.

## Move History

The game keeps a list of moves made during the current game.

Some examples of the notation are:

```text
e4
Nf3
O-O
Qxh4#
```

The notation also handles cases where two pieces of the same type can move to the same square.

## Undo

The Undo button takes the game back to the previous position.

It restores the important game information, including:

* Board position
* Player turn
* Move history
* Timers
* Special-move information

## How to Play

1. Select a time control.
2. Click one of your pieces.
3. The legal moves will be highlighted.
4. Click a highlighted square to move.
5. Continue taking turns with the other player.
6. If a pawn reaches the final row, choose a promotion piece.
7. Use **Undo Last Move** if you want to go back one move.
8. Use **New Game** to start a new game.

## Project Structure

The main chess implementation is contained in:

```text
ChessGame.jsx
```

This file contains the board, chess logic, React state, game controls, and UI for the game.

## Limitations

There are a few things that are not included in the current version:

* Threefold repetition is not implemented.
* The fifty-move rule is not implemented.
* The board always has White at the bottom.
* The game does not save its state after refreshing the browser.
* The game works locally in the browser and does not use an online multiplayer server.

## Running the Project

Install the required packages and run the React project using the normal npm command.

For a Vite project:

```bash
npm install
npm run dev
```

For a project using a `start` script:

```bash
npm start
```
The exact command depends on the scripts defined in `package.json`.

# Run your app as usual (`npm start` / `npm run dev`).