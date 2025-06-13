import { world, Player, EntityComponentTypes } from "@minecraft/server";

const STAFF_HIERARCHY: string[] = [
    "member", 
    "helper",     
    "staff",  
    "admin",    
    "dev",       
    "ceo",    
    "donator",  
    "donatorplus", 
    "crab",      
    "crabplus"  
];


function updatePlayerRank(player: Player) {
    const tags = player.getTags();
    let highestRank: string | null = null;

    for (const tag of tags) {
        if (tag.startsWith("rank:")) {
            const rank = tag.replace("rank:", "");
            if (STAFF_HIERARCHY.includes(rank)) {
                if (!highestRank || STAFF_HIERARCHY.indexOf(rank) > STAFF_HIERARCHY.indexOf(highestRank)) {
                    highestRank = rank;
                }
            }
        }
    }


    if (highestRank) {
        const highestRankIndex = STAFF_HIERARCHY.indexOf(highestRank);
        for (const tag of tags) {
            if (tag.startsWith("rank:")) {
                const rank = tag.replace("rank:", "");
                if (STAFF_HIERARCHY.includes(rank) && STAFF_HIERARCHY.indexOf(rank) < highestRankIndex) {
                    player.removeTag(tag);
                }
            }
        }
    }
}

function getChatRanks(player: Player) {
    let tags = player.getTags();
    let rankList: Array<string> = [];
  
    for (let tag of tags) {
        if (tag.includes("rank:")) {
            let rank = tag.replace("rank:", "");

            switch (rank) {
                case "member":
                    rankList.push("§8[§aMember§8]");
                    break;

                case "helper":
                    rankList.push("§8[§pHelper§8]");
                    break;

                case "staff":
                    rankList.push("§8[§5Staff§8]");
                    break;

                case "admin":
                    rankList.push("§8[§cAdmin§8]");
                    break;

                case "dev":
                    rankList.push("§8[§bDeveloper§8]");
                    break;

                case "ceo":
                    rankList.push("§8[§gOwner§8]");
                    break;

                case "donator":
                    rankList.push("§8[§dDonator§8]");
                    break;

                case "donatorplus":
                    rankList.push("§8[§dDonator§f+§8]");
                    break;
            }
        }
    }
    
    return rankList.join(" ");
}

world.afterEvents.entityHealthChanged.subscribe((ent) => {
    const { entity } = ent;
    if (entity.typeId === "minecraft:player") {
        let player = entity as Player;
        updatePlayerRank(player); 
        const healthComponent = player.getComponent(EntityComponentTypes.Health);
        if (healthComponent) {
            const currentHealth = Math.floor(healthComponent.currentValue) / 2;
            const maxHealth = Math.floor(healthComponent.defaultValue) / 2;
            player.nameTag = `${getChatRanks(player)}§r${player.hasTag("combat") ? "§c" : "§7"} <${player.name}>§r \n §f${currentHealth}/${maxHealth}§r`;
        }
    }
});

export function updatePlayerNametags(player: Player) {
    updatePlayerRank(player);
    const healthComponent = player.getComponent(EntityComponentTypes.Health);
    if (healthComponent) {
        const currentHealth = Math.floor(healthComponent.currentValue) / 2;
        const maxHealth = Math.floor(healthComponent.defaultValue) / 2;
        player.nameTag = `${getChatRanks(player)}§r${player.hasTag("combat") ? "§c" : "§7"} <${player.name}>§r \n §f${currentHealth}/${maxHealth}§r`;
    }
}