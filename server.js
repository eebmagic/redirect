const http = require('http');
const { URL } = require('url');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Add function to get git hash
const getGitHash = () => {
  try {
    return execSync('git rev-parse HEAD').toString().trim();
  } catch (error) {
    return 'Git hash unavailable';
  }
};

// Load redirect mappings from JSON file
const REDIRECT_MAPPINGS = JSON.parse(
  fs.readFileSync(path.join(__dirname, 'redirectMappings.json'), 'utf8')
);

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
  const gitHash = getGitHash();
  console.log(`Running git hash version: ${gitHash}`);
  console.log(`Redirect server running on http://localhost:${PORT}`);
});

