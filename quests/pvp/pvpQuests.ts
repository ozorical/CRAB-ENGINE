import { getScore } from "../../helperFunctions/getScore";
import { Quest } from "../questMain";
import { tierHandler } from "../questFunctions";

const pvpRegister: Record<string, PvpQuest> = {};

class PvpQuest extends Quest {
  public notUsedPushMe: string;

  public setBlocks(blocks: string) {
    this.notUsedPushMe = blocks;
    return this;
  }
  public register() {
    pvpRegister[this.questName.toLowerCase().replaceAll(" ", "_")] = this;
  }
}

new PvpQuest()
  .setName("Player Kills Quest")
  .setDescription("Kill Other Players To Earn Rewards")
  .setAmounts([10, 20, 30, 40, 50, 60, 70, 80, 90, 100])
  .setScore("playerKills")
  .setRewardsCheck((player, quest) => {
    tierHandler(player, quest.questName, quest.amounts, getScore(player, quest.scoreName)!);
  })
  .register();

new PvpQuest()
  .setName("Player Damage Quest")
  .setDescription("Deal Damage To Other Players To Earn Rewards")
  .setAmounts([500, 1000, 2000, 3000, 4000, 5000, 6000, 7000, 8000, 9000])
  .setScore("playerDamage")
  .setRewardsCheck((player, quest) => {
    tierHandler(player, quest.questName, quest.amounts, getScore(player, quest.scoreName)!);
  })
  .register();

export { pvpRegister, PvpQuest };
