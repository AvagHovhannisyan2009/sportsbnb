#!/bin/bash

# 🚀 3D Immersive Website - Installation Script
# Run this script to install all required dependencies

echo "🎨 Installing 3D Immersive Website Dependencies..."
echo ""

# Install main 3D packages with compatible versions for React 18
echo "📦 Installing Three.js and React Three Fiber..."
npm install --legacy-peer-deps \
  three@0.169.0 \
  @react-three/fiber@8.17.10 \
  @react-three/drei@9.114.3 \
  @react-three/postprocessing@2.16.3

echo ""
echo "🎬 Installing Animation Libraries..."
npm install --legacy-peer-deps \
  gsap@3.12.5 \
  @studio-freight/lenis@1.0.42

echo ""
echo "🔢 Installing Math Utilities..."
npm install --legacy-peer-deps maath@0.10.8

echo ""
echo "✅ Installation Complete!"
echo ""
echo "🎯 Next Steps:"
echo "1. Review the implementation guide: 3D_IMPLEMENTATION_GUIDE.md"
echo "2. Update your App.tsx to use HomePage3D"
echo "3. Run 'npm run dev' to see your 3D immersive experience!"
echo ""
echo "🚀 Happy coding!"
