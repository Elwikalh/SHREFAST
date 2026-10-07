"use client";

import { motion } from "motion/react";
import { QuickAddButton } from "./quick-add-button";
import type { SandwichBreadChoice } from "./sandwich-bread";

function FinoBreadIcon() {
  return (
    <svg viewBox="0 0 48 48" aria-hidden="true" className="h-7 w-7">
      <path
        d="M8.5 29.5c1.8-10.2 10-17 21.2-15.9 7.5.7 11.2 5.1 9.7 11.3-1.8 7.5-9.6 11.8-20.4 10.8-7.8-.7-11.6-2.8-10.5-6.2Z"
        fill="currentColor"
        opacity=".18"
      />
      <path
        d="M8.5 29.5c1.8-10.2 10-17 21.2-15.9 7.5.7 11.2 5.1 9.7 11.3-1.8 7.5-9.6 11.8-20.4 10.8-7.8-.7-11.6-2.8-10.5-6.2Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.6"
        strokeLinejoin="round"
      />
      <path
        d="m18 18 4 5m3-7 4 5m3-4 3 4"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function BaladiHalvesIcon() {
  return (
    <svg viewBox="0 0 48 48" aria-hidden="true" className="h-7 w-7">
      <path
        d="M7 27.5A13 13 0 0 1 20 14.5v26A13 13 0 0 1 7 27.5Zm21 0a13 13 0 0 1 13-13v26a13 13 0 0 1-13-13Z"
        fill="currentColor"
        opacity=".18"
      />
      <path
        d="M7 27.5A13 13 0 0 1 20 14.5v26A13 13 0 0 1 7 27.5Zm21 0a13 13 0 0 1 13-13v26a13 13 0 0 1-13-13Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.6"
        strokeLinejoin="round"
      />
      <path
        d="M11.5 27.5c0-3.4 1.7-6.3 4.5-8m16 0c2.8 1.7 4.5 4.6 4.5 8"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function SandwichBreadSelector({
  parentId,
  nameAr,
  choices,
  isAr = true,
}: {
  parentId: string;
  nameAr: string;
  choices: SandwichBreadChoice[];
  isAr?: boolean;
}) {
  if (!choices.length)
    return (
      <p
        className="w-full rounded-xl border border-dashed border-[var(--line-strong)] bg-[var(--surface-muted)] p-3 text-center text-xs font-bold text-[var(--ink)]/55"
        role="status"
      >
        {isAr ? "الصنف غير متاح حاليًا" : "Currently unavailable"}
      </p>
    );

  return (
    <section
      className="w-full overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--surface-muted)]"
      aria-label={
        isAr ? `اختيار نوع العيش والعدد لـ ${nameAr}` : "Bread type and quantity"
      }
    >
      <header className="flex items-center justify-between gap-3 border-b border-[var(--line)] px-3 py-2.5">
        <div className="min-w-0">
          <p className="text-xs font-black text-[var(--ink)]">
            {isAr ? "اختار العيش" : "Choose bread"}
          </p>
          <p className="mt-0.5 text-[10px] font-bold text-[var(--ink)]/45">
            {isAr ? "حدد الكمية لكل نوع" : "Set a quantity for each type"}
          </p>
        </div>
        <span className="shrink-0 text-[10px] font-bold text-[var(--ink)]/40">
          {isAr ? "سعر الساندوتش" : "Per sandwich"}
        </span>
      </header>

      <div className="divide-y divide-[var(--line)]">
        {choices.map((choice, index) => {
          const isBaladi = choice.kind === "baladi";
          const displayName = isAr
            ? isBaladi
              ? "عيش بلدي نصين"
              : "عيش فينو"
            : isBaladi
              ? "Baladi bread · 2 halves"
              : "Fino roll";
          return (
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.18, delay: index * 0.035 }}
              key={choice.id}
              className="group/bread relative flex min-w-0 flex-col gap-2 bg-white px-2.5 py-2 transition-all duration-200 hover:z-10 hover:bg-[#fffaf0] focus-within:z-10 focus-within:bg-[#fffaf0] sm:flex-row sm:items-center sm:gap-2.5"
            >
              <div className="flex min-w-0 w-full items-center gap-2 sm:flex-1">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--amber)]/14 text-[var(--amber-deep)] transition-transform duration-200 group-hover/bread:scale-110 group-focus-within/bread:scale-110">
                  {isBaladi ? <BaladiHalvesIcon /> : <FinoBreadIcon />}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-black leading-4 text-[var(--ink)]">
                    {displayName}
                  </p>
                  <p className="num mt-0.5 text-xs font-black text-[var(--amber-deep)]">
                    {choice.priceEGP} {isAr ? "ج.م" : "EGP"}
                  </p>
                </div>
              </div>
              <QuickAddButton
                menuItemId={choice.id}
                extrasProductId={parentId}
                nameAr={`${nameAr} — ${choice.nameAr}`}
                priceEGP={choice.priceEGP}
                label={isAr ? `عدد ${choice.nameAr}` : `Quantity ${choice.nameEn}`}
                alwaysShowCounter
                compactCounter
              />
              <div
                role="tooltip"
                className="pointer-events-none absolute bottom-[calc(100%+8px)] start-1/2 hidden w-max max-w-[13rem] -translate-x-1/2 items-center gap-3 rounded-2xl border border-[var(--line)] bg-[var(--ink)] px-3 py-2.5 text-white opacity-0 shadow-[var(--shadow-lg)] transition duration-200 [@media(hover:hover)]:flex group-hover/bread:opacity-100 group-focus-within/bread:opacity-100"
              >
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/10 text-[var(--amber)]">
                  {isBaladi ? <BaladiHalvesIcon /> : <FinoBreadIcon />}
                </span>
                <span>
                  <span className="block text-sm font-black">{displayName}</span>
                  <span className="num mt-0.5 block text-xs font-bold text-white/65">
                    {choice.priceEGP} {isAr ? "ج.م للساندوتش" : "EGP per sandwich"}
                  </span>
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
