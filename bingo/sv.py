<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Bingo</title>
    <style>
        .cell {
            width: 50px;
            height: 50px;
            border: 1px solid black;
            display: inline-block;
            text-align: center;
            line-height: 50px;
            cursor: pointer;
        }
        .selected {
            background-color: yellow;
        }
    </style>
</head>
<body>
    <div id="bingo-board">
        <!-- 5x5のビンゴボードを生成 -->
        <script>
            const board = document.getElementById('bingo-board');
            for (let i = 0; i < 5; i++) {
                for (let j = 0; j < 5; j++) {
                    const cell = document.createElement('div');
                    cell.className = 'cell';
                    cell.addEventListener('click', () => {
                        cell.classList.toggle('selected');
                    });
                    board.appendChild(cell);
                }
                board.appendChild(document.createElement('br'));
            }
        </script>
    </div>
</body>
</html>
