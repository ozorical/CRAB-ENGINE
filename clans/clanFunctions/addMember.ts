import { Player, system, world } from "@minecraft/server";
import { ModalFormData, ModalFormResponse } from "@minecraft/server-ui";
import { getScore, setScore } from "../../helperFunctions/getScore";
import { clansDBNew } from "../clanSetup";
import { getClan } from "./getClan";

export function clanAdd(inviter: Player) {
  const clanID = getScore(inviter, "clanID");

  const players = world.getAllPlayers();
  const playerNames = players.map((p) => p.name);

  const playerList = new ModalFormData()
    .title("§cSelect Player To Invite")
    .dropdown("Player", playerNames, { defaultValueIndex: 0 })
    .show(inviter as any)
    .then((res: ModalFormResponse) => {
      if (res.canceled) {
        inviter.sendMessage("§cClan invitation canceled.");
        return;
      }

      const target = players[res.formValues![0] as number];

      if (clanID === getScore(target, "clanID")) {
        inviter.sendMessage("§cCannot send invite: Target is already in your clan.");
        return;
      }

      const clan = getClan(inviter);
      const inviterData = clan?.find((clanData) => clanData.member === inviter.name);
      if (inviterData?.permission === "member") {
        inviter.sendMessage("§cCannot send invite: Insufficient permission level.");
        return;
      }

      if (inviter.getDynamicProperty("invite") && inviter.getDynamicProperty("invite") !== "") {
        inviter.sendMessage("§cCannot send invites while one is pending. Please wait 30 seconds for it to expire.");
        return;
      }
      if (target.getDynamicProperty("inviteAccept") && target.getDynamicProperty("inviteAccept") !== "") {
        inviter.sendMessage("§cCannot send invites to players with pending invites. Please wait and try again.");
        return;
      }

      inviter.sendMessage(`§aInvite sent to §b${target.name}`);
      target.sendMessage(`§a§b${inviter.name} §einvited you to their clan!`);
      inviter.setDynamicProperty("invite", target.name);
      target.setDynamicProperty("inviteAccept", inviter.name);

      inviteTimeout(inviter, target);
    });
}

export function inviteAccept(accepter: Player) {
  const players = world.getAllPlayers();
  const playerNames = players.map((p) => p.name);

  const tpaMenu = new ModalFormData()
    .title("§aAccept Clan Invite From Player§r")
    .dropdown("Player", playerNames, { defaultValueIndex: 0 })
    .show(accepter as any)
    .then((res) => {
      if (res.canceled) {
        accepter.sendMessage("§cInvite acceptance canceled.");
        return;
      }

      const selection = res.formValues![0] as number;
      const target = players[selection];

      const accepterClanID = getScore(accepter, "clanID");
      if (accepterClanID && accepterClanID !== 0) {
        const accepterClan = getClan(accepter);
        if (accepterClan && accepterClan.some((member) => member.member === accepter.name)) {
          accepter.sendMessage("§cCannot join a clan while already in one.");
          return;
        }
      }

      if (!accepter.getDynamicProperty("inviteAccept") || accepter.getDynamicProperty("inviteAccept") === "") {
        accepter.sendMessage("§cYou have no pending invites.");
        return;
      }

      if (!target.getDynamicProperty("invite") || target.getDynamicProperty("invite") === "") {
        accepter.sendMessage("§cThis player has not invited you to their clan.");
        return;
      }

      if ((target.getDynamicProperty("invite") as string) === accepter.name && (accepter.getDynamicProperty("inviteAccept") as string) === target.name) {
        target.setDynamicProperty("invite", "");
        accepter.setDynamicProperty("inviteAccept", "");

        const clanInfo = getClan(target);
        const clanID = getScore(target, "clanID");

        if (!clanInfo || !clanID) {
          accepter.sendMessage("§cError: The inviting player is no longer in a valid clan.");
          return;
        }

        clanInfo.push({
          clanName: clanInfo[0].clanName,
          member: accepter.name,
          permission: "member",
        });

        clansDBNew.set(`clan:${clanID}`, clanInfo);
        setScore(accepter, "clanID", clanID);

        world.sendMessage(`§b${accepter.name} §ejoined §a${target.name}'s§e clan!`);
      }
    });
}

function inviteTimeout(player: Player, target: Player) {
  system.runTimeout(() => {
    player.sendMessage("§cYour clan invite has expired.");
    player.setDynamicProperty("invite", "");
    target.sendMessage(`§c${player.name}'s clan invite has timed out.`);
    target.setDynamicProperty("inviteAccept", "");
  }, 600);
}

const e = () => {
  world.getAllPlayers().forEach((player) => {
    if (player.getDynamicProperty("invite") === undefined) {
      player.setDynamicProperty("invite", "");
    }
    if (player.getDynamicProperty("inviteAccept") === undefined) {
      player.setDynamicProperty("inviteAccept", "");
    }
  });
};

system.run(e);
