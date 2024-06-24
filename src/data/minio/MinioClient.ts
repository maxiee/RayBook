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

async function checkAndCreateBucket(bucketName: string) {
    const params = { Bucket: bucketName };
  
    try {
      // 尝试获取 Bucket 信息以检查其是否存在
      await s3Client.headBucket(params).promise();
      console.log(`Bucket "${bucketName}" 已经存在。`);
    } catch (error) {
      // 如果 Bucket 不存在，则根据错误类型决定操作
      if (error.statusCode === 404) {
        console.log(`Bucket "${bucketName}" 不存在，正在尝试创建...`);
        try {
          await s3Client.createBucket(params).promise();
          console.log(`Bucket "${bucketName}" 创建成功。`);
        } catch (createError) {
          console.error("创建 Bucket 失败：", createError);
        }
      } else {
        console.error("检查 Bucket 时发生错误：", error);
      }
    }
  }

// 检查 RayBook 桶是否存在，不存在则创建
checkAndCreateBucket('raybook');


export default s3Client;