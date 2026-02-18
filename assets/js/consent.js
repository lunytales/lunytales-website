(() => {
  const KEY = "luny_cookie_consent"; // accepted | rejected
  const banner = document.getElementById("cookieBanner");
  const acceptBtn = document.getElementById("cookieAccept");
  const rejectBtn = document.getElementById("cookieReject");
  const prefsBtn = document.getElementById("cookiePrefs");
  const TRACKING_SRC = (document.currentScript && document.currentScript.getAttribute("src") || "").startsWith("/")
    ? "/assets/js/tracking.js"
    : "assets/js/tracking.js";

  const setBodyPadding = () => {
    if (!banner || banner.hasAttribute("hidden")) return;
    const h = banner.offsetHeight || 96;
    document.documentElement.style.setProperty("--cookie-h", `${h}px`);
    document.body.classList.add("has-cookie-banner");
  };

  const clearBodyPadding = () => {
    document.body.classList.remove("has-cookie-banner");
    document.documentElement.style.removeProperty("--cookie-h");
  };

  const loadMetaPixel = () => {
    if (window.fbq) return;
    (function(f,b,e,v,n,t,s){
      if(f.fbq)return; n=f.fbq=function(){ n.callMethod ? n.callMethod.apply(n,arguments) : n.queue.push(arguments) };
      if(!f._fbq)f._fbq=n; n.push=n; n.loaded=!0; n.version='2.0'; n.queue=[];
      t=b.createElement(e); t.async=!0; t.src=v;
      s=b.getElementsByTagName(e)[0]; s.parentNode.insertBefore(t,s);
    })(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');

    window.fbq('init', '4211106805805636');
    window.fbq('track', 'PageView');
  };

  const loadTracking = () => {
    if (window.__lunyTrackingLoaded) return;
    const exists = Array.from(document.scripts).some((s) => (s.src || "").includes(TRACKING_SRC));
    if (exists) {
      window.__lunyTrackingLoaded = true;
      return;
    }
    const s = document.createElement("script");
    s.defer = true;
    s.src = TRACKING_SRC;
    s.onload = () => { window.__lunyTrackingLoaded = true; };
    document.body.appendChild(s);
  };

  const showBanner = () => {
    if (!banner) return;
    banner.removeAttribute("hidden");
    setBodyPadding();
  };

  const hideBanner = () => {
    if (!banner) return;
    banner.setAttribute("hidden", "");
    clearBodyPadding();
  };

  const setConsent = (value) => {
    localStorage.setItem(KEY, value);
    acceptBtn?.blur();
    rejectBtn?.blur();
    if (value === "accepted") {
      loadMetaPixel();
      loadTracking();
    }
    hideBanner();
  };

  const getConsent = () => localStorage.getItem(KEY);

  const consent = getConsent();
  if (consent === "accepted") {
    loadMetaPixel();
    loadTracking();
  } else if (consent === "rejected") {
    // No cargar el Pixel
  } else {
    showBanner();
  }

  acceptBtn?.addEventListener("click", () => setConsent("accepted"));
  rejectBtn?.addEventListener("click", () => setConsent("rejected"));
  prefsBtn?.addEventListener("click", () => showBanner());

  window.addEventListener("resize", () => setBodyPadding(), { passive: true });
})();
