import { world, system, Player } from "@minecraft/server";
import { ActionFormData, FormCancelationReason, ModalFormData } from "@minecraft/server-ui";
import { Database } from "../db/Database";
import { bountyData } from "../types";
import { getScore, removeScore } from "../helperFunctions/getScore";
import { advancedRelay, relay } from "../protocol/protocol";

let bountyDB: Database<bountyData>;

export const bountyDBInit = async () => {
  await null;
  bountyDB = new Database<bountyData>("bounties");
};

const SOUNDS = {
  Success: "random.levelup",
  Error: "note.bit",
  Ping: "random.orb",
  Activate: "beacon.activate",
};

/**
 * Displays the main bounty menu.
 * @param player - The player interacting with the bounty menu.
 * @param isChat - Whether the menu was triggered via chat.
 * @param i - Retry counter for handling busy players.
 */
export function bountyMenu(player: Player, isChat?: boolean, i?: number) {
  if (isChat) {
    i = 0;
  }

  const bountyMenuForm = new ActionFormData()
    .title("§5Nexus§fSMP §8- §eBounties")
    .body("§7Create and view player bounties")
    .button(`§l§aView Bounties§r\n§8[ §fActive bounties §8]§r`, "textures/staff/view.png")
    .button("§l§6Add Bounty§r\n§8[ §fAdd a bounty §8]§r", "textures/items/emerald.png")
    .button("§l§4Close Menu§r\n§8[ §fClose the GUI §8]§r", "textures/blocks/barrier.png")
    .show(player as any)
    .then((res) => {
      if (res.canceled && res.cancelationReason == FormCancelationReason.UserBusy && i != undefined) {
        system.runTimeout(() => {
          if (i! < 5) {
            i!++;
            bountyMenu(player, false, i);
          }
        }, 20);
        return;
      }
      if (res.selection === 0) {
        viewBounties(player);
      }
      if (res.selection === 1) {
        addBounty(player);
      }
      if (res.selection === 2) {
        player.sendMessage("§cClosed Bounty Menu");
      }
    });
}

/**
 * Adds a bounty on a player.
 * @param player - The player adding the bounty.
 */
function addBounty(player: Player) {
  const players = world.getAllPlayers();
  const playerNames = players.map((p) => p.name);

  const addBounty = new ModalFormData()
    .title("§bBounty Menu")
    .dropdown("Player", playerNames, { defaultValueIndex: 0 })
    .textField("Amount", "0", { defaultValue: "0" })
    .show(player as any)
    .then((res) => {
      const amount = parseInt(res.formValues![1]! as string);

      if (isNaN(amount) || amount <= 500 || amount >= 100000) {
        player.sendMessage("§cPlease Enter A Valid Number Between 500 and 100,000");
        player.playSound(SOUNDS.Error); // Play error sound
        return;
      }
      if (getScore(player, "money")! <= amount) {
        player.sendMessage("§cYou Don't Have Enough Money For That");
        player.playSound(SOUNDS.Error); // Play error sound
        return;
      }
      if (bountyDB.get(playerNames[res.formValues![0]! as number])) {
        player.sendMessage("§cCannot Add Bounty -> Player Already Has One");
        player.playSound(SOUNDS.Error); // Play error sound
        return;
      }

      const date = Date.now();
      removeScore(player, "money", amount);

      bountyDB.set(playerNames[res.formValues![0]! as number], { amount: amount, name: playerNames[res.formValues![0]! as number], date: date });
      world.sendMessage(`§e${player.name} §7Set A Bounty Of §a$${res.formValues![1]!} §7On §e${playerNames[res.formValues![0]! as number]}`);
      relay(`[Relay Message] ${player.name} set a bounty of $${res.formValues![1]!} on ${playerNames[res.formValues![0]! as number]}`);
      advancedRelay("1397330754568196246", `${player.name} set a bounty of $${res.formValues![1]!} on ${playerNames[res.formValues![0]! as number]}`, "Bounty Set", "00FF00");
      player.playSound(SOUNDS.Success); // Play success sound
    });
}

/**
 * Adds a random bounty on a player without the 'staffstatus' or 'realmbot' tag.
 */
function addRandomBounty() {
  const players = world.getAllPlayers().filter((p) => !p.hasTag("staffstatus") && !p.hasTag("realmbot"));
  if (players.length === 0) {
    console.warn("No valid players available for a random bounty.");
    return;
  }

  const randomPlayer = players[Math.floor(Math.random() * players.length)];
  const amount = Math.floor(Math.random() * (10000 - 1000 + 1)) + 1000; // Random amount between 1000 and 10000
  const date = Date.now();

  bountyDB.set(randomPlayer.name, { amount: amount, name: randomPlayer.name, date: date, expiresAt: date + 30 * 60 * 1000 }); // Expires in 30 minutes
  world.sendMessage(`§eA Random Bounty Of §a$${amount} §7Has Been Placed On §e${randomPlayer.name} §7(Expires in 30 minutes)`);
  relay(`[Relay Message] A random bounty of $${amount} has been placed on ${randomPlayer.name} (Expires in 30 minutes)`);
  advancedRelay("1397330754568196246", `A random bounty of $${amount} has been placed on ${randomPlayer.name} (Expires in 30 minutes)`, "Random Bounty Set", "00FF00");
}

/**
 * Displays the list of active bounties.
 * @param player - The player viewing the bounties.
 */
function viewBounties(player: Player) {
  const bounties = bountyDB.values();
  const prettyBounties = bounties
    .map((b) => {
      if (b.date == undefined || b.date > Date.now() - 2 * 24 * 60 * 60 * 1000) {
        const expirationTime = b.expiresAt ? new Date(b.expiresAt).toUTCString() : "N/A";
        return `§7Name: §e"${b.name}" §8--> §7Amount: §a${b.amount} §8[ §7Expires: §6${expirationTime} §8]`;
      } else {
        bountyDB.delete(`${b.name}`);
      }
    })
    .join("\n");

  const activeBounties = new ActionFormData()
    .title("§bActive Bounties")
    .body(prettyBounties + "\n\n\n\n\n")
    .button("Close", "textures/blocks/barrier.png")
    .show(player as any)
    .then((res) => {
      if (res.selection == 0) {
        player.playSound(SOUNDS.Ping); // Play ping sound when closing the menu
      }
    });
}

// Schedule random bounty events
system.runInterval(() => {
  const chance = Math.random(); // Random chance between 0 and 1
  if (chance < 0.1) {
    // 10% chance to trigger a random bounty
    addRandomBounty();
  }
}, 20 * 60 * 10); // Check every 10 minutes

export { bountyDB };
