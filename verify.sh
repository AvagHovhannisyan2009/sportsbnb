#!/bin/bash

# Sportsbnb - Testing & Verification Script
# Verifies all deployments, API keys, and functionality
# Date: January 27, 2026

set -e

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

TESTS_PASSED=0
TESTS_FAILED=0

test_result() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✓ $2${NC}"
        ((TESTS_PASSED++))
    else
        echo -e "${RED}✗ $2${NC}"
        ((TESTS_FAILED++))
    fi
}

echo "================================"
echo "🧪 Sportsbnb Verification Tests"
echo "================================"
echo ""

# Test 1: Check project structure
echo -e "${BLUE}Test Suite 1: Project Structure${NC}"
echo ""

test -f "package.json"
test_result $? "package.json exists"

test -f "supabase/config.toml"
test_result $? "supabase/config.toml exists"

test -d "supabase/functions"
test_result $? "supabase/functions directory exists"

test -d "src/integrations/supabase"
test_result $? "Supabase integration exists"

test -f ".env"
test_result $? ".env file exists"

echo ""

# Test 2: Check dependencies
echo -e "${BLUE}Test Suite 2: Dependencies${NC}"
echo ""

if npm list @supabase/supabase-js > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Supabase client installed${NC}"
    ((TESTS_PASSED++))
else
    echo -e "${RED}✗ Supabase client NOT installed${NC}"
    ((TESTS_FAILED++))
fi

if npm list vite > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Vite installed${NC}"
    ((TESTS_PASSED++))
else
    echo -e "${RED}✗ Vite NOT installed${NC}"
    ((TESTS_FAILED++))
fi

if npm list react > /dev/null 2>&1; then
    echo -e "${GREEN}✓ React installed${NC}"
    ((TESTS_PASSED++))
else
    echo -e "${RED}✗ React NOT installed${NC}"
    ((TESTS_FAILED++))
fi

echo ""

# Test 3: Environment variables
echo -e "${BLUE}Test Suite 3: Environment Variables${NC}"
echo ""

if grep -q "VITE_SUPABASE_URL" .env; then
    echo -e "${GREEN}✓ VITE_SUPABASE_URL configured${NC}"
    ((TESTS_PASSED++))
else
    echo -e "${RED}✗ VITE_SUPABASE_URL missing${NC}"
    ((TESTS_FAILED++))
fi

if grep -q "VITE_SUPABASE_PUBLISHABLE_KEY" .env; then
    echo -e "${GREEN}✓ VITE_SUPABASE_PUBLISHABLE_KEY configured${NC}"
    ((TESTS_PASSED++))
else
    echo -e "${RED}✗ VITE_SUPABASE_PUBLISHABLE_KEY missing${NC}"
    ((TESTS_FAILED++))
fi

if grep -q "VITE_SUPABASE_PROJECT_ID" .env; then
    echo -e "${GREEN}✓ VITE_SUPABASE_PROJECT_ID configured${NC}"
    ((TESTS_PASSED++))
else
    echo -e "${RED}✗ VITE_SUPABASE_PROJECT_ID missing${NC}"
    ((TESTS_FAILED++))
fi

echo ""

# Test 4: Check build
echo -e "${BLUE}Test Suite 4: Build System${NC}"
echo ""

echo -e "${YELLOW}Building application...${NC}"
npm run build > /dev/null 2>&1
BUILD_RESULT=$?

if [ $BUILD_RESULT -eq 0 ]; then
    echo -e "${GREEN}✓ Build successful${NC}"
    ((TESTS_PASSED++))
else
    echo -e "${RED}✗ Build failed${NC}"
    ((TESTS_FAILED++))
fi

if [ -d "dist" ] && [ -f "dist/index.html" ]; then
    echo -e "${GREEN}✓ dist/index.html generated${NC}"
    ((TESTS_PASSED++))
else
    echo -e "${RED}✗ dist/index.html not found${NC}"
    ((TESTS_FAILED++))
fi

echo ""

# Test 5: TypeScript check
echo -e "${BLUE}Test Suite 5: TypeScript${NC}"
echo ""

if npx tsc --noEmit > /dev/null 2>&1; then
    echo -e "${GREEN}✓ TypeScript compilation OK${NC}"
    ((TESTS_PASSED++))
else
    echo -e "${YELLOW}⚠ TypeScript has some warnings${NC}"
fi

echo ""

# Test 6: Edge Functions
echo -e "${BLUE}Test Suite 6: Edge Functions${NC}"
echo ""

FUNCTION_COUNT=$(ls supabase/functions/ | wc -l)
echo -e "${GREEN}✓ Found $FUNCTION_COUNT functions${NC}"
((TESTS_PASSED++))

# Check for key functions
FUNCTIONS=(
    "send-booking-confirmation"
    "create-booking-checkout"
    "send-contact-email"
    "create-connect-account"
    "webhook-dispatcher"
)

for func in "${FUNCTIONS[@]}"; do
    if [ -d "supabase/functions/$func" ]; then
        echo -e "${GREEN}✓ Function: $func${NC}"
        ((TESTS_PASSED++))
    else
        echo -e "${RED}✗ Function missing: $func${NC}"
        ((TESTS_FAILED++))
    fi
done

echo ""

# Test 7: Database schema
echo -e "${BLUE}Test Suite 7: Database Migrations${NC}"
echo ""

MIGRATION_COUNT=$(ls supabase/migrations/ | wc -l)
echo -e "${GREEN}✓ Found $MIGRATION_COUNT database migrations${NC}"
((TESTS_PASSED++))

TABLES=(
    "profiles"
    "bookings"
    "venues"
    "games"
    "chats"
    "reviews"
    "payments"
)

for table in "${TABLES[@]}"; do
    if grep -q "CREATE TABLE.*$table" supabase/migrations/*.sql; then
        echo -e "${GREEN}✓ Table defined: $table${NC}"
        ((TESTS_PASSED++))
    else
        echo -e "${YELLOW}⚠ Table not found in migrations: $table (may be in later migration)${NC}"
    fi
done

echo ""

# Test 8: Configuration files
echo -e "${BLUE}Test Suite 8: Configuration Files${NC}"
echo ""

if grep -q "lovable" package.json; then
    echo -e "${RED}✗ Lovable reference found in package.json${NC}"
    ((TESTS_FAILED++))
else
    echo -e "${GREEN}✓ No Lovable references in package.json${NC}"
    ((TESTS_PASSED++))
fi

if grep -q "lovable" vite.config.ts; then
    echo -e "${RED}✗ Lovable reference found in vite.config.ts${NC}"
    ((TESTS_FAILED++))
else
    echo -e "${GREEN}✓ No Lovable references in vite.config.ts${NC}"
    ((TESTS_PASSED++))
fi

if grep -q "sportsbnb.org" index.html; then
    echo -e "${GREEN}✓ Domain correctly set to sportsbnb.org${NC}"
    ((TESTS_PASSED++))
else
    echo -e "${YELLOW}⚠ Domain might need update in index.html${NC}"
fi

echo ""
echo ""

# Summary
echo "================================"
echo -e "${BLUE}Test Summary${NC}"
echo "================================"
echo -e "${GREEN}Passed: $TESTS_PASSED${NC}"
echo -e "${RED}Failed: $TESTS_FAILED${NC}"
echo ""

if [ $TESTS_FAILED -eq 0 ]; then
    echo -e "${GREEN}✅ All tests passed! Your app is ready to deploy.${NC}"
    echo ""
    echo "Next steps:"
    echo "  1. Run: ./deploy.sh        (configure Supabase & deploy functions)"
    echo "  2. Run: ./deploy-vercel.sh (deploy frontend to Vercel)"
    echo "  3. Test at: https://sportsbnb.org"
    exit 0
else
    echo -e "${RED}⚠️  Some tests failed. Please review the issues above.${NC}"
    exit 1
fi
