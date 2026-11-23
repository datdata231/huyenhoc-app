import React from 'react';
import { AlertTriangle, Info } from 'lucide-react';
import { translateWarning, translatePatternName, translateNature } from '../utils/vietnamese_terms';

export default function WarningsBanner({ warnings = [], patterns = [] }) {
  const hasWarnings = warnings && warnings.length > 0;
  const hasPatterns = patterns && patterns.length > 0;

  if (!hasWarnings && !hasPatterns) return null;

  return (
    <div className="mb-4 space-y-2">
      {/* Warnings Banner in Vietnamese */}
      {hasWarnings && (
        <div className="bg-amber-950/40 border border-amber-500/40 rounded-xl p-3.5 shadow-sm backdrop-blur-sm">
          <div className="flex items-center gap-2 text-amber-400 font-semibold text-sm mb-1.5">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>Khẩu kính & Cảnh báo Kỹ thuật</span>
          </div>
          <ul className="text-xs text-amber-200/90 space-y-1.5 pl-6 list-disc">
            {warnings.map((w, idx) => (
              <li key={idx} className="leading-relaxed">
                {translateWarning(w)}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Detected Patterns Banner in Vietnamese */}
      {hasPatterns && (
        <div className="bg-slate-900/90 border border-slate-700/70 rounded-xl p-3 shadow-sm">
          <div className="flex items-center gap-2 text-sky-400 font-semibold text-xs mb-2">
            <Info className="w-3.5 h-3.5 shrink-0" />
            <span>Cách Cục / Biến Động Nhận Diện Được (Kỳ Môn)</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {patterns.map((p, idx) => {
              const isBad = p.nature === '凶' || p.nature === 'Hung';
              const isGood = p.nature === '吉' || p.nature === 'Cát';
              const vnName = translatePatternName(p.name);
              const vnNature = translateNature(p.nature);

              return (
                <span
                  key={idx}
                  className={`text-[11px] px-2.5 py-1 rounded-lg border leading-tight ${
                    isBad
                      ? 'bg-rose-950/60 text-rose-200 border-rose-700/60'
                      : isGood
                      ? 'bg-emerald-950/60 text-emerald-200 border-emerald-700/60'
                      : 'bg-slate-800 text-slate-200 border-slate-700'
                  }`}
                  title={p.detail || ''}
                >
                  <strong className="font-semibold">{vnName}</strong>
                  {p.palace ? ` (Cung ${p.palace})` : ''} • <span className="opacity-90">{vnNature}</span>
                </span>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
