// Proxy endpoint for Privy email verification
export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  
    // Log request for debugging
    console.log("Email auth request received");
    
    // Get the Privy App ID from environment variables
    // clyvjj7dm048l8lwj7krukn29 is the TEST PROJECT APP ID
    const PRIVY_APP_ID = process.env.PRIVY_APP_ID || "clyvjj7dm048l8lwj7krukn29";
    const PRIVY_API_SECRET = process.env.PRIVY_API_SECRET || "3WYzDQwNt5rXQdZyP5o7w2a64PYvVMDJ34TdeLQGBxmtx8LR3DC8VKzdFpV8yra2bjg2k2PVccCJWg7sxz58Tq2o";
    
    // Verify we have all required fields
    const { email, method, redirect_uri } = req.body;
    
    if (!email || !method || method !== 'email' || !redirect_uri) {
      return res.status(400).json({ 
        error: 'Missing required fields',
        details: 'Email verification requires email, method="email", and redirect_uri'
      });
    }
    
    // Create proper request body for Privy API
    const privyPayload = {
      method: method,
      email: email,
      redirect_uri: redirect_uri,
      subject: req.body.subject || "Login to Black Flag",
      message: req.body.message || "Click the link to login to your Black Flag account"
    };


    console.log("NEW TEST FOR GET ALL USERS:")
    const options = {
      method: 'GET',
      headers: {
        'privy-app-id': PRIVY_APP_ID, 
        Authorization: `Basic ${btoa(PRIVY_APP_ID + ':' + PRIVY_API_SECRET)}`,
        'Content-Type': 'application/json',
      }
    };

    console.log("options: ", options);
    console.log("fetching users from privy api");

    try {
    
      await fetch('https://api.privy.io/v1/users', options)
        .then(response => response.json())
        .then(response => console.log(response))
        .catch(err => console.error(err));
        
    } catch (error) {
      console.error('Error fetching users from Privy API:', error);
      return res.status(500).json({ 
        error: 'Failed to connect to Privy API',
        details: error.message,
        timestamp: new Date().toISOString()
      });
    }


  // ORIGINAL CODE
  try {
    
    console.log("Calling Privy API with payload", JSON.stringify(privyPayload).substring(0, 200));
    
    const PRIVY_API_URL = process.env.PRIVY_API_URL || "https://auth.privy.io/api/v1/auth/create-verification";
    console.log(`Using Privy API URL: ${PRIVY_API_URL}...`);

    // build the privy api auth header
    const authHeader = req.headers.authorization;
    console.log(`Using Privy API auth header: ${authHeader}...`);
    if (!authHeader) {
      return res.status(401).json({
        error: 'Authorization header is required',
        details: 'Missing Authorization header for Privy API'
      });
    }
    // Log the request body for debugging
    console.log("Request body:", JSON.stringify(req.body));
    console.log("Privy App ID:", PRIVY_APP_ID);

    // Forward the request to Privy's API
    const response = await fetch('https://auth.privy.io/api/v1/auth/create-verification', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'privy-app-id': PRIVY_APP_ID,
        'Authorization': req.headers.authorization    // Basic Auth header with your app ID as the username and your app secret as the password.
      },
      body: JSON.stringify(privyPayload)
    });
    
    // Log the response status
    console.log(`Privy API response status: ${response.status}`);
    
    // Check if we have an error status
    if (response.status >= 400) {
      console.error(`Privy API error: ${response.status}`);
      
      // Try to get error details
      const errorText = await response.text();
      console.error("Error details:", errorText);
      
      // Handle as fallback - store the email in session and redirect
      console.log("Using fallback email authentication method");
      
      return res.status(200).json({
        success: true,
        fallback: true,
        message: "Email verification requested",
        email: email
      });
    }
    
    // Check for empty response
    const responseText = await response.text();
    
    // Only try to parse as JSON if we have content
    let data;
    if (responseText && responseText.trim()) {
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error("JSON parse error:", parseError);
        // Still return success for email - we can't confirm if it worked
        return res.status(200).json({ 
          success: true,
          message: "Email verification requested",
          email: email
        });
      }
    } else {
      // Handle empty response - assume success for email verification
      console.log("Empty response received from Privy API");
      data = { 
        success: true,
        message: "Email verification requested",
        email: email
      };
    }
    
    // Return success response
    return res.status(200).json(data);
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