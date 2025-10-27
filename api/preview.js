export default async function handler(req, res) {
    const { id } = req.query;
  
    // Replace with your actual record fetch if needed
    const image = `https://servicepro-omega.vercel.app/thumbnail.png`;
    const title = 'Customer Quote';
    const description = 'View customer quote ';
  
    res.setHeader("Content-Type", "text/html");
    res.status(200).send(`
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta property="og:title" content="${title}" />
          <meta property="og:description" content="${description}" />
          <meta property="og:image" content="${image}" />
          <meta property="og:url" content="https://servicepro-omega.vercel.app/api/preview?id=${id}" />
          <meta property="og:type" content="website" />
          <meta name="twitter:card" content="summary_large_image" />
          <meta name="twitter:title" content="${title}" />
          <meta name="twitter:description" content="${description}" />
          <meta name="twitter:image" content="${image}" />
          <meta http-equiv="refresh" content="2;url=https://servicepro-omega.vercel.app/customerPreview?id=${id}">
        </head>
        <body>
          <p>Redirecting to customer preview...</p>
        </body>
      </html>
    `);
  }
  