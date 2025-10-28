// export default async function handler(req, res) {
//     const { id } = req.query;
  
//     // Replace with your actual record fetch if needed
//     const image = `https://servicepro-omega.vercel.app/thumbnail.png`;
//     const title = 'Customer Quote';
//     const description = 'View customer quote ';
  
//     res.setHeader("Content-Type", "text/html");
//     res.status(200).send(`
//       <!DOCTYPE html>
//       <html lang="en">
//         <head>
//           <meta property="og:title" content="${title}" />
//           <meta property="og:description" content="${description}" />
//           <meta property="og:image" content="${image}" />
//           <meta property="og:url" content="https://servicepro-omega.vercel.app/api/preview?id=${id}" />
//           <meta property="og:type" content="website" />
//           <meta name="twitter:card" content="summary_large_image" />
//           <meta name="twitter:title" content="${title}" />
//           <meta name="twitter:description" content="${description}" />
//           <meta name="twitter:image" content="${image}" />
//           <meta http-equiv="refresh" content="2;url=https://servicepro-omega.vercel.app/customerPreview?id=${id}">
//         </head>
//         <body>
//           <p>Redirecting to customer preview...</p>
//         </body>
//       </html>
//     `);
//   }
// pages/preview/[id].js
// ✅ Server-side rendering so each share link can be unique
export async function getServerSideProps({ params }) {
    const { id } = params;
  
    // You can fetch record data here if needed
    const title = `Customer Quote `;
    const description = `View your quote details for customer.`;
    const image = `https://servicepro-omega.vercel.app/thumbnail.png`;
  
    return {
      props: { id, title, description, image },
    };
  }
  
  export default function Preview({ id, title, description, image }) {
    return (
      <html lang="en">
        <head>
          <meta property="og:title" content={title} />
          <meta property="og:description" content={description} />
          <meta property="og:image" content={image} />
          <meta property="og:url" content={`https://servicepro-omega.vercel.app/preview/${id}`} />
          <meta property="og:type" content="website" />
          <meta name="twitter:card" content="summary_large_image" />
          <meta name="twitter:title" content={title} />
          <meta name="twitter:description" content={description} />
          <meta name="twitter:image" content={image} />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
        </head>
        <body>
          <p>Redirecting to your quote...</p>
          <script
            dangerouslySetInnerHTML={{
              __html: `
                setTimeout(() => {
                  window.location.href = "https://servicepro-omega.vercel.app/customerPreview?id=${id}";
                }, 1000);
              `,
            }}
          />
        </body>
      </html>
    );
  }
  