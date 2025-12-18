/**
 * Description placeholder
 *
 * @export
 * @param {number} min - Lowest Number To Generate
 * @param {number} max - Maximum Number To Generate
 * @returns {number} - Random Number Between min and max
 * @example
 * getRandomInt(1, 20) //returns a integer between 1-20
 */
export function getRandomInt(min: number, max: number) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
