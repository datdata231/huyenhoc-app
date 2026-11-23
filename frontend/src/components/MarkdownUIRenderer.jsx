import React from 'react';
import {
  Sparkles,
  Compass,
  CheckCircle2,
  ShieldAlert,
  Flame,
  Award,
  Scroll,
  BookOpen,
  Info
} from 'lucide-react';

/**
 * Parses inline markdown:
 * - **bold** -> highlighted styled strong badge
 * - *italic* -> em
 * - cleans up stray markdown artifacts (###, ***, ---)
 */
export function renderInlineFormatted(text) {
  if (!text) return null;

  // Clean any stray markdown symbols at edges
  let cleaned = text.replace(/^#{1,6}\s*/, '').replace(/\*{3,}/g, '');

  // Split by bold (**...**)
  const boldParts = cleaned.split(/(\*\*[^*]+\*\*)/g);
  return boldParts.map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      const inner = part.slice(2, -2);
      return (
        <strong
          key={index}
          className="font-bold text-amber-950 bg-amber-500/15 border border-amber-400/40 px-1.5 py-0.5 rounded mx-0.5 inline-block shadow-2xs"
        >
          {inner}
        </strong>
      );
    }

    // Handle *italic* if any
    const italicParts = part.split(/(\*[^*]+\*)/g);
    if (italicParts.length > 1) {
      return italicParts.map((sub, sIdx) => {
        if (sub.startsWith('*') && sub.endsWith('*')) {
          return (
            <em key={`${index}-${sIdx}`} className="italic text-stone-700">
              {sub.slice(1, -1)}
            </em>
          );
        }
        return sub;
      });
    }

    return part;
  });
}

/**
 * Parses raw markdown text into structured UI blocks:
 * - lead (intro greeting)
 * - section (numbered / titled group)
 *   - labeled items (- **Label:** Content)
 *   - bullet items (- Content)
 *   - paragraph items
 */
export function parseMarkdownToBlocks(text) {
  if (!text) return [];

  const lines = text.split(/\r?\n/);
  const blocks = [];
  let currentLead = [];
  let currentSection = null;

  for (let rawLine of lines) {
    let line = rawLine.trim();
    if (!line || line === '---' || line === '***' || line === '===') {
      continue;
    }

    // Check for headings: #### 1. Title or ### Title or 1. Title
    const headingMatch = line.match(/^#{1,6}\s*(.+)$/) || line.match(/^(\d+\.)\s+([A-ZÀ-Ỹ0-9].+)$/);

    if (headingMatch) {
      if (currentSection) {
        blocks.push(currentSection);
      } else if (currentLead.length > 0) {
        blocks.push({ type: 'lead', lines: [...currentLead] });
        currentLead = [];
      }

      let rawTitle = headingMatch[1].startsWith('#')
        ? headingMatch[1].replace(/^#{1,6}\s*/, '')
        : (headingMatch[2] ? headingMatch[1] + ' ' + headingMatch[2] : headingMatch[1]);

      rawTitle = rawTitle.replace(/\*\*/g, '').trim();

      let num = '';
      let title = rawTitle;
      const numMatch = rawTitle.match(/^(\d+)[.:\s]+(.*)$/);
      if (numMatch) {
        num = numMatch[1];
        title = numMatch[2].trim();
      }

      currentSection = {
        type: 'section',
        number: num,
        title: title || rawTitle,
        items: []
      };
      continue;
    }

    if (!currentSection) {
      currentLead.push(line);
      continue;
    }

    // Handle bullet or labeled item
    const bulletMatch = line.match(/^[-*•+]\s*(.*)$/);
    const content = bulletMatch ? bulletMatch[1].trim() : line;

    // Check if line has a bold label at start: **Label:** content
    const labeledMatch = content.match(/^\*\*(.+?)\*\*[:：]?\s*(.*)$/);
    if (labeledMatch) {
      let label = labeledMatch[1].trim().replace(/[:：]$/, '');
      currentSection.items.push({
        type: 'labeled',
        label: label,
        content: labeledMatch[2].trim()
      });
    } else if (bulletMatch) {
      currentSection.items.push({
        type: 'bullet',
        content: content
      });
    } else {
      currentSection.items.push({
        type: 'paragraph',
        content: line
      });
    }
  }

  if (currentLead.length > 0) {
    blocks.push({ type: 'lead', lines: currentLead });
  }
  if (currentSection) {
    blocks.push(currentSection);
  }

  return blocks;
}

/**
 * Modern Oriental UI Markdown Renderer
 */
export default function MarkdownUIRenderer({ text, mode = 'master' }) {
  if (!text) return null;

  const blocks = parseMarkdownToBlocks(text);

  if (blocks.length === 0) {
    return (
      <div className="text-xs sm:text-sm text-stone-800 leading-relaxed">
        {renderInlineFormatted(text)}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {blocks.map((block, bIdx) => {
        // 1. Lead Greeting Block
        if (block.type === 'lead') {
          return (
            <div
              key={bIdx}
              className="p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-amber-50/90 via-emerald-50/50 to-amber-50/90 border border-amber-900/15 shadow-xs flex items-start gap-3"
            >
              <Scroll className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
              <div className="text-xs sm:text-sm text-stone-800 leading-relaxed font-medium space-y-1.5 flex-1">
                {block.lines.map((line, lIdx) => (
                  <p key={lIdx}>{renderInlineFormatted(line)}</p>
                ))}
              </div>
            </div>
          );
        }

        // 2. Section Block
        if (block.type === 'section') {
          return (
            <div
              key={bIdx}
              className="oriental-card rounded-2xl p-4 sm:p-5 shadow-sm space-y-3 bg-[#FFFEFC] border border-amber-900/15"
            >
              {/* Section Header */}
              <div className="flex items-center gap-2.5 pb-2.5 border-b border-amber-900/10">
                {block.number ? (
                  <span className="w-6 h-6 rounded-full bg-gradient-to-br from-amber-600 to-amber-700 text-white font-bold text-xs flex items-center justify-center shadow-xs shrink-0">
                    {block.number}
                  </span>
                ) : (
                  <Sparkles className="w-4 h-4 text-amber-700 shrink-0" />
                )}
                <h3 className="font-bold text-sm sm:text-base text-stone-900 tracking-tight">
                  {block.title}
                </h3>
              </div>

              {/* Section Items */}
              <div className="space-y-2.5 pt-0.5">
                {block.items.map((item, itemIdx) => {
                  // Labeled Key-Value item (e.g. - **Tư thế hành động:** ...)
                  if (item.type === 'labeled') {
                    const lbl = item.label.toLowerCase();
                    let badgeStyle = "bg-amber-100 text-amber-950 border-amber-300";
                    let cardStyle = "bg-[#FFFDF9] border-amber-900/10";
                    let IconComp = CheckCircle2;

                    if (
                      lbl.includes('phòng tránh') ||
                      lbl.includes('cẩn trọng') ||
                      lbl.includes('hung') ||
                      lbl.includes('hạn chế') ||
                      lbl.includes('không vong') ||
                      lbl.includes('cảnh báo') ||
                      lbl.includes('thách thức')
                    ) {
                      badgeStyle = "bg-rose-100 text-rose-950 border-rose-300";
                      cardStyle = "bg-[#FFF9F9] border-rose-200/80";
                      IconComp = ShieldAlert;
                    } else if (
                      lbl.includes('cát') ||
                      lbl.includes('thuận') ||
                      lbl.includes('cơ hội') ||
                      lbl.includes('sinh') ||
                      lbl.includes('khai') ||
                      lbl.includes('ưu thế') ||
                      lbl.includes('điểm mạnh')
                    ) {
                      badgeStyle = "bg-emerald-100 text-emerald-950 border-emerald-300";
                      cardStyle = "bg-[#F7FBF8] border-emerald-200/80";
                      IconComp = Sparkles;
                    } else if (lbl.includes('phương vị') || lbl.includes('hướng') || lbl.includes('phương hướng')) {
                      badgeStyle = "bg-sky-100 text-sky-950 border-sky-300";
                      cardStyle = "bg-[#F8FAFD] border-sky-200/80";
                      IconComp = Compass;
                    } else if (lbl.includes('chiến lược') || lbl.includes('hành động') || lbl.includes('quý nhân')) {
                      badgeStyle = "bg-amber-100 text-amber-950 border-amber-300";
                      cardStyle = "bg-[#FFFDF9] border-amber-200/80";
                      IconComp = Award;
                    }

                    return (
                      <div
                        key={itemIdx}
                        className={`p-3 rounded-xl border ${cardStyle} shadow-2xs space-y-1.5 transition`}
                      >
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`inline-flex items-center gap-1 text-[11px] sm:text-xs font-bold px-2 py-0.5 rounded-md border ${badgeStyle} shadow-2xs`}
                          >
                            <IconComp className="w-3.5 h-3.5 shrink-0" />
                            <span>{item.label}</span>
                          </span>
                        </div>
                        <div className="text-xs sm:text-sm text-stone-800 leading-relaxed pl-0.5">
                          {renderInlineFormatted(item.content)}
                        </div>
                      </div>
                    );
                  }

                  // Bullet item (- Cửa hành sự ...)
                  if (item.type === 'bullet') {
                    return (
                      <div
                        key={itemIdx}
                        className="flex items-start gap-2.5 p-2.5 rounded-xl bg-[#FAF7F0]/70 border border-stone-200/70 hover:border-amber-700/30 transition shadow-2xs"
                      >
                        <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-amber-600 shrink-0" />
                        <div className="text-xs sm:text-sm text-stone-800 leading-relaxed flex-1">
                          {renderInlineFormatted(item.content)}
                        </div>
                      </div>
                    );
                  }

                  // Standard paragraph
                  return (
                    <p key={itemIdx} className="text-xs sm:text-sm text-stone-800 leading-relaxed">
                      {renderInlineFormatted(item.content)}
                    </p>
                  );
                })}
              </div>
            </div>
          );
        }

        return null;
      })}
    </div>
  );
}
