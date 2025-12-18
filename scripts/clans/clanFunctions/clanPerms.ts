import { Player, world } from "@minecraft/server";
import { ModalFormData, ModalFormResponse } from "@minecraft/server-ui";
import { getScore } from "../../helperFunctions/getScore";
import { clanData } from "../../types";
import { clansDBNew } from "../clanSetup";
import { getClan } from "./getClan";
import { relay } from "../../protocol/protocol";

const permLvls = ["Member", "Inviter", "Admin"];

/**
 * Allows a player to edit the permission level of another clan member.
 * @param player - The player editing the permissions.
 */
export function editMemberPermission(player: Player) {
  const clan = getClan(player);
  const clanID = getScore(player, "clanID");

  const clanPlayers = clan?.map((value) => value.member);

  const playerList = new ModalFormData()
    .title("§5Nexus§fSMP §8- §eEdit Permissions")
    .dropdown("Player", clanPlayers!, { defaultValueIndex: 0 })
    .dropdown("New Permission Level", permLvls, { defaultValueIndex: 0 })
    .show(player as any)
    .then((res: ModalFormResponse) => {
      if (res.canceled) {
        player.sendMessage("§cPermission editing canceled.");
        return;
      }

      const [selectedPlayerIndex, selectedPermIndex] = res.formValues as [number, number];
      const targetPlayerName = clanPlayers![selectedPlayerIndex];
      const newPermLevel = permLvls[selectedPermIndex].toLowerCase();

      const targetPlayer = world.getPlayers({ name: targetPlayerName })[0];
      const playersClanData = clan?.find((data) => data.member === player.name);
      const targetClanDataIndex = clan?.findIndex((data) => data.member === targetPlayerName);
      const targetClanData = clan?.find((data) => data.member === targetPlayerName);

      if (targetClanData?.permission === "owner") {
        player.sendMessage("§cOwner's permission level cannot be changed.");
        return;
      }

      if ((targetClanData?.permission === "admin" || targetClanData?.permission === "owner") && playersClanData?.permission !== "owner") {
        player.sendMessage("§cYou do not have permission to edit players of this permission level.");
        return;
      }

      if (playersClanData?.permission === "member" || playersClanData?.permission === "inviter") {
        player.sendMessage("§cYou do not have permission to edit player permissions.");
        return;
      }

      if (targetClanDataIndex === undefined) {
        player.sendMessage("§cThere was an error. Please try again.");
        return;
      }

      const updatedClanData: Array<clanData> = [...clan!];
      updatedClanData[targetClanDataIndex].permission = newPermLevel;

      clansDBNew.set(`clan:${clanID}`, updatedClanData);

      player.sendMessage(`§aYou updated §b${targetPlayerName}'s§a permission level to §e${newPermLevel}§a.`);
      relay(`[Clans] ${player.name} updated ${targetPlayerName} permission level to ${newPermLevel}`);
      if (targetPlayer) {
        targetPlayer.sendMessage(`§aYour permission level has been updated to §e${newPermLevel}§a.`);
      }
    });
}
