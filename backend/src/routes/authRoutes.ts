import { Router } from "express";
import { OAuth2Client } from "google-auth-library";
import jwt from "jsonwebtoken";
import { prisma } from "../db";
import { config } from "../config";
import { setAuthCookie } from "../auth";

const router = Router();
const googleClient = new OAuth2Client(config.googleClientId);

router.post("/google", async (req, res) => {
  try {
    const { idToken } = req.body as { idToken?: string };
    if (!idToken) {
      return res.status(400).json({ message: "idToken is required" });
    }

    const ticket = await googleClient.verifyIdToken({
      idToken,
      audience: config.googleClientId,
    });

    const payload = ticket.getPayload();
    if (!payload?.sub || !payload.email) {
      return res.status(400).json({ message: "Invalid Google token" });
    }

    const user = await prisma.user.upsert({
      where: { googleId: payload.sub },
      update: {
        email: payload.email,
        name: payload.name,
        avatar: payload.picture,
      },
      create: {
        googleId: payload.sub,
        email: payload.email,
        name: payload.name,
        avatar: payload.picture,
      },
    });

    const token = jwt.sign(
      { id: user.id, email: user.email, name: user.name },
      config.jwtSecret,
      { expiresIn: "7d" }
    );

    setAuthCookie(res, token);
    res.json({ token, user });
  } catch (err) {
    console.error("google auth error", err);
    res.status(401).json({ message: "Google authentication failed" });
  }
});

router.post("/logout", (_req, res) => {
  res.clearCookie("token");
  res.json({ message: "logged out" });
});

export default router;
