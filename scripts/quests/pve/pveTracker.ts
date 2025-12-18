import { EntityDieAfterEvent, Player, world } from "@minecraft/server";
import { MinecraftDimensionTypes, MinecraftEntityTypes } from "@minecraft/vanilla-data";
import { getScore, addScore } from "../../helperFunctions/getScore";
import { PveRegister } from "./pveQuests";

export function pveTracker(e: EntityDieAfterEvent) {
    if (e.damageSource.damagingEntity?.typeId === MinecraftEntityTypes.Player) {
        const player = e.damageSource.damagingEntity as Player;
        Object.entries(PveRegister).forEach((mob) => {
            if (mob[1].mobList.includes(e.deadEntity.typeId)) {
                if ((getScore(player, mob[1].scoreName) ?? 0) > 2000000000) return;

                addScore(player, mob[1].scoreName, 1);
                if (player.getDynamicProperty(mob[1].questName) === undefined) {
                    player.setDynamicProperty(mob[1].questName, 0);
                }
                mob[1].rewardsAction(player, mob[1]);
            }
        });
    } else {
        const dimension = e.deadEntity.dimension;
        const player = dimension.getPlayers({
            location: e.deadEntity.location,
            closest: 1,
            maxDistance: 30
        });

        if (player.length === 0) return;
        Object.entries(PveRegister).forEach((mob) => {
            if (mob[1].mobList.includes(e.deadEntity.typeId)) {
                if ((getScore(player[0], mob[1].scoreName) ?? 0) > 2000000000) return;

                addScore(player[0], mob[1].scoreName, 1);
                if (player[0].getDynamicProperty(mob[1].questName) === undefined) {
                    player[0].setDynamicProperty(mob[1].questName, 0);
                }
                mob[1].rewardsAction(player[0], mob[1]);
            }
        });
    }
}