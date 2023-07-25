import { google } from 'googleapis';
var OAuth2 = google.auth.OAuth2;

export const generateAuthedClient = ({ accessToken, refreshToken, redirectUrl }: any) => {

    var clientSecret = process.env.GOOGLE_SECRET;
    var clientId = process.env.GOOGLE_ID;
    var defaultRedirectUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000/api/auth/callback/google';
    var oauth2Client = new OAuth2(clientId, clientSecret, redirectUrl ? redirectUrl : defaultRedirectUrl);

    oauth2Client.setCredentials({
        access_token: accessToken,
        refresh_token: refreshToken
    });

    return oauth2Client;

}

export async function refreshAccessToken(tokens: any, reference: string) {
    try {
     console.log('info', 'refreshing token for', reference);
      if(!(tokens.refreshToken)) {
        throw new Error('No refresh token');
      }
      const url =
        "https://oauth2.googleapis.com/token?" +
        new URLSearchParams({
          client_id: process.env.GOOGLE_ID as string,
          client_secret: process.env.GOOGLE_SECRET as string,
          grant_type: "refresh_token",
          refresh_token: tokens.refreshToken,
        })
  
      const response = await fetch(url, {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        method: "POST",
      })
  
      // console.log(response);
  
      const refreshedTokens = await response.json()
  
      if (!response.ok) {
        throw refreshedTokens
      }
  
      console.log('info', 'successful refresh');
      return {
        ...tokens,
        accessToken: refreshedTokens.access_token,
        accessTokenExpires: Date.now() + refreshedTokens.expires_at * 1000,
        refreshToken: refreshedTokens.refresh_token ?? tokens.refreshToken, // Fall back to old refresh token
      }
    } catch (error) {
      console.log('error', 'error refreshing access token', {error, reference})
  
      return {
        ...tokens,
        error: "RefreshAccessTokenError",
      }
    }
  }