// Proxy endpoint for Privy email verification
export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get the Privy App ID from environment variables
    const PRIVY_APP_ID = process.env.PRIVY_APP_ID || "client-WY2fr1iUtnzfTBZERvcJvo37SUfw8gaCzT9Cn7ri4bTLa";
    
    // Forward the request to Privy's API
    const response = await fetch('https://auth.privy.io/api/v1/auth/create-verification', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'privy-app-id': PRIVY_APP_ID
      },
      body: JSON.stringify(req.body)
    });
    
    // Get the response data
    const data = await response.json();
    
    // Return the response with the same status code
    return res.status(response.status).json(data);
  } catch (error) {
    console.error('Error proxying to Privy API:', error);
    return res.status(500).json({ error: 'Failed to connect to Privy API' });
  }
}