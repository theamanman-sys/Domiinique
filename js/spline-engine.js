import { Application } from 'https://unpkg.com/@splinetool/runtime';

const canvas = document.getElementById('canvas3d');
const app = new Application(canvas);

// Load the Spline scene.
// REPLACE 'your-scene-id' with an actual Spline scene ID from https://prod.spline.design
const SCENE_ID = null; // Set to your scene ID string, e.g. 'aBcDeFgHiJkL'
if (SCENE_ID) {
  app.load(`https://prod.spline.design/${SCENE_ID}/scene.splcode`)
    .then(() => {
      console.log('Spline scene loaded successfully');
    })
    .catch((err) => {
      console.warn('Spline failed to load:', err);
    });
} else {
  console.warn('Spline scene not configured — set SCENE_ID in js/spline-engine.js');
}

// Handle window resizing to keep the 3D scene aligned
window.addEventListener('resize', () => {
  // Application handles internal resizing, but we can add custom logic here
});
