// assets/js/tracking.js

(function() {
    const urlParams = new URLSearchParams(window.location.search);
    const trackData = {
        utm_source: urlParams.get('utm_source') || 'direct',
        utm_campaign: urlParams.get('utm_campaign') || 'none',
        referrer: document.referrer || 'Direct',
        page: window.location.href,
        device: /Mobi|Android/i.test(navigator.userAgent) ? 'Mobile' : (/Tablet|iPad/i.test(navigator.userAgent) ? 'Tablet' : 'Desktop'),
        os: navigator.userAgent.indexOf('Win') !== -1 ? 'Windows' : (navigator.userAgent.indexOf('Mac') !== -1 ? 'MacOS' : (navigator.userAgent.indexOf('Linux') !== -1 ? 'Linux' : (navigator.userAgent.indexOf('Android') !== -1 ? 'Android' : (navigator.userAgent.indexOf('iPhone') !== -1 ? 'iOS' : 'Unknown')))),
        browser: navigator.userAgent.indexOf('Chrome') !== -1 ? 'Chrome' : (navigator.userAgent.indexOf('Safari') !== -1 ? 'Safari' : (navigator.userAgent.indexOf('Firefox') !== -1 ? 'Firefox' : 'Other'))
    };

    // ⚠️ تغيير المسار من /api/track إلى /track
    fetch('/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(trackData)
    })
    .then(response => {
        // التحقق من أن الـ Response جيد (وليس 404 أو 500)
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        console.log('✅ TRACKING SUCCESS:', data);
    })
    .catch(err => {
        console.error('❌ TRACKING ERROR:', err.message);
    });
})();