# Deployment — GitHub → Cloud Build → Cloud Run

Push/merge to **`master`** builds a Docker image, pushes it to **Artifact
Registry**, and deploys it to **Cloud Run** in **`asia-south1`**.

```
feature branch → PR → merge to master → Cloud Build trigger
  → docker build → Artifact Registry (:$COMMIT_SHA) → Cloud Run → production
```

| Thing | Value |
|---|---|
| Cloud Run service | `intervue-frontend` |
| Region | `asia-south1` |
| Artifact Registry repo | `intervue-frontend` |
| GCP project | `cuecast-507920` |
| Image | `asia-south1-docker.pkg.dev/cuecast-507920/intervue-frontend/intervue-frontend:$COMMIT_SHA` |
| Production branch | `master` |
| Container port | `8080` (nginx, non-root) |
| Public? | Yes — `--allow-unauthenticated` |

The only app config is `VITE_API_URL` (public backend base URL). It is
**build-time** — Vite bakes it into the JS bundle. It is **not a secret**.
Set it via the `_VITE_API_URL` substitution on the trigger. There are no
secrets in this project, so Secret Manager is not used.

---

## One-time setup

Everything below needs the `gcloud` CLI and Owner/Editor-ish rights on the
project. Run it once.

```bash
# ---- 0. Variables -------------------------------------------------------
export PROJECT_ID="cuecast-507920"
export REGION="asia-south1"
export AR_REPO="intervue-frontend"
export SERVICE="intervue-frontend"
export GITHUB_OWNER="gagannn19"
export GITHUB_REPO="Intervue"

gcloud config set project "$PROJECT_ID"
export PROJECT_NUMBER="$(gcloud projects describe "$PROJECT_ID" --format='value(projectNumber)')"

# ---- 1. Enable APIs ---------------------------------------------------
gcloud services enable \
  run.googleapis.com \
  cloudbuild.googleapis.com \
  artifactregistry.googleapis.com \
  iam.googleapis.com

# ---- 2. Artifact Registry repo -------------------------------------
gcloud artifacts repositories create "$AR_REPO" \
  --repository-format=docker \
  --location="$REGION" \
  --description="Docker images for $SERVICE"

# ---- 3. Dedicated build/deploy service account (least privilege) ----
gcloud iam service-accounts create cloudbuild-deployer \
  --display-name="Cloud Build -> Cloud Run deployer"

export DEPLOYER="cloudbuild-deployer@${PROJECT_ID}.iam.gserviceaccount.com"

# Push images to Artifact Registry
gcloud projects add-iam-policy-binding "$PROJECT_ID" \
  --member="serviceAccount:${DEPLOYER}" \
  --role="roles/artifactregistry.writer"

# Deploy to Cloud Run (create/update services, set public IAM policy)
gcloud projects add-iam-policy-binding "$PROJECT_ID" \
  --member="serviceAccount:${DEPLOYER}" \
  --role="roles/run.admin"

# Write build logs (required when a build uses a user-specified SA)
gcloud projects add-iam-policy-binding "$PROJECT_ID" \
  --member="serviceAccount:${DEPLOYER}" \
  --role="roles/logging.logWriter"

# Let the deployer deploy the service "as" the Cloud Run runtime SA.
# Runtime SA here = the Compute Engine default SA (the frontend needs no
# GCP access of its own). See "Hardening" to swap in a zero-permission SA.
gcloud iam service-accounts add-iam-policy-binding \
  "${PROJECT_NUMBER}-compute@developer.gserviceaccount.com" \
  --member="serviceAccount:${DEPLOYER}" \
  --role="roles/iam.serviceAccountUser"
```

### 4. Connect GitHub to Cloud Build  *(requires browser OAuth — do this in the console)*

1. Console → **Cloud Build → Triggers** → region **`asia-south1`** →
   **Connect Repository**.
2. Source **GitHub (Cloud Build GitHub App)** → **Continue** → authorize →
   install the app on **`gagannn19/Intervue`**.
3. Tick the repo, **Connect** (do *not* let it auto-create a default trigger).

### 5. Create the trigger

Console → **Create Trigger**:

| Field | Value |
|---|---|
| Name | `deploy-master` |
| Event | **Push to a branch** |
| Source | `gagannn19/Intervue` (the connection from step 4) |
| Branch | `^master$` |
| Configuration | **Cloud Build configuration file** → `/cloudbuild.yaml` |
| Substitution variable | `_VITE_API_URL` = `https://<your-prod-backend-host>/api` |
| Service account | `cloudbuild-deployer@$PROJECT_ID.iam.gserviceaccount.com` |

CLI equivalent (after step 4's connection exists):

```bash
gcloud builds triggers create github \
  --name="deploy-master" \
  --region="$REGION" \
  --repo-name="$GITHUB_REPO" \
  --repo-owner="$GITHUB_OWNER" \
  --branch-pattern='^master$' \
  --build-config="cloudbuild.yaml" \
  --service-account="projects/${PROJECT_ID}/serviceAccounts/${DEPLOYER}" \
  --substitutions=_VITE_API_URL="https://REPLACE-WITH-YOUR-BACKEND-HOST/api"
```

### 6. First deploy

Merge a PR to `master`, or run the trigger manually:

```bash
gcloud builds triggers run deploy-master --region="$REGION" --branch=master
```

Then get the URL:

```bash
gcloud run services describe "$SERVICE" --region="$REGION" \
  --format='value(status.url)'
```

---

## Manual deploy (bypass GitHub, from your machine)

```bash
gcloud builds submit --config=cloudbuild.yaml \
  --substitutions=COMMIT_SHA="$(git rev-parse HEAD)",_VITE_API_URL="https://<backend>/api"
```

Or fully by hand:

```bash
IMAGE="asia-south1-docker.pkg.dev/$PROJECT_ID/intervue-frontend/intervue-frontend:$(git rev-parse --short HEAD)"
gcloud auth configure-docker asia-south1-docker.pkg.dev
docker build --build-arg VITE_API_URL="https://<backend>/api" -t "$IMAGE" .
docker push "$IMAGE"
gcloud run deploy intervue-frontend \
  --image="$IMAGE" --region=asia-south1 --platform=managed \
  --port=8080 --allow-unauthenticated \
  --cpu=1 --memory=512Mi --min-instances=0 --max-instances=3
```

## Test the image locally

```bash
docker build --build-arg VITE_API_URL="http://localhost:4000/api" -t intervue-frontend:local .
docker run --rm -e PORT=8080 -p 8080:8080 intervue-frontend:local
# open http://localhost:8080   and   curl -f http://localhost:8080/healthz
```

---

## Branch protection (recommended — do it in GitHub UI)

Protect `master` so production only moves through reviewed PRs:

```
feature/* → PR → CI (lint + build) → approval → merge master → Cloud Build deploy
```

GitHub → **Settings → Rules → Rulesets → New branch ruleset**, target
`master`:
- Require a pull request before merging (≥1 approval)
- Require status checks: **`build`** (the `CI` workflow in
  `.github/workflows/ci.yml`)
- Block force pushes
- Restrict deletions
- Add yourself / a CI app to the **bypass list** as needed

---

## Security / IAM notes

- **No Owner/Editor granted.** The `cloudbuild-deployer` SA has exactly
  `artifactregistry.writer` + `run.admin` + `logging.logWriter`, plus
  `iam.serviceAccountUser` on the single runtime SA it deploys as.
- **`run.admin` is needed** (not just `run.developer`) because the pipeline
  sets the public (`allUsers`) invoker policy on deploy. Drop
  `--allow-unauthenticated` from `cloudbuild.yaml` and you can downgrade to
  `roles/run.developer`.
- **Public service:** `--allow-unauthenticated` binds `roles/run.invoker`
  to `allUsers`. If an org policy (`iam.allowedPolicyMemberDomains` /
  domain-restricted sharing) is enforced, the deploy step will fail until
  that policy allows `allUsers` for this project/service.
- **No secrets** anywhere in the image, repo, `cloudbuild.yaml`, or GitHub.
  `VITE_API_URL` is public build config. If a real secret is ever needed at
  build time, add it via Secret Manager + `availableSecrets` in
  `cloudbuild.yaml` — never as a plain substitution.

## Hardening (optional)

Give Cloud Run a dedicated zero-permission runtime SA instead of the
Compute default:

```bash
gcloud iam service-accounts create intervue-frontend-run \
  --display-name="intervue-frontend Cloud Run runtime"
export RUN_SA="intervue-frontend-run@${PROJECT_ID}.iam.gserviceaccount.com"
gcloud iam service-accounts add-iam-policy-binding "$RUN_SA" \
  --member="serviceAccount:${DEPLOYER}" --role="roles/iam.serviceAccountUser"
# then add to the deploy step in cloudbuild.yaml:
#   - "--service-account=intervue-frontend-run@$PROJECT_ID.iam.gserviceaccount.com"
```
