import { Player, system, world } from "@minecraft/server";
import { ActionFormData, FormCancelationReason } from "@minecraft/server-ui";
import { clanAdd, inviteAccept } from "./clanFunctions/addMember.js";
import { createClan } from "./clanFunctions/clanCreate.js";
import { removeMember } from "./clanFunctions/removeMember.js";

import { Database } from "../db/Database.js";
import { getScore, setScore } from "../helperFunctions/getScore.js";
import { clanBankMenu } from "./clanFunctions/clanBank.js";
import { editMemberPermission } from "./clanFunctions/clanPerms.js";
import { getClan } from "./clanFunctions/getClan.js";
import { playSoundTo } from "../helperFunctions/sounds.js";

let clansDBNew: Database<any>, clansKicksDBNew: Database<any>, clanBanksDB: Database<number>;

export const clansDBInit = async () => {
  await null;
  clansDBNew = new Database<any>("clans");
  clansKicksDBNew = new Database<any>("clans_kicks");
  clanBanksDB = new Database<number>("banks");
  
  if (getScore("clan", "clanID") === undefined) {
    setScore("clan", "clanID", 1);
  }
};

export function clanMenu(player: Player, isChat?: boolean, i?: number) {
  if (isChat) {
    i = 0;
  }

  const clan = getClan(player);
  const clanList = clan?.map((member) => `§a${member.member} §f- §e${member.permission}`).join("\n");

  const clanGUI = new ActionFormData()
    .title("§cCrab§fSMP §8- §eClans§r")
    .body(`§l§bYour Clan Members§r\n${clanList || "§cYou are not in a clan."}\n\n` + `§7Manage your clan, invite players, and more!`)
    .button("§l§aCreate Clan\n§r§8[ §fCreate a team §8]", "textures/gui/claims/create")
    .button("§l§bAccept Clan Invite\n§r§8[ §fJoin a team §8]", "textures/gui/claims/joinClaim")
    .button("§l§6Invite Player\n§r§8[ §fInvite someone §8]", "textures/gui/claims/invite")
    .button("§l§eClan Bank\n§r§8[ §fManage clan money §8]", "textures/gui/claims/bank")
    .button("§l§7Manage Players\n§r§8[ §fManage clan users §8]", "textures/gui/claims/stats")
    .button("§l§5Kick Player\n§r§8[ §fKick a player §8]", "textures/gui/claims/kickClaim")
    .button("§l§cLeave Clan\n§r§8[ §fLeave your clan §8]", "textures/gui/claims/leave")
    .button("§l§4Close Menu\n§r§8[ §fExit the GUI §8]", "textures/blocks/barrier")
    .show(player as any)
    .then((res) => {
      if (res.canceled && res.cancelationReason == FormCancelationReason.UserBusy && i != undefined) {
        system.runTimeout(() => {
          if (i! < 5) {
            player.sendMessage(`§3Close Chat Within §e${5 - i!} §3Seconds To Open Menu`);
            i!++;
            clanMenu(player, false, i);
          }
        }, 20);
        return;
      }

      switch (res.selection) {
        case 0:
          playSoundTo(player, "RandomPop");
          createClan(player);
          break;
        case 1:
          playSoundTo(player, "RandomPop");
          inviteAccept(player);
          break;
        case 2:
          playSoundTo(player, "RandomPop");
          clanAdd(player);
          break;
        case 3:
          playSoundTo(player, "RandomPop");
          clanBankMenu(player);
          break;
        case 4:
          playSoundTo(player, "RandomPop");
          editMemberPermission(player);
          break;
        case 5:
          playSoundTo(player, "RandomPop");
          removeMember(player);
          break;
        case 6:
          playSoundTo(player, "RandomPop");
          handleLeaveClan(player);
          break;
        case 7:
          player.sendMessage("§cClosed Clan Menu");
          break;
      }
    });
}

function handleLeaveClan(player: Player) {
  const clanID = getScore(player, "clanID");
  
  if (!clanID || clanID === 0) {
    player.sendMessage("§cYou are not in a clan!");
    return;
  }

  const clan = getClan(player);
  
  if (clan) {
    const afterRemoveClan = clan.filter((data) => data.member !== player.name);
    
    if (afterRemoveClan.length === 0) {
      clansDBNew.delete(`clan:${clanID}`);
      clanBanksDB.delete(`clan:${clanID}`);
    } else {
      clansDBNew.set(`clan:${clanID}`, afterRemoveClan);
    }
    
    world.sendMessage(`§a${player.name} §bLeft Their Clan`);
    setScore(player, "clanID", 0);
  } else {
    setScore(player, "clanID", 0);
    player.sendMessage("§cYour clan data was corrupted but you've been removed.");
  }
}

export { clanBanksDB, clansDBNew, clansKicksDBNew };