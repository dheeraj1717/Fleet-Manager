import axios from "axios";
import { cookies } from "next/headers";

export async function getServerAxiosInstance() {
  const cookieStore = await cookies();
  const token = cookieStore.get("accessToken")?.value;
  
  const instance = axios.create({
    baseURL: process.env.API_BASE,
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  
  return instance;
}
