// functions/api/config.js

// ⚠️ ضع رابط الـ Google Apps Script هنا (لن يظهر هذا الرابط للمتصفح أبداً)
const GOOGLE_SHEET_API = 'https://script.google.com/macros/s/AKfycby7xcuftof9LzOgVFlxQAJoiyKxzd2UywiMzmr6Ew8YgsQkouJrDaa9a2E0CXh4gcvD5Q/exec';

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
};

export async function onRequestOptions() {
    return new Response(null, { status: 204, headers: corsHeaders });
}

export async function onRequestGet(context) {
    try {
        // جلب الإعدادات من جوجل شيت
        const response = await fetch(`${GOOGLE_SHEET_API}?action=getConfig`);
        const data = await response.json();
        
        // إرجاع الإعدادات للموقع
        return new Response(JSON.stringify(data), {
            status: 200,
            headers: { 'Content-Type': 'application/json', ...corsHeaders }
        });
    } catch (error) {
        return new Response(JSON.stringify({ error: 'Failed to fetch config' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json', ...corsHeaders }
        });
    }
}