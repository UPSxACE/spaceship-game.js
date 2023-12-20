// referenceValue: number between 0 and 1
// maxNumber: number that will be returned on referenceValue = 1
// ej:
// f(0, 5) = 0
// f(1, 5) = 5
function exponentialIncreaseFunc(referenceValue, maxNumber) {
  return maxNumber * (Math.pow(2, referenceValue) - 1);
}

// Background MUST be 400x400
class Background {
  /**
   *
   * @param {CanvasRenderingContext2D} context
   * @param {String} imgSource
   * @param {Number} width
   * @param {Number} height
   */
  constructor(context, imgSource, width, height) {
    this.context = context;
    this.image = new Image(width, height);
    this.width = width;
    this.height = height;
    this.x = 0;
    this.y = 0;
    this.speedX = 0;
    this.speedY = 0.1;
    this.speedIncreaseStep = 1;
    this.speedIncreaseStepPace = 0.0025;
    this.targetSpeedX = [0.1, 0.1]; // initial, final
    this.targetSpeedY = [0.1, 0.1]; // initial, final

    this.image.onload = () => (this.ready = true);
    this.image.src = imgSource;
  }

  changeSpeedY(newSpeed, pace) {
    this.speedIncreaseStepPace = pace;
    this.targetSpeedY = [this.speedY, newSpeed];
    this.speedIncreaseStep = 0;
  }

  draw() {
    if (this.ready) {
      this.context.drawImage(this.image, this.x, this.y - this.height);
      this.context.drawImage(this.image, this.x, this.y);
      this.context.drawImage(this.image, this.x, this.y + this.height);

      if (this.y < this.height) {
        this.y += this.speedY;
      }
      if (this.y >= this.height) {
        this.y = (this.y % this.height) + this.speedY;
      }

      // Set new speed step
      if (this.speedIncreaseStep + this.speedIncreaseStepPace > 1) {
        this.speedIncreaseStep = 1;
      }
      if (this.speedIncreaseStep !== 1) {
        this.speedIncreaseStep += this.speedIncreaseStepPace;
      }

      // Set new speed
      const difSpeedInitialFinal = Math.abs(
        this.targetSpeedY[1] - this.targetSpeedY[0]
      );

      if (this.targetSpeedY[1] > this.speedY) {
        // increase speed
        this.speedY =
          this.targetSpeedY[0] +
          exponentialIncreaseFunc(this.speedIncreaseStep, difSpeedInitialFinal);
      }
      if (this.targetSpeedY[1] < this.speedY) {
        // decrease speed
        this.speedY =
          this.targetSpeedY[1] -
          exponentialIncreaseFunc(this.speedIncreaseStep, difSpeedInitialFinal);
      }

      // Reset target speed
      if (this.speedIncreaseStep === 1) {
        this.targetSpeedY = [this.targetSpeedY[1], this.targetSpeedY[1]];
        this.speedIncreaseStepPace = 0.0025;
      }
    }
  }
}
