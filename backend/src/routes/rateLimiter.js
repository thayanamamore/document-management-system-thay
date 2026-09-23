function createRateLimiter({ limit, windowMs, now = Date.now } = {}) {
  const maxRequests = Number.isInteger(limit) && limit > 0 ? limit : 60;
  const durationMs = Number.isInteger(windowMs) && windowMs > 0 ? windowMs : 60_000;
  const requestsByIp = new Map();

  return function rateLimiter(req, res, next) {
    const ip = req.ip || req.socket?.remoteAddress || 'unknown';
    const currentTime = now();
    const currentEntry = requestsByIp.get(ip);

    if (!currentEntry || currentTime - currentEntry.windowStartedAt >= durationMs) {
      requestsByIp.set(ip, {
        count: 1,
        windowStartedAt: currentTime,
      });
      return next();
    }

    if (currentEntry.count >= maxRequests) {
      return res.status(429).json({
        error: 'Muitas tentativas de download. Tente novamente em instantes.',
      });
    }

    currentEntry.count += 1;
    return next();
  };
}

module.exports = createRateLimiter;
