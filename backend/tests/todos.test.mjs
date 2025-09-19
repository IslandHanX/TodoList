// tests/run-api-tests.mjs
// Node 18+ 内置 fetch；确保后端已启动在 BASE（默认 http://localhost:4000）
// 可用 BASE_URL 环境变量覆盖：BASE_URL=http://localhost:4000 node tests/run-api-tests.mjs

const BASE = process.env.BASE_URL || 'http://localhost:4000';

async function request(method, path, body) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });
  let data = null;
  try { data = await res.json(); } catch {}
  return { status: res.status, data };
}

function assert(cond, msg) {
  if (!cond) throw new Error(msg);
}
function assertEq(a, b, msg = `expected ${JSON.stringify(b)}, got ${JSON.stringify(a)}`) {
  if (a !== b) throw new Error(msg);
}
function title(t) { return `${t} #${Date.now()}-${Math.random().toString(36).slice(2,7)}`; }

// ---- Core happy path tests ----
async function testCreateTodo() {
  const t = title('Create OK');
  const { status, data } = await request('POST', '/todos', { title: t, priority: 'low' });
  assertEq(status, 201, `create should 201, got ${status}`);
  assert(data?.id != null, 'created must return id');
  assertEq(data.title, t);
  assertEq(data.completed, false);
  assertEq(data.priority, 'low');
  return data.id;
}

async function testGetNonExistentTodo404() {
  const { status, data } = await request('GET', '/todos/99999999');
  assertEq(status, 404, `expected 404, got ${status}`);
  assertEq(data?.error?.message, 'Todo not found');
}

async function testCreateWithoutTitle400() {
  const { status, data } = await request('POST', '/todos', { title: '' });
  assertEq(status, 400, `expected 400, got ${status}`);
  assertEq(data?.error?.field, 'title');
  assertEq(data?.error?.message, 'Title is required');
}

// ---- More feature tests ----
async function testFilters_query_status_priority() {
  // 先造数据：两个 pending，一个 completed；不同优先级与包含关键字
  const t1 = `Alpha ${title('search')}`;
  const t2 = `Beta ${title('search')}`;
  const t3 = `Gamma ${title('other')}`;

  const a = await request('POST', '/todos', { title: t1, priority: 'high' });
  const b = await request('POST', '/todos', { title: t2, priority: 'medium' });
  const c = await request('POST', '/todos', { title: t3, priority: 'low' });
  assertEq(a.status, 201); assertEq(b.status, 201); assertEq(c.status, 201);

  // 标记 c 为 completed
  const done = await request('PUT', `/todos/${c.data.id}`, { completed: true });
  assertEq(done.status, 200);
  assertEq(done.data.completed, true);

  // 1) q=search 应命中 t1+t2
  const qres = await request('GET', `/todos?q=search`);
  assertEq(qres.status, 200);
  const has1 = qres.data.some(x => x.id === a.data.id);
  const has2 = qres.data.some(x => x.id === b.data.id);
  const has3 = qres.data.some(x => x.id === c.data.id);
  assert(has1 && has2, 'q=search should include t1 & t2');
  assert(!has3, 'q=search should not include t3');

  // 2) status=completed 只应包含 c
  const sres = await request('GET', `/todos?status=completed`);
  assertEq(sres.status, 200);
  assert(sres.data.some(x => x.id === c.data.id), 'completed should include c');
  assert(!sres.data.some(x => x.id === a.data.id), 'completed should not include a');

  // 3) priority=high 只应包含 a
  const pres = await request('GET', `/todos?priority=high`);
  assertEq(pres.status, 200);
  assert(pres.data.some(x => x.id === a.data.id), 'priority=high should include a');
  assert(!pres.data.some(x => x.id === b.data.id), 'priority=high should not include b');

  return { a: a.data.id, b: b.data.id, c: c.data.id };
}

async function testUpdateTitleAndPriority() {
  const t0 = await request('POST', '/todos', { title: title('update me'), priority: 'low' });
  assertEq(t0.status, 201);
  const id = t0.data.id;

  const nextTitle = title('updated');
  const up = await request('PUT', `/todos/${id}`, { title: nextTitle, priority: 'high' });
  assertEq(up.status, 200);
  assertEq(up.data.title, nextTitle);
  assertEq(up.data.priority, 'high');
}

async function testToggleCompleted() {
  const created = await request('POST', '/todos', { title: title('toggle'), priority: 'low' });
  assertEq(created.status, 201);
  const id = created.data.id;

  const t1 = await request('PUT', `/todos/${id}`, { completed: true });
  assertEq(t1.status, 200);
  assertEq(t1.data.completed, true);

  const t2 = await request('PUT', `/todos/${id}`, { completed: false });
  assertEq(t2.status, 200);
  assertEq(t2.data.completed, false);
}

async function testDeleteAndThen404() {
  const created = await request('POST', '/todos', { title: title('delete'), priority: 'medium' });
  assertEq(created.status, 201);
  const id = created.data.id;

  const del = await request('DELETE', `/todos/${id}`);
  assertEq(del.status, 204);

  const getAfter = await request('GET', `/todos/${id}`);
  assertEq(getAfter.status, 404, 'deleted item should 404 on GET');
}

async function testInvalidPriority400() {
  const res = await request('POST', '/todos', { title: title('bad pri'), priority: 'urgent' });
  assertEq(res.status, 400);
  assertEq(res.data?.error?.message, 'Invalid priority');
  assertEq(res.data?.error?.field, 'priority');
}

async function testTooLongTitle400() {
  const long = 'x'.repeat(201); // 后端限制 >200
  const res = await request('POST', '/todos', { title: long, priority: 'low' });
  assertEq(res.status, 400);
  assertEq(res.data?.error?.message, 'Title is too long (max 200)');
  assertEq(res.data?.error?.field, 'title');
}

async function testInvalidStatus400() {
  const res = await request('GET', '/todos?status=weird');
  assertEq(res.status, 400);
  assertEq(res.data?.error?.message, 'Invalid status (all|completed|pending)');
  assertEq(res.data?.error?.field, 'status');
}

async function testUpdateNonExistent404() {
  const res = await request('PUT', '/todos/99999999', { title: 'x' });
  assertEq(res.status, 404);
  assertEq(res.data?.error?.message, 'Todo not found');
}

async function testDeleteNonExistent404() {
  const res = await request('DELETE', '/todos/99999999');
  assertEq(res.status, 404);
  assertEq(res.data?.error?.message, 'Todo not found');
}

// ---- Runner ----
async function runOne(name, fn) {
  const start = Date.now();
  try {
    await fn();
    const ms = Date.now() - start;
    console.log(`✅  ${name} (${ms}ms)`);
    return true;
  } catch (err) {
    const ms = Date.now() - start;
    console.error(`❌  ${name} (${ms}ms)`);
    console.error('    ', err.message);
    return false;
  }
}

async function main() {
  const tests = [
    ['Create todo successfully', testCreateTodo],
    ['Get non-existent todo returns 404', testGetNonExistentTodo404],
    ['Create todo without title returns error', testCreateWithoutTitle400],

    ['Filters: q/status/priority work', testFilters_query_status_priority],
    ['Update title and priority', testUpdateTitleAndPriority],
    ['Toggle completed true/false', testToggleCompleted],
    ['Delete and then 404 on GET', testDeleteAndThen404],
    ['Create with invalid priority -> 400', testInvalidPriority400],
    ['Create with too long title -> 400', testTooLongTitle400],
    ['GET /todos invalid status -> 400', testInvalidStatus400],
    ['PUT non-existent -> 404', testUpdateNonExistent404],
    ['DELETE non-existent -> 404', testDeleteNonExistent404],
  ];

  let failed = 0;
  for (const [name, fn] of tests) {
    const ok = await runOne(name, fn);
    if (!ok) failed++;
  }
  if (failed) {
    console.error(`\n${failed} test(s) failed.`);
    process.exitCode = 1;
  } else {
    console.log('\nAll tests passed 🎉');
  }
}

main().catch(err => {
  console.error('Unexpected error:', err);
  process.exitCode = 1;
});
