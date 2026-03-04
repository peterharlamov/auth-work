const express = require("express");
require("dotenv").config();

const { clerkMiddleware, getAuth } = require("@clerk/express");
const Stripe = require("stripe");

const app = express();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

app.post(
  "/stripe/webhook",
  express.raw({ type: "application/json" }),
  (req, res) => {
    const sig = req.headers["stripe-signature"];
    const secret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!secret) return res.status(200).send("Webhook secret not set");

    let event;
    try {
      event = stripe.webhooks.constructEvent(req.body, sig, secret);
    } catch (err) {
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      console.log("✅ checkout.session.completed", {
        id: session.id,
        customer_email: session.customer_details?.email,
        client_reference_id: session.client_reference_id,
      });
    }

    res.json({ received: true });
  }
);

app.use(express.json());
app.use(clerkMiddleware());

const CLERK_SIGN_IN_URL = "https://active-mallard-98.accounts.dev/sign-in";
const STRIPE_PAYMENT_LINK_URL = process.env.STRIPE_PAYMENT_LINK_URL;

app.get("/", (req, res) => {
  res.type("html").send(`
    <h1>Auth & Payments demo ✅</h1>
    <ul>
      <li><a href="/login">Login (Clerk)</a></li>
      <li><a href="/buy">Buy PRO (Stripe Payment Link)</a></li>
      <li><a href="/paid">Paid page</a> (Stripe redirects here)</li>
      <li><a href="/dashboard">Dashboard</a> (protected)</li>
    </ul>
  `);
});

app.get("/login", (req, res) => {
  res.redirect(302, CLERK_SIGN_IN_URL);
});

app.get("/buy", (req, res) => {
  if (!STRIPE_PAYMENT_LINK_URL) {
    return res.status(500).send("STRIPE_PAYMENT_LINK_URL is not set");
  }
  res.redirect(302, STRIPE_PAYMENT_LINK_URL);
});

app.get("/paid", (req, res) => {
  res.type("html").send(`
    <h2>Payment redirect works ✅</h2>
    <p>Если ты здесь после оплаты, значит редирект Stripe настроен правильно.</p>
    <pre>${escapeHtml(JSON.stringify(req.query, null, 2))}</pre>
    <a href="/">Back</a>
  `);
});

app.get("/dashboard", (req, res) => {
  const { userId } = getAuth(req);

  if (!userId) {
    return res.redirect(302, "/login");
  }

  res.type("html").send(`
    <h2>Dashboard ✅</h2>
    <p>Ты залогинен. userId: <b>${escapeHtml(userId)}</b></p>
    <p><a href="/buy">Купить PRO</a></p>
    <p><a href="/">Home</a></p>
  `);
});

function escapeHtml(str) {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server listening on ${PORT}`));