"use client";

import { Leaf } from "lucide-react";
import { useEcoStore } from "@/lib/store";

export function Brand({ onClick }: { onClick?: () => void }) {
  const setView = useEcoStore((s) => s.setView);
  const user = useEcoStore((s) => s.user);

  return (
    <button
      onClick={() => {
        if (onClick) onClick();
        else if (user) setView("dashboard");
        else setView("landing");
      }}
      className="flex items-center gap-2 text-left"
    >
      <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-emerald-500 to-green-700 text-white shadow-sm">
        <Leaf size={18} />
      </span>
      <span className="flex flex-col leading-none">
        <span className="text-base font-extrabold tracking-tight">
          EcoTrack <span className="text-emerald-600">Lite</span>
        </span>
        <span className="text-[10px] font-medium text-muted-foreground">
          Small actions · Big impact
        </span>
      </span>
    </button>
  );
}
