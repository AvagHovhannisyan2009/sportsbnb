#!/bin/bash

# Sportsbnb - Full Deployment Script
# This script configures Supabase secrets and deploys Edge Functions
# Date: January 27, 2026

set -euo pipefail

echo "================================"
echo "🚀 Sportsbnb Deployment Starting"
echo "================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Helper: prompt for env var if missing
require_env() {
    local var_name="$1"
    local prompt_message="$2"
    local silent="${3:-false}"
    local current_value="${!var_name:-}"
    if [ -z "$current_value" ]; then
        if [ "$silent" = "true" ]; then
            read -s -p "$prompt_message: " current_value
            echo ""
        else
            read -p "$prompt_message: " current_value
        fi
    fi
    if [ -z "$current_value" ]; then
        echo "❌ Missing required value for $var_name"
        exit 1
    fi
    export "$var_name"="$current_value"
}

# Step 1: Verify we're in the right directory
echo -e "${BLUE}Step 1: Verifying project directory...${NC}"
if [ ! -f "supabase/config.toml" ]; then
    echo "❌ Error: supabase/config.toml not found. Make sure you're in the sportsbnb directory."
    exit 1
fi
echo -e "${GREEN}✓ Project structure verified${NC}"
echo ""

# Step 2: Install/Verify Node.js dependencies
echo -e "${BLUE}Step 2: Installing Node.js dependencies...${NC}"
npm install > /dev/null 2>&1 || npm ci > /dev/null 2>&1
echo -e "${GREEN}✓ Dependencies installed${NC}"
echo ""

# Step 3: Install Supabase CLI
echo -e "${BLUE}Step 3: Checking Supabase CLI...${NC}"
if ! command -v supabase &> /dev/null; then
    echo "Installing Supabase CLI..."
    npm install -g supabase > /dev/null 2>&1
fi
SUPABASE_VERSION=$(supabase --version)
echo -e "${GREEN}✓ Supabase CLI ready: $SUPABASE_VERSION${NC}"
echo ""

# Step 4: Collect required secrets (from env or prompt)
echo -e "${BLUE}Step 4: Collecting secrets (no secrets stored in repo)...${NC}"
require_env "SUPABASE_PROJECT_ID" "Enter your Supabase project ID"
require_env "STRIPE_SECRET_KEY" "Enter STRIPE_SECRET_KEY" true
require_env "STRIPE_WEBHOOK_SECRET" "Enter STRIPE_WEBHOOK_SECRET" true
require_env "RESEND_API_KEY" "Enter RESEND_API_KEY" true
require_env "GOOGLE_OAUTH_CLIENT_ID" "Enter GOOGLE_OAUTH_CLIENT_ID"
require_env "GOOGLE_OAUTH_CLIENT_SECRET" "Enter GOOGLE_OAUTH_CLIENT_SECRET" true
echo -e "${GREEN}✓ Secrets captured from environment / prompts${NC}"
echo ""

# Authenticate with Supabase
echo -e "${BLUE}Authenticating with Supabase...${NC}"
supabase login --no-prompt || supabase login
echo -e "${GREEN}✓ Authenticated with Supabase${NC}"
echo ""

# Link to project
echo -e "${BLUE}Linking to Supabase project...${NC}"
supabase link --project-ref "$SUPABASE_PROJECT_ID"
echo -e "${GREEN}✓ Linked to project${NC}"
echo ""

# Set secrets
echo -e "${BLUE}Setting secrets...${NC}"
supabase secrets set STRIPE_SECRET_KEY="$STRIPE_SECRET_KEY"
echo -e "${GREEN}✓ STRIPE_SECRET_KEY set${NC}"

supabase secrets set STRIPE_WEBHOOK_SECRET="$STRIPE_WEBHOOK_SECRET"
echo -e "${GREEN}✓ STRIPE_WEBHOOK_SECRET set${NC}"

supabase secrets set RESEND_API_KEY="$RESEND_API_KEY"
echo -e "${GREEN}✓ RESEND_API_KEY set${NC}"

supabase secrets set GOOGLE_OAUTH_CLIENT_ID="$GOOGLE_OAUTH_CLIENT_ID"
echo -e "${GREEN}✓ GOOGLE_OAUTH_CLIENT_ID set${NC}"

supabase secrets set GOOGLE_OAUTH_CLIENT_SECRET="$GOOGLE_OAUTH_CLIENT_SECRET"
echo -e "${GREEN}✓ GOOGLE_OAUTH_CLIENT_SECRET set${NC}"

echo ""

# Step 5: Deploy Edge Functions
echo -e "${BLUE}Step 5: Deploying Edge Functions...${NC}"
echo "Deploying 16 serverless functions to Supabase..."
echo ""

supabase functions deploy

echo ""
echo -e "${GREEN}✓ All Edge Functions deployed${NC}"
echo ""

# Step 6: Verify Functions
echo -e "${BLUE}Step 6: Verifying deployed functions...${NC}"
supabase functions list
echo ""

# Step 7: Build frontend
echo -e "${BLUE}Step 7: Building frontend for production...${NC}"
npm run build
echo -e "${GREEN}✓ Production build created in dist/ folder${NC}"
echo ""

# Step 8: Success message
echo "================================"
echo -e "${GREEN}✅ Deployment Configuration Complete!${NC}"
echo "================================"
echo ""
echo "What's been completed:"
echo "  ✓ All API secrets configured in Supabase"
echo "  ✓ 16 Edge Functions deployed"
echo "  ✓ Frontend built and ready"
echo ""
echo "Next steps (manual - requires additional tools):"
echo ""
echo "1️⃣  DEPLOY TO VERCEL (Recommended)"
echo "   Install Vercel CLI:"
echo "     npm install -g vercel"
echo "   Then deploy:"
echo "     vercel --prod"
echo ""
echo "2️⃣  OR DEPLOY TO NETLIFY"
echo "   Install Netlify CLI:"
echo "     npm install -g netlify-cli"
echo "   Then deploy:"
echo "     netlify deploy --prod --dir=dist"
echo ""
echo "3️⃣  AFTER DEPLOYMENT"
echo "   • Visit your domain: https://sportsbnb.org"
echo "   • Test signup/login"
echo "   • Check Supabase Dashboard for data"
echo ""
echo "Your Supabase Dashboard: https://app.supabase.com/project/${SUPABASE_PROJECT_ID}"
echo ""
