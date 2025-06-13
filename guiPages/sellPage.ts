// sellPage.ts
import { Player } from "@minecraft/server";
import { ActionFormData } from "@minecraft/server-ui";
import { playSoundTo } from "../helperFunctions/sounds";
import { sell } from "../sell/sellCommand";

export function sellPage(player: Player) {
  const categories = [
    {
      title: "§6Farming Crops",
      items: [
        { name: "§eMelon Block", price: 5 },
        { name: "§ePumpkin", price: 50 },
        { name: "§eWheat", price: 30 },
        { name: "§eCarrot", price: 10 },
        { name: "§ePotato", price: 10 },
        { name: "§eBeetroot", price: 8 },
        { name: "§eSugar Cane", price: 15 }
      ]
    },
    {
      title: "§6Fishing & Animals",
      items: [
        { name: "§eRaw Cod", price: 10 },
        { name: "§eRaw Salmon", price: 10 },
        { name: "§eCooked Cod", price: 20 },
        { name: "§eCooked Salmon", price: 20 },
        { name: "§ePufferfish", price: 10 },
        { name: "§eTropical Fish", price: 10 },
        { name: "§eLeather", price: 15 },
        { name: "§eHoney Bottle", price: 20 }
      ]
    },
    {
      title: "§6Mining & Ores",
      items: [
        { name: "§eCoal", price: 15 },
        { name: "§eIron Ingot", price: 40 },
        { name: "§eGold Ingot", price: 75 },
        { name: "§eDiamond", price: 150 },
        { name: "§eNetherite Ingot", price: 400 },
        { name: "§eCopper Ingot", price: 25 },
        { name: "§eRaw Iron", price: 20 },
        { name: "§eQuartz", price: 15 },
        { name: "§eLapis Lazuli", price: 25 },
        { name: "§eRedstone", price: 15 },
        { name: "§eEmerald", price: 100 },
        { name: "§eAmethyst Shard", price: 30 }
      ]
    },
    {
      title: "§6Nether & End",
      items: [
        { name: "§eGlowstone Dust", price: 15 },
        { name: "§eBlaze Rod", price: 40 },
        { name: "§eGhast Tear", price: 150 },
        { name: "§eShulker Shell", price: 200 },
        { name: "§eEnder Pearl", price: 25 },
        { name: "§eObsidian", price: 50 },
        { name: "§eNether Star", price: 1000 }
      ]
    },
    {
      title: "§6Miscellaneous",
      items: [
        { name: "§eNautilus Shell", price: 15 },
        { name: "§ePhantom Membrane", price: 25 },
        { name: "§eSlime Ball", price: 15 },
        { name: "§eIron Nugget", price: 5 },
        { name: "§eGold Nugget", price: 5 },
        { name: "§eAll Wood Logs", price: 5 },
        { name: "§eBamboo", price: 3 },
        { name: "§eSea Lantern", price: 30 },
        { name: "§ePrismarine Shard", price: 20 }
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
    .title("§cCrab§fSMP §8- §eShop Prices")
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