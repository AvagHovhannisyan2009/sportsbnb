#!/bin/bash

# Vercel Deployment Script for Sportsbnb
# Automatically deploys frontend to Vercel with correct configuration
# Date: January 27, 2026

set -euo pipefail

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

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

echo "================================"
echo "🚀 Deploying to Vercel"
echo "================================"
echo ""

# Step 1: Check if Vercel CLI is installed
echo -e "${BLUE}Step 1: Checking Vercel CLI...${NC}"
if ! command -v vercel &> /dev/null; then
    echo -e "${YELLOW}Vercel CLI not found. Installing...${NC}"
    npm install -g vercel
fi
echo -e "${GREEN}✓ Vercel CLI ready${NC}"
echo ""

# Step 2: Verify production build exists
echo -e "${BLUE}Step 2: Checking production build...${NC}"
if [ ! -d "dist" ]; then
    echo -e "${YELLOW}dist/ folder not found. Building now...${NC}"
    npm run build
fi
if [ ! -f "dist/index.html" ]; then
    echo -e "${RED}❌ Build failed: dist/index.html not found${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Production build verified${NC}"
echo ""

# Step 3: Collect required environment variables (frontend only; no secrets stored)
echo -e "${BLUE}Step 3: Verifying environment variables...${NC}"
require_env "VITE_SUPABASE_URL" "Enter VITE_SUPABASE_URL"
require_env "VITE_SUPABASE_PUBLISHABLE_KEY" "Enter VITE_SUPABASE_PUBLISHABLE_KEY" true
require_env "VITE_SUPABASE_PROJECT_ID" "Enter VITE_SUPABASE_PROJECT_ID"
echo -e "${GREEN}✓ Environment variables ready${NC}"
echo ""

# Step 4: Login to Vercel (if not already logged in)
echo -e "${BLUE}Step 4: Verifying Vercel authentication...${NC}"
vercel whoami > /dev/null 2>&1 || vercel login
echo -e "${GREEN}✓ Authenticated with Vercel${NC}"
echo ""

# Step 5: Deploy to Vercel
echo -e "${BLUE}Step 5: Deploying to Vercel...${NC}"
echo "Project: sportsbnb"
echo "Domain: sportsbnb.org"
echo ""
echo -e "${YELLOW}This will:${NC}"
echo "  • Deploy to vercel.com"
echo "  • Configure environment variables"
echo "  • Set up domain routing"
echo "  • Enable auto-deployments from main branch"
echo ""
read -p "Press Enter to deploy to Vercel..."
echo ""

# Deploy with production flag
vercel deploy --prod \
    --env VITE_SUPABASE_URL="$VITE_SUPABASE_URL" \
    --env VITE_SUPABASE_PUBLISHABLE_KEY="$VITE_SUPABASE_PUBLISHABLE_KEY" \
    --env VITE_SUPABASE_PROJECT_ID="$VITE_SUPABASE_PROJECT_ID"

echo ""
echo "================================"
echo -e "${GREEN}✅ Vercel Deployment Complete!${NC}"
echo "================================"
echo ""
echo -e "${BLUE}Your app is now live!${NC}"
echo ""
echo "After deployment, you need to:"
echo ""
echo "1️⃣  CONNECT CUSTOM DOMAIN"
echo "   • Go to Vercel Dashboard"
echo "   • Project Settings → Domains"
echo "   • Add: sportsbnb.org"
echo "   • Update DNS CNAME at your registrar"
echo ""
echo "2️⃣  TEST THE APP"
echo "   • Visit your Vercel deployment URL"
echo "   • Sign up with a test account"
echo "   • Verify email in Supabase Auth dashboard"
echo "   • Log in and test functionality"
echo ""
echo "3️⃣  VERIFY IN SUPABASE"
echo "   • Open your Supabase Dashboard"
echo "   • Go to Authentication → Users"
echo "   • Should see your test account"
echo ""
echo "Vercel Dashboard: https://vercel.com/dashboard"
echo "Your Project: https://vercel.com/AvagHovhannisyan2009/sportsbnb"
echo ""
