// Proxy endpoint for Privy user data
import fetch from 'node-fetch';

export default async function handler(req, res) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get the Authorization header
    const authHeader = req.headers.authorization;
    
    // Check if Authorization header is present
    if (!authHeader) {
      return res.status(401).json({ error: 'Authorization header is required' });
    }
    
    // Get the Privy App ID from environment variables
    const PRIVY_APP_ID = process.env.PRIVY_APP_ID || "client-WY2fr1iUtnzfTBZERvcJvo37SUfw8gaCzT9Cn7ri4bTLa";
    
    // Forward the request to Privy's API
    const response = await fetch('https://auth.privy.io/api/v1/users/me', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authHeader,
        'privy-app-id': PRIVY_APP_ID
      }
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