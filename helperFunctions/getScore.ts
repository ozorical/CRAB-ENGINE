/**
 * Docs For The Custom Scoreboard Functions
 * @module ScoreFunctions
 */

import { Entity, Player, world } from "@minecraft/server";

/**
 * Gets The Specified Entity/Fake Player's Specified Score.
 
 * @export
 * @function
 * @author @chickenman34234
 * @param {Player | Entity | string} entity
 * @param {string} score
 * @example <caption>Get A Player's Score</caption>
 * const player = world.getPlayers[0]
 * getScore(player, "money")
 * @example <caption>Get A Fake Player's Score</caption>
 * getScore("fakePlayer", "money")
 * @returns {number | undefined}
 */
export function getScore(entity: Entity | string, score: string) {
  return world.scoreboard.getObjective(score)?.getScore(entity);
}

/**
 * Sets The Specified Entity/Fake Player's To The Specified Score.
 *
 * @export
 * @function
 * @author @chickenman34234
 * @param {(Player| Entity | string)} entity
 * @param {string} score
 * @param {number} amount
 * @example <caption>Set A Player's Score</caption>
 * const player = world.getPlayers[0]
 * setScore(player, "money", 100)
 * @example <caption>Set A Fake Player's Score</caption>
 * setScore("fakePlayer", "money", 100)
 * @returns {void}
 */

export function setScore(entity: Entity | string, score: string, amount: number) {
  world.scoreboard.getObjective(score)?.setScore(entity, amount);
}

/**
 * Adds To The Specified Entity/Fake Player's Specified Score.
 *
 * @export
 * @function
 * @author @chickenman34234
 * @param {(Player| Entity | string)} entity
 * @param {string} score
 * @param {number} amount
 * @example <caption>Add To A Player's Score</caption>
 * const player = world.getPlayers[0]
 * addScore(player, "money", 100)
 * @example <caption>Add To A Fake Player's Score</caption>
 * addScore("fakePlayer", "money", 100)
 * @returns  {void}
 *
 */

export function addScore(entity: Entity | string, score: string, amount: number) {
  world.scoreboard.getObjective(score)?.addScore(entity, amount);
}

/**
 * Subtracts From The Specified Entity/Fake Player's Specified Score.
 * @author @chickenman34234
 * @export
 * @function
 * @param {(Player| Entity | string)} entity
 * @param {string} score
 * @param {number} amount
 * @example <caption>Substracts From A Player's Score</caption>
 * const player = world.getPlayers[0]
 * removeScore(player, "money", 100)
 * @example <caption>Substracts From A Fake Player's Score</caption>
 * removeScore("fakePlayer", "money", 100)
 * @returns {void}
 */

export function removeScore(entity: Entity | string, score: string, amount: number) {
  world.scoreboard.getObjective(score)?.addScore(entity, amount * -1);
}
