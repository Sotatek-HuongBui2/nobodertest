import AWS from '../../config/aws';
const KMS = new AWS.KMS();

export async function decrypt(encryptedData: string) {
  const KeyId = process.env.AWS_ENCRYPTION_KEY_ID;
  const decryptedData = await KMS.decrypt({
    EncryptionAlgorithm: 'RSAES_OAEP_SHA_256',
    KeyId,
    CiphertextBlob: Buffer.from(encryptedData, 'hex'),
  }).promise();
  return decryptedData.Plaintext.toString();
}
