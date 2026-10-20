// Regenerate magicbolt-reel/src/studio/registry.tsx from the src/studio/<id>/index.tsx folders.
import {writeRegistry} from '../server/remotion.mjs';
console.log('registered:', writeRegistry().join(', ') || '(none)');
