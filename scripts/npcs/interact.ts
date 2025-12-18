import { world } from "@minecraft/server";
import { battlepass } from "../battlepass/battlepass";
import { infoMenu } from "../guiPages/infoMenu";
import { marketplaceSelect } from "../guiPages/marketSelectPage";
import { discordKitForm,  } from "../guiPages/discordKit";
import { freePlayForm } from "../guiPages/warps";
import { bountyMenu } from "../bounties/bounty"
import { reportMenu } from "../reportSystem/reportMenu"
import { donoMenu } from "../guiPages/donator";

world.afterEvents.playerInteractWithEntity.subscribe((interact) => {
  const { player, target } = interact;

  switch (target.typeId) {
    case "npc:battlepass":
      battlepass(player);
      break;

    case "npc:discordkit":
      discordKitForm(player);
      break;

    case "npc:freeplay":
      freePlayForm(player);
      break;

    case "npc:help":
      infoMenu(player);
      break;

    case "npc:marketplace":
      marketplaceSelect(player);
      break;

    case "npc:bounty":
      bountyMenu(player);
      break;

    case "npc:report":
      reportMenu(player);
      break;
    
      case "npc:donator":
        donoMenu(player);
        break;

  }
});
