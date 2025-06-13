import { world, Player, system } from "@minecraft/server";
import { ActionFormData, FormCancelationReason } from "@minecraft/server-ui";
import { sellPage } from "./sellPage";
import { playSoundTo } from "../helperFunctions/sounds";
import { auctionHouseMenu } from "../auctionHouse";
import { donoMarketMenu } from "./donomarket";

export function marketplaceSelect(player: Player, isChat?: boolean, i?: number) {
  let marketplaceForm = new ActionFormData()
    .title("§cCrab§fSMP §8- §eMarketplace")
    .body(
      "§6PLEASE READ: §7Transactions for the 'Dono Market' are handled strictly through the Discord server. If you wish to purchase items, please visit the #donation-market channel on our Discord server! §9discord.gg/crabsmp"
    )
    .button("§l§aSell Items§r\n§8[ §fEarn Money §8]", "textures/gui/menu/sell_items")
    .button("§l§eWarp To Shop§r\n§8[ §fBuy goodies §8]", "textures/gui/menu/market")
    .button("§l§bAuctions§r\n§8[ §fConfig Auctions §8]", "textures/items/diamond")
    .button("§l§5Dono Market§r\n§8[ §fPurchase bundles §8]", "textures/blocks/amethyst_cluster")
    .button("§l§4Close Menu§r\n§8[ §fExit the GUI §8]", "textures/blocks/barrier")
    .show(player as any)
    .then((res) => {
      if (res.canceled && res.cancelationReason == FormCancelationReason.UserBusy) return marketplaceSelect(player);
      if (res.selection == 0) {
        playSoundTo(player, "RandomPop");
        sellPage(player);
      }
      if (res.selection == 1) {
        playSoundTo(player, "RandomPop");
        player.teleport({ x: 19912, y: 130, z: 19488 }, { dimension: world.getDimension("minecraft:overworld") });
      }
      if (res.selection == 2) {
        playSoundTo(player, "RandomPop");
        auctionHouseMenu(player);
      }
      if (res.selection == 3) {
        playSoundTo(player, "RandomPop");
        donoMarketMenu(player);
      }
    });
}
