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

resource "google_identity_platform_config" "default" {
}

resource "google_firebase_hosting_site" "default" {
  provider = google-beta
  site_id  = var.project_id
}

resource "google_firebase_web_app" "default" {
  provider     = google-beta
  display_name = "Hopscotch Audio Support Web App"
}
