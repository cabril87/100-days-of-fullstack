import type { IconType } from 'react-icons';
import {
  // Confirmed working Game Icons - Core Icons
  GiCheckMark, GiTrophyCup, GiStairsGoal, GiSpeedometer,
  GiRocketFlight, GiBullseye, GiTargetArrows, GiArcheryTarget, 
  GiStopwatch, GiAlarmClock, GiHourglass, GiSpeedBoat, GiRabbit,
  GiLightningBow, GiThunderStruck, GiWindsock, GiTornado, GiFlashlight,
  GiFire, GiFlame, GiFireBowl, GiCampfire, GiSunrise,
  GiCalendar, GiChainLightning, GiLinkedRings, GiCycle,
  GiStairs, GiMountaintop, GiPodiumWinner, GiCrown,
  GiDiamondRing, GiGoldBar, GiTrophy, GiMedal, GiRibbonMedal,
  GiCog, GiGears, GiFactory, GiGearHammer, GiScrewdriver,
  GiWrench, GiToolbox, Gi3dHammer, GiAnvil, GiComputerFan,
  GiGroupedDrops, GiShare, GiTeacher, GiNetworkBars,
  GiDiamondTrophy, GiStarMedal, GiSportMedal, GiBeveledStar, GiStarShuriken,
  GiFlatStar, GiStarStruck, GiCrystalGrowth,
  GiLightBulb, GiBrain, GiArtificialIntelligence, GiIdea, GiMagicSwirl,
  GiSparkles, GiTwirlyFlower, GiPaintBrush, GiPalette,
  GiCrosshair, GiConcentricCrescents, GiMeditation,
  GiYinYang, GiThirdEye, GiEagleEmblem,
  GiCastle, GiGoalKeeper,
  
  // Gaming & Competition Icons
  GiSoccerBall, GiBasketballBall, GiTennisBall, GiVolleyballBall, GiAmericanFootballBall,
  GiGamepad, GiJoystick, GiConsoleController, GiDiceTwentyFacesTwenty,
  GiDiceFire, GiDiceTarget, GiChessKing, GiChessQueen, GiChessRook,
  GiCheckedShield, GiVortex, GiLevelThreeAdvanced, GiLevelFourAdvanced,
  
  // Party & Celebration
  GiPartyPopper, GiPresent, GiCelebrationFire, GiBalloons, GiPartyHat,
  GiCakeSlice, GiPartyFlags,
  
  // Warrior & Combat
  GiSwordInStone, GiCrossedSwords, GiShield, GiKnightBanner,
  GiSamuraiHelmet, GiNinjaHeroicStance, GiSpartanHelmet,
  GiVikingHelmet, GiHelmet, GiBroadsword, GiWarhammer,
  GiBattleAxe, GiMaceHead, GiCrossbow, GiBoomerang,
  
  // Nature & Growth
  GiOakLeaf, GiTreeGrowth, GiSeedling, GiFlowerPot, GiSunflower,
  GiForestCamp, GiPineTree, GiMountains, GiRiver, GiVolcano,
  GiBeehive, GiButterfly, GiDragonHead,
  
  // Magic & Mystery
  GiMagicHat, GiCrystalBall, GiScrollUnfurled, GiSpellBook,
  GiCauldron, GiWizardStaff, GiWizardFace, GiMagicTrident,
  GiCrystalWand, GiMagicPortal, GiRuneStone,
  
  // Technology & Innovation
  GiCircuitry, GiProcessor, GiRobotGrab, GiArtificialHive, GiDigitalTrace,
  GiSatelliteCommunication, GiRadioTower,
  GiPowerGenerator, GiElectric, GiLightningTrio,
  
  // Animals & Creatures
  GiLion, GiEagleHead, GiWolfHead, GiTigerHead, GiElephantHead,
  GiDolphin, GiBull, GiBirdMask, GiWingedEmblem,
  GiUnicorn, GiSpiderFace, GiSnake, GiScorpion,
  
  // Elements & Weather
  GiSun, GiSnowflake1, GiEclipse,
  GiRainbowStar, GiLightningStorm, GiThunderball, GiMeteorImpact,
  
  // Adventure & Exploration
  GiTreasureMap, GiCompass, GiAnchor, GiShipWheel, GiIsland,
  GiMountainClimbing, GiCampingTent, GiBackpack, GiHiking,
  GiPirateCaptain, GiPirateFlag, GiSpyglass, GiAncientColumns,
  
  // Sports & Activities
  GiMountainCave, GiSkier, GiSurfBoard, GiBasketballJersey,
  GiTennisRacket, GiBoxingGlove, GiWhistle,
  
  // Achievements & Progress
  GiLaurelsTrophy, GiStarFormation, GiTripleGate, GiUpgrade,
  GiProgression, GiFlagObjective, GiTargetShot,
  
  // Time & Speed
  GiTimeTrap, GiClockwork, GiZeusSword, GiSupersonicArrow, GiArrowCluster,
  
  // Special Effects
  GiBrightExplosion, GiNuclearBomb, GiAura,
  GiSonicBoom, GiConcentrationOrb, GiBrainstorm
} from 'react-icons/gi';

// Lucide icons for additional variety
import { 
  Clock, Target, Award, Star, Crown as LucideCrown,
  TrendingUp, CheckCircle, Flame, Users, Shield, Sparkles as LucideSparkles,
  Handshake, UserPlus, Focus, Flag, Milestone, Gift, Cake, 
  Wind, Cloud, Snowflake, Medal, Zap, Gem, Calendar,
  Sword, Wand2, Rocket, Brain, Eye, Heart, Bolt, Diamond,
  Mountain, Waves, Globe, Compass as LucideCompass, Map,
  Timer, AlarmClock, Hourglass, Battery, Power, Settings
} from 'lucide-react';

export interface AchievementTier {
  name: string;
  level: number;
  color: string;
  bgColor: string;
  pointsRequired: number;
  icon: IconType;
}

export interface AchievementIconInfo {
  icon: IconType;
  tier: string;
  level: number;
  category: string;
  description: string;
  color: string;
  bgColor: string;
  pointsRequired: number;
  requirements: string[];
  rewardType: 'points' | 'badge' | 'character' | 'special';
  rewardValue: number;
}

// Define achievement tiers
export const achievementTiers: Record<string, AchievementTier> = {
  bronze: {
    name: 'Bronze',
    level: 1,
    color: 'text-amber-700',
    bgColor: 'bg-amber-100',
    pointsRequired: 0,
    icon: Medal
  },
  silver: {
    name: 'Silver', 
    level: 2,
    color: 'text-gray-500',
    bgColor: 'bg-gray-100',
    pointsRequired: 100,
    icon: Medal
  },
  gold: {
    name: 'Gold',
    level: 3,
    color: 'text-yellow-500',
    bgColor: 'bg-yellow-100',
    pointsRequired: 500,
    icon: GiStarMedal
  },
  platinum: {
    name: 'Platinum',
    level: 4,
    color: 'text-blue-400',
    bgColor: 'bg-blue-50',
    pointsRequired: 1500,
    icon: GiDiamondTrophy
  },
  diamond: {
    name: 'Diamond',
    level: 5,
    color: 'text-cyan-400',
    bgColor: 'bg-cyan-50',
    pointsRequired: 5000,
    icon: Diamond
  },
  onyx: {
    name: 'Onyx',
    level: 6,
    color: 'text-purple-600',
    bgColor: 'bg-purple-100',
    pointsRequired: 15000,
    icon: Gem
  }
};

export const achievementIcons: Record<string, AchievementIconInfo> = {
  // ========== BRONZE TIER (1-6) ==========
  'bronze-first-task': {
    icon: GiCheckMark,
    tier: 'bronze',
    level: 1,
    category: 'First Steps',
    description: 'Complete your very first task',
    color: 'text-amber-700',
    bgColor: 'bg-amber-100',
    pointsRequired: 0,
    requirements: ['Complete 1 task'],
    rewardType: 'points',
    rewardValue: 10
  },
  'bronze-task-starter': {
    icon: GiStairsGoal,
    tier: 'bronze', 
    level: 2,
    category: 'Progress',
    description: 'Complete 5 tasks',
    color: 'text-amber-700',
    bgColor: 'bg-amber-100',
    pointsRequired: 0,
    requirements: ['Complete 5 tasks'],
    rewardType: 'points',
    rewardValue: 25
  },
  'bronze-speed-runner': {
    icon: GiSpeedometer,
    tier: 'bronze',
    level: 3,
    category: 'Speed',
    description: 'Complete a task in under 5 minutes',
    color: 'text-amber-700',
    bgColor: 'bg-amber-100',
    pointsRequired: 0,
    requirements: ['Complete any task in under 5 minutes'],
    rewardType: 'points',
    rewardValue: 15
  },
  'bronze-early-bird': {
    icon: GiSunrise,
    tier: 'bronze',
    level: 4,
    category: 'Time Management',
    description: 'Complete a task before 8 AM',
    color: 'text-amber-700',
    bgColor: 'bg-amber-100',
    pointsRequired: 0,
    requirements: ['Complete a task before 8:00 AM'],
    rewardType: 'points',
    rewardValue: 20
  },
  'bronze-streak-start': {
    icon: GiFire,
    tier: 'bronze',
    level: 5,
    category: 'Consistency',
    description: 'Complete tasks for 3 consecutive days',
    color: 'text-amber-700',
    bgColor: 'bg-amber-100',
    pointsRequired: 0,
    requirements: ['Complete at least 1 task per day for 3 consecutive days'],
    rewardType: 'points',
    rewardValue: 30
  },
  'bronze-creator': {
    icon: GiLightBulb,
    tier: 'bronze',
    level: 6,
    category: 'Creation',
    description: 'Create your first task',
    color: 'text-amber-700',
    bgColor: 'bg-amber-100',
    pointsRequired: 0,
    requirements: ['Create 1 new task'],
    rewardType: 'character',
    rewardValue: 1
  },

  // ========== SILVER TIER (1-6) ==========
  'silver-task-warrior': {
    icon: GiSwordInStone,
    tier: 'silver',
    level: 1,
    category: 'Achievement',
    description: 'Complete 25 tasks',
    color: 'text-gray-500',
    bgColor: 'bg-gray-100',
    pointsRequired: 100,
    requirements: ['Complete 25 tasks total'],
    rewardType: 'points',
    rewardValue: 50
  },
  'silver-lightning-fast': {
    icon: GiLightningBow,
    tier: 'silver',
    level: 2,
    category: 'Speed Challenge',
    description: 'Complete 3 tasks within an hour',
    color: 'text-gray-500',
    bgColor: 'bg-gray-100',
    pointsRequired: 100,
    requirements: ['Complete 3 tasks within 1 hour'],
    rewardType: 'points',
    rewardValue: 75
  },
  'silver-flame-keeper': {
    icon: GiFlame,
    tier: 'silver',
    level: 3,
    category: 'Consistency',
    description: 'Maintain a 7-day streak',
    color: 'text-gray-500',
    bgColor: 'bg-gray-100',
    pointsRequired: 100,
    requirements: ['Complete tasks for 7 consecutive days'],
    rewardType: 'badge',
    rewardValue: 1
  },
  'silver-team-player': {
    icon: GiGroupedDrops,
    tier: 'silver',
    level: 4,
    category: 'Collaboration',
    description: 'Complete 10 family tasks',
    color: 'text-gray-500',
    bgColor: 'bg-gray-100',
    pointsRequired: 100,
    requirements: ['Complete 10 family/shared tasks'],
    rewardType: 'points',
    rewardValue: 100
  },
  'silver-time-master': {
    icon: GiStopwatch,
    tier: 'silver',
    level: 5,
    category: 'Time Management',
    description: 'Complete tasks on time for 5 days',
    color: 'text-gray-500',
    bgColor: 'bg-gray-100',
    pointsRequired: 100,
    requirements: ['Complete all daily tasks on time for 5 consecutive days'],
    rewardType: 'points',
    rewardValue: 125
  },
  'silver-innovator': {
    icon: GiBrain,
    tier: 'silver',
    level: 6,
    category: 'Innovation',
    description: 'Create 10 unique tasks',
    color: 'text-gray-500',
    bgColor: 'bg-gray-100',
    pointsRequired: 100,
    requirements: ['Create 10 different tasks'],
    rewardType: 'character',
    rewardValue: 1
  },

  // ========== GOLD TIER (1-6) ==========
  'gold-champion': {
    icon: GiTrophyCup,
    tier: 'gold',
    level: 1,
    category: 'Achievement',
    description: 'Complete 100 tasks',
    color: 'text-yellow-500',
    bgColor: 'bg-yellow-100',
    pointsRequired: 500,
    requirements: ['Complete 100 tasks total'],
    rewardType: 'points',
    rewardValue: 200
  },
  'gold-rocket-speed': {
    icon: GiRocketFlight,
    tier: 'gold',
    level: 2,
    category: 'Speed Challenge',
    description: 'Complete 10 tasks in 2 hours',
    color: 'text-yellow-500',
    bgColor: 'bg-yellow-100',
    pointsRequired: 500,
    requirements: ['Complete 10 tasks within 2 hours'],
    rewardType: 'badge',
    rewardValue: 1
  },
  'gold-campfire': {
    icon: GiCampfire,
    tier: 'gold',
    level: 3,
    category: 'Consistency',
    description: 'Achieve a 30-day streak',
    color: 'text-yellow-500',
    bgColor: 'bg-yellow-100',
    pointsRequired: 500,
    requirements: ['Complete tasks for 30 consecutive days'],
    rewardType: 'special',
    rewardValue: 500
  },
  'gold-perfectionist': {
    icon: GiBeveledStar,
    tier: 'gold',
    level: 4,
    category: 'Quality',
    description: 'Complete 25 tasks with perfect quality',
    color: 'text-yellow-500',
    bgColor: 'bg-yellow-100',
    pointsRequired: 500,
    requirements: ['Complete 25 tasks with 100% quality rating'],
    rewardType: 'points',
    rewardValue: 300
  },
  'gold-leader': {
    icon: GiCrown,
    tier: 'gold',
    level: 5,
    category: 'Leadership',
    description: 'Lead your family in productivity for a week',
    color: 'text-yellow-500',
    bgColor: 'bg-yellow-100',
    pointsRequired: 500,
    requirements: ['Be the top contributor in family for 7 consecutive days'],
    rewardType: 'character',
    rewardValue: 1
  },
  'gold-master-creator': {
    icon: GiMagicSwirl,
    tier: 'gold',
    level: 6,
    category: 'Creation',
    description: 'Create 50 tasks and templates',
    color: 'text-yellow-500',
    bgColor: 'bg-yellow-100',
    pointsRequired: 500,
    requirements: ['Create 50 tasks or templates'],
    rewardType: 'special',
    rewardValue: 1
  },

  // ========== PLATINUM TIER (1-6) ==========
  'platinum-legend': {
    icon: GiDiamondTrophy,
    tier: 'platinum',
    level: 1,
    category: 'Legend',
    description: 'Complete 500 tasks',
    color: 'text-blue-400',
    bgColor: 'bg-blue-50',
    pointsRequired: 1500,
    requirements: ['Complete 500 tasks total'],
    rewardType: 'points',
    rewardValue: 750
  },
  'platinum-speed-demon': {
    icon: GiTornado,
    tier: 'platinum',
    level: 2,
    category: 'Speed Mastery',
    description: 'Complete 20 tasks in a single day',
    color: 'text-blue-400',
    bgColor: 'bg-blue-50',
    pointsRequired: 1500,
    requirements: ['Complete 20 or more tasks in one day'],
    rewardType: 'special',
    rewardValue: 1
  },
  'platinum-eternal-flame': {
    icon: GiBirdMask,
    tier: 'platinum',
    level: 3,
    category: 'Endurance',
    description: 'Maintain a 100-day streak',
    color: 'text-blue-400',
    bgColor: 'bg-blue-50',
    pointsRequired: 1500,
    requirements: ['Complete tasks for 100 consecutive days'],
    rewardType: 'character',
    rewardValue: 1
  },
  'platinum-perfectionist': {
    icon: GiStarStruck,
    tier: 'platinum',
    level: 4,
    category: 'Excellence',
    description: 'Achieve perfection in 100 tasks',
    color: 'text-blue-400',
    bgColor: 'bg-blue-50',
    pointsRequired: 1500,
    requirements: ['Complete 100 tasks with perfect quality'],
    rewardType: 'badge',
    rewardValue: 1
  },
  'platinum-family-hero': {
    icon: GiKnightBanner,
    tier: 'platinum',
    level: 5,
    category: 'Family Leadership',
    description: 'Help family complete 200 tasks',
    color: 'text-blue-400',
    bgColor: 'bg-blue-50',
    pointsRequired: 1500,
    requirements: ['Contribute to 200 family task completions'],
    rewardType: 'special',
    rewardValue: 1
  },
  'platinum-architect': {
    icon: GiCastle,
    tier: 'platinum',
    level: 6,
    category: 'Creation Mastery',
    description: 'Create 200 tasks and build systems',
    color: 'text-blue-400',
    bgColor: 'bg-blue-50',
    pointsRequired: 1500,
    requirements: ['Create 200 tasks/templates and organize 10 family systems'],
    rewardType: 'character',
    rewardValue: 1
  },

  // ========== DIAMOND TIER (1-6) ==========
  'diamond-grandmaster': {
    icon: Diamond,
    tier: 'diamond',
    level: 1,
    category: 'Mastery',
    description: 'Complete 1000 tasks',
    color: 'text-cyan-400',
    bgColor: 'bg-cyan-50',
    pointsRequired: 5000,
    requirements: ['Complete 1000 tasks total'],
    rewardType: 'special',
    rewardValue: 2000
  },
  'diamond-time-lord': {
    icon: GiStopwatch,
    tier: 'diamond',
    level: 2,
    category: 'Time Mastery',
    description: 'Master time management across all categories',
    color: 'text-cyan-400',
    bgColor: 'bg-cyan-50',
    pointsRequired: 5000,
    requirements: ['Complete 50 tasks in each time category (morning, afternoon, evening)'],
    rewardType: 'character',
    rewardValue: 1
  },
  'diamond-phoenix': {
    icon: GiBirdMask,
    tier: 'diamond',
    level: 3,
    category: 'Immortal',
    description: 'Maintain a 365-day streak',
    color: 'text-cyan-400',
    bgColor: 'bg-cyan-50',
    pointsRequired: 5000,
    requirements: ['Complete tasks for 365 consecutive days'],
    rewardType: 'special',
    rewardValue: 5000
  },
  'diamond-perfectionist': {
    icon: GiCrystalGrowth,
    tier: 'diamond',
    level: 4,
    category: 'Perfection',
    description: 'Achieve diamond-level quality in everything',
    color: 'text-cyan-400',
    bgColor: 'bg-cyan-50',
    pointsRequired: 5000,
    requirements: ['Complete 500 tasks with perfect quality'],
    rewardType: 'badge',
    rewardValue: 1
  },
  'diamond-family-emperor': {
    icon: GiCrown,
    tier: 'diamond',
    level: 5,
    category: 'Empire',
    description: 'Lead a family empire to greatness',
    color: 'text-cyan-400',
    bgColor: 'bg-cyan-50',
    pointsRequired: 5000,
    requirements: ['Lead family to complete 1000 collective tasks'],
    rewardType: 'character',
    rewardValue: 1
  },
  'diamond-universe-creator': {
    icon: GiMagicPortal,
    tier: 'diamond',
    level: 6,
    category: 'Creation God',
    description: 'Create entire productivity universes',
    color: 'text-cyan-400',
    bgColor: 'bg-cyan-50',
    pointsRequired: 5000,
    requirements: ['Create 1000 tasks/templates and establish 50 family systems'],
    rewardType: 'special',
    rewardValue: 3
  },

  // ========== ONYX TIER ==========
  'onyx-transcendent': {
    icon: Gem,
    tier: 'onyx',
    level: 1,
    category: 'Transcendence',
    description: 'Transcend all known limits',
    color: 'text-purple-600',
    bgColor: 'bg-purple-100',
    pointsRequired: 15000,
    requirements: ['Reach the absolute pinnacle of productivity mastery'],
    rewardType: 'special',
    rewardValue: 10000
  },

  // Legacy achievements (maintaining existing ones)
  'three-tasks-hour': {
    icon: GiLightningBow,
    tier: 'silver',
    level: 2,
    category: 'Speed Challenge',
    description: 'Complete 3 tasks in a day within an hour',
    color: 'text-gray-500',
    bgColor: 'bg-gray-100',
    pointsRequired: 100,
    requirements: ['Complete 3 tasks within 1 hour in a single day'],
    rewardType: 'points',
    rewardValue: 75
  },
  'crystal-ball': {
    icon: GiCrystalBall,
    tier: 'gold',
    level: 3,
    category: 'Prediction',
    description: 'Predict and plan ahead perfectly',
    color: 'text-yellow-500',
    bgColor: 'bg-yellow-100',
    pointsRequired: 500,
    requirements: ['Successfully plan and complete 20 scheduled tasks'],
    rewardType: 'badge',
    rewardValue: 1
  }
};

// Helper functions
export const getAchievementIcon = (achievementKey: string): AchievementIconInfo | null => {
  return achievementIcons[achievementKey] || null;
};

export const getAchievementsByTier = (tier: string): Record<string, AchievementIconInfo> => {
  return Object.fromEntries(
    Object.entries(achievementIcons).filter(([_, info]) => info.tier === tier)
  );
};

export const getAchievementsByCategory = (category: string): Record<string, AchievementIconInfo> => {
  return Object.fromEntries(
    Object.entries(achievementIcons).filter(([_, info]) => info.category === category)
  );
};

export const getAllTiers = (): string[] => {
  return Object.keys(achievementTiers);
};

export const getAllCategories = (): string[] => {
  return [...new Set(Object.values(achievementIcons).map(info => info.category))];
};

export const getRandomAchievementIcon = (): AchievementIconInfo => {
  const keys = Object.keys(achievementIcons);
  const randomKey = keys[Math.floor(Math.random() * keys.length)];
  return achievementIcons[randomKey];
};

export const getTierProgress = (userPoints: number, targetTier: string): number => {
  const tier = achievementTiers[targetTier];
  if (!tier) return 0;
  
  const currentTierIndex = Object.values(achievementTiers).findIndex(t => t.pointsRequired <= userPoints);
  const nextTier = Object.values(achievementTiers)[currentTierIndex + 1];
  
  if (!nextTier) return 100;
  
  const progress = ((userPoints - tier.pointsRequired) / (nextTier.pointsRequired - tier.pointsRequired)) * 100;
  return Math.min(progress, 100);
};

export const getUserTier = (userPoints: number): AchievementTier => {
  const tiers = Object.values(achievementTiers).sort((a, b) => b.pointsRequired - a.pointsRequired);
  return tiers.find(tier => userPoints >= tier.pointsRequired) || achievementTiers.bronze;
};

export default achievementIcons; 