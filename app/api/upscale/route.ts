// src/app/api/upscale/route.ts

import { NextResponse } from 'next/server';

export const maxDuration = 60; // Allow more time for processing on Vercel
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No image file provided. Please upload an image.' },
        { status: 400 }
      );
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { error: 'Invalid file type. Please upload an image (JPEG, PNG, WEBP).' },
        { status: 400 }
      );
    }

    // Validate file size (max 20MB)
    if (file.size > 20 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 20MB.' },
        { status: 400 }
      );
    }

    // API endpoint dengan parameter yang benar
    const apiUrl = `https://api.theresav.biz.id/tools/hd?scale=2&apikey=5hgim`;
    
    console.log('Calling HD API:', apiUrl.replace('apikey=5hgim', 'apikey=***')); // Log without exposing key
    
    // Create form data for the external API
    const hdForm = new FormData();
    
    // Coba beberapa kemungkinan field name yang umum digunakan
    // Priority: 'image' -> 'file' -> 'photo'
    hdForm.append('image', file);
    
    // Add additional fields if needed
    // hdForm.append('scale', '2');
    
    const hdRes = await fetch(apiUrl, {
      method: 'POST',
      body: hdForm,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
    });
    
    if (!hdRes.ok) {
      const errText = await hdRes.text().catch(() => 'Unable to read error response');
      console.error(`API Error ${hdRes.status}:`, errText);
      
      // Handle specific error codes
      if (hdRes.status === 400) {
        return NextResponse.json(
          { error: 'Invalid request to upscale service. The API might require different parameters.' },
          { status: 400 }
        );
      }
      if (hdRes.status === 401 || hdRes.status === 403) {
        return NextResponse.json(
          { error: 'API authentication failed. Please check your API key.' },
          { status: 500 }
        );
      }
      
      throw new Error(`HD API responded with status ${hdRes.status}: ${hdRes.statusText}`);
    }

    const contentType = hdRes.headers.get('content-type') || '';
    console.log('Response content-type:', contentType);
    
    // Handle JSON response
    if (contentType.includes('application/json')) {
      const json = await hdRes.json();
      console.log('API Response JSON structure:', Object.keys(json));
      
      // Check for error in response
      if (json.status === false || json.error || json.success === false) {
        throw new Error(json.message || json.error || 'HD API indicated failure.');
      }

      // Try multiple possible response formats
      const resultUrl = json?.data?.url || 
                       json?.data?.image || 
                       json?.result || 
                       json?.url || 
                       json?.image_url ||
                       json?.output;
                       
      if (!resultUrl) {
        console.error('Full API response:', JSON.stringify(json, null, 2));
        throw new Error('HD Image result URL not found in API response.');
      }
      
      return NextResponse.json({ 
        success: true, 
        url: resultUrl 
      });
    } 
    
    // Handle binary image response
    else if (contentType.includes('image/')) {
      const arrayBuffer = await hdRes.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const base64 = buffer.toString('base64');
      const mimeType = contentType || 'image/jpeg';
      
      return NextResponse.json({ 
        success: true, 
        image: `data:${mimeType};base64,${base64}` 
      });
    } 
    
    // Handle unexpected response type
    else {
      const text = await hdRes.text();
      console.error('Unexpected response type:', contentType, text.substring(0, 200));
      throw new Error(`Unexpected response from API: ${contentType}`);
    }

  } catch (error: any) {
    console.error('HD Upscale Error:', error);
    
    // Return user-friendly error message
    let errorMessage = 'Failed to upscale image. ';
    if (error.message.includes('fetch')) {
      errorMessage += 'Network error. Please check your connection and try again.';
    } else if (error.message.includes('API key')) {
      errorMessage += 'Service configuration error. Please contact support.';
    } else {
      errorMessage += error.message || 'Internal server error.';
    }
    
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}