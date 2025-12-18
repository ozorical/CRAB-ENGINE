import { Player } from "@minecraft/server";
import { ActionFormData, ModalFormData } from "@minecraft/server-ui";
import { addScore, getScore, removeScore } from "../../helperFunctions/getScore";
import { clanBanksDB } from "../clanSetup";
import { playSoundTo } from "../../helperFunctions/sounds";
import { relay } from "../../protocol/protocol";



/**
 * Displays the clan bank menu to the player.
 * @param player - The player accessing the clan bank.
 */
export function clanBankMenu(player: Player) {
  const clanID = getScore(player, "clanID");
  const clanBank = clanBanksDB.get(`clan:${clanID}`) || 0;

  const selectAction = new ActionFormData()
    .title("§5Nexus§fSMP §8- §eClan Bank")
    .body(`§fCurrent Balance: §a$${clanBank}`)
    .button("§aDeposit Money", "textures/gui/claims/create")
    .button("§4Withdraw Money", "textures/gui/claims/leave")
    .show(player as any)
    .then((res) => {
      if (res.canceled) {
        player.sendMessage("§cClan bank menu closed.");
        return;
      }

      switch (res.selection) {
        case 0:
          playSoundTo(player, "RandomPop");
          depositToBank(player, clanID!, clanBank);
          break;
        case 1:
          playSoundTo(player, "RandomPop");
          withdrawFromBank(player, clanID!, clanBank);
          break;
      }
    });
}

/**
 * Handles depositing money into the clan bank.
 * @param player - The player depositing money.
 * @param clanID - The ID of the clan.
 * @param currentAmount - The current balance in the clan bank.
 */
function depositToBank(player: Player, clanID: number, currentAmount: number) {
  const depositForm = new ModalFormData()
    .title("§5Nexus§fSMP §8- §eDeposit")
    .textField("Amount To Deposit", "Enter the amount to deposit")
    .show(player as any)
    .then((res) => {
      if (res.canceled) {
        player.sendMessage("§cDeposit canceled.");
        return;
      }

      const amount = parseInt(res.formValues![0] as string);

      if (isNaN(amount) || amount <= 0 || amount >= 1000000000) {
        playSoundTo(player, "Error");
        player.sendMessage("§cPlease enter a valid number between 1 and 1,000,000,000.");
        return;
      }

      if (getScore(player, "money")! < amount) {
        playSoundTo(player, "Error");
        player.sendMessage("§cYou don't have enough money for that.");
        return;
      }

      removeScore(player, "money", amount);
      clanBanksDB.set(`clan:${clanID}`, currentAmount + amount);

      playSoundTo(player, "Success");
      player.sendMessage(`§fYou deposited §a$§a${amount} §finto the clan bank.`);
      relay(`[Clans] ${player.name} deposited ${amount} into their clan bank`);
    });
}

/**
 * Handles withdrawing money from the clan bank.
 * @param player - The player withdrawing money.
 * @param clanID - The ID of the clan.
 * @param currentAmount - The current balance in the clan bank.
 */
function withdrawFromBank(player: Player, clanID: number, currentAmount: number) {
  const withdrawForm = new ModalFormData()
    .title("§5Nexus§fSMP §8- §eWithdraw")
    .textField("Amount To Withdraw", "Enter the amount to withdraw")
    .show(player as any)
    .then((res) => {
      if (res.canceled) {
        player.sendMessage("§cWithdrawal canceled.");
        return;
      }

      const amount = parseInt(res.formValues![0] as string);

      if (isNaN(amount) || amount <= 0 || amount >= 1000000000) {
        playSoundTo(player, "Error");
        player.sendMessage("§cPlease enter a valid number between 1 and 1,000,000,000.");
        return;
      }

      if (currentAmount < amount) {
        playSoundTo(player, "Error");
        player.sendMessage("§cThe clan bank doesn't have enough money for that.");
        return;
      }

      addScore(player, "money", amount);
      clanBanksDB.set(`clan:${clanID}`, currentAmount - amount);

      playSoundTo(player, "Success");
      player.sendMessage(`§fYou withdrew $§a${amount} §ffrom the clan bank.`);
      relay(`[Clans] withdrew ${amount} from their clan bank.`);
    });
}
