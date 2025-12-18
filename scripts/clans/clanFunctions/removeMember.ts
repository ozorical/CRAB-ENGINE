import { Player, world } from "@minecraft/server";
import { ModalFormData, ModalFormResponse } from "@minecraft/server-ui";
import { getScore, setScore } from "../../helperFunctions/getScore";
import { clansDBNew, clansKicksDBNew } from "../clanSetup";
import { getClan } from "./getClan";
import { relay } from "../../protocol/protocol";

/**
 * Removes a member from the player's clan.
 * @param player - The player initiating the removal.
 */
export function removeMember(player: Player) {
  const clan = getClan(player);
  const clanID = getScore(player, "clanID");

  const clanPlayers = clan?.map((value) => value.member);

  const playerList = new ModalFormData()
    .title("§5Nexus§fSMP §8- §eRemove Member")
    .dropdown("Player", clanPlayers!, { defaultValueIndex: 0 })
    .show(player as any)
    .then((res: ModalFormResponse) => {
      if (res.canceled) {
        player.sendMessage("§cMember removal canceled.");
        return;
      }

      const selectedPlayerIndex = res.formValues![0] as number;
      const targetPlayerName = clanPlayers![selectedPlayerIndex];
      const targetPlayer = world.getPlayers({ name: targetPlayerName })[0];
      const playersClanData = clan?.find((data) => data.member === player.name);
      const targetClanData = clan?.find((data) => data.member === targetPlayerName);
      const afterRemoveClan = clan?.filter((data) => data.member !== targetPlayerName);

      if ((targetClanData?.permission === "admin" || targetClanData?.permission === "owner") && playersClanData?.permission !== "owner") {
        player.sendMessage("§cYou do not have permission to kick players of this permission level.");
        return;
      }

      if (playersClanData?.permission === "member" || playersClanData?.permission === "inviter") {
        player.sendMessage("§cYou do not have permission to kick players.");
        return;
      }

      if (!targetPlayer) {
        let kickPlayersList: Array<string> = clansKicksDBNew.get("kicks") || [];
        kickPlayersList.push(targetPlayerName);
        clansKicksDBNew.set("kicks", kickPlayersList);
      } else {
        setScore(targetPlayer, "clanID", 0);
        targetPlayer.sendMessage("§cYou were kicked from your clan.");
      }

      clansDBNew.set(`clan:${clanID}`, afterRemoveClan);
      world.sendMessage(`§e${player.name} §ckicked §e${targetPlayerName}§c from their clan.`);
      relay(`[Clans] ${player.name} kicked ${targetPlayerName} from their clan`);
    });
}

/**
 * Handles kicking players who were offline when they were removed from their clan.
 * @param player - The player who was kicked while offline.
 */
export function poorGuyGotKickedOutOfHisClanWhenHeWasOffline(player: Player) {
  const kickList: Array<string> = clansKicksDBNew.get("kicks") || [];
  const playerFiltered = kickList.filter((name) => name === player.name);

  if (playerFiltered.length > 0) {
    setScore(player, "clanID", 0);
    player.sendMessage("§cYou were kicked from your clan.");

    const newKickList = kickList.filter((name) => name !== player.name);
    clansKicksDBNew.set("kicks", newKickList);
  }
}
