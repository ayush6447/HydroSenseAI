#!/bin/bash
aws ecr get-login-password --region ap-south-1 | docker login --username AWS --password-stdin $ECR_REGISTRY
docker build -t hydroponic-backend ./backend
docker tag hydroponic-backend:latest $ECR_REGISTRY/hydroponic-backend:latest
docker push $ECR_REGISTRY/hydroponic-backend:latest
