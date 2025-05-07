// Proxy endpoint for Privy email verification
export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Log request for debugging
    console.log("Email auth request received:", JSON.stringify({
      body: req.body,
      headers: {
        // Log only non-sensitive headers
        'content-type': req.headers['content-type'],
      }
    }));
    
    // Get the Privy App ID from environment variables
    const PRIVY_APP_ID = process.env.PRIVY_APP_ID || "client-WY2fr1iUtnzfTBZERvcJvo37SUfw8gaCzT9Cn7ri4bTLa";
    
    // Log what we're about to do
    console.log(`Using Privy App ID: ${PRIVY_APP_ID.substring(0, 10)}...`);
    console.log("Attempting to call Privy API...");
    
    // Forward the request to Privy's API
    const response = await fetch('https://auth.privy.io/api/v1/auth/create-verification', {
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
    console.log("Raw response:", responseText);
    
    // Only try to parse as JSON if we have content
    let data;
    if (responseText && responseText.trim()) {
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error("JSON parse error:", parseError);
        return res.status(500).json({ 
          error: 'Invalid response from Privy API',
          details: `Failed to parse response: ${parseError.message}`,
          raw: responseText.substring(0, 200)
        });
      }
    } else {
      // Handle empty response
      console.log("Empty response received from Privy API");
      data = { message: "No content returned from API" };
    }
    
    // Log a snippet of the response data
    console.log("Privy API response data:", JSON.stringify(data || {}).substring(0, 200) + "...");
    
    // Return the response with the same status code
    return res.status(response.status).json(data || {});
  } catch (error) {
    // Enhanced error logging
    console.error('Error proxying to Privy API:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    
    // Return a more detailed error response
    return res.status(500).json({ 
      error: 'Failed to connect to Privy API',
      details: error.message,
      timestamp: new Date().toISOString()
    });
  }
}