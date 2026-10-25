import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  return {
    plugins: [
      react(),
      tailwindcss(),
      {
        name: 'gemini-explain-api',
        configureServer(server) {
          server.middlewares.use(async (req, res, next) => {
            if (req.url === '/api/explain' && req.method === 'POST') {
              let body = '';
              req.on('data', (chunk) => {
                body += chunk;
              });
              req.on('end', async () => {
                try {
                  const payload = JSON.parse(body || '{}');
                  const { generateIncidentCommanderReasoning } = await import(
                    './src/server/geminiHandler.ts'
                  );
                  const result = await generateIncidentCommanderReasoning(payload);
                  res.setHeader('Content-Type', 'application/json');
                  res.end(JSON.stringify({ success: true, data: result }));
                } catch (err: any) {
                  res.statusCode = 500;
                  res.setHeader('Content-Type', 'application/json');
                  res.end(
                    JSON.stringify({ success: false, error: err?.message || 'Server error' })
                  );
                }
              });
            } else {
              next();
            }
          });
        },
      },
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      host: '0.0.0.0',
      port: 3000,
      allowedHosts: true,
      cors: true,
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
