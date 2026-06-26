import fp from 'fastify-plugin';
import { FastifyPluginAsync } from 'fastify';
import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

declare module 'fastify' {
  interface FastifyInstance {
    s3: {
      client: S3Client;
      bucket: string;
      generateUploadUrl: (key: string, contentType: string) => Promise<string>;
      generateDownloadUrl: (key: string) => Promise<string>;
    };
  }
}

const storagePlugin: FastifyPluginAsync = async (fastify, opts) => {
  const region = process.env.AWS_REGION || 'us-east-1';
  const bucket = process.env.AWS_S3_BUCKET || 'grekam-os-dev';
  
  const endpoint = process.env.AWS_S3_ENDPOINT;
  
  const clientConfig: any = {
    region,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID || 'dummy-access',
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || 'dummy-secret',
    },
  };

  if (endpoint) {
    clientConfig.endpoint = endpoint;
    // R2 requires region to be 'auto', but S3Client handles it or we pass it
    // Some custom endpoints need forcePathStyle
    clientConfig.forcePathStyle = true; 
  }

  const client = new S3Client(clientConfig);

  const generateUploadUrl = async (key: string, contentType: string) => {
    const command = new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      ContentType: contentType,
    });
    // Link expires in 15 minutes
    return await getSignedUrl(client, command, { expiresIn: 900 });
  };

  const generateDownloadUrl = async (key: string) => {
    const command = new GetObjectCommand({
      Bucket: bucket,
      Key: key,
    });
    // Link expires in 60 minutes
    return await getSignedUrl(client, command, { expiresIn: 3600 });
  };

  fastify.decorate('s3', {
    client,
    bucket,
    generateUploadUrl,
    generateDownloadUrl,
  });
};

export default fp(storagePlugin);
