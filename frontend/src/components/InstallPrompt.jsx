import React, { useState, useEffect } from 'react';
import { Download, Smartphone, Share2, PlusSquare, X, CheckCircle2, Sparkles } from 'lucide-react';

export default function InstallPrompt({ forceShowModal = false, onCloseModal }) {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [bannerDismissed, setBannerDismissed] = useState(false);

  const isModalVisible = forceShowModal || showModal;

  const handleCloseModal = () => {
    setShowModal(false);
    if (onCloseModal) onCloseModal();
  };

  useEffect(() => {
    // Kiểm tra xem app đã đang chạy ở chế độ Standalone (đã cài đặt) chưa
    const checkStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
    setIsStandalone(checkStandalone);

    // Kiểm tra có phải thiết bị iOS (iPhone/iPad) không
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIosDevice);

    // Bắt sự kiện cài đặt chuẩn PWA trên Android/Desktop Chrome/Edge
    const handleBeforeInstall = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    // Kiểm tra xem người dùng đã từng tắt banner trong phiên này chưa
    const dismissed = sessionStorage.getItem('pwa_banner_dismissed');
    if (dismissed) setBannerDismissed(true);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      // Android / Chrome / Edge Native Install Prompt
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
        setBannerDismissed(true);
      }
    } else {
      // iOS Safari hoặc thiết bị cần hướng dẫn thủ công
      setShowModal(true);
    }
  };

  const handleDismissBanner = () => {
    setBannerDismissed(true);
    sessionStorage.setItem('pwa_banner_dismissed', 'true');
  };

  // Nếu đã cài đặt rồi thì không cần hiển thị gì nữa
  if (isStandalone) return null;

  return (
    <>
      {/* Mobile Top Install Banner (chỉ hiển thị nếu chưa cài đặt) */}
      {!bannerDismissed && (
        <div className="bg-gradient-to-r from-amber-950/80 via-emerald-950/80 to-slate-950 border-b border-amber-500/30 px-3 py-2 text-xs flex items-center justify-between text-amber-100 shadow-sm transition-all animate-in slide-in-from-top duration-300">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center shrink-0">
              <Smartphone className="w-3.5 h-3.5 text-amber-400" />
            </div>
            <div>
              <span className="font-bold text-amber-200 block text-[11px] leading-tight">
                Cài đặt App về Màn hình chính
              </span>
              <span className="text-[10px] text-slate-300">
                Mở nhanh như ứng dụng thật, dùng mượt mà không cần mở trình duyệt
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0 ml-2">
            <button
              onClick={handleInstallClick}
              className="px-2.5 py-1 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-[11px] shadow-sm flex items-center gap-1 transition"
            >
              <Download className="w-3 h-3" />
              <span>Cài Ngay</span>
            </button>
            <button
              onClick={handleDismissBanner}
              className="p-1 rounded text-slate-400 hover:text-slate-200"
              title="Đóng thông báo"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Modal Hướng dẫn Cài đặt (đặc biệt hữu ích cho iPhone/Safari hoặc người dùng cần hỗ trợ) */}
      {isModalVisible && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-amber-500/40 rounded-2xl max-w-sm w-full p-5 shadow-2xl space-y-4 text-slate-100 relative">
            <button
              onClick={handleCloseModal}
              className="absolute top-3.5 right-3.5 p-1 rounded-lg text-slate-400 hover:text-slate-200 bg-slate-800/60"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2.5 text-amber-400">
              <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-100">Cài Đặt Về Màn Hình Chính</h3>
                <p className="text-[11px] text-amber-300/80">Truy cập 1 chạm • Toàn màn hình</p>
              </div>
            </div>

            {isIOS ? (
              // Hướng dẫn dành riêng cho Safari trên iPhone/iPad
              <div className="space-y-3 text-xs text-slate-300 bg-slate-950/60 p-3.5 rounded-xl border border-slate-800">
                <p className="font-semibold text-amber-300 text-[11px]">
                  Các bước cài đặt trên trình duyệt Safari (iPhone/iPad):
                </p>
                <div className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 font-bold flex items-center justify-center shrink-0 text-[10px]">
                    1
                  </div>
                  <div>
                    Nhìn xuống thanh công cụ dưới đáy Safari, bấm vào biểu tượng <strong>Chia sẻ</strong> (
                    <Share2 className="w-3.5 h-3.5 inline text-sky-400 mx-0.5" /> hình ô vuông có mũi tên lên).
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 font-bold flex items-center justify-center shrink-0 text-[10px]">
                    2
                  </div>
                  <div>
                    Cuộn xuống danh sách và chọn dòng: <strong>"Thêm vào Màn hình chính"</strong> (
                    <PlusSquare className="w-3.5 h-3.5 inline text-emerald-400 mx-0.5" /> <em>Add to Home Screen</em>).
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 font-bold flex items-center justify-center shrink-0 text-[10px]">
                    3
                  </div>
                  <div>
                    Bấm nút <strong>"Thêm" (Add)</strong> ở góc trên bên phải màn hình. Biểu tượng app sẽ xuất hiện ngay trên màn hình chính!
                  </div>
                </div>
              </div>
            ) : (
              // Hướng dẫn dành cho Android / Chrome
              <div className="space-y-3 text-xs text-slate-300 bg-slate-950/60 p-3.5 rounded-xl border border-slate-800">
                <p className="font-semibold text-amber-300 text-[11px]">
                  Cài đặt trên trình duyệt Google Chrome (Android):
                </p>
                <div className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 font-bold flex items-center justify-center shrink-0 text-[10px]">
                    1
                  </div>
                  <div>
                    Bấm vào biểu tượng <strong>3 chấm dọc (⋮)</strong> ở góc trên bên phải trình duyệt.
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 font-bold flex items-center justify-center shrink-0 text-[10px]">
                    2
                  </div>
                  <div>
                    Chọn dòng <strong>"Cài đặt ứng dụng"</strong> hoặc <strong>"Thêm vào Màn hình chính"</strong>.
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 font-bold flex items-center justify-center shrink-0 text-[10px]">
                    3
                  </div>
                  <div>
                    Bấm <strong>"Cài đặt" (Install)</strong>. Ứng dụng sẽ tự động tải về màn hình điện thoại của bạn.
                  </div>
                </div>
              </div>
            )}

            <button
              onClick={handleCloseModal}
              className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md transition"
            >
              Tôi Đã Hiểu
            </button>
          </div>
        </div>
      )}
    </>
  );
}
