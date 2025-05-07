// Add a new API endpoint to provide app configuration to the client
export default async function handler(req, res) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get the Privy App ID from environment variables or use fallback for development
    const privyAppId = process.env.PRIVY_APP_ID || "client-WY2fr1iUtnzfTBZERvcJvo37SUfw8gaCzT9Cn7ri4bTLa";
    console.log(`Using Privy App ID: ${privyAppId}...`);

    // Return public configuration that the client needs
    return res.status(200).json({
      privyAppId: privyAppId,
      apiUrl: "https://auth.privy.io/api/v1"
    });
  } catch (error) {
    console.error('Error getting app config:', error);
    return res.status(500).json({ error: 'Failed to retrieve app configuration' });
  }
}