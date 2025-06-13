/**
 * @module PlayerTools
 */
import { Player, system } from "@minecraft/server";

const SOUNDS = {
  Activate: "beacon.activate",
  Chime: "note.chime",
  Error: "note.bit",
  Success: "random.levelup",
  Ping: "random.orb",
  BubblePop: "bubble.pop",
  RandomPop: "random.pop",
  Bass: " note.bass",
  Snare: "note.snare",
  Hat: "note.hat", 
  BassDrum: "note.bd",
};

/**
 * Usage example:
 * ```typescript
 * PlaySoundTo(player, "Success");
 * ```
 * @param {Player} player - The player to play the sound to.
 * @param {string} soundKey - The key of the sound in SOUNDS.
 */
export function playSoundTo(player: Player, soundKey: keyof typeof SOUNDS) {
  const sound = SOUNDS[soundKey];

  if (!sound) {
    console.warn(`Sound "${soundKey}" not found in SOUNDS.`);
    return;
  }

  system.run(() => {
    player.playSound(sound);
  });
}
