## 2026-08-27 - Preventing Sensitive Error Detail Leakage in Express Endpoints

**Vulnerability:** The `/api/gemini/activity-summary` endpoint in `server.ts` returned `error?.message` in HTTP 500 error responses when handling exceptions.
**Learning:** Returning exception details from third-party SDK calls (such as Google GenAI) or internal runtime errors can leak API configuration details, hostnames, system paths, or credential details to untrusted clients.
**Prevention:** Always log detailed error information on the server side using logger/console.error, and return sanitized generic error messages to clients in API error responses.
