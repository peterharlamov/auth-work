const express = require("express");
const {
  clerkMiddleware,
  clerkClient,
  getAuth,
  requireAuth,
} = require("@clerk/express");

const app = express();
app.use(clerkMiddleware());

app.get("/", (req, res) => {
  res.status(200).send("OK: Render service is running ✅");
});

app.get("/paid", (req, res) => {
  res.status(200).json({
    message: "Payment redirect works ✅",
    query: req.query,
    time: new Date().toISOString(),
  });
});

app.get("/api/me", async (req, res) => {
  const { userId } = getAuth(req);

  if (!userId) {
    return res.status(401).json({
      error: "Unauthorized",
      hint: "Send Authorization: Bearer <Clerk JWT>",
    });
  }

  const user = await clerkClient.users.getUser(userId);

  res.json({
    userId,
    email: user.emailAddresses?.[0]?.emailAddress ?? null,
    firstName: user.firstName,
    lastName: user.lastName,
  });
});

app.get("/protected", requireAuth(), (req, res) => {
  const { userId } = getAuth(req);
  res.send(`You are signed in ✅ userId=${userId}`);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));