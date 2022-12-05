const jwt = require('jsonwebtoken')


/**
 *  Generate tokens multipurpose function takes username duration and token type as params and returns a token
*/ 
export const generateToken = async (username: string|undefined, duration: string, token_type: string) => {
    const _token =  await jwt.sign({
        username: username,
      },`process.env.${token_type}`,{
        expiresIn: duration
      });
      return _token;
}
/**
 * Verifies jwt 
 * @param token 
 * @param token_type 
 * @returns 
 */

export const verifyToken = async (token: string, token_type: any) => {
    return jwt.decode(token, token_type);
}