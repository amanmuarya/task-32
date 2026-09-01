# React.js Mini Project: Offline Chess Game

# Chess Game — React

This is a two-player chess game built using React and JavaScript. I developed the chess board, piece movement, game rules, special moves, and game controls without using any external chess library or chess engine.

The main goal of this project was to understand how complex game rules can be implemented using JavaScript logic and React state management.

## Approach I Used

I developed the game step by step instead of implementing all chess rules at once.

### 1. Created the Chess Board

First, I created an 8×8 chess board using React. Each square stores information about whether it contains a piece or is empty.

Each chess piece has two basic properties:

* `type` — pawn, rook, knight, bishop, queen, or king
* `color` — white or black

### 2. Implemented Piece Movement

After creating the board, I implemented movement rules for each piece separately.

For example:

* Rook → horizontal and vertical movement
* Bishop → diagonal movement
* Knight → L-shaped movement
* Queen → rook + bishop movement
* King → one square in any direction
* Pawn → forward movement and diagonal capture

### 3. Added Turn Management

I added a system to keep track of the current player.

After a valid move, the turn changes from White to Black or Black to White.

The game also checks whether the selected piece belongs to the current player.

### 4. Added Legal Move Validation

After calculating the possible moves of a piece, I added another validation step.

The game checks whether the selected move would leave the player's own king in check.

If the king would be exposed to an attack, that move is removed from the legal moves.

### 5. Implemented Check, Checkmate and Stalemate

After every move, the game checks the opponent's king.

If the king is attacked, the position is considered check.

If the player is in check and has no legal moves, the game declares checkmate.

If the player has no legal moves but is not in check, the game declares stalemate.

### 6. Implemented Special Moves

After the basic movement system was working, I added special chess rules:

* Castling
* En passant
* Pawn promotion

These rules required additional game-state information, such as previous pawn movement and whether the king or rook had moved before.

### 7. Added Game Features

Finally, I added additional features such as:

* Move history
* Captured pieces
* Chess notation
* Undo
* Timers
* Different time controls
* New Game
* Invalid move messages
* Legal move highlighting

## Problems I Faced

While developing the project, I faced several challenges.

### 1. Managing Complex Game State

The biggest challenge was managing all the information required for a chess game.

The game needs to track:

* Board position
* Current player
* Move history
* Captured pieces
* King position
* Previous moves
* Castling rights
* En passant information
* Promotion state
* Timers
* Game status

Keeping all of this information synchronized in React was challenging.

### 2. Preventing Illegal Moves

It was not enough to calculate where a piece could normally move.

I also had to check whether the move would expose my own king to check.

For example, a piece may appear to be able to move to a square, but if moving that piece exposes the king, the move must be rejected.

This required simulating moves and checking the resulting board position.

### 3. Checkmate Detection

Checkmate was another difficult part.

The game needs to determine:

1. Is the king currently in check?
2. Does the player have any legal move?
3. If no legal move exists while in check, it is checkmate.

This requires checking the legal moves of all pieces, not just the king.

### 4. Castling

Castling required several conditions to be checked at the same time.

I had to track whether:

* The king had moved before.
* The rook had moved before.
* The squares between them were empty.
* The king was not currently in check.
* The king did not move through an attacked square.
* The king did not finish on an attacked square.

### 5. En Passant

En passant was difficult because the captured pawn is not located on the destination square.

I had to store information about the previous move and check whether the previous move was a two-square pawn move.

### 6. Pawn Promotion

When a pawn reaches the opposite side of the board, the game has to pause the normal move flow and ask the player which piece they want.

I implemented a promotion selection for:

* Queen
* Rook
* Bishop
* Knight

### 7. Chess Notation

Generating chess notation was also challenging because the notation changes depending on the type of move.

For example:

* `e4`
* `Nf3`
* `O-O`
* `Qxh4#`

The game also needs to handle captures, check, checkmate, and situations where two pieces of the same type can reach the same square.

### 8. Undo Functionality

The Undo feature required more than simply moving the last piece back.

I had to restore the complete previous game state, including:

* Board position
* Player turn
* Move history
* Captured pieces
* Timer state
* Castling information
* En passant information
* Promotion information

## What I Learned

This project helped me understand how to break a complex problem into smaller parts.

I learned how to:

* Manage complex state using React
* Implement game logic using JavaScript
* Validate user actions
* Work with arrays and objects
* Simulate possible game states
* Handle conditional logic
* Implement timers
* Maintain move history
* Debug complex state-related problems

The biggest learning from this project was that implementing chess is not only about moving pieces on a board. The difficult part is maintaining the complete game state and making sure every move follows the rules of chess.

## Limitations

The current version still has some limitations:

* Threefold repetition is not implemented.
* The fifty-move rule is not implemented.
* The board always has White at the bottom.
* Game state is not saved after refreshing the browser.
* There is no online multiplayer server.
* The game currently works locally in the browser.

## Running the Project

For a Vite React project:

```bash
npm install
npm run dev
```

The exact command depends on the scripts defined in `package.json`.
