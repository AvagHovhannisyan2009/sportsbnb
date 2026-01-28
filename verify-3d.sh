#!/bin/bash

# 🔍 3D Installation Verification Script
# Checks if everything is properly installed

echo "🔍 Verifying 3D Immersive Website Installation..."
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check Node.js
echo -n "Checking Node.js... "
if command -v node &> /dev/null; then
    NODE_VERSION=$(node -v)
    echo -e "${GREEN}✓${NC} Found $NODE_VERSION"
else
    echo -e "${RED}✗${NC} Node.js not found"
    exit 1
fi

# Check npm
echo -n "Checking npm... "
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm -v)
    echo -e "${GREEN}✓${NC} Found v$NPM_VERSION"
else
    echo -e "${RED}✗${NC} npm not found"
    exit 1
fi

echo ""
echo "📦 Checking Dependencies..."

# Function to check if package is installed
check_package() {
    local package=$1
    local display_name=$2
    
    if npm list "$package" &> /dev/null; then
        local version=$(npm list "$package" --depth=0 2>/dev/null | grep "$package" | awk '{print $2}' | sed 's/@//')
        echo -e "${GREEN}✓${NC} $display_name ${YELLOW}$version${NC}"
        return 0
    else
        echo -e "${RED}✗${NC} $display_name (not installed)"
        return 1
    fi
}

# Check all required packages
MISSING=0

check_package "three" "Three.js" || MISSING=$((MISSING+1))
check_package "@react-three/fiber" "React Three Fiber" || MISSING=$((MISSING+1))
check_package "@react-three/drei" "Drei" || MISSING=$((MISSING+1))
check_package "@react-three/postprocessing" "Postprocessing" || MISSING=$((MISSING+1))
check_package "gsap" "GSAP" || MISSING=$((MISSING+1))
check_package "@studio-freight/lenis" "Lenis" || MISSING=$((MISSING+1))
check_package "maath" "Maath" || MISSING=$((MISSING+1))

echo ""
echo "📁 Checking Files..."

# Function to check if file exists
check_file() {
    local file=$1
    local display_name=$2
    
    if [ -f "$file" ]; then
        echo -e "${GREEN}✓${NC} $display_name"
        return 0
    else
        echo -e "${RED}✗${NC} $display_name (missing)"
        return 1
    fi
}

# Check all required files
check_file "src/pages/HomePage3D.tsx" "HomePage3D.tsx" || MISSING=$((MISSING+1))
check_file "src/components/3d/Scene3D.tsx" "Scene3D.tsx" || MISSING=$((MISSING+1))
check_file "src/components/3d/HeroScene.tsx" "HeroScene.tsx" || MISSING=$((MISSING+1))
check_file "src/components/3d/ScrollRig.tsx" "ScrollRig.tsx" || MISSING=$((MISSING+1))
check_file "src/components/3d/ParticleField.tsx" "ParticleField.tsx" || MISSING=$((MISSING+1))
check_file "src/components/3d/PostProcessing.tsx" "PostProcessing.tsx" || MISSING=$((MISSING+1))
check_file "src/hooks/useSmoothScroll.ts" "useSmoothScroll.ts" || MISSING=$((MISSING+1))
check_file "src/hooks/useInteractions.ts" "useInteractions.ts" || MISSING=$((MISSING+1))
check_file "src/lib/animations.ts" "animations.ts" || MISSING=$((MISSING+1))
check_file "src/types/3d.d.ts" "3d.d.ts" || MISSING=$((MISSING+1))

echo ""
echo "📚 Checking Documentation..."

check_file "3D_IMPLEMENTATION_GUIDE.md" "Implementation Guide"
check_file "3D_API_REFERENCE.md" "API Reference"
check_file "3D_ARCHITECTURE.md" "Architecture Doc"
check_file "README_3D_SUMMARY.md" "Summary"

echo ""

# Final result
if [ $MISSING -eq 0 ]; then
    echo -e "${GREEN}════════════════════════════════════════${NC}"
    echo -e "${GREEN}✓ All checks passed!${NC}"
    echo -e "${GREEN}════════════════════════════════════════${NC}"
    echo ""
    echo "🎉 Your 3D immersive website is ready!"
    echo ""
    echo "Next steps:"
    echo "1. Update src/App.tsx to use HomePage3D"
    echo "2. Run 'npm run dev'"
    echo "3. Visit http://localhost:5173"
    echo ""
    echo "📖 Documentation: ./3D_IMPLEMENTATION_GUIDE.md"
else
    echo -e "${RED}════════════════════════════════════════${NC}"
    echo -e "${RED}✗ Missing $MISSING item(s)${NC}"
    echo -e "${RED}════════════════════════════════════════${NC}"
    echo ""
    echo "Please run the installation script:"
    echo "  ./install-3d.sh"
    exit 1
fi
