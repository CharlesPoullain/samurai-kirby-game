const io = require("socket.io")(3006, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

const players = [];
const characters = ["Kirby", "Knight"];

const gameStates = [
  "Waiting for a player",
  "Waiting everyone ready",
  "playing",
  "gameover",
];

const gameInfos = {
  gameStarted: gameStates[0],
  gameWinner: null,
  countdown: null,
};

function findPlayer(id) {
  return players.find((player) => player.id === id);
}

function findOpponent(id) {
  return players.find((player) => player.id !== id);
}

io.on("connection", function (socket) {
  console.log("client connect - ", socket.id);

  socket.on("joinRoom", () => {
    if (!findPlayer(socket.id) && players.length < 2) {
      players.push({
        id: socket.id,
        player: players.length + 1,
        character: characters[players.length],
        state: "waiting",
      });

      if (players.length === 2) {
        gameInfos.gameStarted = gameStates[1];
        io.emit("gameStateChange", gameInfos);
      }

      socket.emit("player", {
        player: players[players.length - 1],
        game: gameInfos,
      });
    }
  });

  socket.on("playerReady", () => {
    const player = findPlayer(socket.id);
    if (player) {
      player.state = "ready";
      socket.emit("playerState", player);
    }
    if (
      players.length === 2 &&
      players.every((player) => player.state === "ready")
    ) {
      gameInfos.gameStarted = gameStates[2];
      gameInfos.countdown = Math.floor(Math.random() * 5) + 2;
      console.log("emit", gameInfos);
      io.emit("gameStateChange", gameInfos);
    }
  });

  socket.on("hitMark", (markWasDisplayed) => {
    const player = findPlayer(socket.id);
    gameInfos.gameStarted = gameStates[3];

    if (player && markWasDisplayed) {
      gameInfos.gameWinner = player.character;
    } else {
      gameInfos.gameWinner = findOpponent(socket.id).character;
    }

    io.emit("gameStateChange", gameInfos);
  });

  socket.on("reconnect", (attemptNumber) => {
    console.log("client reconnect - ", socket.id);
  });

  socket.on("disconnect", () => {
    console.log("client disconnect - ", socket.id);
  });
});
