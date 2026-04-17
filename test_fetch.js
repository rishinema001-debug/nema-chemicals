const https = require('https');
https.get('https://duckduckgo.com/lite/?q=colgate+toothpaste+images', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => console.log(data));
});
