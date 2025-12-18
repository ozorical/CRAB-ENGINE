// sellPage.ts
import { Player } from "@minecraft/server";
import { ActionFormData } from "@minecraft/server-ui";
import { playSoundTo } from "../helperFunctions/sounds";
import { sell } from "../sell/sellCommand";
import { relay } from "../protocol/protocol";

export function sellPage(player: Player) {
const categories = [
    {
        title: "§6Farming Crops",
        items: [
            { name: "§eMelon Block", price: 2 },
            { name: "§ePumpkin", price: 20 },
            { name: "§eWheat", price: 10 },
            { name: "§eCarrot", price: 3 },
            { name: "§ePotato", price: 3 },
            { name: "§eBeetroot", price: 2 },
            { name: "§eSugar Cane", price: 5 }
        ]
    },
    {
        title: "§6Fishing & Animals",
        items: [
            { name: "§eRaw Cod", price: 3 },
            { name: "§eRaw Salmon", price: 3 },
            { name: "§eCooked Cod", price: 7 },
            { name: "§eCooked Salmon", price: 7 },
            { name: "§ePufferfish", price: 3 },
            { name: "§eTropical Fish", price: 3 },
            { name: "§eLeather", price: 5 },
            { name: "§eHoney Bottle", price: 7 }
        ]
    },
    {
        title: "§6Mining & Ores",
        items: [
            { name: "§eCoal", price: 5 },
            { name: "§eIron Ingot", price: 15 },
            { name: "§eGold Ingot", price: 25 },
            { name: "§eDiamond", price: 50 },
            { name: "§eNetherite Ingot", price: 150 },
            { name: "§eCopper Ingot", price: 8 },
            { name: "§eRaw Iron", price: 7 },
            { name: "§eQuartz", price: 5 },
            { name: "§eLapis Lazuli", price: 8 },
            { name: "§eRedstone", price: 5 },
            { name: "§eEmerald", price: 35 },
            { name: "§eAmethyst Shard", price: 10 }
        ]
    },
    {
        title: "§6Nether & End",
        items: [
            { name: "§eGlowstone Dust", price: 5 },
            { name: "§eBlaze Rod", price: 15 },
            { name: "§eGhast Tear", price: 50 },
            { name: "§eShulker Shell", price: 75 },
            { name: "§eEnder Pearl", price: 8 },
            { name: "§eObsidian", price: 20 },
            { name: "§eNether Star", price: 350 }
        ]
    },
    {
        title: "§6Miscellaneous",
        items: [
            { name: "§eNautilus Shell", price: 5 },
            { name: "§ePhantom Membrane", price: 8 },
            { name: "§eSlime Ball", price: 5 },
            { name: "§eIron Nugget", price: 1 },
            { name: "§eGold Nugget", price: 1 },
            { name: "§eAll Wood Logs", price: 1 },
            { name: "§eBamboo", price: 1 },
            { name: "§eSea Lantern", price: 10 },
            { name: "§ePrismarine Shard", price: 7 }
        ]
    }
];

let bodyContent = "§fHere's everything you can sell:\n";

  categories.forEach(category => {
    bodyContent += `\n\n${category.title}\n§7------------------------`;

    category.items.forEach(item => {
      bodyContent += `\n${item.name} §f- §a$${item.price}`;
    });
  });

  const form = new ActionFormData()
    .title("§5Nexus§fSMP §8- §eShop Prices")
    .body(bodyContent)
    .button("§aSell All Items", "textures/ui/confirm.png")
    .button("§4Close Menu", "textures/ui/cancel.png");

  form.show(player as any).then(res => {
    if (res.selection === 0) {
      playSoundTo(player, "Success");
      sell(player);
    }
  });
}