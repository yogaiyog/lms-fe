"use client";

import { motion } from "framer-motion";
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
            className={`relative flex flex-1 flex-col items-center gap-0.5 rounded-xl py-1.5 text-[10px] font-semibold`}
          >
            {active && (
              <motion.div
                layoutId="mobile-nav-active"
                className="absolute inset-x-1 inset-y-0.5 rounded-xl bg-brand-blue-50"
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
            )}
            {item && <item.icon size={19} className={`relative z-10 ${active ? "text-brand-blue-600" : theme.textMuted}`} />}
            <span className={`relative z-10 ${active ? "text-brand-blue-600" : theme.textMuted}`}>
              {item?.label.split(" ")[0]}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
