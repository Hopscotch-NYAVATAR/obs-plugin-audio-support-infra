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
