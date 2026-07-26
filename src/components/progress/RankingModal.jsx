import React, { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { initialsFromName } from "@/components/profile/ProfileAvatarPicker";

const tiers = [
  { label: "Bronze", min: 0, max: 500, color: "#CD7F32", icon: "🥉" },
  { label: "Prata", min: 500, max: 1500, color: "#C0C0C0", icon: "🥈" },
  { label: "Ouro", min: 1500, max: 3000, color: "#FFD700", icon: "🥇" },
  { label: "Platina", min: 3000, max: 6000, color: "#7DD3FC", icon: "💠" },
  { label: "Diamante", min: 6000, max: Infinity, color: "#A78BFA", icon: "💎" },
];

function getTier(xp) {
  return tiers.find((tier) => xp >= tier.min && xp < tier.max) || tiers[tiers.length - 1];
}

function RankAvatar({ url, name }) {
  const [failed, setFailed] = useState(false);
  const initials = initialsFromName(name || "U");

  if (!url || failed) {
    return (
      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-xs font-bold text-white/80 ring-1 ring-white/15">
        {initials}
      </div>
    );
  }

  return (
    <img
      src={url}
      alt={name || "Avatar"}
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
      className="h-9 w-9 rounded-full object-cover ring-1 ring-white/15"
    />
  );
}

export default function RankingModal({ open, onClose, currentXp, currentRank, leaderboard = [] }) {
  const [showTop100, setShowTop100] = useState(false);
  const limit = showTop100 ? 100 : 10;
  const visibleBoard = leaderboard.slice(0, limit);

  useEffect(() => {
    if (!open) setShowTop100(false);
  }, [open]);

  const tier = getTier(currentXp || 0);
  const nextTier = tiers[tiers.indexOf(tier) + 1] || null;
  const tierProgress = nextTier ? Math.min(100, Math.round(((currentXp - tier.min) / (nextTier.min - tier.min)) * 100)) : 100;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto border-white/10 bg-[#0F1C1B] text-white">
        <DialogHeader>
          <DialogTitle className="text-xl font-black">Ranking Global</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-white/35">Sua posição</p>
                <p className="mt-2 text-3xl font-black text-white">{currentRank ? `#${currentRank}` : '—'}</p>
              </div>
              <div className="text-right">
                <p className="text-3xl">{tier.icon}</p>
                <p className="text-sm font-bold" style={{ color: tier.color }}>{tier.label}</p>
              </div>
            </div>
            <div className="mt-4 space-y-2">
              <div className="flex items-center justify-between text-xs text-white/55">
                <span>{tier.label}</span>
                <span>{nextTier ? `${currentXp}/${nextTier.min} XP` : `${currentXp} XP`}</span>
              </div>
              <Progress value={tierProgress} className="h-2 bg-white/10 [&>div]:bg-[#CEF17B]" />
              {nextTier && <p className="mt-1 text-xs text-white/45">Faltam {Math.max(0, nextTier.min - currentXp)} XP para {nextTier.label}</p>}
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-4">
            <div className="mb-3 flex items-center justify-between gap-3">
              <p className="text-xs uppercase tracking-[0.2em] text-white/35">
                Top {limit} Global
              </p>
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <span className={`text-xs font-semibold ${!showTop100 ? "text-[#CEF17B]" : "text-white/40"}`}>
                  10
                </span>
                <Switch
                  checked={showTop100}
                  onCheckedChange={setShowTop100}
                  aria-label="Alternar entre Top 10 e Top 100"
                  className="data-[state=checked]:bg-[#CEF17B] data-[state=unchecked]:bg-white/20"
                />
                <span className={`text-xs font-semibold ${showTop100 ? "text-[#CEF17B]" : "text-white/40"}`}>
                  100
                </span>
              </label>
            </div>

            <div className="max-h-[45vh] space-y-2 overflow-y-auto pr-1">
              {visibleBoard.map((entry, index) => (
                <div
                  key={entry.id || index}
                  className={`flex items-center justify-between rounded-2xl border px-3 py-3 ${
                    entry.is_current_user
                      ? "border-[#CEF17B]/30 bg-[#CEF17B]/10"
                      : "border-white/8 bg-white/[0.03]"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <RankAvatar url={entry.avatar_url} name={entry.display_name} />
                    <div>
                      <p className="text-sm font-semibold text-white">
                        <span className="mr-1.5 text-white/35">#{entry.posicao || index + 1}</span>
                        {entry.display_name || 'Usuário'}
                      </p>
                      <p className="text-xs text-white/45">Nível {entry.nivel || 1}</p>
                    </div>
                  </div>
                  <p className="text-sm font-bold text-[#CEF17B]">{entry.total_xp || 0} XP</p>
                </div>
              ))}
              {visibleBoard.length === 0 && (
                <p className="py-6 text-center text-xs text-white/40">Nenhum ranking disponível ainda.</p>
              )}
            </div>
            <p className="mt-3 text-[11px] leading-relaxed text-white/40">
              Fotos exibidas são fotos de perfil públicas, com autorização do usuário.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
