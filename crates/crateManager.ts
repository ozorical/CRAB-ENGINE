import { Player, system } from "@minecraft/server";
import { commonCrate } from "./commonCrate";
import { mythicCrate } from "./mythicCrate";
import { rareCrate } from "./rareCrate";

system.afterEvents.scriptEventReceive.subscribe((script) => {
  const { sourceEntity, id } = script;
  if (id == "crate:basic") {
    commonCrate(sourceEntity as Player);
  }
  if (id == "crate:rare") {
    rareCrate(sourceEntity as Player);
  }
  if (id == "crate:super") {
    mythicCrate(sourceEntity as Player);
  }
});
