// Mailtrap webhook endpoint for email tracking
// This receives events like: delivered, opened, clicked, bounced, etc.

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const events = req.body.events || [req.body]; // Mailtrap sends events array
    
    for (const event of events) {
      const { event_type, timestamp, message_id, recipient, metadata } = event;
      
      // Handle different event types
      switch (event_type) {
        case 'delivered':
          // Email successfully delivered
          break;
          
        case 'opened':
          // Email opened by recipient
          break;
          
        case 'clicked':
          // Link clicked in email
          break;
          
        case 'bounced':
          // Email bounced
          break;
          
        case 'spam_complaint':
          // Recipient marked as spam
          break;
          
        default:
          // Unknown event type
      }
    }

    // Return success to Mailtrap
    res.status(200).json({ 
      success: true, 
      message: 'Events processed successfully',
      events_processed: events.length 
    });

  } catch (error) {
    console.error('❌ Error processing Mailtrap events:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};
