import { EntityDieAfterEvent, Player, world } from "@minecraft/server";
import { bountyDB } from "./bounty";
import { addScore } from "../helperFunctions/getScore";
import { reportsDB } from "../reportSystem/reportMenu";

const SOUNDS = {
  Success: "random.levelup",
  Error: "note.bit",
};


export function bountyClaim(death: EntityDieAfterEvent) {
  const { deadEntity, damageSource } = death;

  if (deadEntity.typeId == "minecraft:player" && damageSource.damagingEntity?.typeId == "minecraft:player") {
    const dbEntry = bountyDB.get((deadEntity as Player).name);

    if (dbEntry) {
      const isExpired = dbEntry.expiresAt ? dbEntry.expiresAt <= Date.now() : false;

      if (isExpired) {
        world.sendMessage(`§cThe bounty on §e${(deadEntity as Player).name} §chas expired.`);
        bountyDB.delete((deadEntity as Player).name);
        return;
      }

      if (dbEntry.date < Date.now() - 2 * 24 * 60 * 60 * 1000) {
        reportsDB.delete(`${dbEntry.name}`);
        return;
      }

      addScore(damageSource.damagingEntity, "money", dbEntry.amount);
      bountyDB.delete((deadEntity as Player).name);
      world.sendMessage(`§e${(damageSource.damagingEntity as Player).name} §7Claimed The Bounty Of §a${dbEntry.amount} §7From §a${(deadEntity as Player).name}`);
      (damageSource.damagingEntity as Player).playSound(SOUNDS.Success); // Play success sound
    }
  }
}
