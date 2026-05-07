import { NextResponse } from 'next/server';

export const maxDuration = 60; // Allow more time for processing on Vercel

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No image file provided.' }, { status: 400 });
    }

    // Direct upload to HD API
    const apiUrl = `https://api.theresav.biz.id/tools/hd?apikey=DDKta`;
    
    // Create new form data with field named "image" as expected by the API
    const hdForm = new FormData();
    hdForm.append('image', file);
    
    // We use standard fetch with buffer reading
    const hdRes = await fetch(apiUrl, {
      method: 'POST',
      body: hdForm,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      }
    });
    
    if (!hdRes.ok) {
        const errText = await hdRes.text().catch(() => 'No text body');
        throw new Error(`HD API responded with status ${hdRes.status}: ${hdRes.statusText}. Details: ${errText}`);
    }

    const contentType = hdRes.headers.get('content-type') || '';
    
    if (contentType.includes('application/json')) {
       // A JSON response might mean success returning a link, or a formatted error body 
       const json = await hdRes.json();
       if (json.status === false) {
           throw new Error(json.message || 'HD API indicated failure.');
       }

       const resultUrl = json?.data?.url || json?.result || json?.url;
       if (!resultUrl) {
         throw new Error('HD Image result URL not found in API response.');
       }
       return NextResponse.json({ success: true, url: resultUrl });
    } else {
       // HD API returned binary image data directly
       const arrayBuffer = await hdRes.arrayBuffer();
       const buffer = Buffer.from(arrayBuffer);
       const base64 = buffer.toString('base64');
       const mimeType = contentType || 'image/jpeg';
       
       return NextResponse.json({ success: true, image: `data:${mimeType};base64,${base64}` });
    }

  } catch (error: any) {
    console.error('HD Upscale Error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error while upscaling image.' }, { status: 500 });
  }
}
