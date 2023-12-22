/**
 * This function can be used to get values from X to Y, at an increasing (non-linear) pace.
 *
 * ej:
 *
 * f(0, 5) = 0
 *
 * f(0.2, 5) = 0.74...
 *
 * f(0.4, 5) = 1.59...
 *
 * f(0.6, 5) = 2.57...
 *
 * f(1, 5) = 5
 *
 * @param {Number} referenceValue number between 0 and 1
 * @param {Number} maxNumber number that will be returned on referenceValue = 1
 * @returns {Number}
 */
function exponentialIncreaseFunc(referenceValue, maxNumber) {
  return maxNumber * (Math.pow(2, referenceValue) - 1);
}

/**
 * Same as exponentialIncreaseFunc, but the first values scale more slowly
 * and the latter ones faster. It's possible to control that difference
 * with the third argument
 *
 * @param {Number} referenceValue number between 0 and 1
 * @param {Number} maxNumber number that will be returned on referenceValue = 1
 * @param {Number} smoothness smoothen the early values
 * @returns {Number}
 */
function exponentialIncreaseSmootherFunc(
  referenceValue,
  maxNumber,
  smoothness
) {
  const smoothRefValue =
    referenceValue * referenceValue * (3 - 2 * referenceValue);
  return maxNumber * (1 - Math.pow(1 - smoothRefValue, smoothness));
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

    this.afterSpeedChangeCallback = null;
  }

  changeSpeedY(newSpeed, pace, afterSpeedChangeCallback) {
    this.speedIncreaseStepPace = pace;
    this.targetSpeedY = [this.speedY, newSpeed];
    this.speedIncreaseStep = 0;
    this.afterSpeedChangeCallback = afterSpeedChangeCallback
      ? afterSpeedChangeCallback
      : null;
  }

  draw() {
    if (this.ready) {
      if (this.y < this.height) {
        this.y += this.speedY;
      }
      if (this.y >= this.height) {
        this.y = (this.y % this.height) + this.speedY;
      }

      this.context.drawImage(this.image, this.x, this.y - this.height + 2);
      this.context.drawImage(this.image, this.x, this.y);
      this.context.drawImage(this.image, this.x, this.y + this.height - 2);

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
          exponentialIncreaseSmootherFunc(
            this.speedIncreaseStep,
            difSpeedInitialFinal,
            1.25
          );
      }
      if (this.targetSpeedY[1] < this.speedY) {
        // decrease speed
        this.speedY =
          this.targetSpeedY[0] -
          exponentialIncreaseSmootherFunc(
            this.speedIncreaseStep,
            difSpeedInitialFinal,
            1.25
          );
      }

      // Reset target speed
      if (this.speedIncreaseStep === 1) {
        this.targetSpeedY = [this.targetSpeedY[1], this.targetSpeedY[1]];
        this.speedIncreaseStepPace = 0.0025;
        if (this.afterSpeedChangeCallback) {
          this.afterSpeedChangeCallback();
          this.afterSpeedChangeCallback = null;
        }
      }
    }
  }
}
