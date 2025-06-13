import { Dimension, ItemStack, Vector3 } from "@minecraft/server";

export type clanInfo = {};

export interface clanData {
  member: string;
  permission: string;
  clanName: string;
}

export type warpInfo = {
  location: Vector3;
  dimension: string;
};

export type lbData = {
  amount: number;
  name: string;
};

export type loot = {
  type: string;
  lvl: number;
};

export type JoinLeaveData = {
  action: string;
  player: string;
  timestamp: number;
  formattedTime: string;
};

export interface JoinLeaveDB {
  logs: Array<JoinLeaveData>;
}

export interface messageDBData {
  player?: string;
  message: Array<MessageData>;
}

export type MessageData = {
  player: string;
  message: string;
  timestamp: number;
};

export interface duration {
  S: number;
  M: number;
  H: number;
  D: number;
  Unit: string | number;
}

export interface banDBData {
  bannedBy: string;
  reason: string;
  bannedAt: string;
  unbanTime: number | string;
  player: string;
}

export interface muteDBData {
  player: string;
  mutedBy: string;
  endTime: number;
  duration: string;
  reason: string;
  startTime: number;
  finished: boolean;
}

export type InvDB = {
  playerName: string;
  inv: Array<ItemStack>;
  equipment: Array<ItemStack>;
};

export interface bountyData {
  amount: number;
  name: string;
  date: number;
  expiresAt?: number; // Add this line
}

export type reportData = {
  name: string;
  title: string;
  message: string;
  id: number;
};
export type reportFind = {
  name: string;

  id: number;
};



export type playerInvData = {};
