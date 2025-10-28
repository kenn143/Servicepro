export default async function handler(req, res) {
    const { id } = req.query;
  
    if (!id) {
      return res.status(400).send("Missing ID parameter.");
    }
  
    const AIRTABLE_API_KEY ='patpiD7tGAqIjDtBc.2e94dc1d9c6b4dddd0e3d88371f7a123bf34dc9ccd05c8c2bc1219b370bfc609';
    const AIRTABLE_BASE_ID = "appxmoiNZa85I7nye";
    const AIRTABLE_TABLE_NAME = "tblE4mC8DNhpQ1j3u";
  
    try {
      const airtableUrl = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${AIRTABLE_TABLE_NAME}/${id}`;
      const response = await fetch(airtableUrl, {
        headers: { Authorization: `Bearer ${AIRTABLE_API_KEY}` },
      });
  
      if (!response.ok) {
        return res.status(404).send("Record not found");
      }
  
      const record = await response.json();
  
      const clientName = record.fields?.ClientName || "Customer Profile";
      const description =
        record.fields?.Notes || "View this customer profile in ServicePro.";
      const image =
        record.fields?.Image?.[0]?.url ||
        "https://servicepro-omega.vercel.app/thumbnail.png";
  
      const html = `
        <!DOCTYPE html>
        <html lang="en">
          <head>
            <meta charset="UTF-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  
            <!-- Open Graph -->
            <meta property="og:title" content="${clientName}" />
            <meta property="og:description" content="${description}" />
            <meta property="og:image" content="${image}" />
            <meta property="og:type" content="website" />
            <meta property="og:url" content="https://servicepro-omega.vercel.app/api/preview?id=${id}" />
  
            <!-- Twitter Card -->
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content="${clientName}" />
            <meta name="twitter:description" content="${description}" />
            <meta name="twitter:image" content="${image}" />
  
            <title>${clientName}</title>
          </head>
          <body style="font-family:sans-serif;text-align:center;padding-top:80px;">
            <div>Redirecting to customer preview...</div>
            <script>
              setTimeout(() => {
                window.location.href = "https://servicepro-omega.vercel.app/customerPreview?id=${id}";
              }, 1500);
            </script>
          </body>
        </html>
      `;
  
      res.setHeader("Content-Type", "text/html; charset=utf-8");
      res.setHeader("Cache-Control", "public, max-age=3600, s-maxage=3600");
      res.setHeader("X-Robots-Tag", "all");
  
      return res.status(200).send(html);
    } catch (err) {
      console.error(err);
      return res.status(500).send("Server error");
    }
  }
  