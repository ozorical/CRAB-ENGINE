import { Player, world } from "@minecraft/server";
import { MineQuestRegistry } from "./mining/miningQuests";
import { PveRegister } from "./pve/pveQuests";
import { pvpRegister } from "./pvp/pvpQuests";
import { TravelRegister } from "./travel/travelQuests";
import { addScore } from "../helperFunctions/getScore";

function getRandomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function tierHandler(player: Player, questName: string, amountList: Array<number>, score: number) {
  if (player.getDynamicProperty(questName) == undefined) {
    player.setDynamicProperty(questName, 0);
  }
  const tier = player.getDynamicProperty(questName) as number;

  if (score > amountList[tier]) {
    player.setDynamicProperty(questName, tier + 1);
    rewardHandler(player, questName, tier + 1);
  }
}

export function rewardHandler(player: Player, questName: string, tier: number) {
  // Send a message to the player indicating they completed the quest
  player.sendMessage(`§l§8>>§r §aYou have completed the quest: §e${questName} - Tier ${player.getDynamicProperty(questName)}`);
  player.playSound(`random.toast`);
  const randomXP = getRandomInt(25, 100);
  addScore(player, "xp", randomXP);
  player.sendMessage(`§l§8>>§r §aYou earned §e${randomXP} XP§a!`);
}

export function questScoreboardInit() {
  const scoreboard = world.scoreboard;
  Object.entries(MineQuestRegistry).forEach((quest) => {
    try {
      scoreboard.addObjective(quest[1].scoreName);
    } catch {
      console.warn("score added");
    }
  });
  Object.entries(PveRegister).forEach((e) => {
    try {
      scoreboard.addObjective(e[1].scoreName);
      console.log("New Score added");
    } catch {
      console.log("Score added");
    }
  });
  Object.entries(TravelRegister).forEach((e) => {
    try {
      scoreboard.addObjective(e[1].scoreName);
      console.log("New Score added");
    } catch {
      console.log("Score added");
    }
  });
  Object.entries(pvpRegister).forEach((e) => {
    try {
      scoreboard.addObjective(e[1].scoreName);
      console.log("New Score added");
    } catch {
      console.log("Score added");
    }
  });
}
