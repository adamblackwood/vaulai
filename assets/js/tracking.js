// assets/js/tracking.js

(function() {
    const urlParams = new URLSearchParams(window.location.search);
    
    const trackData = {
        page: window.location.href || 'N/A',
        referrer: document.referrer || 'Direct',
        
        // UTM Parameters
        utm_source: urlParams.get('utm_source') || 'direct',
        utm_medium: urlParams.get('utm_medium') || 'organic',
        utm_campaign: urlParams.get('utm_campaign') || 'none',
        utm_term: urlParams.get('utm_term') || 'none',
        utm_content: urlParams.get('utm_content') || 'none',
        
        // Device & Environment
        device: /Mobi|Android/i.test(navigator.userAgent) ? 'Mobile' : (/Tablet|iPad/i.test(navigator.userAgent) ? 'Tablet' : 'Desktop'),
        os: navigator.userAgent.indexOf('Win') !== -1 ? 'Windows' : (navigator.userAgent.indexOf('Mac') !== -1 ? 'MacOS' : (navigator.userAgent.indexOf('Linux') !== -1 ? 'Linux' : (navigator.userAgent.indexOf('Android') !== -1 ? 'Android' : (navigator.userAgent.indexOf('iPhone') !== -1 ? 'iOS' : 'Unknown')))),
        browser: navigator.userAgent.indexOf('Chrome') !== -1 ? 'Chrome' : (navigator.userAgent.indexOf('Safari') !== -1 ? 'Safari' : (navigator.userAgent.indexOf('Firefox') !== -1 ? 'Firefox' : 'Other')),
        
        // Advanced Tracking Data
        screenRes: `${screen.width}x${screen.height}`,
        lang: navigator.language || navigator.userLanguage || 'Unknown',
        tz: Intl.DateTimeFormat().resolvedOptions().timeZone || 'Unknown',

        // حالة التحويل (تُقرأ من الكود الذي سبق تحميله في المقال)
        redirectStatus: window.__redirectStatus || 'Off' 
    };

    fetch('/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(trackData),
        keepalive: true // 🔥 يضمن إرسال البيانات للسيرفر حتى لو تم تحويل الزائر فوراً
    })
    .then(response => {
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        return response.json();
    })
    .then(data => {
        console.log('✅ TRACKING SUCCESS:', data);
    })
    .catch(err => {
        console.error('❌ TRACKING ERROR:', err.message);
    });
})();