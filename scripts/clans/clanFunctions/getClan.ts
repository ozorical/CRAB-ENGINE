import { Player } from "@minecraft/server";
import { getScore } from "../../helperFunctions/getScore";
import { clanData } from "../../types";
import { clansDBNew } from "../clanSetup";

/**
 * Retrieves the clan data for the player.
 * @param player - The player whose clan data is being retrieved.
 * @returns The clan data as an array of `clanData` objects, or `undefined` if the player is not in a clan.
 */
export function getClan(player: Player): Array<clanData> | undefined {
  const clanID = getScore(player, "clanID");

  if (clanID === 0) {
    return undefined;
  }

  const clan = clansDBNew.get(`clan:${clanID}`) as Array<clanData>;
  return clan;
}