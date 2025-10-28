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
import Head from 'next/head'


export async function getServerSideProps({ params, req }) {
const { id } = params || {};


// === Optional: fetch dynamic data here (title, description, image) ===
// Example placeholder: if you have an API or database, fetch it here.
// const res = await fetch(`https://.../quotes/${id}`)
// const data = await res.json()
// const title = data.title


const title = `Customer Quote `
const description = `View quote details for customer `;


// IMPORTANT: Use a fully-qualified absolute HTTPS URL for the image
// Make sure the image is publicly accessible, >= 300x200 and < 5MB
const image = `https://servicepro-omega.vercel.app/thumbnail.png`;


return {
props: { id, title, description, image },
}
}


export default function Preview({ id, title, description, image }) {
// The crawler (WhatsApp / Facebook) will see the meta tags because
// they are rendered server-side. We purposely do NOT include
// server-side redirects because crawlers ignore redirects and only
// read the initial HTML response.


// After a short delay, real users are redirected to your actual app page.
const destination = `https://servicepro-omega.vercel.app/customerPreview?id=${id}`


return (
<>
<Head>
<meta charSet="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />


<title>{title}</title>


{/* Open Graph / Facebook */}
<meta property="og:title" content={title} />
<meta property="og:description" content={description} />
<meta property="og:image" content={image} />
<meta property="og:url" content={`https://servicepro-omega.vercel.app/preview/${id}`} />
<meta property="og:type" content="website" />


{/* Twitter */}
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content={title} />
<meta name="twitter:description" content={description} />
<meta name="twitter:image" content={image} />


{/* Optional: prevent indexing if you don't want search engines indexing these previews */}
<meta name="robots" content="noindex, nofollow" />


</Head>


<main style={{fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, sans-serif', padding: 24}}>
<h1 style={{fontSize: 18, marginBottom: 8}}>{title}</h1>
<p style={{marginBottom: 20}}>{description}</p>
<p style={{fontSize: 12, color: '#666'}}>Redirecting to quote...</p>


<script dangerouslySetInnerHTML={{ __html: `
// Client-side redirect for real users only. Give crawlers time to read the tags.
// 700ms is usually enough; increase to 1200 if you need more safety.
setTimeout(function(){ window.location.replace(${JSON.stringify(destination)}) }, 700);
`}} />
</main>
</>
)
}