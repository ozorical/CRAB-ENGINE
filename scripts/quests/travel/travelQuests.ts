import { getScore } from "../../helperFunctions/getScore";
import { Quest } from "../questMain";
import { tierHandler } from "../questFunctions";

const TravelRegister: Record<string, TravelQuest> = {};

class TravelQuest extends Quest {
  public register() {
    TravelRegister[this.questName.toLowerCase().replaceAll(" ", "_")] = this;
  }
}

new TravelQuest()
  .setName("Traveling Quest")
  .setDescription("Travel Across Distance To Progress")
  .setAmounts([1000, 10000, 50000, 100000, 250000, 500000, 1000000, 3000000, 6000000, 100000000])
  .setScore("distanceMoved")
  .setRewardsCheck((player, quest) => {
    tierHandler(player, quest.questName, quest.amounts, getScore(player, quest.scoreName)!);
  })
  .register();

export { TravelRegister, TravelQuest };
