import { world, Player, Entity, EntityQueryOptions, EntityType, VanillaEntityIdentifier } from "@minecraft/server";
import { ModalFormData } from "@minecraft/server-ui";
import { lbData } from "../types";
import { Database } from "../db/Database";

export async function getLbDB(entity: Entity) {
  const db = await new Database<{
    obj: string;
    name: string;
    name_colour: string;
    player_colour: string;
    score_colour: string;
    amount: number;
    data: lbData[];
  }>(`${entity.id}_lbData`);
  return db;
}

export async function setupLeaderBoard(player: Player) {
  //prettier-ignore
  let colours: Array<string> = ["§0", "§1","§2","§3","§4","§5","§6","§7","§8","§9","§a","§b","§c","§d","§e","§f","§g",]
  //prettier-ignore
  let coloursList: Array<string> = ["§0Black", "§1Dark Blue","§2Dark Green","§3Dark Aqua","§4Dark Red","§5Dark Purple","§6Gold","§7Grey","§8Dark Grey","§9Blue","§aGreen","§bAqua","§cRed","§dLight Purple","§eYellow","§fWhite","§gMinecon Gold",]

  const queryOptions: EntityQueryOptions = {
    maxDistance: 2,
    type: "crab:floating_text",
    closest: 1,
    location: player.location
  };

  let nearLB = player.dimension.getEntities(queryOptions);
  let leaderboardEntity: Entity;
  if (nearLB.length == 0) {
    const { x, y, z } = player.location;
    leaderboardEntity = player.dimension.spawnEntity("crab:floating_text" as VanillaEntityIdentifier, { x: x, y: y + 1, z: z });
  } else {
    leaderboardEntity = nearLB[0];
  }

  const lbDB = await getLbDB(leaderboardEntity);
  const currentData = lbDB.get("data") ?? {
    obj: "",
    name: "",
    name_colour: "§f",
    player_colour: "§f",
    score_colour: "§f",
    amount: 1,
    data: []
  };

  let spawnForm = new ModalFormData()
    .title("§cCreate Leaderboard§r")
    .textField("Objective Name", "Enter the scoreboard objective name", {
      defaultValue: currentData.obj ?? ""
    })
    .textField("Leaderboard Title", "Enter the display name", { 
      defaultValue: currentData.name ?? "Leaderboard" 
    })
    .dropdown("Title Colour", coloursList, { 
      defaultValueIndex: currentData.name_colour ? colours.findIndex((colour) => colour === currentData.name_colour) : 0 
    })
    .dropdown("Player Names Colour", coloursList, { 
      defaultValueIndex: currentData.player_colour ? colours.findIndex((colour) => colour === currentData.player_colour) : 0 
    })
    .dropdown("Score Colour", coloursList, { 
      defaultValueIndex: currentData.score_colour ? colours.findIndex((colour) => colour === currentData.score_colour) : 0 
    })
    .slider("Amount Of Players To Show", 1, 25, { 
      defaultValue: currentData.amount ?? 1, 
      valueStep: 1 
    })
    .toggle("§aDelete This Leaderboard?", { defaultValue: false });

  spawnForm.show(player as any).then(async (res) => {
    if (res.canceled) return;
    
    if (res.formValues?.[6] === true) {
      await lbDB.delete("data");
      leaderboardEntity.remove();
      return;
    }

    const obj = res.formValues?.[0] as string ?? "";
    const displayName = res.formValues?.[1] as string ?? "Leaderboard";
    const nameColour = colours[res.formValues?.[2] as number ?? 0];
    const playerNameColour = colours[res.formValues?.[3] as number ?? 0];
    const scoreColour = colours[res.formValues?.[4] as number ?? 0];
    const amountToDisplay = res.formValues?.[5] as number ?? 1;

    if (!obj) {
      player.sendMessage("§cError: Objective name cannot be empty!");
      return;
    }

    const newData = {
      obj,
      name: displayName,
      name_colour: nameColour,
      player_colour: playerNameColour,
      score_colour: scoreColour,
      amount: amountToDisplay,
      data: [{ name: player.name, amount: 0 }]
    };

    await lbDB.set("data", newData);
    await leaderboardUpdate(leaderboardEntity);
  });
}

async function leaderboardUpdate(leaderboard: Entity) {
  const lbDB = await getLbDB(leaderboard);
  const lbData = lbDB.get("data");
  
  if (!lbData) return;

  const { obj, name: displayName, name_colour, player_colour, score_colour, amount: amountToDisplay, data } = lbData;

  let playersOnlineScores: Array<lbData> = world.getAllPlayers().map((player) => {
    let score = world.scoreboard.getObjective(obj)?.getScore(player);
    let pData: lbData = { name: player.name, amount: score ?? 0 };
    return pData;
  });

  const mergedLb = merge(data, playersOnlineScores, "name");
  const shortendLb = mergedLb.sort((a, b) => b.amount - a.amount).slice(0, 20);

  await lbDB.set("data", {
    ...lbData,
    data: shortendLb
  });

  let sortedLb = mergedLb.sort((a, b) => b.amount - a.amount).slice(0, amountToDisplay);
  let scoreSection: string = "";
  sortedLb.forEach((v, index) => {
    scoreSection += `§f${index + 1}. §r${player_colour}${sortedLb[index].name}§f -§r ${score_colour}${sortedLb[index].amount}\n`;
  });

  const formattedTitle = `§l ${name_colour}${displayName} §r`;
  let nametag = `${formattedTitle}\n${scoreSection}`;
  leaderboard.nameTag = nametag;
}

export async function updateLeaderboards() {
  const queryOptions: EntityQueryOptions = {
    type: "crab:floating_text"
  };
  
  let entities = world.getDimension("overworld").getEntities(queryOptions);
  if (entities.length != 0) {
    for (const entity of entities) {
      const lbDB = await getLbDB(entity);
      const data = lbDB.get("data");
      if (entity.nameTag != "entity.crab:floating_text.name" && data) {
        await leaderboardUpdate(entity);
      }
    }
  }
}

function merge(a: Array<lbData>, b: Array<lbData>, prop: keyof lbData): Array<lbData> {
  var reduced = a.filter((aitem) => !b.find((bitem) => aitem[prop] === bitem[prop]));
  return reduced.concat(b);
}