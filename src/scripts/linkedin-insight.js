(() => {
  const partnerId = document.currentScript?.dataset.linkedinPartnerId;
  if (!partnerId) return;

  window._linkedin_partner_id = partnerId;
  window._linkedin_data_partner_ids = window._linkedin_data_partner_ids || [];
  window._linkedin_data_partner_ids.push(partnerId);

  if (!window.lintrk) {
    window.lintrk = function (a, b) { window.lintrk.q.push([a, b]); };
    window.lintrk.q = [];
  }

  const firstScript = document.getElementsByTagName("script")[0];
  const script = document.createElement("script");
  script.type = "text/javascript";
  script.async = true;
  script.src = "https://snap.licdn.com/li.lms-analytics/insight.min.js";
  firstScript.parentNode.insertBefore(script, firstScript);
})();
