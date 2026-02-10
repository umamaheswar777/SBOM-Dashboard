# AWS S3 Deployment Guide

## Prerequisites

1. AWS Account
2. AWS CLI installed and configured
3. An S3 bucket created

## Quick Deploy

### Option 1: Using the deployment script

```bash
chmod +x deploy-s3.sh
./deploy-s3.sh your-bucket-name
```

### Option 2: Manual deployment

```bash
# Build the application
npm run build

# Upload to S3
aws s3 sync dist/ s3://your-bucket-name --delete
```

## Configure S3 Bucket for Website Hosting

### 1. Enable Static Website Hosting

```bash
aws s3 website s3://your-bucket-name \
  --index-document index.html \
  --error-document index.html
```

### 2. Set Bucket Policy for Public Access

Create a file named `bucket-policy.json`:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::your-bucket-name/*"
    }
  ]
}
```

Apply the policy:

```bash
aws s3api put-bucket-policy \
  --bucket your-bucket-name \
  --policy file://bucket-policy.json
```

### 3. Disable Block Public Access

```bash
aws s3api put-public-access-block \
  --bucket your-bucket-name \
  --public-access-block-configuration \
  "BlockPublicAcls=false,IgnorePublicAcls=false,BlockPublicPolicy=false,RestrictPublicBuckets=false"
```

## Access Your Website

Your website will be available at:
```
http://your-bucket-name.s3-website-REGION.amazonaws.com
```

Replace `REGION` with your bucket's region (e.g., `us-east-1`).

## Optional: CloudFront CDN

For better performance and HTTPS support:

1. Create a CloudFront distribution
2. Set the S3 bucket as the origin
3. Configure SSL certificate
4. Point your custom domain to CloudFront

## Files Included in Deployment

The `dist/` folder contains:
- `index.html` - Main HTML file
- `assets/` - JavaScript and CSS bundles
- `favicon.svg` and `icons.svg` - Icon files
- `_redirects` - Redirect rules (for SPA routing)

## Troubleshooting

### 403 Forbidden Error
- Check bucket policy allows public read access
- Verify Block Public Access settings are disabled

### 404 Not Found
- Ensure static website hosting is enabled
- Verify index.html exists in the bucket root

### Assets Not Loading
- Check content-type headers are set correctly
- Verify all files were uploaded successfully
