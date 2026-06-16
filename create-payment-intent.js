// api/create-payment-intent.js
// Vercel Serverless Function — runs securely on the server, never exposed to the browser

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

module.exports = async (req, res) => {
  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // CORS headers (adjust origin to your actual domain in production)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const { amount, quantity, name, email, address } = req.body;

    // Validate amount matches expected pricing
    const validAmounts = [7900, 14900, 21000]; // cents: $79, $149, $210
    if (!validAmounts.includes(amount)) {
      return res.status(400).json({ error: 'Invalid order amount.' });
    }

    // Create a PaymentIntent with Stripe
    const paymentIntent = await stripe.paymentIntents.create({
      amount,                    // in cents
      currency: 'usd',
      automatic_payment_methods: { enabled: true },
      description: `America 250 Commemorative Coin — Preorder x${quantity}`,
      receipt_email: email,
      metadata: {
        customer_name: name,
        quantity: String(quantity),
        campaign: 'america250-preorder',
        preorder: 'true',
      },
      shipping: address ? {
        name,
        address: {
          line1: address.line1,
          city: address.city,
          state: address.state,
          postal_code: address.postal_code,
          country: 'US',
        },
      } : undefined,
    });

    // Return the client secret — front end uses this to confirm the payment
    res.status(200).json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    });

  } catch (err) {
    console.error('Stripe error:', err.message);
    res.status(500).json({ error: err.message });
  }
};
