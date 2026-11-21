import * as oidc from 'openid-client';

let googleConfig;

export const getGoogleConfig = async () => {
    if (!googleConfig) {
        googleConfig = await oidc.discovery(
            new URL('https://accounts.google.com'),
            process.env.GOOGLE_CLIENT_ID,
            {
                client_secret: process.env.GOOGLE_CLIENT_SECRET
            },
            oidc.ClientSecretPost(process.env.GOOGLE_CLIENT_SECRET)
        );
    }

    return googleConfig;
};