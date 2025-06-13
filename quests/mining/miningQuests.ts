import { MinecraftBlockTypes } from "@minecraft/vanilla-data";
import { Quest } from "../questMain";
import { getScore } from "../../helperFunctions/getScore";
import { tierHandler } from "../questFunctions";

const MineQuestRegistry: Record<string, MiningQuest> = {};

class MiningQuest extends Quest {
  public blockList: Array<string>;

  public setBlocks(blocks: Array<string>) {
    this.blockList = blocks;
    return this;
  }

  public register() {
    MineQuestRegistry[this.questName.toLowerCase().replaceAll(" ", "_")] = this;
  }
}

/* new MiningQuest()
  .setName("Dirt Quest")
  .setDescription("Mine Dirt To Earn Rewards")
  .setBlocks([MinecraftBlockTypes.Dirt, MinecraftBlockTypes.DirtWithRoots, MinecraftBlockTypes.CoarseDirt, MinecraftBlockTypes.GrassBlock, MinecraftBlockTypes.GrassPath])
  .setAmounts([100, 1000, 5000, 10000, 25000, 100000, 250000, 500000, 1000000])
  .setScore("dirtMined")
  .setRewardsCheck((player, quest) => {
    tierHandler(player, quest.questName, quest.amounts, getScore(player, quest.scoreName) as number);
  })
  .register();
  */

new MiningQuest()
  .setName("Misc Stones")
  .setDescription("Mine Misc Stones To Earn Rewards")
  .setBlocks([MinecraftBlockTypes.Andesite, MinecraftBlockTypes.Diorite, MinecraftBlockTypes.Granite, MinecraftBlockTypes.DripstoneBlock])
  .setAmounts([100, 1000, 5000, 10000, 25000, 100000, 250000, 500000, 1000000])
  .setScore("miscStoneMined")
  .setRewardsCheck((player, quest) => {
    tierHandler(player, quest.questName, quest.amounts, getScore(player, quest.scoreName) as number);
  })
  .register();

new MiningQuest()
  .setName("Coal Ore")
  .setDescription("Mine Coal Ore To Earn Rewards")
  .setBlocks([MinecraftBlockTypes.CoalOre, MinecraftBlockTypes.DeepslateCoalOre])
  .setAmounts([100, 1000, 5000, 10000, 25000, 100000, 250000, 500000, 1000000])
  .setScore("coalOre")
  .setRewardsCheck((player, quest) => {
    tierHandler(player, quest.questName, quest.amounts, getScore(player, quest.scoreName) as number);
  })
  .register();

new MiningQuest()
  .setName("Copper Ore")
  .setDescription("Mine Copper Ore To Earn Rewards")
  .setBlocks([MinecraftBlockTypes.CopperOre, MinecraftBlockTypes.DeepslateCopperOre])
  .setAmounts([100, 1000, 5000, 10000, 25000, 100000, 250000, 500000, 1000000])
  .setScore("copperOre")
  .setRewardsCheck((player, quest) => {
    tierHandler(player, quest.questName, quest.amounts, getScore(player, quest.scoreName) as number);
  })
  .register();

new MiningQuest()
  .setName("Iron Ore")
  .setDescription("Mine Iron Ore To Earn Rewards")
  .setBlocks([MinecraftBlockTypes.IronOre, MinecraftBlockTypes.DeepslateIronOre])
  .setAmounts([100, 1000, 5000, 10000, 25000, 100000, 250000, 500000, 1000000])
  .setScore("ironOre")
  .setRewardsCheck((player, quest) => {
    tierHandler(player, quest.questName, quest.amounts, getScore(player, quest.scoreName) as number);
  })
  .register();

new MiningQuest()
  .setName("Gold Ore")
  .setDescription("Mine Gold Ore To Earn Rewards")
  .setBlocks([MinecraftBlockTypes.GoldOre, MinecraftBlockTypes.DeepslateGoldOre])
  .setAmounts([100, 1000, 5000, 10000, 25000, 100000, 250000, 500000, 1000000])
  .setScore("goldOre")
  .setRewardsCheck((player, quest) => {
    tierHandler(player, quest.questName, quest.amounts, getScore(player, quest.scoreName) as number);
  })
  .register();

new MiningQuest()
  .setName("Emerald Ore")
  .setDescription("Mine Emerald Ore To Earn Rewards")
  .setBlocks([MinecraftBlockTypes.EmeraldOre, MinecraftBlockTypes.DeepslateEmeraldOre])
  .setAmounts([100, 1000, 5000, 10000, 25000, 100000, 250000, 500000, 1000000])
  .setScore("emeraldOre")
  .setRewardsCheck((player, quest) => {
    tierHandler(player, quest.questName, quest.amounts, getScore(player, quest.scoreName) as number);
  })
  .register();

new MiningQuest()
  .setName("Diamond Ore")
  .setDescription("Mine Diamond Ore To Earn Rewards")
  .setBlocks([MinecraftBlockTypes.DiamondOre, MinecraftBlockTypes.DeepslateDiamondOre])
  .setAmounts([100, 1000, 5000, 10000, 25000, 100000, 250000, 500000, 1000000])
  .setScore("diamondOre")
  .setRewardsCheck((player, quest) => {
    tierHandler(player, quest.questName, quest.amounts, getScore(player, quest.scoreName) as number);
  })
  .register();

new MiningQuest()
  .setName("Logs Quest")
  .setDescription("Mine Logs To Earn Rewards")
  .setBlocks([
    MinecraftBlockTypes.OakLog,
    MinecraftBlockTypes.BirchLog,
    MinecraftBlockTypes.AcaciaLog,
    MinecraftBlockTypes.CherryLog,
    MinecraftBlockTypes.JungleLog,
    MinecraftBlockTypes.SpruceLog,
    MinecraftBlockTypes.DarkOakLog,
    // MinecraftBlockTypes.PaleOakLog,
    MinecraftBlockTypes.MangroveLog,
  ])
  .setAmounts([100, 1000, 5000, 10000, 25000, 100000, 250000, 500000, 1000000])
  .setScore("logsMined")
  .setRewardsCheck((player, quest) => {
    tierHandler(player, quest.questName, quest.amounts, getScore(player, quest.scoreName) as number);
  })
  .register();

export { MiningQuest, MineQuestRegistry };
