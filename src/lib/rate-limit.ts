const requests = new Map<string, { count: number; resetTime: number }>();

// Clean up expired entries every 60 seconds
let lastCleanup = Date.now();
function cleanup() {
  const now = Date.now();
  if (now - lastCleanup < 60_000) return;
  lastCleanup = now;
  for (const [key, value] of requests) {
    if (now > value.resetTime) {
      requests.delete(key);
    }
  }
}

export function rateLimit(
  ip: string,
  path: string,
  { limit, windowMs }: { limit: number; windowMs: number }
): { success: boolean; remaining: number } {
  cleanup();

  const key = `${ip}:${path}`;
  const now = Date.now();
  const entry = requests.get(key);

  if (!entry || now > entry.resetTime) {
    requests.set(key, { count: 1, resetTime: now + windowMs });
    return { success: true, remaining: limit - 1 };
  }

  entry.count++;
  if (entry.count > limit) {
    return { success: false, remaining: 0 };
  }

  return { success: true, remaining: limit - entry.count };
}
