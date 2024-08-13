// Firebase
resource "google_project_service" "firebase" {
  service = "firebase.googleapis.com"
}

resource "google_project_service" "cloudresourcemanager" {
  service = "cloudresourcemanager.googleapis.com"
}

resource "google_firebase_project" "default" {
  provider = google-beta
  depends_on = [
    google_project_service.firebase,
    google_project_service.cloudresourcemanager,
  ]
}

resource "google_firebase_web_app" "default" {
  provider     = google-beta
  display_name = "Hopscotch Audio Support Web App"
}

resource "google_firebase_hosting_site" "default" {
  provider = google-beta
  site_id  = var.project_id
}

resource "google_identity_platform_config" "default" {
}

// API Gateway
resource "google_project_service" "apigateway" {
  service = "apigateway.googleapis.com"
}

resource "google_project_service" "servicecontrol" {
  service = "servicecontrol.googleapis.com"
}

resource "google_api_gateway_api" "default" {
  provider = google-beta
  api_id   = "${var.short_name}-api"
  depends_on = [
    google_project_service.apigateway,
    google_project_service.servicecontrol
  ]
}

resource "google_api_gateway_api_config" "default" {
  provider      = google-beta
  api           = google_api_gateway_api.default.api_id
  api_config_id = "${var.short_name}-config"

  openapi_documents {
    document {
      path = "spec.yaml"
      contents = base64encode(templatefile("${path.module}/api.yaml.tftpl", {
        audioRecordingAccessTokenBackend = "https://example.com"
      }))
    }
  }

  lifecycle {
    create_before_destroy = true
  }
}

resource "google_api_gateway_gateway" "default" {
  provider   = google-beta
  api_config = google_api_gateway_api_config.default.id
  gateway_id = var.short_name
  region     = var.region
}

// Cloud Run
resource "google_project_service" "clouddeploy" {
  service = "clouddeploy.googleapis.com"
}

resource "google_clouddeploy_target" "default_prod" {
  location = var.region
  name     = "${var.short_name}-default-prod"
  run {
    location = "projects/${var.project_id}/locations/${var.region}"
  }

  depends_on = [
    google_project_service.clouddeploy
  ]
}

resource "google_clouddeploy_delivery_pipeline" "default" {
  location = var.region
  name = "${var.short_name}-default"
  serial_pipeline {
    stages {
      target_id = google_clouddeploy_target.default_prod.name
    }
  }
}
