const AWS = require('aws-sdk');

AWS.CredentialProviderChain.defaultProviders = [
    /**
     * The EnvironmentCredentials will be loaded from the env vars:
     * - AWS_ACCESS_KEY_ID
     * - AWS_SECRET_ACCESS_KEY
     * - AWS_SESSION_TOKEN (optional)
     */
    function environmentCredentials() {
        return new AWS.EnvironmentCredentials('AWS');
    },

    /**
     * The SharedIniFileCredentials will be loaded from the config file:
     * - ~/.aws/credentials
     */
    function sharedIniFileCredentials() {
        return new AWS.SharedIniFileCredentials({
            profile: process.env.AWS_PROFILE_NAME || 'default',
        });
    },

    /**
     * The eC2MetadataCredentials will be loaded if the process is running
     * under an EC2 Instance
     */
    function eC2MetadataCredentials() {
        return new AWS.EC2MetadataCredentials();
    },
];

// Use Promise
AWS.config.setPromisesDependency(Promise);

// If there're no particular settings, the default regiono is Singapore
AWS.config.update({ region: process.env.AWS_REGION || 'ap-southeast-1' });

export default AWS;
