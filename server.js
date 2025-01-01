const http = require('http');
const { URL } = require('url');

// Define a lookup table for redirects
const REDIRECT_MAPPINGS = {
  'dev': 'http://localhost:8080',
  'prod': 'https://production-domain.com',
  // Add more environments as needed
};

// Create the server
const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  console.log(`catching from: ${url}`);

  // Check for special redirect parameter
  const environment = url.searchParams.get('environment');
  if (environment && REDIRECT_MAPPINGS[environment]) {
    // Create new URL from the mapped destination
    const mappedUrl = new URL(REDIRECT_MAPPINGS[environment]);

    // Extract the path and query from the encoded URL in the pathname
    try {
      // Remove the leading slash and parse the remaining URL
      const encodedUrl = new URL(url.pathname.substring(1));

      // Copy the path from the encoded URL
      mappedUrl.pathname = mappedUrl.pathname.replace(/\/$/, '') + encodedUrl.pathname;

      // Copy all query parameters from both the encoded URL and the original URL (except 'environment')
      url.searchParams.delete('environment');
      for (const [key, value] of [...encodedUrl.searchParams, ...url.searchParams]) {
        mappedUrl.searchParams.append(key, value);
      }
    } catch (error) {
      console.error('Invalid encoded URL:', error);
      res.writeHead(400, { 'Content-Type': 'text/plain' });
      res.end('Invalid encoded URL in pathname');
      return;
    }

    console.log(`redirecting to mapped URL: ${mappedUrl.toString()}`);
    res.writeHead(307, { Location: mappedUrl.toString() });
    res.end(`Redirecting to ${mappedUrl.toString()}`);
    return;
  }

  // Original redirect logic
  const redirectUrl = url.pathname.substring(1) + url.search;
  console.log(`redirecting to: ${redirectUrl}`);

  if (redirectUrl) {
    res.writeHead(307, { Location: redirectUrl });
    res.end(`Redirecting to ${redirectUrl}`);
  } else {
    res.writeHead(400, { 'Content-Type': 'text/plain' });
    res.end('Invalid redirect target.');
  }
});

// Start the server
const PORT = 3021;
server.listen(PORT, () => {
  console.log(`Redirect server running on http://localhost:${PORT}`);
});

