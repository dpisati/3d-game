import Pathfinding from "pathfinding";
import { Server } from "socket.io";

const io = new Server({
  cors: {
    origin: "http://localhost:5173",
  },
});

io.listen(3001);

const generateRandomPosition = () => {
  let x;
  let y;

  do {
    x = Math.floor(Math.random() * map.size[0] * map.gridDivision);
    y = Math.floor(Math.random() * map.size[1] * map.gridDivision);
  } while (grid.isWalkableAt(x, y) === false);

  return [x, y];
};

const generateRandomColor = () => {
  return `#${Math.floor(Math.random() * 16777215).toString(16)}`;
};

const characters = [];

const items = {
  table: {
    name: "Table",
    size: [5, 3],
  },
  chair: {
    name: "Chair",
    size: [2, 2],
  },
  desk: {
    name: "Desk",
    size: [5, 4],
  },
  light: {
    name: "Light",
    size: [1, 1],
  },
  styleChair: {
    name: "StyleChair",
    size: [3, 3],
  },
  couchSmall: {
    name: "Couch_Small1",
    size: [3, 2],
  },
  couchMedium: {
    name: "Couch_Medium1",
    size: [5, 2],
  },
  shelf: {
    name: "Shelf",
    size: [4, 1],
  },
};

const map = {
  size: [10, 10],
  gridDivision: 2,
  items: [
    {
      ...items.chair,
      gridPosition: [11, 4],
      rotation: 1,
    },
    {
      ...items.table,
      gridPosition: [9, 12],
    },
    {
      ...items.couchMedium,
      gridPosition: [4, 4],
    },
    {
      ...items.couchSmall,
      gridPosition: [2, 6],
      rotation: 1,
    },
    {
      ...items.desk,
      gridPosition: [12, 4],
      rotation: 1,
    },
    {
      ...items.shelf,
      gridPosition: [12, 0],
    },
    {
      ...items.light,
      gridPosition: [3, 4],
    },
    {
      ...items.styleChair,
      gridPosition: [3, 14],
      rotation: 1,
    },
  ],
};

const grid = new Pathfinding.Grid(
  map.size[0] * map.gridDivision,
  map.size[1] * map.gridDivision
);

const finder = new Pathfinding.AStarFinder({
  allowDiagonal: true,
  dontCrossCorners: true,
});

const updateGrid = () => {
  map.items.forEach((item) => {
    const width =
      item.rotation === 1 || item.rotation === 3 ? item.size[1] : item.size[0];
    const height =
      item.rotation === 1 || item.rotation === 3 ? item.size[0] : item.size[1];

    for (let x = 0; x < width; x++) {
      for (let y = 0; y < height; y++) {
        grid.setWalkableAt(
          item.gridPosition[0] + x,
          item.gridPosition[1] + y,
          false
        );
      }
    }
  });
};

updateGrid();

const findPath = (start, end) => {
  const gridClone = grid.clone();
  const path = finder.findPath(start[0], start[1], end[0], end[1], gridClone);

  return path;
};

io.on("connection", (socket) => {
  console.log("a user connected");

  characters.push({
    id: socket.id,
    position: generateRandomPosition(),
    hairColor: generateRandomColor(),
    topColor: generateRandomColor(),
    bottomColor: generateRandomColor(),
  });

  socket.emit("hello", {
    map,
    characters,
    items,
    id: socket.id,
  });

  socket.on("move", ({ from, to }) => {
    const character = characters.find((c) => c.id === socket.id);
    const path = findPath(from, to);

    if (!path.length) return;

    character.position = from;
    character.path = path;

    io.emit("playerMove", character);
  });

  io.emit("characters", characters);

  socket.on("disconnect", () => {
    console.log("user disconnected");

    const index = characters.findIndex((c) => c.id === socket.id);
    characters.splice(index, 1);

    io.emit("characters", characters);
  });
});
