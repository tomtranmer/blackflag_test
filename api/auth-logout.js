// Proxy endpoint for Privy logout
export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
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
    const response = await fetch('https://auth.privy.io/api/v1/auth/logout', {
      method: 'POST',
      headers: {
        'Authorization': authHeader,
        'privy-app-id': PRIVY_APP_ID
      }
    });
    
    // Handle response correctly
    if (response.status === 204 || response.status === 200) {
      // No content or success response
      return res.status(response.status).json({ success: true });
    }
    
    // For other status codes, try to parse the response
    const responseText = await response.text();
    
    // Only try to parse as JSON if we have content
    let data = { success: false };
    if (responseText && responseText.trim()) {
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error("JSON parse error:", parseError);
        return res.status(500).json({ 
          error: 'Invalid response from Privy API',
          details: `Failed to parse response: ${parseError.message}`
        });
      }
    }
    
    // Return the response with the same status code
    return res.status(response.status).json(data);
  } catch (error) {
    // Enhanced error logging
    console.error('Error proxying to Privy API:', error);
    
    // Return a more detailed error response
    return res.status(500).json({ 
      error: 'Failed to connect to Privy API',
      details: error.message,
      timestamp: new Date().toISOString()
    });
  }
}