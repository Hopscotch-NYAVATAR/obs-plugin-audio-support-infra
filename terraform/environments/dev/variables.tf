variable "project_id" {
  description = "Google Cloud project ID"
  type        = string
}

variable "region" {
  description = "Default region"
  type        = string
}

variable "run_default_url" {
  description = "Run URL for default backend"
  type        = string
}

variable "run_jwks_url" {
  description = "Run URL for JWKS backend"
  type        = string
}
