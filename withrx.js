const {Subject, fromEvent, merge} = rxjs;
const {takeWhile, filter, tap, take, takeUntil} = rxjs.operators;

const board = document.getElementById('board');
window.addEventListener('load', () => init());

let grid = [], openedEmptySquare$, openedMine$;

function init() {
  initState();
  plantMines();
  createBoard();
}

function initState() {
  grid = Array(5);
  for(let i=0; i<5; ++i) grid[i] = Array(5).fill(0);
  board.innerText = '';
  openedEmptySquare$ = new Subject();
  openedMine$ = new Subject();
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
  const board = document.getElementById('board');
  const boardFragment = new DocumentFragment();
  for(let i=0; i<5; ++i) {
    const row = document.createElement('div');
    row.classList.add('row');
    for(let j=0; j<5; ++j) {
      cell = Cell(i, j, grid[i][j]);
      row.appendChild(cell);
    }
    boardFragment.appendChild(row);
  }
  board.appendChild(boardFragment);
}

function Cell(i, j, content) {
  const cell = document.createElement('div');
  cell.classList.add('cell');
  cell.setAttribute('data-i', i);
  cell.setAttribute('data-j', j);

  /* Main Logic Starts Here */
  let cellClick$ = fromEvent(cell, 'click').pipe(
    take(1), // once this cell is opened, don't bother listening to any more clicks on it
    takeUntil(openedMine$) // once a mine is clicked, don't bother listening to any more clicks on this cell
  );

  cellClick$.subscribe(openCell); // call openCell when cell has been clicked

  openedEmptySquare$.pipe(
    takeUntil(merge(cellClick$, openedMine$), true), // take until this cell has not been clicked (firs time click is ok) or a mine has not been opened
    filter(isNeigbouringCell), // this cell is interested only if the empty square that was opened is adjacent to it
    take(1) // need only one adjacent empty cell to open to trigger this cell to open
  ).subscribe(openCell);

  function openCell() {
    if(isMine(content))  openedMine$.next({i, j}); // broadcast that a mine has been opened at (i, j)
    else if(isEmptySquare(content)) openedEmptySquare$.next({i, j});  // broadcast that an empty cell been opened at (i, j)
    reveal(); // open this cell
  }

  openedMine$.pipe(
    takeUntil(cellClick$) // listen until this cell has not been clicked yet
  ).subscribe(handleMineOpened)


  function handleMineOpened() {
    if(isMine(content)) window.setTimeout(reveal, (-content)*200);
    else window.setTimeout(reveal, 1200);
  }

  function reveal() {
    cell.classList.add('open');
    if(isEmptySquare(content)) return;
    cell.innerText = isMine(content) ? '💣' : content;
  }

  function isNeigbouringCell({i: x, j: y}) {
    return Math.abs(x-i) <= 1 && Math.abs(y-j) <= 1;
  }

  /* Main Logic Ends Here */

  return cell;
}

function isMine(content) {
  return content < 0;
}

function isEmptySquare(content) {
  return content === 0;
}