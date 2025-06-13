import { Player, world, ItemStack } from "@minecraft/server";
import { ActionFormData, ModalFormData, FormCancelationReason } from "@minecraft/server-ui";
import { addScore, getScore } from "../helperFunctions/getScore";
import { getRandomInt } from "../helperFunctions/randomInt";
import { miningProgressPage } from "../quests/mining/miningGuiPageGenerator";
import { pvpProgressPage } from "../quests/pvp/pvpGUIPageGenerator";

interface Reward {
  description: string;
  claim: (player: Player) => void;
}

export function battlepass(player: Player): void {
  new ActionFormData()
    .title("§cCrab§fSMP §8- §eBattle Pass")
    .body("§bClaim rewards as you complete achievements!\n\n§7Standard pass is completely free, but if you want more rewards, Play for more than 24 hours or buy is straight from the Dono menu.\n\n")
    .button("§l§pStandard Pass\n§r§8[ §fFree rewards! §8]", "textures/items/iron_ingot")
    .button("§l§aExclusive Pass\n§r§8[ §fMore rewards! §8]", "textures/items/emerald")
    .button("§l§eQuests\n§r§8[ §fGain XP §8]", "textures/blocks/bookshelf")
    .show(player as any)
    .then((res) => {
      if (res.canceled && res.cancelationReason === FormCancelationReason.UserBusy) {
        return battlepass(player);
      }

      if (res.canceled) return;

      const type = res.selection;
      if (type === 1 && !player.hasTag("ebattlepass")) {
        return player.sendMessage("§cYou must play for over 24 Hours to access the Exclusive pass!");
      }
      if (type === 2) {
        return openQuestsMenu(player);
      }

      openBattlePass(player, Number(type));
    });
}

function openQuestsMenu(player: Player): void {
  new ActionFormData()
    .title("§cCrab§fSMP §8- §eQuests")
    .body("§bChoose a quest category to view your progress and rewards!\n\n")
    .button("§l§6Mining Progress\n§r§8[ §fEarn XP §8]", "textures/items/diamond_pickaxe")
    .button("§l§cPvP Progress\n§r§8[ §fEarn XP §8]", "textures/items/diamond_sword")
    .show(player as any)
    .then((res) => {
      if (res.canceled) return;

      const selection = res.selection;
      if (selection === 0) {
        return miningProgressPage(player);
      } else if (selection === 1) {
        return pvpProgressPage(player);
      }
    });
}

function openBattlePass(player: Player, type: number): void {
  const claimedTier = getScore(player, type === 0 ? "standardpass" : "exclusivepass") ?? 0;
  const currentTier = getScore(player, "level") ?? 0;
  const playerXP = getScore(player, "xp") ?? 0;

  const xpRequired = 250;
  if (playerXP >= xpRequired && currentTier < 25) {
    addScore(player, "level", 1);
    addScore(player, "xp", -xpRequired);
  }

  const rewardArray = type === 0 ? getStandardRewards() : getExclusiveRewards();

  const displayRewards = rewardArray.map((reward, i) => {
    const status = i < claimedTier ? "§aClaimed" : i >= claimedTier && i < currentTier ? "§6Pending" : "§cLocked";
    return `§7[§s${i + 1}§7]: §b${reward.description} §7| ${status}`;
  });

  new ModalFormData()
    .title("§f" + (type === 0 ? "§eStandard Pass" : "§eExclusive Pass"))
    .dropdown(
      `§bYou may only claim rewards that are pending if you have claimed all previous rewards.\n\n` + `§fCurrent Tier: §a${claimedTier}\n§fNext Tier: §a${claimedTier < 25 ? claimedTier + 1 : "25"}` + `/25\nXP: ${playerXP}/${xpRequired}\n\n`,
      displayRewards,
      { defaultValueIndex: Math.min(claimedTier, displayRewards.length - 1) }
    )
    .show(player as any)
    .then((res) => {
      if (res.canceled) return;

      const selection = res.formValues?.[0] as number;
      if (selection < claimedTier) {
        return player.sendMessage("§cYou already claimed that.");
      }
      if (selection >= currentTier) {
        return player.sendMessage("§cThat tier is locked.");
      }
      if (selection !== claimedTier) {
        return player.sendMessage("§cYou must claim all your previous rewards first.");
      }

      const reward = rewardArray[selection];
      if (!reward) {
        return player.sendMessage("§cSeems there is nothing to claim...");
      }

      reward.claim(player);

      player.sendMessage(`§aSuccessfully claimed: ${reward.description}.`);
      addScore(player, type === 0 ? "standardpass" : "exclusivepass", 1);

      openBattlePass(player, type);
    });

  function getStandardRewards(): Reward[] {
    return [
      { description: "$100", claim: (player) => givemoney(player, 100, "money") },
      { description: "Iron Sword", claim: (player) => giveItem(player, new ItemStack(`iron_sword`, 1)) },
      { description: "5x Bread", claim: (player) => giveItem(player, new ItemStack(`bread`, 5)) },
      { description: "$500", claim: (player) => givemoney(player, 500, "money") },
      { description: "Leather Chestplate", claim: (player) => giveItem(player, new ItemStack(`leather_chestplate`, 1)) },
      { description: "8x Arrows", claim: (player) => giveItem(player, new ItemStack(`arrow`, 8)) },
      { description: "Wooden Shield", claim: (player) => giveItem(player, new ItemStack(`shield`, 1)) },
      { description: "$1,000", claim: (player) => givemoney(player, 1000, "money") },
      { description: "Stone Pickaxe", claim: (player) => giveItem(player, new ItemStack(`stone_pickaxe`, 1)) },
      { description: "5x XP Bottles", claim: (player) => giveItem(player, new ItemStack(`experience_bottle`, 5)) },
      { description: "$2,500", claim: (player) => givemoney(player, 2500, "money") },
      { description: "Iron Pickaxe", claim: (player) => giveItem(player, new ItemStack(`iron_pickaxe`, 1)) },
      { description: "3x Golden Apples", claim: (player) => giveItem(player, new ItemStack(`golden_apple`, 3)) },
      { description: "$5,000", claim: (player) => givemoney(player, 5000, "money") },
      { description: "Chainmail Chestplate", claim: (player) => giveItem(player, new ItemStack(`chainmail_chestplate`, 1)) },
      { description: "$10,000", claim: (player) => givemoney(player, 10000, "money") },
      { description: "Bow", claim: (player) => giveItem(player, new ItemStack(`bow`, 1)) },
      { description: "16x Fireworks", claim: (player) => giveItem(player, new ItemStack(`firework_rocket`, 16)) },
      { description: "$25,000", claim: (player) => givemoney(player, 25000, "money") },
      { description: "Enchanted Fishing Rod", claim: (player) => giveItem(player, new ItemStack(`fishing_rod`, 1)) },
      { description: "$50,000", claim: (player) => givemoney(player, 50000, "money") },
      { description: "Diamond Sword", claim: (player) => giveItem(player, new ItemStack(`diamond_sword`, 1)) },
      { description: "$75,000", claim: (player) => givemoney(player, 75000, "money") },
      {
        description: "Full Iron Armor Set",
        claim: (player) => {
          giveItem(player, new ItemStack(`iron_helmet`, 1));
          giveItem(player, new ItemStack(`iron_chestplate`, 1));
          giveItem(player, new ItemStack(`iron_leggings`, 1));
          giveItem(player, new ItemStack(`iron_boots`, 1));
        },
      },
      { description: "$100,000", claim: (player) => givemoney(player, 100000, "money") },
    ];
  }

  function getExclusiveRewards(): Reward[] {
    return [
      { description: "$100", claim: (player) => givemoney(player, 100, "money") },
      { description: "Elytra", claim: (player) => giveItem(player, new ItemStack(`minecraft:elytra`, 1)) },
      { description: "$500", claim: (player) => givemoney(player, 500, "money") },
      { description: "Dragon Egg", claim: (player) => giveItem(player, new ItemStack(`dragon_egg`, 1)) },
      { description: "$1,000", claim: (player) => givemoney(player, 1000, "money") },
      { description: "Netherite Sword", claim: (player) => giveItem(player, new ItemStack(`netherite_sword`, 1)) },
      { description: "$2,500", claim: (player) => givemoney(player, 2500, "money") },
      { description: "Stack of Netherite Ingots", claim: (player) => giveItem(player, new ItemStack(`netherite_ingot`, 64)) },
      { description: "$5,000", claim: (player) => givemoney(player, 5000, "money") },
      {
        description: "Full Netherite Armor Set",
        claim: (player) => {
          giveItem(player, new ItemStack(`netherite_helmet`, 1));
          giveItem(player, new ItemStack(`netherite_chestplate`, 1));
          giveItem(player, new ItemStack(`netherite_leggings`, 1));
          giveItem(player, new ItemStack(`netherite_boots`, 1));
        },
      },
      { description: "$7,500", claim: (player) => givemoney(player, 7500, "money") },
      { description: "$10,000", claim: (player) => givemoney(player, 10000, "money") },
      { description: "64x Golden Apples", claim: (player) => giveItem(player, new ItemStack(`golden_apple`, 64)) },
      { description: "Beacon", claim: (player) => giveItem(player, new ItemStack(`beacon`, 1)) },
      { description: "64x Fireworks", claim: (player) => giveItem(player, new ItemStack(`firework_rocket`, 64)) },
      { description: "$25,000", claim: (player) => givemoney(player, 25000, "money") },
      { description: "64x Blaze Rods", claim: (player) => giveItem(player, new ItemStack(`blaze_rod`, 64)) },
      { description: "$30,000", claim: (player) => givemoney(player, 30000, "money") },
      { description: "Shulker Box", claim: (player) => giveItem(player, new ItemStack(`shulker_box`, 1)) },
      { description: "64x Wither Skeleton Skulls", claim: (player) => giveItem(player, new ItemStack(`wither_skeleton_skull`, 64)) },
      { description: "$50,000", claim: (player) => givemoney(player, 50000, "money") },
      { description: "Trident", claim: (player) => giveItem(player, new ItemStack(`trident`, 1)) },
      { description: "$75,000", claim: (player) => givemoney(player, 75000, "money") },
      { description: "32x TNT", claim: (player) => giveItem(player, new ItemStack(`tnt`, 32)) },
      { description: "$100,000", claim: (player) => givemoney(player, 100000, "money") },
    ];
  }

  function givemoney(player: Player, amount: number, type: string): void {
    addScore(player, "money", amount);
  }

  function givexp(player: Player, amount: number): void {
    let totalXp = getRandomInt(1, 10);
    player.sendMessage(`§aYou gained ${amount} XP! You are now at ${Number(amount + totalXp)} XP.`);
  }

  function giveItem(player: Player, itemStack: ItemStack): void {
    if (player.getComponent("inventory")) {
      const remainingItems = player.getComponent("inventory")?.container?.addItem(itemStack);

      if (remainingItems && remainingItems.amount > 0) {

        player.dimension.spawnItem(remainingItems, player.location);
        player.sendMessage(`§eYour inventory was full, so some items were dropped on the ground.`);
      }
    } else {
      console.error("Inventory component not found on the player.");
    }
  }
}
