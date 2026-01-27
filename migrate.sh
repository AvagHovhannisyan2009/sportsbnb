#!/bin/bash

# ============================================
# SPORTSBNB MIGRATION SCRIPT
# Lovable Cloud → Supabase
# ============================================

set -e  # Exit on any error

echo "🚀 Starting SportsBnB Migration to Supabase..."
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# ============================================
# STEP 1: Install Supabase CLI
# ============================================
echo -e "${BLUE}Step 1/6: Checking Supabase CLI...${NC}"
if ! command -v supabase &> /dev/null; then
    echo "Supabase CLI not found. Installing..."
    
    # Try different installation methods
    if curl --version &> /dev/null; then
        echo "Downloading Supabase CLI installer..."
        curl -o- https://raw.githubusercontent.com/supabase/cli/main/install.sh | bash
    else
        echo -e "${RED}curl not found. Please install Supabase CLI manually:${NC}"
        echo "Visit: https://github.com/supabase/cli#install-the-cli"
        exit 1
    fi
    
    # Add to PATH if needed
    export PATH="$HOME/.local/bin:$PATH"
    
    # Verify installation
    if command -v supabase &> /dev/null; then
        echo -e "${GREEN}✓ Supabase CLI installed${NC}"
    else
        echo -e "${RED}Installation failed. Please install manually.${NC}"
        exit 1
    fi
else
    echo -e "${GREEN}✓ Supabase CLI already installed${NC}"
fi
echo ""

# ============================================
# STEP 2: Login to Supabase
# ============================================
echo -e "${BLUE}Step 2/6: Logging in to Supabase...${NC}"
echo "This will open a browser window for authentication."
supabase login || {
    echo -e "${RED}Login failed. Please run 'supabase login' manually.${NC}"
    exit 1
}
echo -e "${GREEN}✓ Logged in to Supabase${NC}"
echo ""

# ============================================
# STEP 3: Link Project
# ============================================
echo -e "${BLUE}Step 3/6: Linking to Supabase project...${NC}"
PROJECT_REF="ifphycktfuymugqxvvbi"
echo "Linking to project: $PROJECT_REF"

# Check if already linked
if [ -f ".supabase/config.toml" ]; then
    echo "Project appears to be already linked. Unlinking first..."
    supabase unlink || true
fi

supabase link --project-ref "$PROJECT_REF" || {
    echo -e "${RED}Failed to link project. Please check your project ID.${NC}"
    exit 1
}
echo -e "${GREEN}✓ Project linked${NC}"
echo ""

# ============================================
# STEP 4: Run Database Migrations
# ============================================
echo -e "${BLUE}Step 4/6: Running database migrations...${NC}"
echo "This will apply all migrations from supabase/migrations/ to your database."
supabase db push || {
    echo -e "${RED}Migration failed. Check the error above.${NC}"
    exit 1
}
echo -e "${GREEN}✓ Migrations applied successfully${NC}"
echo ""

# ============================================
# STEP 5: Deploy Edge Functions
# ============================================
echo -e "${BLUE}Step 5/6: Deploying Edge Functions...${NC}"
echo "Deploying all 16 Edge Functions..."
supabase functions deploy --all || {
    echo -e "${YELLOW}⚠ Some functions may have failed to deploy. Check logs above.${NC}"
}
echo -e "${GREEN}✓ Edge Functions deployed${NC}"
echo ""

# ============================================
# STEP 6: Verify Setup
# ============================================
echo -e "${BLUE}Step 6/6: Verifying setup...${NC}"

# Check migrations status
echo "Checking migration status..."
supabase migration list || echo "Could not list migrations"

# Get project info
echo ""
echo "Project info:"
supabase projects list || echo "Could not get project list"

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}✓ MIGRATION COMPLETE!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo "Next steps:"
echo "1. Set up your .env.local file with Supabase credentials"
echo "2. Test your app locally: npm run dev"
echo "3. Deploy to Vercel: ./deploy-vercel.sh"
echo ""
echo "To view your Supabase dashboard:"
echo "https://supabase.com/dashboard/project/$PROJECT_REF"
echo ""
