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
resource "google_api_gateway_api" "default" {
  provider = google-beta
  api_id   = "default"
}

resource "google_api_gateway_api_config" "default" {
  provider      = google-beta
  api           = google_api_gateway_api.default.api_id
  api_config_id = "default"

  openapi_documents {
    document {
      path = "spec.yaml"
      contents = base64encode(templatefile("api.yaml", {
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
  gateway_id = "default"
}
