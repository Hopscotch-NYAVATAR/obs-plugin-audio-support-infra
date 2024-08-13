resource "google_project_service" "firebase" {
  service = "firebase.googleapis.com"
}

resource "google_firebase_project" "default" {
  provider   = google-beta
  depends_on = [google_project_service.firebase]
}
