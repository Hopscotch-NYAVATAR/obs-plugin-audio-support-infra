terraform {
  required_version = ">= 1.5.7"

  required_providers {
    google = {
      source  = "hashicorp/google"
      version = ">= 5.40.0, < 6"
    }
    google-beta = {
      source  = "hashicorp/google"
      version = ">= 5.40.0, < 6"
    }
  }
}
