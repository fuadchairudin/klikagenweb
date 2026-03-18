export function verifyApiKey(req: Request): boolean {
  const authHeader = req.headers.get("x-api-key");
  const expectedKey = process.env.API_KEY;

  if (!expectedKey) {
    console.warn("API_KEY environment variable is not set!");
    return false;
  }

  return authHeader === expectedKey;
}
