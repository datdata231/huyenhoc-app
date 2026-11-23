import React, { useState, useEffect } from 'react';
import { Bell, CheckCircle2, AlertCircle, Send, X, Clock, Sparkles } from 'lucide-react';
import {
  isPushNotificationSupported,
  getExistingSubscription,
  subscribeUserTo8amPush,
  sendInstantTestNotification,
} from '../utils/push';

export default function NotificationModal({ isOpen, onClose, activeProfile, theme }) {
  const [isSupported, setIsSupported] = useState(true);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [testing, setTesting] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen) {
      checkStatus();
    }
  }, [isOpen]);

  const checkStatus = async () => {
    const supported = isPushNotificationSupported();
    setIsSupported(supported);
    if (supported) {
      const sub = await getExistingSubscription();
      setIsSubscribed(!!sub);
    }
  };

  const handleSubscribe = async () => {
    setLoading(true);
    setError(null);
    setMessage(null);
    try {
      await subscribeUserTo8amPush(activeProfile?.id || '');
      setIsSubscribed(true);
      setMessage('Đã bật nhận thông báo 8h sáng thành công! Bạn có thể bấm nút thử nghiệm bên dưới.');
    } catch (err) {
      setError(err.message || 'Không thể bật thông báo.');
    } finally {
      setLoading(false);
    }
  };

  const handleTestNotification = async () => {
    setTesting(true);
    setError(null);
    setMessage(null);
    try {
      await sendInstantTestNotification();
      setMessage('Đã gửi thông báo thử nghiệm! Hãy vuốt thanh thông báo trên điện thoại xuống để xem nhé.');
    } catch (err) {
      setError(err.message || 'Lỗi khi gửi thông báo thử nghiệm.');
    } finally {
      setTesting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-[#FFFDF9] border border-amber-900/30 rounded-3xl shadow-2xl p-5 sm:p-6 overflow-hidden">
        {/* Subtle Oriental cloud and seal ornament */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl pointer-events-none" />
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full bg-amber-100/60 hover:bg-amber-200/80 text-amber-900 transition"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header with Traditional Bell Icon */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-600 to-amber-800 flex items-center justify-center shadow-md text-white">
            <Bell className="w-6 h-6 animate-pulse-subtle" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-amber-950 font-serif">Điểm Chuông 8:00 Sáng</h3>
              <span className="seal-stamp text-[9px]">CÁT NHẬT</span>
            </div>
            <p className="text-xs text-stone-600">Thông báo vận trình ngày mới vào điện thoại</p>
          </div>
        </div>

        {/* Feature Explanation */}
        <div className="bg-[#FAF7F0] border border-amber-900/15 rounded-2xl p-3.5 mb-4 text-xs text-stone-700 space-y-2">
          <div className="flex items-start gap-2">
            <Clock className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-amber-950">Tự Động 8:00 AM Hàng Ngày:</span>
              <p className="text-stone-600 text-[11px] leading-relaxed">
                Hệ thống tự động kích hoạt máy chủ lúc 8:00 sáng (Giờ Thìn cát khí) và gửi thông báo đến màn hình khóa điện thoại của bạn.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <Sparkles className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-amber-950">Không Lo Chờ Đợi Khởi Động:</span>
              <p className="text-stone-600 text-[11px] leading-relaxed">
                Máy chủ được đánh thức sẵn, bạn chỉ cần chạm vào thông báo là xem ngay vận trình hôm nay mà không bị trễ.
              </p>
            </div>
          </div>
        </div>

        {/* Feedback Alerts */}
        {message && (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs mb-4">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
            <span>{message}</span>
          </div>
        )}
        {error && (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-50 border border-rose-300 text-rose-800 text-xs mb-4">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{error}</span>
          </div>
        )}

        {/* Action Controls */}
        <div className="space-y-2.5">
          {!isSupported ? (
            <div className="text-center p-3 text-xs text-amber-800 bg-amber-50 rounded-xl border border-amber-200">
              Trình duyệt hiện tại chưa hỗ trợ Web Push Notification. Bạn hãy mở trang này bằng trình duyệt Chrome hoặc Samsung Internet trên điện thoại nhé.
            </div>
          ) : isSubscribed ? (
            <>
              <div className="flex items-center justify-center gap-2 py-2 px-3 bg-emerald-100/60 border border-emerald-400 text-emerald-900 rounded-xl text-xs font-bold">
                <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                <span>Thiết bị này đã bật nhận thông báo 8h sáng!</span>
              </div>
              <button
                onClick={handleTestNotification}
                disabled={testing}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white font-bold text-xs shadow-md transition disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{testing ? 'Đang gửi tín hiệu...' : 'Thử Gửi Thông Báo Tới Điện Thoại Ngay'}</span>
              </button>
            </>
          ) : (
            <button
              onClick={handleSubscribe}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-red-700 via-amber-700 to-red-800 hover:brightness-110 text-white font-bold text-xs shadow-lg transition disabled:opacity-50 tracking-wide uppercase"
            >
              <Bell className="w-4 h-4" />
              <span>{loading ? 'Đang thiết lập...' : 'Bật Nhận Thông Báo 8:00 AM Hàng Ngày'}</span>
            </button>
          )}

          <button
            onClick={onClose}
            className="w-full py-2 text-stone-600 hover:text-stone-900 text-xs font-medium text-center transition"
          >
            Để sau / Đóng lại
          </button>
        </div>
      </div>
    </div>
  );
}
