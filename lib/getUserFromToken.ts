import Cookies from 'js-cookie';
import { jwtDecode } from "jwt-decode";

interface DecodedToken {
  userId: string;
  type: string;
  [key: string]: any;
}

export const getUserFromToken = (): { userId: string } | null => {
  const token = Cookies.get("accessToken");

  if (!token) return null;

  try {
    const decoded: DecodedToken = jwtDecode(token);
    return { userId: decoded.userId };
  } catch (error) {
    console.error("Failed to decode token:", error);
    return null;
  }
};