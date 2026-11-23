/* ============================================================
   SHOPEE//SINK — Popunder Engine v2
   กติกา: ยิงเฉพาะจาก user gesture (กัน popup blocker)
   Cap: 1 ครั้ง / 4 ชม. · สูงสุด 2 ครั้ง / session
   หมายเหตุ: ห้ามใช้ "noopener" ใน window.open เพราะมันคืน null
            แล้วเราจะสั่ง blur() เพื่อดันลงข้างหลังไม่ได้
   ============================================================ */
(function () {
  "use strict";

  var CFG = window.SINK_CFG || {};
  var POOL = (CFG.pool || []).map(function (x) { return typeof x === "string" ? { url: x } : x; })
                              .filter(function (x) { return x && x.url; });
  if (!POOL.length) return;

  var COOLDOWN_H = CFG.cooldownHours || 4;
  var MAX_SESSION = CFG.maxSession || 2;
  var MIN_DELAY = CFG.minDelay || 900;
  var SKIP_SCROLL = CFG.skipScroll || 0.28;

  var K_LAST = "sd_pu_last";

  var fired = 0;      // ยิงไปแล้วกี่ครั้ง
  var scrolled = false;
  var pending = false;

  function num(k) { try { return parseInt(localStorage.getItem(k) || "0", 10) || 0; } catch (e) { return 0; } }
  function canFire() {
    if (fired >= MAX_SESSION) return false;
    return Date.now() - num(K_LAST) > COOLDOWN_H * 3600e3;
  }
  function scrollPct() {
    var h = document.documentElement.scrollHeight - window.innerHeight;
    return h <= 0 ? 1 : (window.scrollY || window.pageYOffset) / h;
  }
  function isSkip(t) {
    if (!t || !t.closest) return false;
    return !!t.closest('a[href*="shopee"],[data-nopop],button,summary,input,textarea,select,nav,.dock');
  }

  function fire() {
    if (!canFire()) return;
    fired++;
    try { localStorage.setItem(K_LAST, String(Date.now())); } catch (e) {}

    var pick = POOL[Math.floor(Math.random() * POOL.length)];
    var w = window.open(pick.url, "_blank");     // ห้าม noopener
    if (!w) return;
    try { w.opener = null; } catch (e) {}
    try { w.blur(); } catch (e) {}
    try { window.focus(); } catch (e) {}
  }

  function onGesture(e) {
    if (pending || !scrolled || !canFire()) return;
    if (isSkip(e.target)) return;
    pending = true;
    setTimeout(function () { pending = false; fire(); }, MIN_DELAY + Math.random() * 800);
  }

  function armScroll() {
    if (scrolled) return;
    if (scrollPct() >= SKIP_SCROLL) {
      scrolled = true;
      window.removeEventListener("scroll", armScroll);
    }
  }

  window.addEventListener("scroll", armScroll, { passive: true });
  armScroll();
  document.addEventListener("click", onGesture, { passive: true });
  document.addEventListener("touchend", onGesture, { passive: true });

  /* exit-intent — เดสก์ท็อปเท่านั้น */
  if (!/Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent)) {
    document.addEventListener("mouseout", function (e) {
      if (pending || !canFire()) return;
      if (e.relatedTarget || e.clientY > 6) return;
      pending = true;
      fire();
      pending = false;
    }, { passive: true });
  }

  window.SINK = { fire: fire, canFire: canFire, fired: function () { return fired; } };
})();
