import AWS from 'aws-sdk';

const minioEndpoint = process.env.MINIO_ENDPOINT;
const minioAccessKey = process.env.MINIO_ACCESS_KEY;
const minioSecretKey = process.env.MINIO_SECRET_KEY;

if (!minioEndpoint || !minioAccessKey || !minioSecretKey) {
    throw new Error('MinIO configuration not found in environment variables');
}

const s3Client = new AWS.S3({
    endpoint: minioEndpoint,
    s3ForcePathStyle: true,
    signatureVersion: 'v4',
    accessKeyId: minioAccessKey,
    secretAccessKey: minioSecretKey,
});

// 检查 RayBook 桶是否存在，不存在则创建
s3Client.createBucket({
    Bucket: 'raybook',
}, (err, data) => {
    if (err) {
        console.error('Error creating bucket:', err);
    } else {
        console.log('Bucket created:', data);
    }
});


export default s3Client;