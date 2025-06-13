import { Entity, EntityComponentTypes, Player, world } from "@minecraft/server";
import { getScore, removeScore, setScore } from "../helperFunctions/getScore";
import { playSoundTo } from "../helperFunctions/sounds";

world.afterEvents.entityHurt.subscribe((hurt) => {
  const { damageSource, hurtEntity } = hurt;

  if (hurtEntity.typeId != "minecraft:player") return;

  let attacker: Entity | undefined;
  if (damageSource.damagingProjectile?.getComponent(EntityComponentTypes.Projectile)?.owner?.typeId == "minecraft:player") {
    attacker = damageSource.damagingProjectile.getComponent(EntityComponentTypes.Projectile)?.owner!;
  } else if (damageSource.damagingEntity?.typeId == "minecraft:player") {
    attacker = damageSource.damagingEntity;
  }

  if (attacker == undefined) {
    return;
  }

  setScore(attacker, "clog", 15);
  setScore(hurtEntity, "clog", 15);

  let hurtPlayer = hurtEntity as Player;
  let attackerPlayer = attacker as Player;

  if (!hurtPlayer.hasTag("combat")) {
    hurtPlayer.sendMessage("§cYou Are In Combat: You Cannot Leave For The Next 15 Seconds Or You Will Be Cleared");
  }
  if (!attackerPlayer.hasTag("combat")) {
    attackerPlayer.sendMessage("§cYou Are In Combat: You Cannot Leave For The Next 15 Seconds Or You Will Be Cleared");
  }
  hurtPlayer.addTag("combat");
  attackerPlayer.addTag("combat");
});

export function combatStatusCheck() {
  let players = world.getPlayers({ tags: ["combat"] });
  
  players.forEach((player) => {
    if (getScore(player, "clog")! > 0) {
      if (getScore(player, "clog") == 1 && player.hasTag("combat")) {
        player.sendMessage("§aYou Are No Longer In Combat");
        player.removeTag("combat");
        playSoundTo(player, "Chime");
      }
      removeScore(player, "clog", 1);
    }
  });
}
