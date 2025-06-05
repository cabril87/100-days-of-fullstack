import { 
  User, 
  UserCreateDTO, 
  UserLoginDTO, 
  TokensResponseDTO, 
  UserProfileUpdateDTO, 
  PasswordChangeDTO, 
  AdminPasswordChangeDTO,
  MFASetupInitiateDTO,
  MFASetupCompleteDTO,
  MFAVerificationDTO,
  MFADisableDTO,
  MFABackupCodesDTO,
  MFAStatusDTO,
  MFABackupCodeDTO
} from '../types/auth';
import { apiClient, API_ENDPOINTS, ApiClientError } from '../config/api-client';

class AuthServiceError extends Error {
  constructor(
    message: string, 
    public status?: number, 
    public errors?: Record<string, string[]>
  ) {
    super(message);
    this.name = 'AuthServiceError';
  }
}

class AuthService {
  // Authentication Methods
  async register(userData: UserCreateDTO): Promise<User> {
    try {
      return await apiClient.post<User>(
        `${API_ENDPOINTS.AUTH.BASE}${API_ENDPOINTS.AUTH.REGISTER}`,
        userData
      );
    } catch (error) {
      if (error instanceof ApiClientError) {
        throw new AuthServiceError(error.message, error.statusCode, error.errors);
      }
      throw new AuthServiceError('Network error occurred');
    }
  }

  async login(credentials: UserLoginDTO): Promise<TokensResponseDTO> {
    try {
      return await apiClient.post<TokensResponseDTO>(
        `${API_ENDPOINTS.AUTH.BASE}${API_ENDPOINTS.AUTH.LOGIN}`,
        credentials
      );
    } catch (error) {
      if (error instanceof ApiClientError) {
        throw new AuthServiceError(error.message, error.statusCode, error.errors);
      }
      throw new AuthServiceError('Network error occurred');
    }
  }

  async refreshToken(refreshToken: string): Promise<TokensResponseDTO> {
    try {
      return await apiClient.post<TokensResponseDTO>(
        `${API_ENDPOINTS.AUTH.BASE}${API_ENDPOINTS.AUTH.REFRESH_TOKEN}`,
        { refreshToken }
      );
    } catch (error) {
      if (error instanceof ApiClientError) {
        throw new AuthServiceError(error.message, error.statusCode, error.errors);
      }
      throw new AuthServiceError('Network error occurred');
    }
  }

  async logout(refreshToken: string): Promise<void> {
    try {
      await apiClient.post<void>(
        `${API_ENDPOINTS.AUTH.BASE}${API_ENDPOINTS.AUTH.LOGOUT}`,
        { refreshToken }
      );
    } catch (error) {
      if (error instanceof ApiClientError) {
        throw new AuthServiceError(error.message, error.statusCode, error.errors);
      }
      throw new AuthServiceError('Network error occurred');
    }
  }

  async requestPasswordReset(email: string): Promise<void> {
    try {
      await apiClient.post<void>(
        `${API_ENDPOINTS.AUTH.BASE}${API_ENDPOINTS.AUTH.FORGOT_PASSWORD}`,
        { email }
      );
    } catch (error) {
      if (error instanceof ApiClientError) {
        throw new AuthServiceError(error.message, error.statusCode, error.errors);
      }
      throw new AuthServiceError('Network error occurred');
    }
  }

  // Profile Methods
  async getProfile(): Promise<User> {
    try {
      return await apiClient.get<User>(
        `${API_ENDPOINTS.AUTH.BASE}${API_ENDPOINTS.AUTH.PROFILE}`
      );
    } catch (error) {
      if (error instanceof ApiClientError) {
        throw new AuthServiceError(error.message, error.statusCode, error.errors);
      }
      throw new AuthServiceError('Network error occurred');
    }
  }

  async updateProfile(data: UserProfileUpdateDTO): Promise<void> {
    try {
      await apiClient.put<void>(
        `${API_ENDPOINTS.AUTH.BASE}${API_ENDPOINTS.AUTH.PROFILE}`,
        data
      );
    } catch (error) {
      if (error instanceof ApiClientError) {
        throw new AuthServiceError(error.message, error.statusCode, error.errors);
      }
      throw new AuthServiceError('Network error occurred');
    }
  }

  async changePassword(data: PasswordChangeDTO): Promise<void> {
    try {
      await apiClient.post<void>(
        `${API_ENDPOINTS.AUTH.BASE}${API_ENDPOINTS.AUTH.CHANGE_PASSWORD}`,
        data
      );
    } catch (error) {
      if (error instanceof ApiClientError) {
        throw new AuthServiceError(error.message, error.statusCode, error.errors);
      }
      throw new AuthServiceError('Network error occurred');
    }
  }

  // Admin Methods
  async getAllUsers(): Promise<User[]> {
    try {
      return await apiClient.get<User[]>(
        `${API_ENDPOINTS.AUTH.BASE}${API_ENDPOINTS.AUTH.USERS}`
      );
    } catch (error) {
      if (error instanceof ApiClientError) {
        throw new AuthServiceError(error.message, error.statusCode, error.errors);
      }
      throw new AuthServiceError('Network error occurred');
    }
  }

  async updateUserRole(userId: number, role: string): Promise<void> {
    try {
      await apiClient.put<void>(
        `${API_ENDPOINTS.AUTH.BASE}${API_ENDPOINTS.AUTH.USERS}/${userId}/role`,
        role
      );
    } catch (error) {
      if (error instanceof ApiClientError) {
        throw new AuthServiceError(error.message, error.statusCode, error.errors);
      }
      throw new AuthServiceError('Network error occurred');
    }
  }

  async deleteUser(userId: number): Promise<void> {
    try {
      await apiClient.delete<void>(
        `${API_ENDPOINTS.AUTH.BASE}${API_ENDPOINTS.AUTH.USERS}/${userId}`
      );
    } catch (error) {
      if (error instanceof ApiClientError) {
        throw new AuthServiceError(error.message, error.statusCode, error.errors);
      }
      throw new AuthServiceError('Network error occurred');
    }
  }

  async adminChangePassword(data: AdminPasswordChangeDTO): Promise<void> {
    try {
      await apiClient.post<void>(
        `${API_ENDPOINTS.AUTH.BASE}${API_ENDPOINTS.AUTH.USERS}/change-password`,
        data
      );
    } catch (error) {
      if (error instanceof ApiClientError) {
        throw new AuthServiceError(error.message, error.statusCode, error.errors);
      }
      throw new AuthServiceError('Network error occurred');
    }
  }

  // MFA Methods
  async initiateMFASetup(): Promise<MFASetupInitiateDTO> {
    try {
      return await apiClient.post<MFASetupInitiateDTO>(
        `${API_ENDPOINTS.AUTH.BASE}${API_ENDPOINTS.AUTH.MFA_SETUP}`
      );
    } catch (error) {
      if (error instanceof ApiClientError) {
        throw new AuthServiceError(error.message, error.statusCode, error.errors);
      }
      throw new AuthServiceError('Network error occurred');
    }
  }

  async completeMFASetup(data: MFASetupCompleteDTO): Promise<MFABackupCodesDTO> {
    try {
      return await apiClient.post<MFABackupCodesDTO>(
        `${API_ENDPOINTS.AUTH.BASE}${API_ENDPOINTS.AUTH.MFA_VERIFY_SETUP}`,
        data
      );
    } catch (error) {
      if (error instanceof ApiClientError) {
        throw new AuthServiceError(error.message, error.statusCode, error.errors);
      }
      throw new AuthServiceError('Network error occurred');
    }
  }

  async verifyMFACode(data: MFAVerificationDTO): Promise<boolean> {
    try {
      const response = await apiClient.post<{ success: boolean }>(
        `${API_ENDPOINTS.AUTH.BASE}${API_ENDPOINTS.AUTH.MFA_VERIFY}`,
        data
      );
      return response.success;
    } catch (error) {
      if (error instanceof ApiClientError) {
        throw new AuthServiceError(error.message, error.statusCode, error.errors);
      }
      throw new AuthServiceError('Network error occurred');
    }
  }

  async verifyBackupCode(data: MFABackupCodeDTO): Promise<boolean> {
    try {
      const response = await apiClient.post<{ success: boolean }>(
        `${API_ENDPOINTS.AUTH.BASE}${API_ENDPOINTS.AUTH.MFA_BACKUP_CODE}`,
        data
      );
      return response.success;
    } catch (error) {
      if (error instanceof ApiClientError) {
        throw new AuthServiceError(error.message, error.statusCode, error.errors);
      }
      throw new AuthServiceError('Network error occurred');
    }
  }

  async disableMFA(data: MFADisableDTO): Promise<void> {
    try {
      await apiClient.post<void>(
        `${API_ENDPOINTS.AUTH.BASE}${API_ENDPOINTS.AUTH.MFA_DISABLE}`,
        data
      );
    } catch (error) {
      if (error instanceof ApiClientError) {
        throw new AuthServiceError(error.message, error.statusCode, error.errors);
      }
      throw new AuthServiceError('Network error occurred');
    }
  }

  async generateNewBackupCodes(): Promise<MFABackupCodesDTO> {
    try {
      return await apiClient.post<MFABackupCodesDTO>(
        `${API_ENDPOINTS.AUTH.BASE}${API_ENDPOINTS.AUTH.MFA_BACKUP_CODES}`
      );
    } catch (error) {
      if (error instanceof ApiClientError) {
        throw new AuthServiceError(error.message, error.statusCode, error.errors);
      }
      throw new AuthServiceError('Network error occurred');
    }
  }

  async getMFAStatus(): Promise<MFAStatusDTO> {
    try {
      return await apiClient.get<MFAStatusDTO>(
        `${API_ENDPOINTS.AUTH.BASE}${API_ENDPOINTS.AUTH.MFA_STATUS}`
      );
    } catch (error) {
      if (error instanceof ApiClientError) {
        throw new AuthServiceError(error.message, error.statusCode, error.errors);
      }
      throw new AuthServiceError('Network error occurred');
    }
  }
}

export const authService = new AuthService();
export { AuthServiceError }; 