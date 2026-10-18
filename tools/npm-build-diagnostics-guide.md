# Global npm Configuration & Build Warning Guide (Windows)

This guide documents the root cause and safe resolution for recurring npm lifecycle warnings and build bundle warnings across all your JavaScript/TypeScript projects on Windows 11.

---

## 1. Global vs. Project-Specific Configuration

Understanding the scope of settings is essential for keeping your computer and repositories secure:

| Configuration Scope | Location | What Belongs Here | What MUST NOT Go Here |
| :--- | :--- | :--- | :--- |
| **Global npm Settings** | `C:\Users\MSI\.npmrc` | Custom package prefix, default author, log levels, proxy settings | Blanket approvals (`allow-scripts=all`) or globally disabled security checks |
| **Project-Specific Settings** | `<project>\package.json` | `allowScripts`, project dependencies, build scripts, engine constraints | Machine-specific file paths or personal local configs |
| **Project npm Rules** | `<project>\.npmrc` | Project-scoped registry settings, lockfile behaviors, strict peer dependencies | Personal auth tokens or credentials |
| **Bundler Config** | `vite.config.js` / `next.config.js` | Chunk size thresholds, code-splitting (`manualChunks`), dynamic imports | Global npm flags (bundlers do not read npm settings) |

---

## 2. Resolving `npm warn allow-scripts` Safely

### The Root Cause & Version Matrix
Supply-chain security enhancements in npm govern unvetted lifecycle scripts (`preinstall`, `install`, `postinstall`, `node-gyp rebuild`):

| Environment / Version | Lifecycle Script Behavior | `allowScripts` Status |
| :--- | :--- | :--- |
| **npm < 11.16.0** (e.g. your local **v11.6.2**) | Scripts run automatically. No warnings. | Not implemented. `npm approve-scripts` is unknown. |
| **npm v11.16.0 – v11.x** (Phase 1, released May 2026) | Scripts run, but prints `npm warn allow-scripts`. | Introduces `package.json` `"allowScripts"` allowlist & `npm approve-scripts` CLI. |
| **npm v12.0.0+** (Phase 2) | Unapproved scripts are **blocked** by default. | Fully enforced via `package.json` `"allowScripts"`. |
| **Cloud CI (Vercel / Netlify / GitHub Actions)** | Runs modern Node/npm containers (npm >= 11.16). | Issues `npm warn allow-scripts` during clean container installs. |

Packages triggering the warning:
- **`@firebase/util`**: Runs `node ./postinstall.js` (detects `FIREBASE_WEBAPP_CONFIG` for App Hosting).
- **`protobufjs`**: Runs `node scripts/postinstall` (checks version parity).

### Safe Approval Workflow
1. **Never use blanket global approval**:
   Setting `allow-scripts=all` in `C:\Users\MSI\.npmrc` disables script auditing across **all** repositories on your computer, exposing you to malicious supply chain packages.
2. **Approve on a per-project basis in `package.json`**:
   Add the specific, verified packages to your repository's `package.json`:
   ```json
   {
     "allowScripts": {
       "@firebase/util": true,
       "protobufjs": true
     }
   }
   ```
   *(Version-pinned format like `"@firebase/util@1.15.3": true` is also supported by npm 11.16+).*
3. **Commit `package.json` to Git**:
   Because `package.json` is tracked, cloud deployment providers (Vercel, Netlify) receive the vetted approvals during clean installations without manual intervention.
4. **Current Status**:
   Local npm 11.6.2 safely ignores `"allowScripts"` without error. No changes have been applied to your repositories yet. Approval remains an explicit opt-in choice per project.

---

## 3. Resolving Vite Chunk-Size Warnings

### The Root Cause
Vite builds production bundles using Rolldown/Rollup. By default, it warns whenever an individual generated chunk exceeds **500 kB**:
```
(!) Some chunks are larger than 500 kB after minification.
```
In applications using substantial SDKs (such as Firebase Web SDK), bundling all application code and vendors into a single chunk inevitably exceeds 500 kB.

### Why Global npm Cannot Fix This
Vite's chunk size warnings originate entirely from the client bundler, not npm. There is no npm setting that controls bundle chunking.

### How to Fix in Vite Projects
Open the project's `vite.config.js` and configure manual code-splitting under `build.rollupOptions` (or `build.rolldownOptions` in Vite 8):

```javascript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    // 1. Separate heavy vendor libraries into dedicated cached chunks
    rollupOptions: {
      output: {
        manualChunks: {
          firebase: [
            'firebase/app',
            'firebase/firestore',
            'firebase/storage',
            'firebase/auth'
          ],
          vendor: ['react', 'react-dom']
        }
      }
    },
    // 2. Or adjust the warning limit (in kB) if a single chunk is intentionally bundled:
    chunkSizeWarningLimit: 1000
  }
});
```

### For Next.js Projects
Next.js automatically handles chunk splitting per route. To analyze large bundles in Next.js:
1. Install `@next/bundle-analyzer`:
   ```bash
   npm install --save-dev @next/bundle-analyzer
   ```
2. Enable in `next.config.js`:
   ```javascript
   const withBundleAnalyzer = require('@next/bundle-analyzer')({
     enabled: process.env.ANALYZE === 'true',
   });
   module.exports = withBundleAnalyzer({});
   ```

---

## 4. Reusable Diagnostic PowerShell Command

To diagnose any repository or check your global npm status without modifying any files or leaking credentials:

### Permanent Global User Tool (Recommended):
Run against current project directory:
```powershell
powershell -ExecutionPolicy Bypass -File "C:\Users\MSI\scripts\npm-build-diagnostics.ps1"
```

Run against a specific target project:
```powershell
powershell -ExecutionPolicy Bypass -File "C:\Users\MSI\scripts\npm-build-diagnostics.ps1" -ProjectPath "D:\Downloads\project\love"
```

Run with relative path (e.g. from parent folder):
```powershell
powershell -ExecutionPolicy Bypass -File "C:\Users\MSI\scripts\npm-build-diagnostics.ps1" -ProjectPath "..\another-project"
```

### Local Workspace Copy:
```powershell
powershell -ExecutionPolicy Bypass -File "D:\Downloads\project\love\tools\npm-build-diagnostics.ps1"
```

---

## 5. Handling Deployment Environments (Vercel, Netlify, CI)

Cloud deployment platforms install dependencies in an isolated container from scratch (`npm ci` or `npm install`):
- They do **not** inherit your Windows global `.npmrc` file (`C:\Users\MSI\.npmrc`).
- They read **only** your repository's:
  1. `package.json` (including `"allowScripts"`)
  2. `package-lock.json`
  3. Repository-level `.npmrc` (if committed)
- To ensure clean CI builds without warnings:
  Always commit the `"allowScripts"` block to `package.json`.
