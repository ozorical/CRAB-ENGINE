import { Player, world } from "@minecraft/server";
import { ModalFormData } from "@minecraft/server-ui";
import { addScore, getScore, setScore } from "../../helperFunctions/getScore";
import { clanData } from "../../types";
import { clanBanksDB, clansDBNew } from "../clanSetup";

// Clan color options
const clanColours: Array<string> = ["§1", "§2", "§3", "§4", "§5", "§6", "§7", "§8", "§9", "§a", "§b", "§c", "§d", "§e", "§f", "§g"];
const clanColoursList: Array<string> = [
  "§1Dark Blue",
  "§2Dark Green",
  "§3Dark Aqua",
  "§4Dark Red",
  "§5Dark Purple",
  "§6Gold",
  "§7Grey",
  "§8Dark Grey",
  "§9Blue",
  "§aGreen",
  "§bAqua",
  "§cRed",
  "§dLight Purple",
  "§eYellow",
  "§fWhite",
  "§gMinecon Gold",
];

export function createClan(player: Player) {
  console.warn(`${player.name} attempted to create a clan. Current clanID: ${getScore(player, "clanID")}`);

  const clanID: number = getScore(player, "clanID") ?? 0;
  const clan: clanData | null = clanID ? clansDBNew.get(`clan:${clanID}`)?.find((m: clanData) => m.member === player.name) || null : null;

  if (clan) {
    player.sendMessage("§cYou are already in a clan. Leave it first to create a new one.");
    return;
  }

  if (clanID && clanID !== 0) {
    setScore(player, "clanID", 0);
  }

  if (clanID && clanID !== 0) {
    setScore(player, "clanID", 0);
  }

  const clanCreationForm = new ModalFormData()
    .title("§cCrab§fSMP §8- §eClan Creator")
    .textField("Clan Name", `Enter a unique name for your clan`)
    .dropdown("Clan Colour", clanColoursList)
    .show(player as any)
    .then((res) => {
      if (res.canceled) {
        player.sendMessage("§cClan creation canceled.");
        return;
      }

      const [name, colorIndex] = res.formValues as [string, number];

      if (name.length > 15) {
        player.sendMessage("§cClan names cannot be more than 15 characters long.");
        return;
      }

      const selectedColor = clanColours[colorIndex];
      const coloredClanName = `${selectedColor}${name}`;

      const clanBuilder: Array<clanData> = [
        {
          member: player.name,
          permission: "owner",
          clanName: coloredClanName,
        },
      ];

      const newClanID = getScore("clan", "clanID")!;
      setScore(player, "clanID", newClanID);
      addScore("clan", "clanID", 1);

      clansDBNew.set(`clan:${newClanID}`, clanBuilder);
      clanBanksDB.set(`clan:${newClanID}`, 0);

      world.sendMessage(`§b${player.name} §acreated a new clan called ${coloredClanName}!`);
      player.sendMessage(`§aWelcome to your new clan! Use the GUI to manage it.`);
    });
}
