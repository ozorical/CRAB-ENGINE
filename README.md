# CRAB-ENGINE V4

> **The end of an era, the beginning of open source.**

Welcome to CRAB-ENGINE V4, the complete scripting system that powered CrabSMP. After years of development and refinement, i'm making this powerful engine available to the community.

## 🦀 What is CRAB-ENGINE?

CRAB-ENGINE is a comprehensive Minecraft Bedrock Edition scripting system built exclusively for CrabSMP. This engine is powered by the MCBE Beta API and was custom-designed to handle all aspects of the CrabSMP server experience, from player management to complex game mechanics.

## ✨ Key Features

### System Features

**Complete Server Ecosystem**:
- **Admin GUI**: Full administrative control panel
- **Economy System**: Auction house, selling, and crate rewards
- **Social Features**: Clans, chat ranks, and player interaction
- **Protection Systems**: Anti-bot, spawn protection, and land claims
- **RPG Elements**: Classes, quests, bounties, and battle pass progression
- **Performance Tools**: Lag clearing, entity stacking, and optimization
- **Moderation**: Report system, combat logging, and player tracking

**Built on MCBE Beta API**:
- **TypeScript Foundation**: Strongly typed codebase with custom types and enums
- **Modular Architecture**: Independent systems that work together seamlessly  
- **Advanced GUI System**: Custom user interfaces and interactive elements
- **Real-time Data Processing**: Live player statistics and leaderboards

## 🚀 Quick Start

**Note**: This engine was specifically built for CrabSMP using the Minecraft Bedrock Edition Beta API. It may require modifications to work with other servers.

### Basic Commands

Enter debug mode for advanced server insights:
```
/tag @s add debug
```

Bypass member restrictions for staff duties:
```
/tag @s add staffstatus
```

Set up complete permission hierarchy:
```
/tag @s add member
/tag @s add staff
/tag @s add admin
/tag @s add dev
/tag @s add owner
```

### Permission Hierarchy

| Rank | Tag | Capabilities |
|------|-----|-------------|
| **Owner** | `owner` | Full server control, all permissions |
| **Developer** | `dev` | Code access, debug tools, advanced features |
| **Admin** | `admin` | Player management, server configuration |
| **Staff** | `staff` | Moderation tools, bypass protections |
| **Member** | `member` | Standard player permissions |

## 📁 Project Structure

```
CRAB-ENGINE/
├── adminGUI/         
├── afk/            
├── antibot/          
├── auctionHouse/   
├── battlepass/     
├── bounties/      
├── chatCommands/ 
├── chatRanks/     
├── clans/        
├── classes/   
├── combatLog/  
├── commands/    
├── components/   
├── crates/     
├── db/      
├── debugger/    
├── events/    
├── guiPages/   
├── helperFunctions/
├── killDeath/     
├── lagClear/     
├── landClaim/   
├── leaderboard/    
├── namebar/       
├── npcs/          
├── playerInfo/   
├── quests/           
├── reportSystem/  
├── sell/          
├── spawnProt/    
├── stacker/      
├── enums.ts       
├── main.ts     
├── README.md   
└── types.ts   
```

### Requirements
- Minecraft Bedrock Edition
- Beta API access enabled
- TypeScript compilation environment
- Understanding of MCBE scripting architecture

## 🎯 Use Cases

**Primary Purpose**: This engine was built exclusively for CrabSMP and contains highly specific implementations.

**Potential Applications** (with modifications):
- **Learning Resource**: Study advanced MCBE scripting techniques
- **Code Reference**: Understand complex TypeScript implementations for Minecraft
- **Base Framework**: Adapt systems for similar SMP servers
- **API Examples**: See practical uses of MCBE Beta API features

**Note**: Direct usage requires extensive knowledge of the CrabSMP server structure and MCBE Beta API limitations.


## 🌟 Legacy

CRAB-ENGINE V4 represents years of evolution in Minecraft realms management. What started as a simple permission system grew into a comprehensive server engine. By open sourcing this project, we hope to give back to the community that made CrabSMP possible.
