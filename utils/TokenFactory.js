import * as jose from "jose";
class TokenFactory {
  static alg = "HS256";
  static secret = new TextEncoder().encode('u%s"p62?XuDG0E"DYl+1nxNW:uB/0E');
  static expiresIn = "1w";

  /**
   *
   * @param {jose.JWTPayload} data
   * @returns {string}
   */
  static generateToken(data) {
    const token = new jose.SignJWT(data)
      .setProtectedHeader({ alg: this.alg })
      .setExpirationTime(this.expiresIn)
      .sign(this.secret);
    return token;
  }
  /**
   *
   * @param {string} token
   * @returns
   */
  static validateToken(token) {
    try {
      const state = jose.jwtVerify(token, this.secret);
      return state;
    }
    catch (e) {
      return null;
    }
  }
}

export default TokenFactory;
