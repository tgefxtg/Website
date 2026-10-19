import test from 'node:test';
import assert from 'node:assert/strict';
import { DatabaseSync } from 'node:sqlite';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import ts from 'typescript';

test('owner deletion persists for bundled and saved places, rejects stale/unauthorized requests', async () => {
  const db = new DatabaseSync(':memory:');
  db.exec('CREATE TABLE places(slug TEXT PRIMARY KEY, content TEXT NOT NULL, revision INTEGER NOT NULL)');
  let owner = true;
  const env = { DB: { prepare(sql: string) {
    let params: any[] = [];
    const stmt = db.prepare(sql);
    return { bind(...values: any[]) { params = values; return this; },
      async all() { return {results: stmt.all(...params)}; },
      async run() { return {meta: {changes: Number(stmt.run(...params).changes)}}; } };
  }}};
  const modules: Record<string, any> = {
    'cloudflare:workers': {env}, react: {cache: (fn: any) => fn},
    '@/data/destinations': {destinations: [{slug:'bundled-place', name:'Bundled place'}]},
    '@/lib/admin-auth': {isOwner: async () => owner, sameOrigin: (r: Request) => r.headers.get('origin') === new URL(r.url).origin},
    '@/lib/place-validation': {}, '@/lib/request-body': {boundedText: (r: Request) => r.text()},
  };
  function load(path: string) {
    const context = { exports: {} as any, require: (id: string) => modules[id], Request, Response, URL };
    runInNewContext(ts.transpileModule(readFileSync(path, 'utf8'), {compilerOptions: {module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText, context);
    return context.exports;
  }
  const places = load('lib/places.ts'); modules['@/lib/places'] = places;
  const route = load('app/api/admin/places/route.ts');
  const remove = (slug: string, revision: number, origin='https://example.test') => route.DELETE(new Request('https://example.test/api/admin/places', {method:'DELETE',headers:{Origin:origin},body:JSON.stringify({slug,revision})}));
  try {
    owner = false; assert.equal((await remove('bundled-place',0)).status,403);
    owner = true; assert.equal((await remove('bundled-place',0,'https://evil.test')).status,403);
    assert.equal((await remove('bundled-place',-1)).status,400);
    assert.equal((await remove('bundled-place',4)).status,409);
    assert.equal((await remove('bundled-place',0)).status,200);
    assert.equal((await places.getPlaces()).length,0);
    assert.equal((await remove('bundled-place',0)).status,404);
    const record = db.prepare('SELECT content FROM places WHERE slug=?').get('bundled-place') as {content:string};
    assert.equal(JSON.parse(record.content).name,'Bundled place');
    db.prepare('INSERT INTO places VALUES(?,?,1)').run('custom-place',JSON.stringify({slug:'custom-place',name:'Custom place'}));
    assert.equal((await remove('custom-place',0)).status,409);
    assert.equal((await remove('custom-place',1)).status,200);
    assert.equal((await places.getPlaces()).length,0);
  } finally { db.close(); }
});
