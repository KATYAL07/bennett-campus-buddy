#!/usr/bin/env bash

# ==============================================================================
# Campus Buddy - GitHub Repository Setup Automation
# Requires GitHub CLI (gh) authenticated with repo permissions.
# ==============================================================================

set -e

echo "=============================================================="
echo "  Campus Buddy - GitHub Setup & Hacktoberfest Issue Seeder"
echo "=============================================================="

# 1. Verify gh CLI authentication
if ! command -v gh &> /dev/null; then
    echo "Error: GitHub CLI (gh) is not installed. Please install from https://cli.github.com/"
    exit 1
fi

echo "Checking GitHub authentication status..."
gh auth status

# 2. Add repo topic 'hacktoberfest'
echo ""
echo "Step 1: Adding 'hacktoberfest' topic to repository..."
gh repo edit --add-topic hacktoberfest || true
echo "✓ Topic 'hacktoberfest' added successfully."

# 3. Create required issue labels
echo ""
echo "Step 2: Creating Hacktoberfest and categorization labels..."

declare -A LABELS=(
  ["hacktoberfest-accepted"]="9be54b:Approved pull request for Hacktoberfest"
  ["good first issue"]="7057ff:Good for newcomers"
  ["easy"]="0e8a16:Quick and straightforward fix"
  ["medium"]="fbca04:Moderate complexity"
  ["hard"]="d93f0b:Challenging feature or refactor"
  ["ui"]="1d76db:Visual styling and layout"
  ["docs"]="0075ca:Documentation improvements"
  ["accessibility"]="0052cc:Accessibility and screen reader improvements"
  ["bug"]="d73a4a:Something isn't working"
  ["feature"]="a2eeef:New feature or enhancement"
  ["tests"]="bfd4f2:Testing suites and assertions"
  ["content"]="5319e7:Dataset and seed content updates"
  ["spam"]="b60205:Disqualified spam submission"
  ["invalid"]="e4e669:Invalid contribution"
)

for label in "${!LABELS[@]}"; do
  IFS=":" read -r color desc <<< "${LABELS[$label]}"
  echo "Ensuring label: '$label'..."
  gh label create "$label" --color "$color" --description "$desc" --force || true
done

echo "✓ All labels created."

# 4. Create all issues from .github/starter-issues.json
echo ""
echo "Step 3: Creating starter issues from .github/starter-issues.json..."
node scripts/seed-issues.mjs

echo ""
echo "=============================================================="
echo "  ✓ Setup completed successfully!"
echo "  Visit your repository Issues tab to see the created issues."
echo "=============================================================="
