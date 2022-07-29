<template>
  <div class="App" id="app">
    <div class="game">
      <div class="demo-scene">
        <div style="height: 40%;">
          <p>{{ status }}</p>
          <p v-if="gameState() && game.gameStarted">
            {{ game.gameStarted }}
          </p>
          <div>
            <button v-if="step === 1 && !game.gameFull" @click="joinGame">
              Join
            </button>
            <button
              v-if="[2, 3].includes(step) && player.state !== 'ready'"
              @click="playerReady"
            >
              Ready
            </button>
          </div>
        </div>
        <div>
          <div class="h-element">
            <img
              v-if="displayMark"
              src="/images/action-mark.png"
              class="h-element"
            />
          </div>
          <div style="display: flex; justify-content: space-around;">
            <img
              :src="`/images/kirby/kirby_${playerState}.png`"
              class="h-element"
            />
            <img
              :src="`/images/knight/knight_${opponentState}.png`"
              class="h-element"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import io from "socket.io-client";

const socket = io(`${location.protocol}//${location.hostname}:3006`);

export default {
  name: "App",

  data: () => ({
    status: "connecting...",
    displayMark: false,
    player: null,
    step: 1,
    game: {
      gameStarted: false,
      gameWinner: null,
      countdown: null,
      gameFull: false,
    },
    timer: null,
    playerState: "start",
    opponentState: "start",
  }),

  watch: {
    "game.countdown"(value) {
      if (value) {
        this.timer = setTimeout(() => {
          this.displayMark = true;
        }, value * 1000);
      }
    },
  },

  mounted() {
    socket.on("connect", () => {
      this.status = "connected";
    });
    socket.on("disconnect", () => {
      this.status = "disconnected";
    });
    socket.on("reconnect", () => {
      this.status = "connected";
    });

    socket.on("player", (payload) => {
      const { player, game } = payload;
      this.player = player;
      this.status = `Joined as ${player.character}`;
      this.step = 2;
      this.game = game;
    });

    socket.on("playerState", (player) => {
      this.player = player;
    });

    socket.on("gameFull", (isFull) => {
      this.game.gameFull = isFull;
      this.status = "Game is full";
    });

    socket.on("gameStateChange", (game) => {
      this.game = game;

      if (this.game.gameStarted === "playing") {
        document.addEventListener("keydown", this.handleKeyDown);
        document.addEventListener("click", this.handleKeyDown);
      }

      if (this.game.gameStarted === "gameover") {
        clearTimeout(this.timer);
        document.removeEventListener("keydown", this.handleKeyDown);
        document.removeEventListener("click", this.handleKeyDown);
        this.displayMark = false;
        this.step = 3;
        if (this.game.gameWinner === this.player.character) {
          this.status = "You won!";
          this.playerState = "win";
          this.opponentState = "lose";
        } else {
          this.status = "You lost!";
          this.playerState = "lose";
          this.opponentState = "win";
        }
        this.restartGame();
      }
    });
  },

  methods: {
    joinGame() {
      socket.emit("joinGame");
    },
    playerReady() {
      if (["You won!", "You lost!"].includes(this.status)) {
        this.playerState = "start";
        this.opponentState = "start";

        this.status = "Waiting for other player...";
      }
      this.status = `Joined as ${this.player.character}`;
      socket.emit("playerReady");
    },
    gameState() {
      return !["playing", "gameover"].includes(this.game.gameStarted);
    },
    hitMark() {
      socket.emit("hitMark", this.displayMark);
    },
    handleKeyDown() {
      this.hitMark();
    },

    restartGame() {
      this.step = 2;
      this.game = {
        gameStarted: false,
        gameWinner: null,
        countdown: null,
      };
    },
  },
};
</script>

<style scoped>
.App {
  width: 100%;
  height: 100%;
  background: url(/images/background.png) center center;
  background-size: cover;
  display: flex;
  justify-content: center;
  align-items: center;
}

.game {
  width: 512px;
  max-width: 90%;
  height: 444px;
  max-height: 90%;
  background: url(/images/background.png) center center;
  box-shadow: 0 0 9px rgb(0 0 0 / 60%), 0 0 0 9999px rgb(255 255 255 / 40%);
  border-radius: 5px;
  overflow: hidden;
}

.demo-scene {
  height: 100%;
  padding: 0.7rem;
  text-align: center;
  color: white;
}

.demo-scene p {
  margin-bottom: 2rem;
}

.h-element {
  height: 60px;
}
</style>
