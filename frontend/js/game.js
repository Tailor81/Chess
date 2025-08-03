document.addEventListener('DOMContentLoaded', function() {
    const game = new Chess();
    const statusEl = document.getElementById('status');
    const startBtn = document.getElementById('startBtn');
    const playAgainBtn = document.getElementById('playAgainBtn');
    let board = null;
    let playerColor = 'white';

    startBtn.addEventListener('click', () => {
        const choice = document.querySelector('input[name="side"]:checked').value;
        if (choice === 'random') playerColor = Math.random() < 0.5 ? 'white' : 'black';
        else playerColor = choice;

        startBtn.style.display = 'none';
        document.getElementById('controls').style.display = 'none';
        document.getElementById('board-container').style.display = 'block';

        initBoard();
        setStatus('White to move.');
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
    let selectedSquare = null;

    function clearHighlights() {
        $board.find('.square-55d63').removeClass('highlight check');
    }

    function highlightSquare(square, css = 'highlight') {
        $(`.square-${square}`).addClass(css);
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

        const move = game.move(cfg);
        if (move === null) return 'snapback';

        playSound(move);
        updateCheckHighlight();
        showGameResult();
        if (!game.game_over()) setStatus(`${game.turn()==='w' ? 'White' : 'Black'} to move.`);
    }

    // --- Click-to-move logic -------------------------------------------------
    $board.on('click', '.square-55d63', function () {
        const square = $(this).attr('data-square');

        // first click – select piece & highlight moves
        if (!selectedSquare) {
            const piece = game.get(square);
            if (!piece || piece.color !== game.turn()) return;
            selectedSquare = square;
            clearHighlights();
            highlightSquare(square);
            game.moves({ square, verbose: true }).forEach(m => highlightSquare(m.to));
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

        const move = game.move(cfg);
        if (move === null) return; // illegal

        board.position(game.fen());
        selectedSquare = null;
        clearHighlights();
        playSound(move);
        updateCheckHighlight();
        showGameResult();
        if (!game.game_over()) setStatus(`${game.turn()==='w' ? 'White' : 'Black'} to move.`);
    });
});