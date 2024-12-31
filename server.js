const http = require('http');
const { URL } = require('url');

// Create the server
const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  console.log(`catching from: ${url}`);

  // Extract the redirect target from the path and preserve query params
  console.log(`Working with url pathname:`, url.pathname);
  console.log(`Working with url search:`, url.search);
  const redirectUrl = url.pathname.substring(1) + url.search;
  console.log(`redirecting to: ${redirectUrl}`);

  if (redirectUrl) {
    // Issue a 307 redirect to the target
    res.writeHead(307, { Location: redirectUrl });
    res.end(`Redirecting to ${redirectUrl}`);
  } else {
    // Respond with a 400 Bad Request if no valid target
    res.writeHead(400, { 'Content-Type': 'text/plain' });
    res.end('Invalid redirect target.');
  }
});

// Start the server
const PORT = 3021;
server.listen(PORT, () => {
  console.log(`Redirect server running on http://localhost:${PORT}`);
});

