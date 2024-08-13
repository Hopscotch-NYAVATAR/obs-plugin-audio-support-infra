terraform {
  backend "gcs" {
    bucket = "obs-plugin-voice-storage-tfstate"
    prefix = "env/dev"
  }
}
