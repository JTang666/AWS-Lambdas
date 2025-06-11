const {S3Client, PutObjectCommand} = require('@aws-sdk/client-s3')
const {getSignedUrl} = require('@aws-sdk/s3-request-presigner');


const s3Client = new S3Client({
  region: "ap-southeast-2",
});

exports.getUploadUrl = async (event) => {
    try {
        const bucketName = process.env.BUCKET_NAME;
        const { fileName, fileType } = JSON.parse(event.body);

        if(!fileName || !fileType){
            return{
                statusCode: 400,
                body: JSON.stringify({error:"fileName and fileType are required"}),
            };
        }

        const command = new PutObjectCommand({
            Bucket: bucketName,
            Key: fileName,
            ContentType: fileType,
        });

        const signedUrl = await getSignedUrl(s3Client, command,{expiresIn:3600});

        return{
            statusCode:200,
            body:JSON.stringify({uploadUrl:signedUrl}),
        };
    }
    catch (error) {
        console.error("Error generating upload URL:", error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: "Failed to generate upload URL" }),
        };
    }
}