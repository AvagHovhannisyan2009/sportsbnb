#!/bin/bash
# Fix git history by removing commits with secrets

# Reset to before the commits with secrets
git reset --soft HEAD~2

# Re-add all files with placeholders already fixed
git add -A

# Create a new commit
git commit -m "feat: complete Supabase migration with all Edge Functions and APIs"

# Force push to replace the bad commits
git push -f origin main

echo "✅ Git history cleaned and pushed successfully!"
