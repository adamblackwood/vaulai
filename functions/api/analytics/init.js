// functions/api/analytics/init.js

const GOOGLE_SHEET_API = 'https://script.google.com/macros/s/AKfycbxZAC2jGthyYIt-yhm71Hg-5towgBArKY3iXivMtoLBRo17gOpz1x88rp1jmoocvBfSjA/exec'; // رابط V9

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
};

const botPatterns = /bot|crawler|spider|headless|chrome-lighthouse|python|curl|wget|node-fetch/i;

export async function onRequestOptions() {
    return new Response(null, { status: 204, headers: corsHeaders });
}

export async function onRequestGet(context) {
    const request = context.request;
    const userAgent = request.headers.get('User-Agent') || '';
    
    // 🛡️ جدار الحماية الأول: حظر الروبوتات
    if (botPatterns.test(userAgent)) {
        return new Response(JSON.stringify({ s: 0, u: '', b: '', e: '' }), {
            status: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders }
        });
    }

    try {
        const response = await fetch(`${GOOGLE_SHEET_API}?action=getConfig`);
        const data = await response.json();
        
        let isRedirectAllowed = false;

        // ✅ الشرط الأول: هل التحويل مفعل؟
        if (data.status === 'ON') {
            const visitorCountry = (request.cf?.country || 'Unknown').toUpperCase();
            const targetCountries = (data.targetCountries || '').toUpperCase().split(',').map(c => c.trim()).filter(Boolean);

            // ✅ الشرط الثاني: فحص التصفية الجغرافية (Geo-Fencing)
            if (targetCountries.length === 0) {
                // القائمة فارغة = السماح لجميع الدول
                isRedirectAllowed = true;
            } else if (targetCountries.includes(visitorCountry)) {
                // دولة الزائر موجودة في القائمة = مسموح
                isRedirectAllowed = true;
            } else {
                // دولة الزائر غير موجودة = مرفوض (سيرجع Off للمتصفح)
                isRedirectAllowed = false;
            }
        }

        // ✅ إذا اجتاز الشروط، جهز الرابط المشفر وبيانات الحظر
        if (isRedirectAllowed) {
            let encodedUrl = '';
            if (data.smartlinkUrl) {
                try { encodedUrl = btoa(data.smartlinkUrl); } catch(e) {}
            }

            return new Response(JSON.stringify({ 
                s: 1, // مسموح بالتحويل
                u: encodedUrl,
                b: data.blockedReferrers || '',
                e: data.blockedExactReferrers || ''
            }), { status: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders } });
        } else {
            // مرفوض (إما التحويل مغلق، أو الدولة غير مسموح بها)
            return new Response(JSON.stringify({ s: 0, u: '', b: '', e: '' }), {
                status: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders }
            });
        }

    } catch (error) {
        return new Response(JSON.stringify({ s: 0, u: '', b: '', e: '' }), {
            status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders }
        });
    }
}