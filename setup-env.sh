#!/bin/bash

# ============================================
# ENVIRONMENT SETUP SCRIPT
# Creates .env.local with Supabase credentials
# ============================================

set -e

echo "🔧 Setting up environment variables..."
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Project details
PROJECT_REF="ifphycktfuymugqxvvbi"
PROJECT_URL="https://$PROJECT_REF.supabase.co"

echo -e "${BLUE}Getting project information...${NC}"
echo "Project URL: $PROJECT_URL"
echo ""

# Prompt for API keys
echo -e "${YELLOW}You need to get your API keys from:${NC}"
echo "https://supabase.com/dashboard/project/$PROJECT_REF/settings/api"
echo ""

read -p "Enter your Supabase ANON (public) key: " ANON_KEY
echo ""
read -p "Enter your Supabase SERVICE_ROLE (secret) key: " SERVICE_KEY
echo ""

# Create .env.local file
cat > .env.local <<EOF
# Supabase Configuration
VITE_SUPABASE_URL=$PROJECT_URL
VITE_SUPABASE_ANON_KEY=$ANON_KEY
VITE_SUPABASE_SERVICE_ROLE_KEY=$SERVICE_KEY

# Stripe Configuration (add when ready)
VITE_STRIPE_PUBLISHABLE_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=

# App Configuration
VITE_APP_URL=http://localhost:5173
EOF

echo -e "${GREEN}✓ .env.local created successfully!${NC}"
echo ""
echo "File contents (secrets hidden):"
echo "--------------------------------"
cat .env.local | sed 's/=sk_.*/=sk_***HIDDEN***/g' | sed 's/=eyJ.*/=eyJ***HIDDEN***/g'
echo "--------------------------------"
echo ""
echo -e "${GREEN}You can now run: npm run dev${NC}"
echo ""
