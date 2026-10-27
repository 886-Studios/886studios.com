import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { loadCatalog, matches, normalizeSort, sortPerks } from '../src/catalog.mjs';

const catalogPath=new URL('../private/catalog.json',import.meta.url);
test('private catalog has sourced, redeemable records and distinguishes pending offers',{skip:!existsSync(catalogPath)},()=>{
  const catalog=loadCatalog(fileURLToPath(catalogPath));
  assert.equal(catalog.perks.length,22);
  assert.equal(catalog.perks.filter(p=>!p.pending).length,21);
  assert.ok(catalog.perks.find(p=>p.id==='zettabyte').pending);
  assert.ok(catalog.perks.find(p=>p.id==='linear'));
  assert.ok(catalog.perks.find(p=>p.id==='deel'));
  const supabase=catalog.perks.find(p=>p.id==='supabase');
  assert.ok(supabase);
  assert.equal(supabase.logo,'/assets/logos/supabase.svg');
  assert.equal(supabase.category,'Engineering');
  assert.match(supabase.instructions,/claim link/i);
  for(const perk of catalog.perks){assert.ok(!/^(TBD|See below)$/i.test(perk.instructions));assert.ok(perk.source.startsWith('https://'));assert.ok(perk.about.length>=60&&perk.about.length<=360,perk.id);assert.ok(perk.aboutSource.startsWith('https://'));}
  const json=readFileSync(catalogPath,'utf8');
  for(const excluded of ['Granola','Wispr Flow','Devin (Cognition)','PostHog','Perplexity'])assert.ok(!json.includes(excluded));
});
test('search combines category and words across benefits',()=>{
  const perk={name:'Partner',category:'Engineering',headline:'Cloud credits',description:'Build globally',about:'Tools for prototyping.',offer:'Starter benefit',eligibility:''};
  assert.equal(matches(perk,'CLOUD build','Engineering'),true);
  assert.equal(matches(perk,'cloud','Marketing'),false);
  assert.equal(matches(perk,'missing','Engineering'),false);
  assert.equal(matches(perk,'prototyping','Engineering'),true);
});

test('category sorting groups types in filter order and alphabetizes their partners',()=>{
  const perks=[
    {id:'design',name:'Alpha',category:'Design'},
    {id:'engineering-z',name:'Zulu',category:'Engineering'},
    {id:'finance',name:'Beta',category:'Finance & legal'},
    {id:'engineering-a',name:'alpha',category:'Engineering'},
    {id:'productivity',name:'Gamma',category:'Productivity'},
    {id:'marketing',name:'Delta',category:'Marketing'}
  ];
  const original=perks.map(perk=>perk.id);
  assert.deepEqual(sortPerks(perks).map(perk=>perk.id),['engineering-a','engineering-z','productivity','finance','marketing','design']);
  assert.deepEqual(sortPerks(perks,'alphabetical').map(perk=>perk.id),['design','engineering-a','finance','marketing','productivity','engineering-z']);
  assert.deepEqual(perks.map(perk=>perk.id),original,'sorting must not change the source catalog');
});

test('unsupported sort parameters fall back to category order',()=>{
  for(const value of [undefined,null,'','unknown','<script>'])assert.equal(normalizeSort(value),'category');
  assert.equal(normalizeSort('alphabetical'),'alphabetical');
});
