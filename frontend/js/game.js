document.addEventListener('DOMContentLoaded', function() {
    const game = new Chess();
    const statusEl = document.getElementById('status');
    const startBtn = document.getElementById('startBtn');
    const playAgainBtn = document.getElementById('playAgainBtn');
    const createBtn = document.getElementById('createBtn');
    const joinBtn = document.getElementById('joinBtn');
    const gameIdInput = document.getElementById('gameIdInput');
    let board = null;
    let playerColor = 'white';

    const wsBase = (location.protocol === 'https:' ? 'wss://' : 'ws://') + location.host + '/ws';
    let ws = null;
    let gameId = null;

    /**
     * Establish WebSocket for multiplayer.
     * @param {string} id  Game ID to join
     * @param {string=} forcedColor  Explicit colour ("white" | "black") if supplied
     */
    function connectSocket(id, forcedColor) {
        gameId = id;

        // Determine colour
        if (forcedColor) {
            playerColor = forcedColor;
            dbg('forced colour', playerColor);
        } else {
            const choice = document.querySelector('input[name="side"]:checked').value;
            dbg('radio choice', choice);
            if (choice === 'random') playerColor = Math.random() < 0.5 ? 'white' : 'black';
            else playerColor = choice;
        }
        dbg('connecting with colour', playerColor);

        ws = new WebSocket(`${wsBase}/${gameId}/${playerColor}`);
        dbg('WS URL', ws.url);

        ws.onopen = () => dbg('WebSocket open', gameId);

        ws.onmessage = evt => {
            const msg = JSON.parse(evt.data);
            if (msg.type === 'init' || msg.type === 'move') {
                game.load(msg.fen);
                board && board.position(msg.fen);
                updateCheckHighlight();
            }
            if (msg.type === 'game_over') {
                setStatus(`Game over: ${msg.result}`);
            }
        };

        ws.onclose = () => setStatus('Connection closed');

        // hide buttons but keep the Game ID label visible
        document.querySelectorAll('#controls button, #controls input[name="side"]').forEach(el => el.style.display = 'none');
        document.getElementById('board-container').style.display = 'block';

        // create or update a dedicated match info element so ID remains visible
        let info = document.getElementById('matchInfo');
        if (!info) {
            info = document.createElement('div');
            info.id = 'matchInfo';
            info.style.margin = '8px 0';
            info.style.fontWeight = 'bold';
            document.body.insertBefore(info, document.getElementById('board-container'));
        }
        info.textContent = `Game ID: ${gameId} — playing as ${playerColor}`;

        setStatus(`${playerColor.charAt(0).toUpperCase() + playerColor.slice(1)}: waiting for opponent...`);
        initBoard();
    }

    // ------------------------------------------------------------------
    // UI EVENTS
    // ------------------------------------------------------------------
    createBtn.addEventListener('click', async () => {
        const res = await fetch('/create');
        const data = await res.json();
        gameIdInput.value = data.game_id;
        document.getElementById('gameIdLabel').textContent = data.game_id;
        // bigger font and auto-copy to clipboard
        const label = document.getElementById('gameIdLabel');
        label.style.fontSize = '1.2em';
        navigator.clipboard?.writeText(data.game_id).catch(() => {});
        connectSocket(data.game_id, 'white');
    });

    joinBtn.addEventListener('click', () => {
        const id = gameIdInput.value.trim();
        if (!id) return alert('Enter Game ID');
        document.getElementById('gameIdLabel').textContent = id;
        const label = document.getElementById('gameIdLabel');
        label.style.fontSize = '1.2em';
        const chosen = document.querySelector('input[name="side"]:checked').value;
        let joinColor;
        if (chosen === 'random') joinColor = Math.random() < 0.5 ? 'white' : 'black';
        else joinColor = chosen;

        // If user unintentionally chose the same as default (white), flip to black
        if (joinColor === 'white') joinColor = 'black';

        dbg('join button clicked, using colour', joinColor);
        connectSocket(id, joinColor);
    });

    startBtn.addEventListener('click', () => {
        playerColor = document.querySelector('input[name="side"]:checked').value || 'white';
        document.querySelectorAll('#controls button, #controls input[name="side"], #gameIdInput').forEach(el => el.style.display = 'none');
        document.getElementById('board-container').style.display = 'block';
        setStatus('Local game — White to move.');
        initBoard();
    });

    playAgainBtn.addEventListener('click', () => window.location.reload());

    function setStatus(msg) {
        statusEl.textContent = msg;
    }

    function initBoard() {
        board = Chessboard('board', {
            position: 'start',
            orientation: playerColor,
            pieceTheme: '../chessboardjs-1.0.0/img/chesspieces/wikipedia/{piece}.png',
            draggable: true,
            dropOffBoard: 'snapback',
            animate: true,
            moveSpeed: 200,
            snapSpeed: 100,
            snapbackSpeed: 50,
            onDragStart: onDragStart,
            onDrop: onDrop,
            onSnapEnd: () => board.position(game.fen())
        });
    }

    // --- Audio --------------------------------------------------------------
    const sounds = {
        move: new Audio('https://cdn.jsdelivr.net/gh/ornicar/lila@master/public/sound/standard/Move.mp3'),
        capture: new Audio('https://cdn.jsdelivr.net/gh/ornicar/lila@master/public/sound/standard/Capture.mp3'),
        check: new Audio('https://cdn.jsdelivr.net/gh/ornicar/lila@master/public/sound/standard/Check.mp3'),
        gameEnd: new Audio('https://cdn.jsdelivr.net/gh/ornicar/lila@master/public/sound/standard/GameEnd.mp3')
    };

    // --- Helpers ------------------------------------------------------------
    const $board = $('#board');
    // attach a global error/debug logger
    function dbg(...args) { console.debug('[chess-debug]', ...args); }
    dbg('JS loaded, waiting for game start');
    let selectedSquare = null;

    function clearHighlights() {
        // remove highlight classes from every square
        $board.find('div[data-square]').removeClass('highlight check');
    }

    function highlightSquare(square, css = 'highlight') {
        dbg('highlight', square, css);
        $board.find(`div[data-square='${square}']`).addClass(css);
    }

    function promptPromotion() {
        let piece = prompt('Promote to (q, r, b, n):', 'q');
        if (!piece || !'qrbn'.includes(piece.toLowerCase())) piece = 'q';
        return piece.toLowerCase();
    }

    function playSound(move) {
        if (game.in_checkmate() || game.in_stalemate()) return sounds.gameEnd.play();
        if (game.in_check()) return sounds.check.play();
        if (move.captured) return sounds.capture.play();
        sounds.move.play();
    }

    function updateCheckHighlight() {
        clearHighlights();
        if (game.in_check()) {
            const turn = game.turn();
            for (const sq of game.SQUARES) {
                const p = game.get(sq);
                if (p && p.type === 'k' && p.color === turn) {
                    highlightSquare(sq, 'check');
                    break;
                }
            }
        }
    }

    function showGameResult() {
        if (game.in_checkmate()) {
            const winner = game.turn() === 'w' ? 'Black' : 'White';
            setStatus(`Checkmate! ${winner} wins.`);
            playAgainBtn.style.display = 'inline-block';
        } else if (game.in_stalemate()) {
            setStatus('Stalemate!');
            playAgainBtn.style.display = 'inline-block';
        }
    }

    // --- Drag & drop handlers ----------------------------------------------
    function onDragStart(source, piece) {
        // don’t pick up the wrong colour piece
        if ((game.turn() === 'w' && piece.startsWith('b')) ||
            (game.turn() === 'b' && piece.startsWith('w'))) return false;
    }

    function onDrop(source, target) {
        const cfg = { from: source, to: target };
        const movingPawn = game.get(source)?.type === 'p';
        if (movingPawn && (target[1] === '8' || target[1] === '1')) cfg.promotion = promptPromotion();

        dbg('attempt move', cfg);
        const move = game.move(cfg);
        if (move === null) return 'snapback';
        dbg('move result', move);

        playSound(move);
        updateCheckHighlight();
        showGameResult();
        if (!game.game_over()) setStatus(`${game.turn()==='w' ? 'White' : 'Black'} to move.`);

        // send to server
        const uci = move.from + move.to + (move.promotion || '');
        if (ws && ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ type: 'move', uci }));
        }
    }

    // --- Click-to-move logic -------------------------------------------------
    // single-tap / click handler; using touchend avoids triggering drag, works on mobile
    $board.on('click touchend', 'div[data-square]', function (e) {
        const square = $(this).attr('data-square');
        dbg('square tapped', square, 'selected?', !!selectedSquare);

        // first click – select piece & highlight moves
        if (!selectedSquare) {
            const piece = game.get(square);
            if (!piece) return;
            const myColor = playerColor === 'white' ? 'w' : 'b';
            if (game.turn() !== myColor || (myColor === 'w' && piece.color !== 'w') || (myColor === 'b' && piece.color !== 'b')) {
                return; // not your turn or not your piece
            }
            selectedSquare = square;
            clearHighlights();
            highlightSquare(square);
            const moves = game.moves({ square, verbose: true });
            dbg('legal moves', moves);
            moves.forEach(m => highlightSquare(m.to));
            return;
        }

        // same square — deselect
        if (square === selectedSquare) {
            selectedSquare = null;
            clearHighlights();
            return;
        }

        // attempt move
        const cfg = { from: selectedSquare, to: square };
        const movingPawn = game.get(selectedSquare)?.type === 'p';
        if (movingPawn && (square[1] === '8' || square[1] === '1')) cfg.promotion = promptPromotion();

        dbg('attempt move', cfg);
        const move = game.move(cfg);
        if (move === null) return; // illegal
        dbg('move result', move);

        board.position(game.fen());
        selectedSquare = null;
        clearHighlights();
        playSound(move);
        updateCheckHighlight();
        showGameResult();
        if (!game.game_over()) setStatus(`${game.turn()==='w' ? 'White' : 'Black'} to move.`);

        const uci = move.from + move.to + (move.promotion || '');
        if (ws && ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ type: 'move', uci }));
        }
    });
});