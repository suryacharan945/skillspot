import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

test('Schema SQL integrity and RLS coverage', () => {
  const schemaPath = path.join(projectRoot, 'schema.sql');
  assert.ok(fs.existsSync(schemaPath), 'schema.sql must exist');
  
  const content = fs.readFileSync(schemaPath, 'utf-8');
  assert.ok(content.length > 5000, 'schema.sql should contain substantial DDL definitions');

  const requiredTables = [
    'ngos',
    'users',
    'enrollments',
    'notifications',
    'workshop_equipment',
    'placement_records',
    'assignment_submissions',
    'course_forum_posts',
    'broadcast_messages',
    'vocational_jobs',
    'job_applications'
  ];

  for (const table of requiredTables) {
    const tableRegex = new RegExp(`CREATE TABLE IF NOT EXISTS public\\.${table}`, 'i');
    assert.ok(tableRegex.test(content), `Table public.${table} must be defined in schema.sql`);
    
    const rlsRegex = new RegExp(`ALTER TABLE public\\.${table} ENABLE ROW LEVEL SECURITY`, 'i');
    assert.ok(rlsRegex.test(content), `Table public.${table} must have Row Level Security enabled`);
  }
});

test('Metadata and package.json validity', () => {
  const pkgPath = path.join(projectRoot, 'package.json');
  assert.ok(fs.existsSync(pkgPath), 'package.json must exist');
  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
  
  assert.strictEqual(pkg.name, 'skillspot-2.0');
  assert.ok(pkg.dependencies['@supabase/supabase-js'], 'Must include @supabase/supabase-js');
  assert.ok(pkg.dependencies['react'], 'Must include React dependency');

  const metaPath = path.join(projectRoot, 'metadata.json');
  if (fs.existsSync(metaPath)) {
    const meta = JSON.parse(fs.readFileSync(metaPath, 'utf-8'));
    assert.ok(meta.name, 'metadata.json must have a project name');
  }
});

test('Supabase client module structure', () => {
  const clientPath = path.join(projectRoot, 'lib', 'supabaseClient.ts');
  assert.ok(fs.existsSync(clientPath), 'lib/supabaseClient.ts must exist');
  const clientContent = fs.readFileSync(clientPath, 'utf-8');
  assert.ok(clientContent.includes('createClient'), 'Must call createClient from supabase-js');
  assert.ok(clientContent.includes('export const supabase'), 'Must export supabase client');
});
