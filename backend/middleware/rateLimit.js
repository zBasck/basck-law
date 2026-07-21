// backend/middleware/rateLimit.js
// Limitador por IP/chave em memória. Sem dependência externa.
// Uso: rateLimit({ windowMs: 60000, max: 5, keyFn: req => req.ip })

function rateLimit({ windowMs = 60000, max = 5, keyFn = (req) => req.ip || 'global' } = {}) {
  const buckets = new Map();
  // limpeza periodica para nao crescer indefinidamente
  setInterval(() => {
    const agora = Date.now();
    for (const [k, v] of buckets) {
      if (v.resetAt <= agora) buckets.delete(k);
    }
  }, Math.max(5000, windowMs)).unref();

  return function (req, res, next) {
    const key = keyFn(req);
    const agora = Date.now();
    let b = buckets.get(key);
    if (!b || b.resetAt <= agora) {
      b = { count: 0, resetAt: agora + windowMs };
      buckets.set(key, b);
    }
    b.count += 1;
    res.setHeader('X-RateLimit-Limit', String(max));
    res.setHeader('X-RateLimit-Remaining', String(Math.max(0, max - b.count)));
    res.setHeader('X-RateLimit-Reset', String(Math.ceil(b.resetAt / 1000)));
    if (b.count > max) {
      return res.status(429).json({ erro: 'Muitas tentativas. Tente novamente em instantes.' });
    }
    next();
  };
}

module.exports = { rateLimit };
