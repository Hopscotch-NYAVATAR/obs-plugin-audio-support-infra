module "hopscotch_audio_support" {
  source     = "../../modules/hopscotch_audio_support"
  project_id = var.project_id
  region     = var.region

  run_default_url = var.run_default_url
  run_jwks_url    = var.run_jwks_url
}
