# Devops_Capstone_4

## Objective
 End-to-End DevOps Pipeline for a Web Application with CI/CD

---

## Problem Statement: [ProblemStatement.md](ProblemStatement.md)

---

## Application API documentation: [backend/README.md](backend/README.md)

---

## Prerequisites
- Fork the repository https://github.com/UnpredictablePrashant/SampleMERNwithMicroservices.git to your github https://github.com/SyamalaKadmi/SampleMERNwithMicroservices.git

---

## Instructions

### 1. Architecture Design, Dockerization, and Jenkins Setup
1. Design Application Architecture
    - Use AWS EKS for Kubernetes cluster management.
    - Deploy a web application containerized with Docker.
    - Store container images in AWS ECR.
    - Use Terraform for Infrastructure as Code (IaC).
    - Automate configuration with Ansible.
    - Monitor with Prometheus & Grafana.
    ![Architecture.png](Images/Architecture.png)
    - Draw.io architecture diagram can be found at [Capstone.drawio](Capstone.drawio)
2. Clone the forked repository to your local using 
    ```bash
        git clone https://github.com/SyamalaKadmi/SampleMERNwithMicroservices.git
    ```
    - This application contains frontend & backend(helloService, profileService). Create a docker file for each service
3. Create .env files for helloService & ProfileService in backend
    - helloService
        ```
            PORT=3001
        ```
    - profileService
        ```
            PORT=3002
            MONGO_URL="specifyYourMongoURLHereWithDatabaseNameInTheEnd"
        ```
4. Install AWS CLI for windows from official website
5. Verify the installation
    ```bash
        aws --version
    ```
6. Configure AWS CLI:
    Run the following command and enter your AWS Access Key, Secret Key, Region, and Output format. You can get Access Key & Secret Key from AWS IAM policies
    ```bash
        aws configure
    ```
7. Create docker files for frontend and backend (helloService & profileService) respectively
    - helloservice [HelloServiceDockerfile](backend/helloService/Dockerfile)
    - profileservice [profileServiceDockerfile](backend/profileService/Dockerfile)
    - frontendservice [frontendDockerfile](frontend/Dockerfile)
8. Build the docker images
    ```bash
    cd ./SampleMERNwithMicroservices
    docker build -t mern-frontend-image ./frontend
    docker build -t mern-backend-helloservice-image ./backend/helloService
    docker build -t mern-backend-profileservice-image ./backend/profileservice
    ```
9. Push Docker Images to Amazon ECR:
    1. Create a reppository for each image
        ```bash
            aws ecr create-repository --repository-name mern-frontend-repo
            aws ecr create-repository --repository-name mern-backend-helloservice-repo
            aws ecr create-repository --repository-name mern-backend-profileservice-repo
        ```
        ![ecrRepoCreation](Images/ecrCreation.png)
    2. Authenticate Docker to ECR
        ```bash
            aws ecr get-login-password --region <region> | docker login --username AWS --password-stdin <account-id>.dkr.ecr.<region>.amazonaws.com
        ```
    3. Tag and push the docker images to the ECR
        - Frontend
        ```bash
            docker tag mern-frontend-image:latest 975050024946.dkr.ecr.us-east-1.amazonaws.com/mern-frontend-repo:latest
            docker push 975050024946.dkr.ecr.us-east-1.amazonaws.com/mern-frontend-repo:latest
        ```
        ![FrontEndECR](Images/ecrFrontend.png)

        - backend - helloService
        ```bash
            docker tag mern-backend-helloservice-image:latest 975050024946.dkr.ecr.us-east-1.amazonaws.com/mern-backend-helloservice-repo:latest
            docker push 975050024946.dkr.ecr.us-east-1.amazonaws.com/mern-backend-helloservice-repo:latest
        ```
        ![helloserviceECR](Images/ecrHelloService.png)

        - backend - profileService
        ```bash
            docker tag mern-backend-profileservice-image:latest 975050024946.dkr.ecr.us-east-1.amazonaws.com/mern-backend-profileservice-repo:latest
            docker push 975050024946.dkr.ecr.us-east-1.amazonaws.com/mern-backend-profileservice-repo:latest
        ```
        ![profileServiceECR](Images/ecrProfileService.png)

10. Setup Jenkins on EC2
    - Create an EC2 instance - Amazon Linux 2, t2.micro, and allow the port 8080 for Jenkins
    - 1. Login to the created EC2 instance
        - Install Java (Required for Jenkins)
        ```bash
            sudo yum update -y
            sudo yum install -y java-11-amazon-corretto
        ```
        - Add Jenkins repository
        ```bash
            sudo wget -O /etc/yum.repos.d/jenkins.repo https://pkg.jenkins.io/redhat-stable/jenkins.repo
            sudo rpm --import https://pkg.jenkins.io/redhat-stable/jenkins.io-2023.key
        ```
        - Install & Start Jenkins
        ```bash
            sudo yum install -y jenkins
            sudo systemctl start jenkins
            sudo systemctl enable jenkins
        ```
        - Access Jenkins
        Get the initial password from 
        ```bash
        sudo cat /var/lib/jenkins/secrets/initialAdminPassword
        ```
        - Open Jenkins in the browser: http://<ipaddress>:8080/ and enter the copied password and setup an admin user
        - Install the required plugins - Git, Github, Docker Pipeline, AWS CLI, Kubernetes CLI, Terraform
        - Configure credentials for AWS, DockerHub, and GitHub - Go to Jenkins Dashboard -> Manage Jenkins -> Credentials -> System -> Global credentials (unrestricted) -> Add Credentials

---

### 2. AWS Infrastructure Provisioning with Terraform and Jenkins Integration
1. Install Terraform
   ```
   sudo apt install unzip
   wget https://releases.hashicorp.com/terraform/X.X.X/terraform_X.X.X_linux_amd64.zip
   unzip terraform_X.X.X_linux_amd64.zip
   sudo mv terraform /usr/local/bin
   ```

2. Create Terraform Configuration Files
   ```
       mkdir -p ~/terraform/aws-eks
       cd ~/terraform/aws-eks
   ```
   1. [provider.tf](Scripts/Terraform/provider.tf) -- for indicating the Terraform to use the aws
   2. [vpc.tf](Scripts/Terraform/vpc.tf) -- for creating vpc and subnets
   3. [eks.tf](Scripts/Terraform/eks.tf) -- to create EKS cluster
   4. [iam.tf](Scripts/Terraform/iam.tf) -- to create IAM roles for EKS cluster
   5. [security.tf](Scripts/Terraform/security.tf) -- to create security group for EKS cluster
   6. [backend.tf](Scripts/Terraform/backend.tf) -- to store the Terraform state securely
      Important: Create an S3 bucket manually before running Terraform:
      ```
         aws s3 mb s3://ssy-terraform-state-bucket
      ```
3. Initialize and Apply Terraform
   Run the following commands in the Terraform project directory:
   ```
      terraform init       # Initialize Terraform
      terraform plan       # Preview changes
      terraform apply -auto-approve   # Apply changes
   ```
   Verification:
   ```
      aws eks list-clusters --region us-east-1
   ```
4. Configure Terraform in Jenkins
   . Navigate to Jenkins Dashboard
   . Create a new jenkins job --> Jenkins Dashboard → New Item → Pipeline → OK
   . Under Pipeline Definition, select Pipeline Script
   . Add the script -- [pipeline.txt](pipeline.txt)
