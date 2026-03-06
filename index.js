addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
  const url = new URL(request.url);
  const targetUrlParam = url.searchParams.get('url');

  // 1. Validasi URL
  if (!targetUrlParam) {
    return new Response('Parameter "url" diperlukan', { status: 400 });
  }

  try {
      // Basic URL validation
      const targetUrl = new URL(targetUrlParam);
      // Only allow https, you can also validate the domain
      if (targetUrl.protocol !== 'https:') {
          return new Response('Hanya URL HTTPS yang diizinkan.', { status: 400 });
      }

      // 2. Fetch the resource
      const response = await fetch(targetUrlParam, {
          method: request.method,
          headers: request.headers,
          body: request.body,
      });

      // 3. Create a new response with CORS headers
      const newHeaders = new Headers(response.headers);
      //newHeaders.set('Access-Control-Allow-Origin', 'https://yourwebkomik.com'); // Hapus atau Komentar baris ini
      newHeaders.set('Access-Control-Allow-Origin', '*'); //  Izinkan semua domain - HATI-HATI!
      newHeaders.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      // Remove potentially problematic headers
      newHeaders.delete('Content-Security-Policy');
      newHeaders.delete('X-Frame-Options');

      // 4. Pretty Print JSON (Jika responsnya adalah JSON)
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
          const jsonBody = await response.json();
          const prettyJson = JSON.stringify(jsonBody, null, 2); // 2 spaces for indentation
          newHeaders.set('Content-Type', 'application/json; charset=UTF-8'); // Update Content-Type
          return new Response(prettyJson, {
              status: response.status,
              statusText: response.statusText,
              headers: newHeaders,
          });
      }


      // Jika bukan JSON, kembalikan respons asli
      return new Response(response.body, {
          status: response.status,
          statusText: response.statusText,
          headers: newHeaders,
      });


  } catch (error) {
      console.error('Error fetching resource:', error);
      return new Response('Error fetching resource: ' + error.message, { status: 500 });
  }
}
