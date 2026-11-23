import React from 'react';
import { ShieldCheck } from 'lucide-react';

export default function DisclaimerFooter({ system = 'chung' }) {
  let text = 'Huyền học là mô hình truyền thống cung cấp góc nhìn tham khảo, không thay thế quyết định thực tế.';
  if (system === 'qimen') {
    text = 'Kỳ Môn Độn Giáp thuộc hệ thống thuật số truyền thống phương Đông, dùng để hỗ trợ quan sát thời cơ và xu hướng, không thay thế các tư vấn chuyên môn về y tế, pháp luật, tài chính. Trước các quyết định quan trọng, hãy luôn kết hợp dữ liệu thực tế để phán đoán lý tính.';
  } else if (system === 'ziwei') {
    text = 'Tử Vi Đẩu Số là hệ thống mô hình mệnh lý truyền thống, cung cấp góc nhìn tự quan sát về khuynh hướng và bài học cuộc đời. Lá số không phải mệnh lệnh bất biến; nỗ lực, môi trường và hành động kiên trì mới là điều quyết định.';
  } else if (system === 'bazi') {
    text = 'Tứ Trụ Bát Tự là hệ thống mệnh lý ngũ hành truyền thống, phản ánh khí thế và chu kỳ vận hạn. Mệnh cục là gốc rễ, nhưng ý chí, việc làm thiện lành và học hỏi thực tế luôn có thể cải biến tương lai.';
  }

  return (
    <div className="mt-8 pt-4 pb-2 border-t border-slate-800 text-center">
      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900/60 border border-slate-800 text-slate-400 text-[11px] mb-2">
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
        <span>Miễn trừ trách nhiệm chuẩn mực</span>
      </div>
      <p className="text-[11px] text-slate-400 leading-relaxed max-w-xl mx-auto px-4 italic">
        {text}
      </p>
      <div className="text-[10px] text-slate-500 mt-2">
        © 2026 Huyền Học Ba Hệ Thống • Single Source of Truth
      </div>
    </div>
  );
}
