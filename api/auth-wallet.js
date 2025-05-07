// Proxy endpoint for Privy wallet authentication
export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Log request for debugging
    console.log("Wallet auth request received");
    
    // Get the Privy App ID from environment variables
    const PRIVY_APP_ID = process.env.PRIVY_APP_ID || "client-WY2fr1iUtnzfTBZERvcJvo37SUfw8gaCzT9Cn7ri4bTLa";
    
    // Forward the request to Privy's API
    const response = await fetch('https://auth.privy.io/api/v1/auth/wallet', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'privy-app-id': PRIVY_APP_ID
      },
      body: JSON.stringify(req.body)
    });
    
    // Log the response status
    console.log(`Privy API response status: ${response.status}`);
    
    // Check for empty response
    const responseText = await response.text();
    
    // Only try to parse as JSON if we have content
    let data;
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
    } else {
      // Handle empty response
      console.log("Empty response received from Privy API");
      data = { message: "No content returned from API" };
    }
    
    // Return the response with the same status code
    return res.status(response.status).json(data || {});
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