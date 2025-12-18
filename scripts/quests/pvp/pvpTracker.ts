import { EntityHurtAfterEvent, Player, EntityDieAfterEvent } from "@minecraft/server";
import { MinecraftEntityTypes } from "@minecraft/vanilla-data";
import { getScore, addScore } from "../../helperFunctions/getScore";
import { pvpRegister } from "./pvpQuests";

export function pvpDamageTracker(e: EntityHurtAfterEvent) {
  const { damage, damageSource, hurtEntity } = e;
  if (hurtEntity.typeId == MinecraftEntityTypes.Player && damageSource.damagingEntity?.typeId == MinecraftEntityTypes.Player) {
    const player = damageSource.damagingEntity as Player;
    if ((getScore(player, "playerDamage") ?? 0) > 2000000000) return;
    addScore(player, "playerDamage", damage);

    Object.entries(pvpRegister).forEach((pvp) => {
      if (player.getDynamicProperty(pvp[1].questName) === undefined) {
        player.setDynamicProperty(pvp[1].questName, 0);
      }
      pvp[1].rewardsAction(player, pvp[1]);
    });
  }
}

export function pvpKillTracker(e: EntityDieAfterEvent) {
  if (e.deadEntity.typeId === MinecraftEntityTypes.Player && e.damageSource.damagingEntity?.typeId === MinecraftEntityTypes.Player) {
    const player = e.damageSource.damagingEntity as Player;

    if ((getScore(player, "playerKills") ?? 0) > 2000000000) return;
    addScore(player, "playerKills", 1);
    Object.entries(pvpRegister).forEach((pvp) => {
      addScore(player, pvp[1].scoreName, 1);
      if (player.getDynamicProperty(pvp[1].questName) === undefined) {
        player.setDynamicProperty(pvp[1].questName, 0);
      }
      pvp[1].rewardsAction(player, pvp[1]);
    });
  }
}