import BaseRequestService from "./baseRequest.service";
import { getAuthHeader } from "@/utils/utils";

const ApiUrl = import.meta.env.VITE_API_URL;
const API_URL = `${ApiUrl}`;

class AuthService extends BaseRequestService {

  login(data: any) {
    return this.post(`${API_URL}/auth/login`, data);
  }

  register(data: any) {
    return this.post(`${API_URL}/auth/register`, data, {
    });
  }
  verifyEmail(data: any) {
    return this.post(`${API_URL}/auth/verify-email`, data );
  }

  forgotPassword(data: any) {
    return this.post(`${API_URL}/auth/forgot-password`, data);
  }
  

  changePassword(data: any) {
    return this.patch(`${API_URL}/auth/change-password`, data, {
      headers: getAuthHeader(),
    });
  }

  }

export default new AuthService();