# Terraform for Hopscotch Audio Support

## Variables (Dev)

```
PROJECT_ID=obs-plugin-voice-storage
REGION=asia-northeast1
BUCKET_NAME=$PROJECT_ID-tfstate
ENVIRONMENT=dev
```

## Storage for tfstate

```
gcloud storage buckets create "gs://$BUCKET_NAME" \
  --location=$REGION \
  --public-access-prevention \
  --uniform-bucket-level-access

gcloud storage buckets update "gs://$BUCKET_NAME" --versioning
```

## Apply Terraform on Cloud Shell

```
git clone https://github.com/Hopscotch-NYAVATAR/obs-plugin-audio-support-infra.git
git switch main
git pull
cd ~/obs-plugin-audio-support-infra/terraform/environments/$ENVIRONMENT
terraform init
terraform plan -input=false -out=tfplan
terraform apply tfplan
```

## OAuth brand screen

https://console.cloud.google.com/apis/credentials/consent?hl=ja&project=obs-plugin-voice-storage

## Cloud Deploy

```
gcloud deploy releases create \
  test-release-003 \
  --project=$PROJECT_ID \
  --region=$REGION \
  --delivery-pipeline=has-default \
  --images=has-default=tbd
```
