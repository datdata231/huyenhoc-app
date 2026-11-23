import React, { useState, useEffect } from 'react';
import { Download, Smartphone, Share2, PlusSquare, X, CheckCircle2, Sparkles, Menu, Compass } from 'lucide-react';

export default function InstallPrompt({ forceShowModal = false, onCloseModal }) {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isSamsung, setIsSamsung] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [bannerDismissed, setBannerDismissed] = useState(false);

  useEffect(() => {
    // Kiểm tra xem app đã đang chạy ở chế độ Standalone (đã cài đặt) chưa
    const checkStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
    setIsStandalone(checkStandalone);

    const userAgent = window.navigator.userAgent.toLowerCase();
    setIsIOS(/iphone|ipad|ipod/.test(userAgent));
    setIsSamsung(/samsungbrowser/.test(userAgent));

    // Bắt sự kiện cài đặt chuẩn PWA trên Android/Desktop
    const handleBeforeInstall = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    // Kiểm tra trạng thái đã đóng banner
    const dismissed = sessionStorage.getItem('pwa_banner_dismissed');
    if (dismissed) setBannerDismissed(true);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    };
  }, []);

  const isModalVisible = forceShowModal || showModal;

  const handleCloseModal = () => {
    setShowModal(false);
    if (onCloseModal) onCloseModal();
  };

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
      // Mở modal hướng dẫn chi tiết theo đúng trình duyệt của người dùng
      setShowModal(true);
    }
  };

  const handleDismissBanner = () => {
    setBannerDismissed(true);
    sessionStorage.setItem('pwa_banner_dismissed', 'true');
  };

  // Nếu app đã chạy ở chế độ standalone thì không cần hiển thị banner nữa
  if (isStandalone && !forceShowModal) return null;

  return (
    <>
      {/* Mobile Top Install Banner (luôn hiển thị nổi bật trên điện thoại nếu chưa cài đặt) */}
      {!bannerDismissed && !isStandalone && (
        <div className="bg-gradient-to-r from-amber-950 via-emerald-950 to-slate-950 border-b border-amber-500/40 px-3 py-2 text-xs flex items-center justify-between text-amber-100 shadow-md transition-all">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-amber-500/30 border border-amber-500/60 flex items-center justify-center shrink-0">
              <Smartphone className="w-4 h-4 text-amber-300" />
            </div>
            <div>
              <span className="font-bold text-amber-200 block text-[11px] leading-tight">
                Cài đặt Huyền Học về Màn hình chính
              </span>
              <span className="text-[10px] text-slate-300">
                {isSamsung ? 'Hỗ trợ Samsung Internet: Thêm vào MH chờ' : 'Mở nhanh 1 chạm, dùng toàn màn hình 24/7'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0 ml-2">
            <button
              onClick={handleInstallClick}
              className="px-2.5 py-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-[11px] shadow-sm flex items-center gap-1 transition"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Cài Ngay</span>
            </button>
            <button
              onClick={handleDismissBanner}
              className="p-1 rounded text-slate-400 hover:text-slate-200"
              title="Đóng thông báo"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Modal Hướng Dẫn Cài Đặt Thông Minh (Tự động nhận diện Samsung Browser / Chrome / Safari) */}
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
                <h3 className="font-bold text-sm text-slate-100">Cài Đặt Về Màn Hình Điện Thoại</h3>
                <p className="text-[11px] text-amber-300/80">
                  {isSamsung ? 'Dành riêng cho Samsung Internet' : isIOS ? 'Dành riêng cho Safari (iPhone/iPad)' : 'Dành cho Android & Chrome'}
                </p>
              </div>
            </div>

            {isSamsung ? (
              // Hướng dẫn dành riêng cho trình duyệt SAMSUNG INTERNET BROWSER
              <div className="space-y-3 text-xs text-slate-300 bg-slate-950/70 p-3.5 rounded-xl border border-amber-500/20">
                <p className="font-semibold text-amber-300 text-[11px] flex items-center gap-1.5">
                  <Compass className="w-3.5 h-3.5 text-amber-400" />
                  <span>Cách cài đặt trên Samsung Internet:</span>
                </p>

                <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/30 text-[11px] text-amber-200">
                  💡 <strong>Cách 1 (Nhanh nhất):</strong> Nhìn lên thanh địa chỉ trên cùng, bấm vào biểu tượng <strong>Mũi tên tải xuống (⬇)</strong> ở góc phải thanh địa chỉ.
                </div>

                <div className="space-y-2 pt-1 border-t border-slate-800">
                  <p className="font-semibold text-slate-200 text-[11px]">Hoặc làm theo 3 bước sau:</p>
                  
                  <div className="flex items-start gap-2.5">
                    <div className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 font-bold flex items-center justify-center shrink-0 text-[10px]">
                      1
                    </div>
                    <div>
                      Nhìn xuống thanh công cụ <strong>ở góc dưới cùng bên phải</strong> của màn hình, chạm vào biểu tượng <strong>3 dấu gạch ngang (☰)</strong>.
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <div className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 font-bold flex items-center justify-center shrink-0 text-[10px]">
                      2
                    </div>
                    <div>
                      Trong bảng menu hiện lên, chọn mục: <strong>"Thêm trang vào"</strong> (hoặc <em>Add page to</em>).
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <div className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 font-bold flex items-center justify-center shrink-0 text-[10px]">
                      3
                    </div>
                    <div>
                      Chọn tiếp dòng: <strong>"Màn hình Chờ"</strong> (hoặc <em>Home screen</em> / <em>Cài đặt ứng dụng web</em>). Bấm <strong>Thêm</strong> là hoàn tất!
                    </div>
                  </div>
                </div>
              </div>
            ) : isIOS ? (
              // Hướng dẫn dành riêng cho Safari trên iPhone/iPad
              <div className="space-y-3 text-xs text-slate-300 bg-slate-950/60 p-3.5 rounded-xl border border-slate-800">
                <p className="font-semibold text-amber-300 text-[11px]">
                  Các bước cài đặt trên trình duyệt Safari:
                </p>
                <div className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 font-bold flex items-center justify-center shrink-0 text-[10px]">
                    1
                  </div>
                  <div>
                    Nhìn xuống đáy Safari, bấm biểu tượng <strong>Chia sẻ</strong> (<Share2 className="w-3.5 h-3.5 inline text-sky-400 mx-0.5" /> ô vuông có mũi tên lên).
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 font-bold flex items-center justify-center shrink-0 text-[10px]">
                    2
                  </div>
                  <div>
                    Cuộn danh sách chọn: <strong>"Thêm vào Màn hình chính"</strong> (<PlusSquare className="w-3.5 h-3.5 inline text-emerald-400 mx-0.5" /> <em>Add to Home Screen</em>).
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 font-bold flex items-center justify-center shrink-0 text-[10px]">
                    3
                  </div>
                  <div>
                    Bấm nút <strong>"Thêm" (Add)</strong> ở góc trên bên phải.
                  </div>
                </div>
              </div>
            ) : (
              // Hướng dẫn cho Chrome trên Android
              <div className="space-y-3 text-xs text-slate-300 bg-slate-950/60 p-3.5 rounded-xl border border-slate-800">
                <p className="font-semibold text-amber-300 text-[11px]">
                  Các bước cài đặt trên Google Chrome (Android):
                </p>
                <div className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 font-bold flex items-center justify-center shrink-0 text-[10px]">
                    1
                  </div>
                  <div>
                    Bấm biểu tượng <strong>3 chấm dọc (⋮)</strong> ở góc trên bên phải Chrome.
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 font-bold flex items-center justify-center shrink-0 text-[10px]">
                    2
                  </div>
                  <div>
                    Chọn dòng: <strong>"Cài đặt ứng dụng"</strong> hoặc <strong>"Thêm vào Màn hình chính"</strong>.
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 font-bold flex items-center justify-center shrink-0 text-[10px]">
                    3
                  </div>
                  <div>
                    Bấm <strong>"Cài đặt" (Install)</strong> để app tải về màn hình.
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
