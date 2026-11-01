# GitHub Branches & Deployment Pipeline Architecture

This document illustrates how Git branches, GitHub Pull Requests, and Vercel environments are connected, and how Development (Preview) and Production environments operate with complete separation.

---

## 1. High-Level Architecture Diagram

```mermaid
flowchart TD
    subgraph Local["👨‍💻 Local Development"]
        LocalDev["Working on features / fixes"]
        LocalTest["Run tests (npm run test, test:push, test:gate, test:templates)"]
        LocalDev --> LocalTest
    end

    subgraph GitHub["🐙 GitHub Repository (lemon079/ai-task-manager)"]
        DevBranch["🌿 develop branch (Development / Staging)"]
        PR["🔀 Pull Request (#4: develop ➔ main)"]
        MainBranch["⭐ main branch (Production)"]

        DevBranch -->|"Open & Review PR"| PR
        PR -->|"Approve & Merge"| MainBranch
    end

    subgraph VercelEnvironments["▲ Vercel Cloud Platform"]
        subgraph DevEnv["🧪 Development / Preview Environment"]
            VercelPreviewBuild["Vercel Preview Build (Auto-triggered by push to develop)"]
            PreviewEnvs["Preview Environment Variables (Sensitive Secrets)"]
            PreviewDomain["🌐 Preview URL: ai-task-manager-112-*.vercel.app"]

            VercelPreviewBuild --> PreviewEnvs
            PreviewEnvs --> PreviewDomain
        end

        subgraph ProdEnv["🚀 Production Environment"]
            VercelProdBuild["Vercel Production Build (Auto-triggered by merge into main)"]
            ProdEnvs["Production Environment Variables (Sensitive Secrets)"]
            ProdDomain["🌐 Canonical Production URL: ai-task-manager-112-mu.vercel.app"]

            VercelProdBuild --> ProdEnvs
            ProdEnvs --> ProdDomain
        end
    end

    %% Connections
    LocalTest -->|"git push origin develop"| DevBranch
    DevBranch -->|"Webhook trigger"| VercelPreviewBuild
    MainBranch -->|"Webhook trigger"| VercelProdBuild

    classDef dev fill:#3b82f6,stroke:#1d4ed8,color:#fff;
    classDef prod fill:#10b981,stroke:#047857,color:#fff;
    classDef github fill:#6b7280,stroke:#374151,color:#fff;
    classDef local fill:#f59e0b,stroke:#b45309,color:#fff;

    class LocalDev,LocalTest local;
    class DevBranch,PR,MainBranch github;
    class VercelPreviewBuild,PreviewEnvs,PreviewDomain dev;
    class VercelProdBuild,ProdEnvs,ProdDomain prod;
```

---

## 2. Environment Comparison Matrix

| Aspect | Development / Preview (`develop`) | Production (`main`) |
|---|---|---|
| **Git Branch** | `develop` | `main` |
| **Vercel Target** | **Preview** | **Production** |
| **Deployment Trigger** | Automatic on every `git push origin develop` | Automatic on PR merge into `main` |
| **Public URL** | `https://ai-task-manager-112-*.vercel.app` | `https://ai-task-manager-112-mu.vercel.app` |
| **Purpose** | Verification, testing new features, mobile PWA testing | Live end-users, installed desktop/mobile PWAs |
| **Environment Variables** | Configured for **Preview** environment | Configured for **Production** environment |
| **Safety Net** | Safe to break, iterate, test migrations and edge cases | Strictly guarded; zero breaking changes allowed |

---

## 3. How Separation Works

1. **Independent Triggers**:
   - Pushing code to `develop` **only** creates a preview deployment. It will **never** touch or overwrite the live production app.
   - The production deployment is **only** triggered when changes are explicitly merged into `main`.

2. **Isolated Environment Variables**:
   - Vercel allows assigning secrets and environment variables by environment target: `Production`, `Preview`, and `Development`.
   - VAPID keys, database URLs, and API tokens can be scoped individually so preview tests never affect production data.

3. **Gated Progression (The Golden Flow)**:
   ```
   1. Develop & test locally
         ↓
   2. git push origin develop
         ↓
   3. Vercel generates Preview deployment URL
         ↓
   4. You test & verify on phone / desktop preview URL
         ↓
   5. Open Pull Request (develop → main)
         ↓
   6. Merge Pull Request
         ↓
   7. Vercel automatically deploys to Production URL
   ```
