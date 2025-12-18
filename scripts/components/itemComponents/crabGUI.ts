import { Player, StartupEvent } from "@minecraft/server";
import { ActionFormData } from "@minecraft/server-ui";
import { moneyTransfer } from "../../chatCommands/commands/moneyTransfer";
import { tpaMenu } from "../../chatCommands/commands/tpa";
import { clanMenu } from "../../clans/clanSetup";
import { homeMenu } from "../../guiPages/homeMenu";
import { marketplaceSelect } from "../../guiPages/marketSelectPage";
import { warpMenu } from "../../guiPages/warps";
import { playSoundTo } from "../../helperFunctions/sounds";
import { bountyMenu } from "../../bounties/bounty";
import { reportMenu } from "../../reportSystem/reportMenu";
import { discordKitForm } from "../../guiPages/discordKit";
import { battlepass } from "../../battlepass/battlepass";
import { settingsMenu } from "../../helperFunctions/settings";
import { showEnhancedLandMenu } from "../../landClaim/claim";


export function crabGUI(init: StartupEvent) {
  init.itemComponentRegistry.registerCustomComponent("crab:crabGUI", {
    onUse(use) {
      let player: Player = use.source;
      if (player.hasTag("combat")) {
        player.sendMessage("§cYou Cannot Use GUI In Combat!");
        player.playSound("beacon.deactivate");
        return;
      }
      player.runCommand("playsound random.pop @s ~~~ 5 0.3");
      let guiMenu = new ActionFormData()
        .title("§m§a§i§n§r§dNexus§fSMP")
        .button("§s§l§r§7Warps", "textures/ui/gui/warps")
        .button("§s§l§r§cHomes", "textures/ui/gui/homes")
        .button("§s§l§r§3Clan Menu", "textures/ui/gui/teams")
        .button("§s§l§r§eMarketplace", "textures/ui/gui/shop")
        .button("§s§l§r§aBounties", "textures/ui/gui/bounty")
        .button("§s§l§r§cReporting", "textures/ui/gui/report")
        .button("§s§l§r§bTeleport", "textures/ui/gui/teleport")
        .button("§s§l§r§6Cash Transfer", "textures/ui/gui/mtmenu")
        .button("§s§l§r§9Discord Kit", "textures/ui/gui/discord")
        .button("§s§l§r§7Battlepass", "textures/ui/gui/battlepass")
        .button("§s§l§r§fClaiming §8[§eBETA§8]", "textures/ui/gui/gamble")
        .button("§s§l§r§bSettings", "textures/ui/gui/info")

        .show(player as any)
        .then((res) => {
          let selection = res.selection;
          switch (selection) {

            case 0:
              playSoundTo(player, "RandomPop");
              warpMenu(player);
              break;


            case 1:
              playSoundTo(player, "RandomPop");
              homeMenu(player);
              break;


            case 2:
              playSoundTo(player, "RandomPop");
              clanMenu(player);
              break;


            case 3:
              playSoundTo(player, "RandomPop");
              marketplaceSelect(player);
              break;


            case 4:
              playSoundTo(player, "RandomPop");
              bountyMenu(player);
              break;


            case 5:
              playSoundTo(player, "RandomPop");
              reportMenu(player);
              break;


            case 6:
              playSoundTo(player, "RandomPop");
              tpaMenu(player);
              break;


            case 7:
              playSoundTo(player, "RandomPop");
              moneyTransfer(player);
              break;


            case 8:
              playSoundTo(player, "RandomPop");
              discordKitForm(player);
              break;


            case 9:
              playSoundTo(player, "RandomPop");
              battlepass(player);
              break;


            case 10:
              playSoundTo(player, "RandomPop");
              showEnhancedLandMenu(player);
              break;


            case 11:
              playSoundTo(player, "RandomPop");
              settingsMenu(player);
              break;
          }
        });
    },
  });
}
