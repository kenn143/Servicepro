export default async function handler(req, res) {
    const { id } = req.query;
  
    // ✅ Validate ID
    if (!id) {
      return res.status(400).send("Missing ID parameter.");
    }
  
    // ✅ Replace with your Airtable credentials
    const AIRTABLE_API_KEY = "patpiD7tGAqIjDtBc.2e94dc1d9c6b4dddd0e3d88371f7a123bf34dc9ccd05c8c2bc1219b370bfc609";
    const AIRTABLE_BASE_ID = "appxmoiNZa85I7nye"; // replace with your base ID
    const AIRTABLE_TABLE_NAME = "tblE4mC8DNhpQ1j3u"; // replace with your table name
  
    try {
      // ✅ Fetch record from Airtable
      const airtableUrl = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${AIRTABLE_TABLE_NAME}/${id}`;
      const response = await fetch(airtableUrl, {
        headers: {
          Authorization: `Bearer ${AIRTABLE_API_KEY}`,
        },
      });
  
      if (!response.ok) {
        return res.status(404).send("Record not found");
      }
  
      const record = await response.json();
  
      // ✅ Extract fields (customize to your Airtable schema)
      const clientName = record.fields?.ClientName || "Customer Profile";
      const description =
        record.fields?.Notes || "View this customer profile in ServicePro.";
      const image =
        record.fields?.Image?.[0]?.url ||
        "https://servicepro-omega.vercel.app/thumbnail.png";
  
      // ✅ Build static HTML with OG meta tags for WhatsApp
      const html = `
        <!DOCTYPE html>
        <html lang="en">
          <head>
            <meta charset="UTF-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  
            <!-- ✅ Open Graph meta tags -->
            <meta property="og:title" content="${clientName}" />
            <meta property="og:description" content="${description}" />
            <meta property="og:image" content="${image}" />
            <meta property="og:type" content="website" />
            <meta property="og:url" content="https://servicepro-omega.vercel.app/api/preview?id=${id}" />
  
            <!-- Optional for better sharing -->
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content="${clientName}" />
            <meta name="twitter:description" content="${description}" />
            <meta name="twitter:image" content="${image}" />
  
            <title>${clientName}</title>
  
            <style>
              body {
                font-family: sans-serif;
                text-align: center;
                padding-top: 100px;
              }
              .loading {
                font-size: 1.2rem;
                color: #555;
              }
            </style>
          </head>
          <body>
            <div class="loading">Redirecting to customer preview...</div>
            <script>
              // Delay to ensure crawlers read OG tags first
              setTimeout(() => {
                window.location.href = "https://servicepro-omega.vercel.app/customerPreview?id=${id}";
              }, 1500);
            </script>
          </body>
        </html>
      `;
  
      // ✅ Return HTML
      res.setHeader("Content-Type", "text/html");
      res.status(200).send(html);
    } catch (err) {
      console.error("Error fetching from Airtable:", err);
      res.status(500).send("Server error");
    }
  }
  