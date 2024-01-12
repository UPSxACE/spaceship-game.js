// Find the canvas element in the page and start the game on it.
const canva = document.getElementById("game");
const game = new Game(canva);

const launchButton = document.getElementById("launch");
launchButton.addEventListener("click", () => {
  launchButton.classList.toggle("hide", true);
  setTimeout(() => {
    launchButton.style.display = "none";
  }, 1000);
  setTimeout(() => {
    game.init();
  }, 500);
});
