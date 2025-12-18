import { world } from "@minecraft/server";
import { addScore } from "../helperFunctions/getScore";

world.afterEvents.entityDie.subscribe((death) => {
  const { damageSource, deadEntity } = death;
  if (deadEntity.typeId == "minecraft:player") {
    addScore(deadEntity, "deaths", 1);
    if (damageSource.damagingEntity?.typeId == "minecraft:player") {
      addScore(damageSource.damagingEntity, "kills", 1);
    }
  }
});
