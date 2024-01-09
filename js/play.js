// Find the canvas element in the page and start the game on it.
const canva = document.getElementById("game");
const game = new Game(canva);
game.init();
