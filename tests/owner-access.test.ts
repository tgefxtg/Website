import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import ts from 'typescript';
test('configured owner can bind identity; old owner and anonymous callers cannot write', async () => {
  let owner = {user_id: 'old-id'};
  let user: {userId: string; email: string} | null = {userId:'new-id',email:'owner@example.test'};
  const env = { ADMIN_OWNER_EMAIL:'owner@example.test', DB:{prepare(){return {
    first:async()=>owner, bind(id:string){return {run:async()=>{owner={user_id:id};}};}
  };}}};
  const output = ts.transpileModule(readFileSync('lib/admin-auth.ts','utf8'), {compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
  const context = {exports:{} as {isOwner:()=>Promise<boolean>;sameOrigin:(r:Request)=>boolean}, require:(name:string)=>name==='cloudflare:workers'?{env}:{getChatGPTUser:async()=>user},URL};
  runInNewContext(output,context);
  assert.equal(await context.exports.isOwner(),true);
  assert.equal(owner.user_id,'new-id');
  user={userId:'old-id',email:'old@example.test'};
  assert.equal(await context.exports.isOwner(),false);
  user=null; assert.equal(await context.exports.isOwner(),false);
  assert.equal(context.exports.sameOrigin(new Request('https://example.test/api/admin/places',{headers:{Origin:'https://evil.test'}})),false);
});
