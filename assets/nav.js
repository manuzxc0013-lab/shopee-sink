/* มือถือ: ถอด target=_blank ออก เพื่อให้ลิงก์เด้งเข้าแอป Shopee ได้ (คุกกี้ไม่หลุด) */
(function () {
  if (!/Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent)) return;
  function fix() {
    document.querySelectorAll('a[target="_blank"]').forEach(function (a) {
      a.removeAttribute("target");
    });
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", fix);
  } else { fix(); }
})();
