# America 250 Preorder Site — Deployment Guide
## You'll be live in about 20 minutes. No coding required.

---

## WHAT YOU NEED FIRST

- [ ] A free **GitHub** account → github.com
- [ ] A free **Vercel** account → vercel.com (sign up with GitHub)
- [ ] A free **Stripe** account → stripe.com

---

## STEP 1 — SET UP STRIPE (10 min)

1. Go to **stripe.com** and create a free account
2. Complete your business profile (you can use your name as the business name)
3. Go to **Developers → API Keys** in your Stripe dashboard
4. Copy your two keys — you'll need both:
   - **Publishable key** → starts with `pk_live_...`
   - **Secret key** → starts with `sk_live_...`

> ⚠️ While testing, use the TEST keys (`pk_test_` and `sk_test_`) so no real charges occur.
> Switch to LIVE keys when you're ready to accept real payments.

---

## STEP 2 — UPLOAD TO GITHUB (5 min)

1. Go to **github.com** → click the **+** → **New repository**
2. Name it `america250-preorder`, set it to **Public**, click **Create**
3. On the next screen, click **uploading an existing file**
4. Upload ALL the files from this folder:
   ```
   america250/
   ├── package.json
   ├── vercel.json
   ├── api/
   │   ├── create-payment-intent.js
   │   └── webhook.js
   └── public/
       ├── index.html
       └── coin.png
   ```
5. Click **Commit changes**

---

## STEP 3 — DEPLOY TO VERCEL (5 min)

1. Go to **vercel.com** and click **Add New → Project**
2. Click **Import** next to your `america250-preorder` GitHub repo
3. Leave all settings as default — Vercel auto-detects the setup
4. Before clicking Deploy, click **Environment Variables** and add these:

   | Variable Name | Value |
   |---|---|
   | `STRIPE_SECRET_KEY` | `sk_live_...` (your Stripe secret key) |
   | `STRIPE_WEBHOOK_SECRET` | (set this after Step 4 below) |

5. Click **Deploy** — your site will be live at a URL like `america250-preorder.vercel.app`

---

## STEP 4 — SET UP THE STRIPE WEBHOOK (5 min)

The webhook fires after every successful payment so you can track orders.

1. In your Stripe Dashboard → **Developers → Webhooks** → **Add endpoint**
2. Set the endpoint URL to:
   ```
   https://YOUR-VERCEL-URL.vercel.app/api/webhook
   ```
3. Under **Events to listen to**, select:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `charge.refunded`
4. Click **Add endpoint**
5. Click the webhook you just created → **Reveal signing secret** → copy it
6. Go back to Vercel → your project → **Settings → Environment Variables**
7. Add: `STRIPE_WEBHOOK_SECRET` = the value you just copied
8. Go to **Deployments** → click **Redeploy** so the new variable takes effect

---

## STEP 5 — UPDATE YOUR SITE WITH YOUR LIVE KEY

Open `public/index.html` in GitHub (click the file → pencil icon to edit) and find this line near the bottom:

```javascript
const STRIPE_PUBLISHABLE_KEY = 'pk_live_REPLACE_WITH_YOUR_KEY';
```

Replace `pk_live_REPLACE_WITH_YOUR_KEY` with your actual publishable key.
Commit the change → Vercel auto-redeploys in about 30 seconds.

---

## STEP 6 — CONNECT A CUSTOM DOMAIN (OPTIONAL)

1. In Vercel → your project → **Settings → Domains**
2. Add your domain (e.g. `america250coin.com`)
3. Follow the DNS instructions Vercel provides
4. Vercel handles SSL (the 🔒 padlock) for free automatically

---

## HOW TO SEE YOUR ORDERS

Every successful payment appears in your **Stripe Dashboard → Payments**.
You'll see the customer name, email, amount, and shipping address for every preorder.

To get email notifications for every new payment:
- Stripe Dashboard → **Settings → Email notifications** → turn on **Successful payments**

---

## HOW TO ISSUE REFUNDS

If the funding goal isn't reached, refund everyone:
1. Stripe Dashboard → **Payments**
2. Click a payment → **Refund**
3. Or use **Stripe's Bulk Refund** tool for all at once

---

## TEST YOUR SITE BEFORE GOING LIVE

Use Stripe's test card to place a test order:
- Card number: **4242 4242 4242 4242**
- Expiry: any future date (e.g. 12/28)
- CVC: any 3 digits (e.g. 123)
- ZIP: any 5 digits

This simulates a real payment without charging anyone.

---

## NEED HELP?

Email: preorders@america250coin.com
Stripe docs: https://stripe.com/docs
Vercel docs: https://vercel.com/docs
