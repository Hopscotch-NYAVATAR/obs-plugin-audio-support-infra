#!/bin/bash

set -euxo pipefail

terraform init
terraform plan -input=false -out=tfplan
terraform apply tfplan

gcloud deploy releases create \
  "has-default-$(date +%Y%m%dt%H%M%S)" \
  --project=obs-plugin-voice-storage \
  --region=asia-northeast1 \
  --delivery-pipeline=has-default \
  --skaffold-file=skaffold-default.yaml

gcloud deploy releases create \
  "has-default-$(date +%Y%m%dt%H%M%S)" \
  --project=obs-plugin-voice-storage \
  --region=asia-northeast1 \
  --delivery-pipeline=has-jwks \
  --skaffold-file=skaffold-jwks.yaml
