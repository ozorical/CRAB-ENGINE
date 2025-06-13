import { MinecraftEntityTypes } from "@minecraft/vanilla-data";
import { Quest } from "../questMain";
import { getScore } from "../../helperFunctions/getScore";
import { tierHandler } from "../questFunctions";
import { Player } from "@minecraft/server";

const PveRegister: Record<string, PveQuest> = {};

class PveQuest extends Quest {
  public mobList: Array<string>;

  public setMobs(mobs: Array<string>) {
    this.mobList = mobs;
    return this;
  }

  public register() {
    PveRegister[this.questName.toLowerCase().replaceAll(" ", "_")] = this;
  }
}

new PveQuest()
  .setName("Undead Quest")
  .setDescription("Kill Undead Mobs To Progress The Quest")
  .setAmounts([100, 500, 1000, 5000, 15000, 25000, 75000, 150000, 500000])
  .setScore("undeadMobsKilled")
  .setMobs([MinecraftEntityTypes.Zombie, MinecraftEntityTypes.Husk, MinecraftEntityTypes.ZombieVillager, MinecraftEntityTypes.ZombiePigman, MinecraftEntityTypes.Drowned, MinecraftEntityTypes.Skeleton, MinecraftEntityTypes.Stray])
  .setRewardsCheck((player, quest) => {})
  .register();

new PveQuest()
  .setName("Villagers Enemies Quest")
  .setDescription("Kill The Villagers Enemies To Progress The Quest")
  .setAmounts([50, 100, 300, 600, 1000, 2000, 3000, 5000, 10000])
  .setScore("villagersEnemiesKilled")
  .setMobs([MinecraftEntityTypes.EvocationIllager, MinecraftEntityTypes.Vex, MinecraftEntityTypes.Witch, MinecraftEntityTypes.Pillager, MinecraftEntityTypes.Vindicator, MinecraftEntityTypes.Ravager])
  .setRewardsCheck((player, quest) => {})
  .register();

new PveQuest()
  .setName("Passive Mobs Quest")
  .setDescription("Kill Passive Mobs To Progress The Quest")
  .setAmounts([100, 500, 1000, 5000, 15000, 25000, 75000, 150000, 500000])
  .setScore("passiveMobsKilled")
  .setMobs([
    MinecraftEntityTypes.Cow,
    MinecraftEntityTypes.Turtle,
    MinecraftEntityTypes.Axolotl,
    MinecraftEntityTypes.Chicken,
    MinecraftEntityTypes.Pig,
    MinecraftEntityTypes.Sheep,
    MinecraftEntityTypes.Rabbit,
    MinecraftEntityTypes.Mooshroom,
    MinecraftEntityTypes.Sniffer,
    MinecraftEntityTypes.Squid,
    MinecraftEntityTypes.GlowSquid,
  ])
  .setRewardsCheck((player, quest) => {})
  .register();

new PveQuest()
  .setName("Psychopath Quest")
  .setDescription("Kill Villagers To Progress The Quest")
  .setAmounts([50, 100, 300, 600, 1000, 2000, 3000, 5000, 10000])
  .setScore("villagersKilled")
  .setMobs([MinecraftEntityTypes.Villager, MinecraftEntityTypes.VillagerV2])
  .setRewardsCheck((player, quest) => {
    tierHandler(player, quest.questName, quest.amounts, getScore(player, quest.scoreName)!);
  })
  .register();

new PveQuest()
  .setName("Nether Mobs Quest")
  .setDescription("Kill Nether Mobs Progress The Quest")
  .setAmounts([100, 500, 1000, 5000, 15000, 25000, 75000, 150000, 500000])
  .setScore("netherMobsKilled")
  .setMobs([MinecraftEntityTypes.Blaze, MinecraftEntityTypes.WitherSkeleton, MinecraftEntityTypes.Ghast, MinecraftEntityTypes.Hoglin, MinecraftEntityTypes.MagmaCube, MinecraftEntityTypes.Piglin, MinecraftEntityTypes.PiglinBrute])
  .setRewardsCheck((player, quest) => {
    tierHandler(player, quest.questName, quest.amounts, getScore(player, quest.scoreName)!);
  })
  .register();

export { PveRegister, PveQuest };
