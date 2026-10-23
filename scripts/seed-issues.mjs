import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const issuesPath = path.join(process.cwd(), '.github', 'starter-issues.json');
const issues = JSON.parse(fs.readFileSync(issuesPath, 'utf-8'));

console.log(`Found ${issues.length} starter issues to create on GitHub...\n`);

for (const issue of issues) {
  const labelFlags = (issue.labels || []).map((l) => `--label "${l}"`).join(' ');
  const body = `### Description\n${issue.description}\n\n### Where to Look\nFile: \`${issue.file_path}\`\n\n### How to Know It's Fixed\n${issue.how_to_verify}\n\n---\n*Part of Bennett University GDG On Campus Hacktoberfest 2026!*`;

  try {
    const cmd = `gh issue create --title "${issue.title.replace(/"/g, '\\"')}" --body "${body.replace(/"/g, '\\"')}" ${labelFlags}`;
    const output = execSync(cmd, { encoding: 'utf-8' });
    console.log(`✓ Created Issue #${issue.id}: ${issue.title} -> ${output.trim()}`);
  } catch (err) {
    console.error(`✕ Failed to create issue ${issue.id}:`, err.message);
  }
}

console.log('\nAll starter issues processed successfully!');
