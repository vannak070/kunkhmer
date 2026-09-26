import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { BellPlus, Check } from "lucide-react";
import { toast } from "sonner";
import { useFan } from "../../contexts/FanContext";
import { useI18n } from "../../i18n/LanguageContext";
import { fanApi } from "../../utils/fanApi";

interface FollowButtonProps {
  fighterId: string;
  fighterName: string;
  className?: string;
  /** Show the public follower count under the button. */
  showCount?: boolean;
}

export function FollowButton({ fighterId, fighterName, className = "", showCount = true }: FollowButtonProps) {
  const { t, tn } = useI18n();
  const { fan, followedIds, toggleFollow } = useFan();
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);
  const [count, setCount] = useState<number | null>(null);
  const following = followedIds.has(fighterId);

  useEffect(() => {
    if (!showCount) return;
    let alive = true;
    fanApi.followerCount(fighterId).then((r) => alive && setCount(r.count)).catch(() => {});
    return () => {
      alive = false;
    };
  }, [fighterId, showCount]);

  const onClick = async () => {
    if (!fan) {
      toast(t("follow.signInToFollow"));
      navigate(`/account?next=${encodeURIComponent(window.location.pathname)}`);
      return;
    }
    setBusy(true);
    try {
      const nowFollowing = await toggleFollow(fighterId);
      setCount((c) => (c == null ? c : Math.max(0, c + (nowFollowing ? 1 : -1))));
      toast.success(t(nowFollowing ? "follow.followed" : "follow.unfollowed", { name: fighterName }));
    } catch {
      toast.error(t("common.error"));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="inline-flex flex-col items-center gap-1">
      <button
        type="button"
        onClick={onClick}
        disabled={busy}
        aria-pressed={following}
        className={`inline-flex items-center gap-2 px-6 py-3.5 rounded-xl font-bold text-sm transition-all disabled:opacity-60 ${
          following ? "bg-white text-[#0A3D91] hover:bg-gray-100" : "bg-[#C8102E] text-white hover:bg-red-700"
        } ${className}`}
      >
        {following ? <Check className="w-4 h-4" aria-hidden /> : <BellPlus className="w-4 h-4" aria-hidden />}
        {following ? t("follow.following") : t("follow.follow")}
      </button>
      {showCount && count != null && count > 0 && (
        <span className="text-xs text-white/60 font-semibold">{tn("follow.followers", count)}</span>
      )}
    </div>
  );
}
