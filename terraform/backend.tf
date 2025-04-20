terraform {
  backend "s3" {
    bucket = "sk-terraform-backend-bucket"
    key    = "eks/terraform.tfstate"
    region = "us-east-1"
  }
}
