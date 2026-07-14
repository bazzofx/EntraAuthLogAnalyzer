# Sync Entra 
 ## First Steps for Setup
To enable the real-time feed, you need to register an application in your Azure tenant:
App Registration: Go to the Azure Portal > Microsoft Entra ID > App registrations > New registration.
API Permissions:
Go to API permissions > Add a permission > Microsoft Graph.
Select Application permissions.
Search for and add AuditLog.Read.All.
Admin Consent: Click the "Grant admin consent for [Your Organization]" button.
Create Secret: Go to Certificates & secrets > New client secret. Copy the Value immediately (you won't see it again).
Environment Variables: Configure these variables in your environment settings:
ENTRA_CLIENT_ID: Found on the App Registration "Overview" page.
ENTRA_TENANT_ID: Found on the App Registration "Overview" page.
ENTRA_CLIENT_SECRET: The secret value you created in step 4.

## 🚀 New Features Added
Full-Stack Backend: Added an Express server (server.ts) that handles the OAuth2 Client Credentials flow to securely acquire access tokens from Microsoft.
Real-Time Sync Endpoint: A new API endpoint fetches the latest 100 sign-in logs directly from the Microsoft Graph Audit Logs API and maps them into our analyzer's format.
Sync UI:
Added a "Sync Entra" button to the main header.
Updated the "No Data" dashboard state to include a direct sync option alongside the CSV upload.
Implemented visual feedback for syncing states (Loading, Success, and detailed Error reporting if credentials are missing).
Once you've set the environment variables, you can click Sync Entra to pull live data without needing to export and upload CSV files manually.