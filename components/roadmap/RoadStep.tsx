'use client';

import { motion } from 'framer-motion';
import type { RoadmapItem } from './types';
import { CheckIcon, LockIcon } from './icons';

interface RoadStepProps {
  item: RoadmapItem;
  index: number;
  xPercent: number;
  y: number;
  animated: boolean;
  onSelect?: (item: RoadmapItem) => void;
}

export function RoadStep({ item, index, xPercent, y, animated, onSelect }: RoadStepProps) {
  const { title, description, icon, color, completed, locked, current, lessons, duration } = item;

  const badgeColor = locked ? '#94a3b8' : color;
  const sizeClasses = current ? 'h-28 w-28 md:h-32 md:w-32' : 'h-24 w-24 md:h-28 md:w-28';

  return (
    <motion.div
      className="absolute flex w-32 -translate-x-1/2 -translate-y-1/2 flex-col items-center md:w-40"
      style={{ left: `${xPercent}%`, top: y }}
      initial={animated ? { opacity: 0, y: 28 } : false}
      whileInView={animated ? { opacity: 1, y: 0 } : undefined}
      viewport={{ once: true, amount: 0.6 }}
      transition={{ duration: 0.5, ease: 'easeOut', delay: index * 0.08 }}
    >
      <div className="relative">
        {/* ambient pulse ring for the current step */}
        {current && !locked && (
          <motion.span
            className="absolute -inset-3 rounded-full"
            style={{ backgroundColor: color }}
            initial={{ opacity: 0.25, scale: 0.92 }}
            animate={{ opacity: [0.25, 0, 0.25], scale: [0.92, 1.35, 0.92] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            aria-hidden="true"
          />
        )}

        <motion.button
          type="button"
          disabled={locked}
          aria-label={locked ? `${title}, locked` : completed ? `${title}, completed` : title}
          aria-current={current ? 'step' : undefined}
          onClick={() => !locked && onSelect?.(item)}
          whileHover={!locked ? { scale: 1.08, y: -6 } : undefined}
          whileTap={!locked ? { scale: 0.95 } : undefined}
          className={[
            sizeClasses,
            'relative flex items-center justify-center rounded-full border-4 bg-white shadow-lg',
            'transition-shadow duration-200 ease-out',
            'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-400',
            locked ? 'cursor-not-allowed opacity-50 shadow-md' : 'cursor-pointer hover:shadow-2xl',
            current && !locked ? 'shadow-xl' : '',
          ].join(' ')}
          style={{
            borderColor: badgeColor,
            boxShadow: current && !locked ? `0 0 0 6px ${color}22, 0 12px 24px -8px ${color}55` : undefined,
          }}
        >
          <motion.span
            className="flex items-center justify-center text-3xl md:text-4xl"
            style={{ color: locked ? '#94a3b8' : color }}
            whileHover={!locked ? { rotate: 10 } : undefined}
            transition={{ type: 'spring', stiffness: 300, damping: 12 }}
          >
            {locked ? <LockIcon className="h-7 w-7 md:h-8 md:w-8" /> : icon}
          </motion.span>

          {completed && (
            <span
              className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 text-white shadow-md ring-2 ring-white"
              aria-hidden="true"
            >
              <CheckIcon />
            </span>
          )}
        </motion.button>
      </div>

      <div className="mt-3 text-center">
        <p className={['text-sm font-semibold leading-tight', locked ? 'text-slate-400' : 'text-slate-800'].join(' ')}>
          {title}
        </p>

        {description && (
          <p className={['mt-0.5 line-clamp-2 text-xs leading-snug', locked ? 'text-slate-300' : 'text-slate-500'].join(' ')}>
            {description}
          </p>
        )}

        {(lessons !== undefined || duration) && (
          <div
            className={['mt-1 flex items-center justify-center gap-1.5 text-[11px] font-medium', locked ? 'text-slate-300' : 'text-slate-400'].join(
              ' ',
            )}
          >
            {lessons !== undefined && <span>{lessons} lessons</span>}
            {lessons !== undefined && duration && <span aria-hidden="true">&middot;</span>}
            {duration && <span>{duration}</span>}
          </div>
        )}
      </div>
    </motion.div>
  );
}
