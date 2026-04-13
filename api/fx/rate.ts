export default async function handler(req: Request) {
  if (req.method !== 'GET') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 });
  }

  try {
    const url = new URL(req.url);
    const from = url.searchParams.get('from') || 'USD';
    const to = url.searchParams.get('to') || 'USD';

    if (from === to) {
      return new Response(JSON.stringify({ rate: 1 }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    try {
      const response = await fetch(
        `https://api.frankfurter.app/latest?from=${from}&to=${to}`,
        { signal: AbortSignal.timeout(5000) }
      );
      
      if (!response.ok) throw new Error('API failed');
      
      const data = await response.json();
      const rate = data.rates?.[to];
      
      if (!rate) throw new Error('Rate not found');
      
      return new Response(JSON.stringify({ rate }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    } catch {
      const fallbackRates: Record<string, Record<string, number>> = {
        USD: { EUR: 0.92, GBP: 0.79, NGN: 1500, CAD: 1.36, AUD: 1.53, JPY: 149, CNY: 7.24 },
        EUR: { USD: 1.09, GBP: 0.86, NGN: 1630, CAD: 1.48, AUD: 1.66, JPY: 162, CNY: 7.87 },
        GBP: { USD: 1.27, EUR: 1.16, NGN: 1900, CAD: 1.72, AUD: 1.94, JPY: 189, CNY: 9.16 },
      };
      
      const rate = fallbackRates[from]?.[to] || 1;
      
      return new Response(JSON.stringify({ rate, source: 'fallback' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}
