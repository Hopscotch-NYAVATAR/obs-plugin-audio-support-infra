#!/bin/bash

set -euo pipefail

terraform init
terraform plan -input=false -out=tfplan
terraform apploy tfplan

(
  cd ../../
  docker build -t asia-northeast1-docker.pkg.dev/obs-plugin-voice-storage/has-default/has-default .
  docker image push asia-northeast1-docker.pkg.dev/obs-plugin-voice-storage/has-default/has-default
)

gcloud deploy releases create \
  "has-default-$(date +%Y%m%dT%H%M%S)" \
  --project=obs-plugin-voice-storage \
  --region=asia-northeast1 \
  --delivery-pipeline=has-default \
  --images=has-default=asia-northeast1-docker.pkg.dev/obs-plugin-voice-storage/has-default/has-default
