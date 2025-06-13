import { Player, world } from "@minecraft/server";
export class Quest {
  public questName: string;
  public questDesc: string;
  public scoreName: string;
  public amounts: Array<number>;
  public rewardsAction: (player: Player, quest: this) => void;

  constructor() {}

  public completed(quest: this, player: Player) {
    if ((player.getDynamicProperty(quest.questName) as number) === quest.amounts.length) {
      return true;
    } else {
      return false;
    }
  }

  public setAmounts(num: Array<number>) {
    this.amounts = num;
    return this;
  }

  public setName(name: string) {
    this.questName = name;
    return this;
  }
  public setDescription(desc: string) {
    this.questDesc = desc;
    return this;
  }

  public setScore(score: string) {
    this.scoreName = score;
    return this;
  }

  public setRewardsCheck(action: (player: Player, quest: this) => void) {
    this.rewardsAction = action;
    return this;
  }
}
