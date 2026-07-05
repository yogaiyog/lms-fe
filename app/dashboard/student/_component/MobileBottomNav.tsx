"use client";

import type { Theme, Segment } from "./types";
import { NAV_ITEMS, MOBILE_NAV } from "./types";

type Props = {
  theme: Theme;
  segment: Segment;
  onNavigate: (key: Segment) => void;
};

export default function MobileBottomNav({ theme, segment, onNavigate }: Props) {
  return (
    <nav className={`md:hidden fixed bottom-0 inset-x-0 z-30 border-t ${theme.border} ${theme.card} px-2 py-2 flex items-center justify-between`}>
      {MOBILE_NAV.map((key) => {
        const item = NAV_ITEMS.find((n) => n.key === key);
        const active = segment === key;
        return (
          <button
            key={key}
            onClick={() => onNavigate(key)}
            className={`flex flex-1 flex-col items-center gap-0.5 rounded-xl py-1.5 text-[10px] font-semibold ${
              active ? "text-blue-600" : theme.textMuted
            }`}
          >
            {item && <item.icon size={19} />}
            {item?.label.split(" ")[0]}
          </button>
        );
      })}
    </nav>
  );
}
