import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    {
      name: 'api-dev-server',
      configureServer(server) {
        server.middlewares.use(async (req, res, next) => {
          if (req.url && (req.url.startsWith('/api/') || req.url === '/api')) {
            const { default: apiHandler } = await import('./api/index.js');
            try {
              let body = '';
              req.on('data', (chunk) => {
                body += chunk;
              });
              req.on('end', async () => {
                if (body) {
                  try {
                    (req as any).body = JSON.parse(body);
                  } catch {
                    (req as any).body = body;
                  }
                }

                // Add helper methods expected by Vercel serverless function
                if (!(res as any).status) {
                  (res as any).status = function (code: number) {
                    res.statusCode = code;
                    return res;
                  };
                }
                if (!(res as any).json) {
                  (res as any).json = function (data: any) {
                    res.setHeader('Content-Type', 'application/json');
                    res.end(JSON.stringify(data));
                    return res;
                  };
                }

                await apiHandler(req, res);
              });
            } catch (err: any) {
              console.error('Local API dev server error:', err);
              res.statusCode = 500;
              res.end(JSON.stringify({ success: false, error: err.message }));
            }
          } else {
            next();
          }
        });
      },
    },
  ],
});
