#!/bin/bash

set -euxo pipefail

terraform init
terraform plan -input=false -out=tfplan
terraform apply tfplan

(
  cd ../../..
  docker build -t asia-northeast1-docker.pkg.dev/obs-plugin-voice-storage/has-default/has-default .
  docker image push asia-northeast1-docker.pkg.dev/obs-plugin-voice-storage/has-default/has-default
)

gcloud deploy releases create \
  "has-default-$(date +%Y%m%dt%H%M%S)" \
  --project=obs-plugin-voice-storage \
  --region=asia-northeast1 \
  --delivery-pipeline=has-default \
  --images=has-default=asia-northeast1-docker.pkg.dev/obs-plugin-voice-storage/has-default/has-default
