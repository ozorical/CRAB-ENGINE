import { Player, world } from "@minecraft/server";
import { addScore, getScore, setScore } from "../helperFunctions/getScore";

export function checkAndKickAFKPlayers(player: Player) {
  const velocity = player.getVelocity();
  const isMoving = velocity.x !== 0 || velocity.y !== 0 || velocity.z !== 0;

  if (isMoving && !player.hasTag("staffstatus") && !player.hasTag("realmbot")) {
    setScore(player, "afk", 0);
  } else if (!player.hasTag("staffstatus") && !player.hasTag("realmbot")) {
    addScore(player, "afk", 1);
  }

  const afkScore = getScore(player, "afk")!;

  if (afkScore === 540 && !player.getTags().includes("staffstatus") && !player.getTags().includes("realmbot")) {
    player.sendMessage(`§eYou will be kicked for being AFK in 1 minute.`);
  }

  if (afkScore >= 600 && !player.getTags().includes("staffstatus") && !player.getTags().includes("realmbot")) {
    world.sendMessage(`${player.name} §cWas Kicked For AFK`);
    setScore(player, "afk", 0);
    player.runCommand(`kick "${player.name}" §cYou were kicked for being AFK`);

  }
}