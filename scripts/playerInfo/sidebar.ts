import { Player, HudVisibility, HudElement } from "@minecraft/server";
import { addScore, getScore, setScore } from "../helperFunctions/getScore";

export function updateSidebar(player: Player) {
    const seconds = getScore(player, "seconds") || 0;
    const minutes = getScore(player, "minutes") || 0;
    const hours = getScore(player, "hours") || 0;
    const kills = getScore(player, "kills") || 0;
    const deaths = getScore(player, "deaths") || 0;
    const money = getScore(player, "money") || 0;
    const blocksPlaced = getScore(player, "blocksPlaced") || 0;
    const blocksBroken = getScore(player, "blocksBroken") || 0;
    const clicks = getScore(player, "clicks") || 0;

    addScore(player, "seconds", 1);
    if (seconds >= 60) {
        addScore(player, "minutes", 1);
        setScore(player, "seconds", 0);
    }
    if (minutes >= 60) {
        addScore(player, "hours", 1);
        setScore(player, "minutes", 0);
    }

    const kdRatio = deaths === 0 ? kills : (kills / deaths).toFixed(2);
    const formattedTime = `${hours <= 9 ? `0${hours}` : hours}:${minutes <= 9 ? `0${minutes}` : minutes}:${seconds <= 9 ? `0${seconds}` : seconds}`;

    if (player.hasTag("nosidebar")) {
        player.onScreenDisplay.setTitle("")
    } else {
        player.onScreenDisplay.setTitle(`§●§l§dMoney §b>§e  ${money}
§●§l§dKills §b>§e  ${kills}
§●§l§dDeaths §b>§e  ${deaths}
§●§l§dKD §b>§e  ${kdRatio}
§●§l§dTime §b>§e  ${formattedTime}
§●§l§dCPS §b>§e  ${clicks}
§●§l§dPlaced §b>§e ${blocksPlaced}
§●§l§dBroke §b>§e ${blocksBroken}
§r\n\n§●§l  §7§8 §9nexussmp
§8-------------------
§●§l    §dnexussmp.xyz
            `);
    }}

