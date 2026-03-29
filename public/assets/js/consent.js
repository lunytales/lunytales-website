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

  const ensureGtagStub = () => {
    window.dataLayer = window.dataLayer || [];
    window.gtag = window.gtag || function gtag(){
      window.dataLayer.push(arguments);
    };
  };

  const fireGaConfig = () => {
    if (!ANALYTICS_MEASUREMENT_ID || window.__lunyGaConfigured) return;

    ensureGtagStub();
    window.gtag("js", new Date());
    window.gtag("config", ANALYTICS_MEASUREMENT_ID, {
      send_page_view: true,
    });

    window.__lunyGaConfigured = true;
    console.info("GA CONFIG FIRED");
  };

  const loadGoogleAnalytics = () => {
    if (!ANALYTICS_MEASUREMENT_ID || !GOOGLE_ANALYTICS_SRC) return;

    if (GA_DISABLE_KEY) {
      window[GA_DISABLE_KEY] = false;
    }

    ensureGtagStub();

    const existingScript = Array.from(document.scripts).find(
      (script) => (script.src || "") === GOOGLE_ANALYTICS_SRC
    );

    if (existingScript) {
      fireGaConfig();

      if (existingScript.dataset.lunyGaLoadListener !== "true") {
        existingScript.dataset.lunyGaLoadListener = "true";
        existingScript.addEventListener("load", () => {
          existingScript.dataset.lunyGaLoaded = "true";
          fireGaConfig();
        }, { once: true });
      }
      return;
    }

    const script = document.createElement("script");
    script.async = true;
    script.src = GOOGLE_ANALYTICS_SRC;
    script.dataset.lunyGa = ANALYTICS_MEASUREMENT_ID;
    script.addEventListener("load", () => {
      script.dataset.lunyGaLoaded = "true";
      fireGaConfig();
    }, { once: true });

    document.head.appendChild(script);
    console.info("GA SCRIPT INJECTED");
  };

  const loadTracking = () => {
    if (window.__lunyTrackingLoaded) return;
    const exists = Array.from(document.scripts).some((s) => (s.src || "").includes(TRACKING_SRC));
    if (exists) {
      window.__lunyTrackingLoaded = true;
      return;
    }
    const script = document.createElement("script");
    script.defer = true;
    script.src = TRACKING_SRC;
    script.onload = () => { window.__lunyTrackingLoaded = true; };
    document.body.appendChild(script);
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

  const writeConsent = (value) => {
    try {
      localStorage.setItem(KEY, value);
    } catch (_) {
      // Ignore storage failures in restricted browser contexts.
    }
  };

  const readConsent = () => {
    try {
      return localStorage.getItem(KEY);
    } catch (_) {
      return null;
    }
  };

  const applyConsentState = (value, source) => {
    if (value === "accepted") {
      if (source === "auto") {
        console.info("GA AUTO LOAD TRIGGERED");
      } else {
        console.info("GA CONSENT ACCEPTED");
      }
      loadGoogleAnalytics();
      loadMetaPixel();
      if (TRACKING_ENABLED) {
        loadTracking();
      }
      hideBanner();
      return;
    }

    disableGoogleAnalytics();

    if (value === "rejected") {
      hideBanner();
      return;
    }

    showBanner();
  };

  const setConsent = (value) => {
    writeConsent(value);
    acceptBtn?.blur();
    rejectBtn?.blur();
    applyConsentState(value, "manual");
  };

  const initializeConsentState = () => {
    applyConsentState(readConsent(), "auto");
  };

  acceptBtn?.addEventListener("click", () => setConsent("accepted"));
  rejectBtn?.addEventListener("click", () => setConsent("rejected"));
  prefsBtn?.addEventListener("click", () => showBanner());

  window.addEventListener("resize", () => setBodyPadding(), { passive: true });

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initializeConsentState, { once: true });
  } else {
    initializeConsentState();
  }
})();
