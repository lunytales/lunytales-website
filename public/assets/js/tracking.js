(function(){
  function bindTracking(selector, handler, flagName) {
    var links = document.querySelectorAll(selector);
    if (!links.length) return;
    links.forEach(function(link){
      if (link.dataset[flagName] === 'true') return;
      link.dataset[flagName] = 'true';

      link.addEventListener('click', function(e){
        try { handler(); } catch (err) {}
      });
    });
  }

  bindTracking(
    'a[href*="hotmart.com"]',
    function(){
      if (window.fbq) window.fbq('track','InitiateCheckout');
    },
    'fbqCheckoutBound'
  );

  bindTracking(
    'a[href*="demo.pdf"]',
    function(){
      if (window.fbq) window.fbq('trackCustom','ViewDemo');
    },
    'fbqDemoBound'
  );
})();
