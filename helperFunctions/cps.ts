import { Player, Scoreboard, world } from "@minecraft/server";

export function trackPlayerClickStats(player: Player) {
  const scoreboard = world.scoreboard;
  if (!player.getDynamicProperty("lastClicks")) {
    player.setDynamicProperty("lastClicks", JSON.stringify([0]));
  }

  let lastFiveClicks: Array<number>;
  try {
    lastFiveClicks = JSON.parse(player.getDynamicProperty("lastClicks") as string);
    if (!Array.isArray(lastFiveClicks)) {
      throw new Error("§clastClicks is not an array");
    }
  } catch (error) {
    console.error("Error parsing lastClicks:", error);
    lastFiveClicks = [0];
    player.setDynamicProperty("lastClicks", JSON.stringify(lastFiveClicks));
  }

  const clicksObjective = scoreboard.getObjective("clicks");
  let clicksinSecond = clicksObjective?.getScore(player) || 0;
  if (isNaN(clicksinSecond)) {
    clicksinSecond = 0;
  }

  const clickRecord = (player.getDynamicProperty("clickRecord") as number) || 0;
  if (clicksinSecond > clickRecord) {
    player.setDynamicProperty("clickRecord", clicksinSecond);
  }

  lastFiveClicks.push(clicksinSecond);
  if (lastFiveClicks.length === 6) {
    lastFiveClicks.shift();
  }

  player.setDynamicProperty("lastClicks", JSON.stringify(lastFiveClicks));

  const sum = lastFiveClicks.reduce((p, c) => p + c, 0);
  const avg = Math.floor(sum / 5);


  clicksObjective?.setScore(player, 0);

  const avgClicksObjective = scoreboard.getObjective("avgClicks");
  avgClicksObjective?.setScore(player, avg);
}
