const tetrominos = {
  I: [
    [0, 0, 0, 0],
    [1, 1, 1, 1],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
  ],
  J: [
    [1, 0, 0],
    [1, 1, 1],
    [0, 0, 0],
  ],
  L: [
    [0, 0, 1],
    [1, 1, 1],
    [0, 0, 0],
  ],
  O: [
    [1, 1],
    [1, 1],
  ],
  S: [
    [0, 1, 1],
    [1, 1, 0],
    [0, 0, 0],
  ],
  Z: [
    [1, 1, 0],
    [0, 1, 1],
    [0, 0, 0],
  ],
  T: [
    [0, 1, 0],
    [1, 1, 1],
    [0, 0, 0],
  ],
};
let nextItemPlace = [
  [0, 0, 0, 0],
  [0, 0, 0, 0],
  [0, 0, 0, 0],
];

let tetrominosWithWeight = {
  I: 20,
  J: 15,
  L: 15,
  O: 15,
  S: 15,
  Z: 15,
  T: 15,
};
let valueName, intervalId, nonCollisionPlace, changedPlace;
let score = 0;
let bestScore = 0;
let currentInterval = 500;
let scoreBust = 1;
let countOfLine = 0;
let lvl = 1;
let item = randomTetrominos(tetrominosWithWeight);
let nextItem = randomTetrominos(tetrominosWithWeight);
let place = createNewPlace();
let position = {
  x: place[0].length / 2 - 1,
  y: 1,
};
let updatedPlace = place;

document.getElementById("scoreValue").innerText = score;
document.getElementById("bestScoreValue").innerText = bestScore;

function createNewPlace() {
  let place = Array.from({ length: 24 }, () => Array(14).fill(0));
  place[23].fill(1);
  for (let index = 0; index < place.length; index++) {
    place[index][0] = 3;
    place[index][1] = 3;
    place[index][place[index].length - 2] = 3;
    place[index][place[index].length - 1] = 3;
  }
  return place;
}
function rotate(matrix) {
  const rows = matrix.length;
  const columns = matrix[0].length;
  const rotatedMatrix = new Array(columns)
    .fill(0)
    .map(() => new Array(rows).fill(0));
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < columns; j++) {
      rotatedMatrix[j][rows - 1 - i] = matrix[i][j];
    }
  }
  return rotatedMatrix;
}

function randomTetrominos(tetrominosWithWeight) {
  const randomValue = Math.random() * 100;
  let cumulativeWeight = 0;
  for (const [tetrominoName, weight] of Object.entries(tetrominosWithWeight)) {
    cumulativeWeight += weight;
    if (randomValue <= cumulativeWeight) {
      return tetrominos[tetrominoName];
    }
  }
}

function displayBoard(currentPlace, nextItem) {
  const gameBoard = document.getElementById("game-board");
  const nextItemBoard = document.getElementById("next-piece");
  gameBoard.innerHTML = "";
  nextItemBoard.innerHTML = "";

  for (let x = 0; x < currentPlace.length; x++) {
    for (let y = 0; y < currentPlace[x].length; y++) {
      const cell = document.createElement("div");
      if (x > 2) {
        cell.classList.add("cell");
      }
      if (x <= 2) {
        cell.classList.add("empt");
      }
      if (currentPlace[x][y] === 1) {
        cell.classList.add(`alive${lvl}`);
      } else if (currentPlace[x][y] >= 2) {
        cell.classList.add("collaps");
      } else {
        cell.classList.add("dead");
      }

      gameBoard.appendChild(cell);
    }
  }

  for (let x = 0; x < nextItemPlace.length; x++) {
    for (let y = 0; y < nextItemPlace[x].length; y++) {
      const cell = document.createElement("div");
      if (x < nextItem.length && y < nextItem.length)
        nextItemPlace[x][y] = nextItem[x][y];
      if (nextItemPlace[x][y] === 1) {
        cell.classList.add(`next-alive${lvl}`);
      } else {
        cell.classList.add("next-dead");
      }

      nextItemBoard.appendChild(cell);
    }
  }
  nextItemPlace = [
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
  ];
}
document.addEventListener("keydown", function (e) {
  if (e.keyCode === 38) {
    rotateTetramino();
  }
  if (e.keyCode === 37) {
    moveDirection("left");
  }
  if (e.keyCode === 39) {
    moveDirection("right");
  }
  if (e.keyCode === 40 && position.y <= place.length - item.length + 1) {
    moveDirection("down");
  }
});
displayBoard(place, nextItem);
function startGame() {
  if (intervalId) {
    clearInterval(intervalId);
  }

  const intervalCallback = () => {
    if (!collisium(updatedPlace, position, item)) {
      displayBoard(updatedPlace, nextItem);
      nonCollisionPlace = updatedPlace;
      verticalDirection(place, item, position);
    } else {
      if (position.y < 3) gameOwer();
      position = {
        x: place[0].length / 2 - 1,
        y: 1,
      };

      place = nonCollisionPlace;

      for (let index = place.length - 2; index > 3; index--) {
        if (place[index].every((el) => el !== 0)) {
          for (let x = 1; x <= place[index].length - 2; x++) {
            place[index][x] = 0;
          }
          countOfLine++;
          for (let y = index; y > 3; y--) {
            place[y] = place[y - 1];
          }

          index++;
        }
      }
      changingScore();
      document.getElementById("scoreValue").innerText = score;
      displayBoard(place, nextItem);
      verticalDirection(place, (item = nextItem), position, place);

      clearInterval(intervalId);
      intervalId = setInterval(intervalCallback, currentInterval);

      nextItem = randomTetrominos(tetrominosWithWeight);
    }
  };

  // Запуск setInterval с начальным интервалом
  intervalId = setInterval(intervalCallback, currentInterval);
}

function positionCalculationverticalDirection(place, item, position) {
  updatedPlace = JSON.parse(JSON.stringify(place));
  for (let y = 0; y < item.length; y++) {
    for (let x = 0; x < item[y].length; x++) {
      if (item[y].every((el) => el == 0)) break;
      if (!collisium(updatedPlace)) {
        updatedPlace[position.y + y][position.x + x] += item[y][x];
      }
    }
  }

  return updatedPlace;
}

function verticalDirection(place, item, position) {
  updatedPlace = positionCalculationverticalDirection(place, item, position);
  position.y++;
}

function collisium(place) {
  return place.some((place) => place.some((el) => el === 2 || el === 4));
}
function rotateTetramino() {
  let itemRotate = rotate([...item]);
  changedPlace = JSON.parse(JSON.stringify(place));
  for (let y = 0; y < itemRotate.length; y++) {
    for (let x = 0; x < itemRotate[y].length; x++) {
      if (itemRotate[y].some((el) => el !== 0)) {
        changedPlace[position.y - 1 + y][position.x + x] += itemRotate[y][x];
      }
    }
  }
  if (changedPlace.some((el) => el.some((el) => el == 4))) {
    do {
      changedPlace = JSON.parse(JSON.stringify(place));
      position.x < 6 ? position.x++ : position.x--;
      for (let y = 0; y < itemRotate.length; y++) {
        for (let x = 0; x < itemRotate[y].length; x++) {
          if (itemRotate[y].some((el) => el !== 0)) {
            changedPlace[position.y - 1 + y][position.x + x] +=
              itemRotate[y][x];
          }
        }
      }
    } while (changedPlace.some((el) => el.some((el) => el == 4)));
  }

  if (!collisium(changedPlace)) {
    item = [...itemRotate];
    updatedPlace = JSON.parse(JSON.stringify(changedPlace));
    displayBoard(updatedPlace, nextItem);
  } else {
    return updatedPlace;
  }
}

function moveDirection(direction) {
  let verticalDirection, horizontalDirection;
  switch (direction) {
    case "down":
      verticalDirection = 1;
      horizontalDirection = 0;
      break;
    case "left":
      verticalDirection = 0;
      horizontalDirection = -1;
      break;
    case "right":
      verticalDirection = 0;
      horizontalDirection = 1;
      break;
  }
  changedPlace = JSON.parse(JSON.stringify(place));
  for (let y = 0; y < item.length; y++) {
    for (let x = 0; x < item[y].length; x++) {
      if (item[y].some((el) => el !== 0)) {
        changedPlace[position.y - 1 + y + verticalDirection][
          position.x + horizontalDirection + x
        ] += item[y][x];
      }
    }
  }
  if (!collisium(changedPlace)) {
    position.x += horizontalDirection;
    position.y += verticalDirection;
    updatedPlace = JSON.parse(JSON.stringify(changedPlace));
    displayBoard(updatedPlace, nextItem);
  }
}

function changingScore() {
  if (countOfLine === 4) {
    score += 100 * scoreBust * countOfLine * 2;
  } else if (countOfLine === 3) {
    score += 100 * scoreBust * countOfLine * 1.5;
  } else if (countOfLine === 2) {
    score += 100 * scoreBust * countOfLine * 1.2;
  } else {
    score += 100 * scoreBust * countOfLine;
  }
  countOfLine = 0;
  switch (true) {
    case score > 200000:
      currentInterval = 100;
      scoreBust = 32;
      lvl = 6;
      break;
    case score > 100000:
      currentInterval = 150;
      scoreBust = 16;
      lvl = 5;
      break;
    case score > 50000:
      currentInterval = 200;
      scoreBust = 8;
      lvl = 4;
      break;
    case score > 10000:
      currentInterval = 300;
      scoreBust = 4;
      lvl = 3;
      break;
    case score > 2000:
      currentInterval = 400;
      scoreBust = 2;
      lvl = 2;
      break;
    default:
      currentInterval = 500;
      scoreBust = 1;
      lvl = 1;
      break;
  }
}
function openModal() {
  clearInterval(intervalId);
  document.getElementById("gameOverModal").style.display = "block";
  document.getElementById("scoreValueModal").textContent = score;
  document.getElementById("scoreValueModal").style.display = "block";
}

function closeModal() {
  document.getElementById("gameOverModal").style.display = "none";
  updatedPlace = createNewPlace();
  place = updatedPlace;
  clearInterval(intervalId);
  displayBoard(place);
  score > bestScore ? (bestScore = score) : 0;
  document.getElementById("bestScoreValue").innerText = bestScore;
  score = 0;
  document.getElementById("scoreValue").innerText = score;
}
function gameOwer() {
  clearInterval(intervalId);
  openModal();
  currentInterval = 500;
  scoreBust = 1;
  lvl = 1;
}
function stopGame() {
  clearInterval(intervalId);
}
