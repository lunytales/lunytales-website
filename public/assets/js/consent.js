(() => {
  const KEY = "luny_cookie_consent"; // accepted | rejected
  const banner = document.getElementById("cookieBanner");
  const acceptBtn = document.getElementById("cookieAccept");
  const rejectBtn = document.getElementById("cookieReject");
  const prefsBtn = document.getElementById("cookiePrefs");
  const currentScriptSrc = (document.currentScript && document.currentScript.getAttribute("src")) || "";
  const TRACKING_SRC = currentScriptSrc.includes("consent.js")
    ? currentScriptSrc.replace("consent.js", "tracking.js")
    : (
      currentScriptSrc.startsWith("/")
        ? "/assets/js/tracking.js"
        : "assets/js/tracking.js"
    );
  const config = window.__LUNY_CONFIG && window.__LUNY_CONFIG.flags
    ? window.__LUNY_CONFIG.flags
    : null;
  const TRACKING_GATE_ENABLED =
    config && typeof config.trackingGate === "boolean"
      ? config.trackingGate
      : true;
  const TRACKING_QUERY_ENABLED = new URLSearchParams(window.location.search).get("track") === "1";
  const TRACKING_ENABLED = TRACKING_GATE_ENABLED ? TRACKING_QUERY_ENABLED : true;

  const analyticsConfig = window.__LUNY_CONFIG && window.__LUNY_CONFIG.analytics
    ? window.__LUNY_CONFIG.analytics
    : null;
  const ANALYTICS_MEASUREMENT_ID =
    analyticsConfig && typeof analyticsConfig.gaMeasurementId === "string"
      ? analyticsConfig.gaMeasurementId.trim()
      : "";
  const GOOGLE_ANALYTICS_SRC = ANALYTICS_MEASUREMENT_ID
    ? `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(ANALYTICS_MEASUREMENT_ID)}`
    : "";
  const GA_DISABLE_KEY = ANALYTICS_MEASUREMENT_ID
    ? `ga-disable-${ANALYTICS_MEASUREMENT_ID}`
    : "";

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

  const disableGoogleAnalytics = () => {
    if (!GA_DISABLE_KEY) return;
    window[GA_DISABLE_KEY] = true;
    if (typeof window.gtag === "function") {
      window.gtag("consent", "update", { analytics_storage: "denied" });
    }
  };

  const loadGoogleAnalytics = () => {
    if (!ANALYTICS_MEASUREMENT_ID || !GOOGLE_ANALYTICS_SRC) return;

    if (GA_DISABLE_KEY) {
      window[GA_DISABLE_KEY] = false;
    }

    window.dataLayer = window.dataLayer || [];
    window.gtag = window.gtag || function gtag(){
      window.dataLayer.push(arguments);
    };

    if (!window.__lunyGaInitialized) {
      window.gtag("js", new Date());
      window.__lunyGaInitialized = true;
    }

    window.gtag("consent", "update", { analytics_storage: "granted" });

    if (!window.__lunyGaConfigured) {
      window.gtag("config", ANALYTICS_MEASUREMENT_ID);
      console.info("GA CONFIG FIRED");
      window.__lunyGaConfigured = true;
    }

    const exists = Array.from(document.scripts).some(
      (script) => (script.src || "") === GOOGLE_ANALYTICS_SRC
    );

    if (!exists) {
      const script = document.createElement("script");
      script.async = true;
      script.src = GOOGLE_ANALYTICS_SRC;
      script.dataset.lunyGa = ANALYTICS_MEASUREMENT_ID;
      document.head.appendChild(script);
      console.info("GA SCRIPT INJECTED");
    }
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
      console.info("GA CONSENT ACCEPTED");
      loadGoogleAnalytics();
      if (TRACKING_ENABLED) {
        loadMetaPixel();
        loadTracking();
      }
    } else if (value === "rejected") {
      disableGoogleAnalytics();
    }
    hideBanner();
  };

  const getConsent = () => localStorage.getItem(KEY);

  const consent = getConsent();
  if (consent === "accepted") {
    console.info("GA CONSENT ACCEPTED");
    loadGoogleAnalytics();
    if (TRACKING_ENABLED) {
      loadMetaPixel();
      loadTracking();
    }
  } else if (consent === "rejected") {
    disableGoogleAnalytics();
  } else {
    disableGoogleAnalytics();
    showBanner();
  }

  acceptBtn?.addEventListener("click", () => setConsent("accepted"));
  rejectBtn?.addEventListener("click", () => setConsent("rejected"));
  prefsBtn?.addEventListener("click", () => showBanner());

  window.addEventListener("resize", () => setBodyPadding(), { passive: true });
})();
