import { Trophy, Medal, Star, Zap, Gem, Flame, ShieldCheck, Crown } from "lucide-react";

export default function getUserBadge(rating = 0, wins = 0) {

  const level = Math.floor(rating / 100);

  if (wins >= 500)
    return {
      name: "Immortal",
      color: "text-emerald-400",
      icon: Crown
    };

  if (level >= 50)
    return {
      name: "Skill Titan",
      color: "text-indigo-400",
      icon: ShieldCheck
    };

  if (wins >= 100)
    return {
      name: "Grand Legend",
      color: "text-purple-400",
      icon: Flame
    };

  if (level >= 25)
    return {
      name: "Arena Master",
      color: "text-red-400",
      icon: Zap
    };

  if (wins >= 50)
    return {
      name: "Diamond Elite",
      color: "text-blue-400",
      icon: Gem
    };

  if (wins >= 20)
    return {
      name: "Platinum Ace",
      color: "text-cyan-400",
      icon: Zap
    };

  if (level >= 10)
    return {
      name: "Gold Gladiator",
      color: "text-yellow-400",
      icon: Star
    };

  if (level >= 5)
    return {
      name: "Silver Striker",
      color: "text-slate-300",
      icon: Medal
    };

  return {
    name: "Bronze Warrior",
    color: "text-orange-400",
    icon: Trophy
  };
}