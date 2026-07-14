import express from "express";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import fetch from "node-fetch";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Microsoft Entra Integration Endpoint
  app.get("/api/entra/logs", async (req, res) => {
    const { ENTRA_CLIENT_ID, ENTRA_CLIENT_SECRET, ENTRA_TENANT_ID } = process.env;

    if (!ENTRA_CLIENT_ID || !ENTRA_CLIENT_SECRET || !ENTRA_TENANT_ID) {
      return res.status(400).json({ 
        error: "Missing Entra configuration. Please set ENTRA_CLIENT_ID, ENTRA_CLIENT_SECRET, and ENTRA_TENANT_ID in environment variables." 
      });
    }

    try {
      // 1. Get Access Token
      const tokenResponse = await fetch(`https://login.microsoftonline.com/${ENTRA_TENANT_ID}/oauth2/v2.0/token`, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          client_id: ENTRA_CLIENT_ID,
          client_secret: ENTRA_CLIENT_SECRET,
          grant_type: "client_credentials",
          scope: "https://graph.microsoft.com/.default",
        }),
      });

      const tokenData: any = await tokenResponse.json();
      if (!tokenData.access_token) {
        throw new Error(tokenData.error_description || "Failed to acquire access token");
      }

      // 2. Fetch Sign-in Logs from Graph API
      // We fetch the last 100 sign-ins
      const graphResponse = await fetch("https://graph.microsoft.com/v1.0/auditLogs/signIns?$top=100&$orderby=createdDateTime desc", {
        headers: {
          Authorization: `Bearer ${tokenData.access_token}`,
        },
      });

      const graphData: any = await graphResponse.json();
      
      if (graphData.error) {
        throw new Error(graphData.error.message);
      }

      // 3. Map Graph API response to our AuthLog format
      const mappedLogs = graphData.value.map((item: any) => ({
        date: item.createdDateTime,
        requestId: item.id,
        user: item.userDisplayName || item.userPrincipalName,
        username: item.userPrincipalName,
        application: item.appDisplayName,
        ipAddress: item.ipAddress,
        location: `${item.location.city || 'Unknown'}, ${item.location.state || ''}, ${item.location.countryOrRegion}`,
        status: item.status.errorCode === 0 ? "Success" : "Failure",
        failureReason: item.status.failureReason || "",
        browser: item.deviceDetail.browser || "Unknown",
        os: item.deviceDetail.operatingSystem || "Unknown",
        mfaResult: item.mfaDetail?.authMethod || "None",
        authRequirement: item.conditionalAccessStatus || "Unknown",
        userAgent: item.userAgent || "",
        latency: 0, // Not provided by Graph API directly in this endpoint
      }));

      res.json(mappedLogs);
    } catch (error: any) {
      console.error("Entra Sync Error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static("dist"));
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
