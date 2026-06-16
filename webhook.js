// api/webhook.js
// Stripe sends events here after payment succeeds, fails, or is refunded.
// This is where you'd trigger confirmation emails, update a database, etc.

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// Vercel needs the raw body for Stripe signature verification
export const config = { api: { bodyParser: false } };

async function getRawBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', chunk => chunks.push(chunk));
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).end('Method Not Allowed');
  }

  const rawBody = await getRawBody(req);
  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the events you care about
  switch (event.type) {

    case 'payment_intent.succeeded': {
      const pi = event.data.object;
      console.log('✅ Payment succeeded:', {
        id: pi.id,
        amount: `$${(pi.amount / 100).toFixed(2)}`,
        customer: pi.metadata.customer_name,
        email: pi.receipt_email,
        quantity: pi.metadata.quantity,
      });

      // TODO: Add your post-payment logic here:
      // - Save order to a database (e.g. Airtable, Supabase, MongoDB)
      // - Send confirmation email via Mailchimp / SendGrid / Resend
      // - Update your backer count in a CMS
      // Example (pseudocode):
      // await saveOrderToDatabase(pi);
      // await sendConfirmationEmail(pi.receipt_email, pi.metadata);
      break;
    }

    case 'payment_intent.payment_failed': {
      const pi = event.data.object;
      console.log('❌ Payment failed:', pi.id, pi.last_payment_error?.message);
      // Optionally notify the customer to retry
      break;
    }

    case 'charge.refunded': {
      const charge = event.data.object;
      console.log('↩ Refund issued:', charge.id);
      // Mark order as refunded in your database
      break;
    }

    default:
      console.log(`Unhandled event type: ${event.type}`);
  }

  res.status(200).json({ received: true });
};
