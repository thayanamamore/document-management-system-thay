const { test } = require('node:test');
const assert = require('node:assert/strict');
const createRateLimiter = require('../src/routes/rateLimiter');

function createResponseRecorder() {
  return {
    statusCode: 200,
    body: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      this.body = payload;
      return this;
    },
  };
}

test('permite requisições até o limite e bloqueia o excedente', () => {
  let now = 1_000;
  const limiter = createRateLimiter({
    limit: 2,
    windowMs: 60_000,
    now: () => now,
  });
  const req = { ip: '127.0.0.1' };

  let nextCalls = 0;
  limiter(req, createResponseRecorder(), () => {
    nextCalls += 1;
  });
  limiter(req, createResponseRecorder(), () => {
    nextCalls += 1;
  });

  const blockedResponse = createResponseRecorder();
  limiter(req, blockedResponse, () => {
    nextCalls += 1;
  });

  assert.equal(nextCalls, 2);
  assert.equal(blockedResponse.statusCode, 429);
  assert.deepEqual(blockedResponse.body, {
    error: 'Muitas tentativas de download. Tente novamente em instantes.',
  });

  now += 60_000;
  limiter(req, createResponseRecorder(), () => {
    nextCalls += 1;
  });

  assert.equal(nextCalls, 3);
});
