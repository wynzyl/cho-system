module.exports = {
    apps: [
      {
        name: "cho-system",
        cwd: "E:\\Projects\\CHO\\cho-system",
 
        // Windows-safe: avoid .cmd shims by running node + Next's real JS entry
        script: "node",
        args: "node_modules/next/dist/bin/next start --hostname 127.0.0.1 --port 6600",
  
        // Optional: set to true only if you actually use Next's "standalone" output
        exec_mode: "fork",
  
        instances: 1,
        autorestart: true,
        watch: false,
  
        // Prevent restart loops if it keeps crashing
        min_uptime: "10s",
        max_restarts: 10,
  
        // Logs
        error_file: "E:\\Projects\\CHO\\cho-system\\.pm2\\logs\\cho-system-error.log",
        out_file: "E:\\Projects\\CHO\\cho-system\\.pm2\\logs\\cho-system-out.log",
        time: true,
  
        // Env (PM2 uses these at start; use --update-env when you change them)
        env: {
          NODE_ENV: "production",
          // PORT is redundant since we pass --port, but harmless
          PORT: "6600",
        },
      },
    ],
  };
  