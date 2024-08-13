# Terraform for Hopscotch Audio Support

## Variables (Dev)

```
PROJECT_ID=obs-plugin-voice-storage
REGION=asia-northeast1
BUCKET_NAME=$PROJECT_ID-tfstate
```

## Storage for tfstate

```
gcloud storage buckets create "gs://$BUCKET_NAME" \
  --location=$REGION \
  --public-access-prevention \
  --uniform-bucket-level-access

gcloud storage buckets update "gs://$BUCKET_NAME" --versioning
```
