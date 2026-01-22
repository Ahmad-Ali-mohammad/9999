Quick frontend deployment notes:

- The frontend Dockerfile builds the Vite app and serves dist via nginx.
- Ensure any runtime API URL is set to the backend host (e.g., via env replacement or at build time).
- Build and push image, or use Vercel/Netlify for static hosting.
