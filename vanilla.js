const board = document.getElementById('board');
window.addEventListener('load', () => init());

let grid = [];
let openSquares = new Set();

function init() {
  initState();
  plantMines();
  createBoard();
}

function initState() {
  grid = Array(5);
  for(let i=0; i<5; ++i) grid[i] = Array(5).fill(0);
  board.innerText = '';
  openSquares = new Set();
}

function plantMines() {
  let mine = -1;
  for(let n=0; n<5; ++n) {
    let i = Math.floor(Math.random() * 5);
    let j = Math.floor(Math.random() * 5);
    while(isMine(grid[i][j])) {
      i = Math.floor(Math.random() * 5);
      j = Math.floor(Math.random() * 5);
    }
    grid[i][j] = mine--;
    for(let x=-1; x<=1; ++x) {
      for(let y=-1; y<=1; ++y) {
        if(x === 0 && y === 0) continue;
        if(i+x >= 0 && i+x < 5 && j+y >= 0 && j+y < 5 && grid[i+x][j+y] >= 0)
          grid[i+x][j+y] += 1;
      }
    }
  }
}

function createBoard() {  
  const boardFragment = new DocumentFragment();
  for(let i=0; i<5; ++i) {
    const row = document.createElement('div');
    row.classList.add('row');
    for(let j=0; j<5; ++j) {
      const cell = document.createElement('div');
      cell.classList.add('cell');
      cell.setAttribute('data-i', i);
      cell.setAttribute('data-j', j);
      cell.addEventListener('click', e => handleCellClick(i, j));
      row.appendChild(cell);
    }
    boardFragment.appendChild(row);
  }
  board.appendChild(boardFragment);
}

/* Main Logic Starts Here */
function handleCellClick(i, j) {
  // If cell has been opened already do not do anything
  if(openSquares.has(toString(i,j))) return;

  if(isMine(grid[i][j])) {
    handleMineClick(i, j);
    return;
  }

  if(isEmptySquare(grid[i][j])) {
    handleEmptySquareClick(i, j);
    return;
  }

  // This is a normal square with a number
  // Add this is openedSquares and reveal it
  openSquares.add(toString(i,j))
  reveal(i, j);
}

function handleMineClick(i, j) {
    openSquares.add(toString(i, j));
    reveal(i, j)

    // Reveal mines one by one
    let count = 1;
    for(let x=0; x<5; ++x) {
      for(let y=0; y<5; ++y) {
        if((x==i && y==j) || grid[x][y] >= 0) continue;
        window.setTimeout(() => reveal(x, y), (count++)*200);
      }
    }

    // Reveal all the other non-mine squares
    window.setTimeout(revealAll, (count++)*200);
}

function handleEmptySquareClick(i, j) {
  // Use BFS to open and reveal all adjacent squares
  openSquares.add(toString(i, j));
  let queue = [{i,j}];
  while(queue.length > 0) {
    let {i: _i, j: _j} = queue.splice(0, 1)[0];
    reveal(_i, _j);
    if(grid[_i][_j] !== 0) continue;
    for(let x=-1; x<=1; ++x) {
      for(let y=-1; y<=1; ++y) {
        if(x === 0 && y === 0) continue;
        if(_i+x >= 0 && _i+x < 5 && _j+y >= 0 && _j+y < 5 && !openSquares.has(toString(_i+x, _j+y))) {
          openSquares.add(toString(_i+x, _j+y));
          queue.push({i:_i+x, j:_j+y});
        } 
      }
    }
  }
}

function reveal(i, j) {
  const cell = document.querySelector(`.cell[data-i="${i}"][data-j="${j}"]`);
  cell.classList.add('open');
  if(isEmptySquare(grid[i][j])) return;
  cell.innerText = isMine(grid[i][j]) ? '💣' : grid[i][j];
}

function revealAll() {
  for(let x=0; x<5; ++x) {
    for(let y=0; y<5; ++y) {
      if(openSquares.has(toString(x,y))) continue;
      reveal(x, y);
    }
  }
}

/* Main Logic Ends Here */

function toString(i, j) {
  return `${i},${j}`;
}

function isMine(content) {
  return content < 0;
}

function isEmptySquare(content) {
  return content === 0;
}