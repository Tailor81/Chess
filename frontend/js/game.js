document.addEventListener('DOMContentLoaded', function() {
    var game = new Chess();

    var board = Chessboard('board', {
        position: 'start',
        pieceTheme: '/home/darktailor/Documents/App Dev/chess/chessboardjs-1.0.0/img/chesspieces/wikipedia/{piece}.png',
        draggable: true,
        dropOffBoard: 'snapback',
        onDrop: function(source, target, piece) {
            var move = game.move({
                from: source,
                to: target,
                promotion: 'q' // always promote to a queen for simplicity
            });

            if (move === null) return 'snapback';

            board.position(game.fen());
        }
    });
});