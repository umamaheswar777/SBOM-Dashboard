#!/bin/bash

# S3 Deployment Script
# Usage: ./deploy-s3.sh your-bucket-name

if [ -z "$1" ]; then
    echo "Error: Please provide your S3 bucket name"
    echo "Usage: ./deploy-s3.sh your-bucket-name"
    exit 1
fi

BUCKET_NAME=$1

echo "Building application..."
npm run build

echo "Uploading to S3 bucket: $BUCKET_NAME"
aws s3 sync dist/ s3://$BUCKET_NAME --delete

echo "Setting proper content types..."
aws s3 cp s3://$BUCKET_NAME s3://$BUCKET_NAME \
    --recursive \
    --exclude "*" \
    --include "*.html" \
    --content-type "text/html" \
    --metadata-directive REPLACE

aws s3 cp s3://$BUCKET_NAME s3://$BUCKET_NAME \
    --recursive \
    --exclude "*" \
    --include "*.css" \
    --content-type "text/css" \
    --metadata-directive REPLACE

aws s3 cp s3://$BUCKET_NAME s3://$BUCKET_NAME \
    --recursive \
    --exclude "*" \
    --include "*.js" \
    --content-type "application/javascript" \
    --metadata-directive REPLACE

aws s3 cp s3://$BUCKET_NAME s3://$BUCKET_NAME \
    --recursive \
    --exclude "*" \
    --include "*.svg" \
    --content-type "image/svg+xml" \
    --metadata-directive REPLACE

echo "Deployment complete!"
echo "Configure your bucket for static website hosting:"
echo "  - Enable static website hosting in S3 bucket settings"
echo "  - Set index document to: index.html"
echo "  - Set error document to: index.html"
echo "  - Update bucket policy to allow public read access"
