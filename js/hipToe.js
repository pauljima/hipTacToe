/*... a;lskdjf;laksdjf;alskdjf
tic tac toe
computer wants to win
*/


/**
 * sometimes it's just easier to extend the primitives and core objects
 */
if(![].indexOf) {
  Array.prototype.indexOf = function(s) {
    for(var i=0, n=this.length; i<n; i++) {
      if(this[i] == s) {
        return i;
      }
    }

    return -1;
  }
}

(function() {
  /**
   * vars that need to be available to this closure
   */
  var
    gel = function(id) { return document.getElementById(id); },
    $ = function(s) { return document.querySelectorAll(s); },
    names = {
      p : 'Player',
      c : 'Joshua'
    },
    cells = $('cell'),
    cellMatrix = {
      // TODO: obvious pattern: set + 3 iterations
      rows : [
        [ 0, 1, 2 ],
        [ 3, 4, 5 ],
        [ 6, 7, 8 ]
      ],
      // TODO: obvious pattern: set + 1 iterations
      cols : [
        [ 0, 3, 6 ],
        [ 1, 4, 7 ],
        [ 2, 5, 8 ]
      ],
      // TOOO: opposition corners++ == 8
      diagonals : [
        [ 0, 4, 8 ],
        [ 2, 4, 6 ]
      ]
    },
    next;


  /*****************************************************************************
   **** UTILS
   *****************************************************************************/
  function hasClass(el, className) {
    return (el.className.indexOf(className) > -1);
  }

  function removeClass(el, className) {
    var ret = [],
      a = el.className.split(' ');

    for(var i=0, n=a.length; i<n; i++) {
      if(a[i] != className) {
        ret.push(a[i])
      }
    }

    el.className = ret.join(' ');
  }







  /*****************************************************************************
   **** JOSHUA's LOGIC
   *****************************************************************************/
  /**
   * JS calculates best move, passes turn back to player
   */
  function play() {
    // console.log('@play');
    var availableCells = $('cell.available'),
      bestMoves, bridgeMove,
      strongOpenMove = _getBestCell(availableCells);
      // strongOpenMove = _getBestCell(cells);

    // get logically weighted cell
    bridgeMove = _getBridgeMove();

    // in jeopardy?
    bestMoves = _getCriticalCell();

    // play bestMove or just a strongOpenMove
    placeMarker((bestMoves.length) ? bestMoves[0] : (bridgeMove) ? bridgeMove : strongOpenMove, function() {
      next = 'p';
    });
  }


  /**
   * in game play, find a cell that can potentially lead to victory
   * @return {HtmlDOMElement|null}
   */
  function _getBridgeMove() {
    var k, i, j, m, n, a, b,
      checks,
      checkCells,
      ret = null;

    for(k in cellMatrix) {
      for(i=0, n=cellMatrix[k].length; i<n; i++) {
        checks = [];
        checkCells = [];

        for(j=0, m=cellMatrix[k][i].length; j<m; j++) {
          checks.push(cells[cellMatrix[k][i][j]].dataset.owner || '');
          checkCells.push(cells[cellMatrix[k][i][j]]);
        }

        // we have 1 cell taken, 2 open
        if(checks.join('') == 'c') {
          // find available cells
          for(a=0, b=checkCells.length; a<b; a++) {
            if(checkCells[a].className.indexOf('available') > -1) {
              return checkCells[a];
            }
          }
        }
      }
    }

    return ret;
  }


  /**
   * uses the matrix to determine if a required move is present,
   * i.e., the cock block
   * @return {Array} list of critical cells
   */
  function _getCriticalCell() {
    var k, i, j, m, n, a, b,
      checks,
      checkCells,
      ret = [];

    for(k in cellMatrix) {
      for(i=0, n=cellMatrix[k].length; i<n; i++) {
        checks = [];
        checkCells = [];

        for(j=0, m=cellMatrix[k][i].length; j<m; j++) {
          checks.push(cells[cellMatrix[k][i][j]].dataset.owner || '');
          checkCells.push(cells[cellMatrix[k][i][j]]);
        }

        if(checks.join('') == 'pp' || checks.join('') == 'cc') {
          // find available cells
          for(a=0, b=checkCells.length; a<b; a++) {
            if(checkCells[a].className.indexOf('available') > -1) {
              if(checks.join('') == 'cc') {
                return [ checkCells[a] ]; // WOPR wins
              } else {
                ret.push(checkCells[a]);
              }
            }
          }
        }
      }
    }

    // joshua loses
    if(ret.length > 1) {
      // alert('really? really?  fine.');
      return ret;
      // if(confirm('Stalemate.  I refuse to lose to you.  Press Ok to play again.')) {
      //   resetBoard();
      // } else {
      //   alert('really? really?  fine.');
      //   return ret;
      // }
    } else {
      return ret;
    }
  }


  /**
   * low level, determine best cell based on rank
   * @param {NodeList} cells - this is a filtered list of available cells
   */
  function _getBestCell(cells) {
    var ret = null, j, m, i, n, cellIndex,
      lowest = 9,
      // reflow weights
      random,
      reflow = [ 4 ], // center
      p0s = [ 0, 2, 6, 8 ], // corners
      p1s = [ 1, 3, 5, 7 ]; // others

    // randomize tier-0, concat with randomized tier-1
    while(p0s.length > 0) {
      random = Math.floor(Math.random() * (p0s.length));
      reflow = reflow.concat(p0s.splice(random, 1));
    }
    while(p1s.length > 0) {
      random = Math.floor(Math.random() * (p1s.length));
      reflow = reflow.concat(p1s.splice(random, 1));
    }
    // console.log(reflow);

    // iterate through reflowed priority list, find lowest available cell and return
    for(i=0, n=reflow.length; i<n; i++) {
      for(j=0, m=cells.length; j<m; j++) {
        if(parseInt(cells[j].dataset.cellIndex) === reflow[i]) {
          return cells[j];
        }
      }
    }

    return ret; // 
  }



  /**
   * draws X or O
   * @param {HTMLDomElement} cell
   * @param {Function} callback fire when done
   */
  function placeMarker(cell, callback) {
    removeClass(cell, 'available');

    // is cell populated?
    if(cell.innerHTML === "") {
      cell.innerHTML = (next == 'p') ? 'x' : 'o';
      cell.dataset.owner = next;

      if(winner()) {
        alert('Winner: ' + names[next] + '\n\nPress "Reset" to begin a new game.');
      } else {
        // catch draw condition (all cells filled);
        if($('cell.available').length === 0) {
          if(confirm('No more moves.  Play again?')) {
            resetBoard();
          }
        } else {
          callback();
        }
      }
    }
  }



  /**
   *  checks the board for 3-in-a-row, including diagonals
   */
  function winner() {
    var k, i, j, m, n,
      checks,
      ret = false;

    for(k in cellMatrix) {
      for(i=0, n=cellMatrix[k].length; i<n; i++) {
        checks = [];

        for(j=0, m=cellMatrix[k][i].length; j<m; j++) {
          checks.push(cells[cellMatrix[k][i][j]].dataset.owner || null);
        }

        if(checks.join('') === 'ccc' || checks.join('') == 'ppp') {
          return true;
        }
        // console.log(checks);
      }
    }

    return ret;
  }






  /**
   * Reset the game board.
   */
  function resetBoard() {
    var i, n;

    for(i=0, n=cells.length; i<n; i++) {
      cells[i].className = 'available';
      cells[i].removeAttribute('data-owner');
      cells[i].innerHTML = '';
    }

    //$('messages')[0].innerHTML = 'Your move.';
    next = 'p';
  }

  /**
   * bind click events on cells
   */
  function handleInputs() {
    document.body.addEventListener('click', function(e) {
      var focusCell;

      e.preventDefault();

      // handle basic actions
      if(e.target.dataset.action) {
        switch(e.target.dataset.action) {
          case "reset-game":
            resetBoard();
            break;
        }

      } else if(e.target.tagName.toLowerCase() == 'cell') {
        if(next != 'p') {
          // we'll probably never see this b/c logic is fast, but damned event bubbling
          alert('naughty.  cheaters suck.');
        } else {
          focusCell = e.target;

          if(!hasClass(focusCell, 'selected')) {
            placeMarker(focusCell, function() {
              next = 'c';
              play();
            });
          }
        }
      }
    });
  }













  /*****************************************************************************
   **** GOLD PLATING
   *****************************************************************************/
  function rotateBg() {
    var
      interval, inFocus, outFocus, timeout,
      imgIndex = 0,
      bgImages = [
        'gtw.jpg', 'menu.jpg', 'ttt.jpg', 'defcon.png', 'greetz.png'
      ],
      bg1= gel('bg1'), 
      bg0 = gel('bg0');


    bg0.style.backgroundImage = 'url(img/greetz.png)';
    removeClass(bg0, 'out');

    interval = setInterval(function() {
      inFocus = (imgIndex % 2 === 0) ? bg0 : bg1;
      outFocus = (imgIndex % 2 === 0) ? bg1 : bg0;

      // place current bg behind
      inFocus.style.zIndex = 0;
      inFocus.className = 'out';

      outFocus.style.backgroundImage = 'url(img/' + bgImages[imgIndex] + ')';
      outFocus.style.zIndex = 100;
      outFocus.className = '';

      imgIndex++;

      if(imgIndex == bgImages.length) {
        imgIndex = 0;
      }
    }, 5000);
  }










  /**
   * start the game
   */
  resetBoard();
  handleInputs();
  rotateBg();
})();