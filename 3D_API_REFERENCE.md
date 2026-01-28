# 🎨 3D Component Library - API Reference

## Core Components

### `<Scene3D>`

Main 3D canvas wrapper with performance monitoring.

**Props:**
```typescript
interface Scene3DProps {
  children: ReactNode;
  className?: string;
  onPerformanceChange?: (fps: number) => void;
}
```

**Usage:**
```tsx
<Scene3D onPerformanceChange={(fps) => console.log(fps)}>
  {/* 3D content */}
</Scene3D>
```

---

### `<HeroScene>`

Premium 3D hero section with cinematic lighting.

**Props:**
```typescript
interface HeroSceneProps {
  scrollProgress: number; // 0-1
}
```

**Features:**
- Glass transmission sphere
- Orbiting sport elements
- Particle sparkles
- Geometric rings
- Environment lighting

**Usage:**
```tsx
<HeroScene scrollProgress={0.5} />
```

---

### `<ParticleField>`

Dynamic particle system with scroll response.

**Props:**
```typescript
interface ParticleFieldProps {
  count?: number; // Default: 1000
  scrollProgress?: number; // 0-1
}
```

**Usage:**
```tsx
<ParticleField count={500} scrollProgress={scrollProgress} />
```

---

### `<ScrollRig>`

Camera control system for spatial navigation.

**Props:**
```typescript
interface ScrollRigProps {
  scrollProgress: number; // 0-1
}
```

**Usage:**
```tsx
<ScrollRig scrollProgress={scrollProgress} />
```

---

### `<FloatingCard>`

UI card that floats in 3D space with hover effects.

**Props:**
```typescript
interface FloatingCardProps {
  children: ReactNode;
  position: [number, number, number]; // [x, y, z]
  index: number;
  scrollProgress: number;
}
```

**Usage:**
```tsx
<FloatingCard position={[0, 0, 0]} index={0} scrollProgress={0.5}>
  <div>Your content</div>
</FloatingCard>
```

---

### `<PostProcessing>`

Cinematic post-processing effects.

**Features:**
- Bloom (glow)
- Chromatic aberration
- Vignette

**Usage:**
```tsx
<PostProcessing />
```

---

## Hooks

### `useSmoothScroll()`

Lenis-powered smooth scrolling.

**Returns:**
```typescript
{
  scrollProgress: number; // 0-1
  scrollTo: (target: string | number | HTMLElement) => void;
  lenis: Lenis | null;
}
```

**Usage:**
```tsx
const { scrollProgress, scrollTo } = useSmoothScroll();

// Scroll to element
scrollTo('#section-id');

// Scroll to position
scrollTo(1000);
```

---

### `useTiltEffect(strength)`

Tilt effect on hover.

**Parameters:**
- `strength: number` - Tilt angle (default: 10)

**Returns:**
- `ref: RefObject<HTMLElement>`

**Usage:**
```tsx
const cardRef = useTiltEffect(15);

return <div ref={cardRef}>Tiltable card</div>;
```

---

### `useMouseMove(options)`

Magnetic/follow cursor effect.

**Options:**
```typescript
{
  strength?: number; // Default: 0.3
  ease?: number;     // Default: 0.1
}
```

**Usage:**
```tsx
const ref = useMouseMove({ strength: 0.5, ease: 0.15 });

return <div ref={ref}>Magnetic element</div>;
```

---

### `useScrollReveal(threshold)`

Reveal animation on scroll.

**Parameters:**
- `threshold: number` - Intersection threshold (default: 0.1)

**Returns:**
- `ref: RefObject<HTMLElement>`

**Usage:**
```tsx
const ref = useScrollReveal(0.2);

return <div ref={ref} className="opacity-0 is-visible:opacity-100">
  Content
</div>;
```

---

## Animation Presets

### `animations`

Pre-configured animation presets.

**Available Presets:**
```typescript
{
  fadeInUp: {...},
  fadeInBlur: {...},
  scaleIn: {...},
  slideFromLeft: {...},
  slideFromRight: {...},
  cardHover: {...},
  magneticHover: {...}
}
```

**Usage:**
```tsx
import { animations } from '@/lib/animations';

<motion.div {...animations.fadeInUp}>
  Content
</motion.div>
```

---

### `easings`

Premium easing functions.

**Available Easings:**
```typescript
{
  easeInOutCubic: [0.65, 0, 0.35, 1],
  easeOutExpo: [0.19, 1, 0.22, 1],
  easeOutQuint: [0.22, 1, 0.36, 1],
  easeInOutQuart: [0.76, 0, 0.24, 1],
  spring: [0.34, 1.56, 0.64, 1]
}
```

---

## Performance Tips

### Optimize Particle Count

```tsx
// Mobile
<ParticleField count={250} />

// Desktop
<ParticleField count={1000} />
```

### Adaptive Quality

```tsx
<Scene3D
  onPerformanceChange={(fps) => {
    if (fps < 30) {
      // Reduce quality
      setParticleCount(250);
    }
  }}
>
```

### Conditional Rendering

```tsx
const isMobile = window.innerWidth < 768;

{isMobile ? (
  <SimplifiedVersion />
) : (
  <Scene3D>
    {/* Full experience */}
  </Scene3D>
)}
```

---

## Customization Examples

### Change Camera Path

In `ScrollRig.tsx`:
```tsx
targetPosition.current.set(
  Math.sin(progress * Math.PI) * 5,    // Wider X movement
  progress * 8,                         // Faster Y movement
  10 - progress * 15                    // Deeper Z movement
);
```

### Adjust Bloom Intensity

In `PostProcessing.tsx`:
```tsx
<Bloom
  intensity={2.5}  // More glow
  luminanceThreshold={0.1}  // More elements glow
/>
```

### Modify Particle Colors

In `ParticleField.tsx`:
```tsx
// Blue to purple gradient
colors[i * 3] = THREE.MathUtils.lerp(0.2, 0.8, t);     // R
colors[i * 3 + 1] = THREE.MathUtils.lerp(0.4, 0.2, t); // G
colors[i * 3 + 2] = THREE.MathUtils.lerp(1.0, 1.0, t); // B
```

---

## Advanced Usage

### Add Custom 3D Objects

```tsx
import { useGLTF } from '@react-three/drei';

function CustomModel() {
  const { scene } = useGLTF('/models/sport-equipment.glb');
  return <primitive object={scene} />;
}

<Scene3D>
  <CustomModel />
</Scene3D>
```

### Physics Integration

```bash
npm install @react-three/cannon
```

```tsx
import { Physics, useBox } from '@react-three/cannon';

<Physics>
  <Ball />
</Physics>
```

### VR Support

```tsx
<Canvas vr>
  {/* VR-ready 3D content */}
</Canvas>
```

---

## Browser Support

- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 15+
- ✅ Edge 90+
- ⚠️ IE 11 (Not supported - requires WebGL 2)

---

## TypeScript Support

Full TypeScript support included:
- Type declarations in `src/types/3d.d.ts`
- Strict typing for all components
- IntelliSense support

---

## License

MIT - Use freely in your projects!
