variable "project_id" {
  description = "Google Cloud project ID"
  type        = string
}

variable "region" {
  description = "Default region"
  type        = string
}

variable "short_name" {
  description = "Short name of project used for DNS"
  type        = string
  default     = "has"
}
