import { 
  MFASetupInitiateDTO,
  MFASetupCompleteDTO,
  MFAVerificationDTO,
  MFADisableDTO,
  MFABackupCodesDTO,
  MFAStatusDTO,
  MFABackupCodeDTO
} from '../types/auth';
import { apiClient, ApiClientError } from '../config/api-client';

/**
 * Custom error class for MFA service operations
 */
export class MFAServiceError extends Error {
  constructor(
    message: string,
    public status?: number,
    public code?: string,
    public details?: Record<string, string[]>
  ) {
    super(message);
    this.name = 'MFAServiceError';
  }
}

/**
 * Service for handling Multi-Factor Authentication operations
 * Follows Family Auth Implementation Checklist rules:
 * - Explicit types only (no any/unknown)
 * - Proper error handling
 * - Complete API integration
 */
export class MFAService {
  private readonly baseUrl = '/v1/auth/mfa';

  /**
   * Initialize MFA setup for the current user
   * Returns QR code and manual entry key
   */
  async initiateMFASetup(): Promise<MFASetupInitiateDTO> {
    try {
      const result = await apiClient.post<MFASetupInitiateDTO>(`${this.baseUrl}/setup`);
      return result;
    } catch (error) {
      if (error instanceof ApiClientError) {
        throw new MFAServiceError(
          error.message || 'Failed to initiate MFA setup',
          error.statusCode,
          error.code,
          error.errors
        );
      }
      throw new MFAServiceError('Network error during MFA setup initiation');
    }
  }

  /**
   * Complete MFA setup by verifying the first TOTP code
   * Returns backup codes for the user
   */
  async completeMFASetup(setupData: MFASetupCompleteDTO): Promise<MFABackupCodesDTO> {
    try {
      const result = await apiClient.post<MFABackupCodesDTO>(`${this.baseUrl}/setup/complete`, setupData);
      return result;
    } catch (error) {
      if (error instanceof ApiClientError) {
        throw new MFAServiceError(
          error.message || 'Failed to complete MFA setup',
          error.statusCode,
          error.code,
          error.errors
        );
      }
      throw new MFAServiceError('Network error during MFA setup completion');
    }
  }

  /**
   * Verify MFA code during login or verification
   */
  async verifyMFACode(verificationData: MFAVerificationDTO): Promise<boolean> {
    try {
      const result = await apiClient.post<{ message: string }>(`${this.baseUrl}/verify`, verificationData);
      return !!result.message; // Return true if message exists
    } catch (error) {
      if (error instanceof ApiClientError) {
        // Invalid code returns 401, which is expected
        if (error.statusCode === 401) {
          return false;
        }
        throw new MFAServiceError(
          error.message || 'Failed to verify MFA code',
          error.statusCode,
          error.code,
          error.errors
        );
      }
      throw new MFAServiceError('Network error during MFA verification');
    }
  }

  /**
   * Verify backup code during login
   */
  async verifyBackupCode(backupCodeData: MFABackupCodeDTO): Promise<boolean> {
    try {
      const result = await apiClient.post<{ message: string }>(`${this.baseUrl}/verify-backup`, backupCodeData);
      return !!result.message; // Return true if message exists
    } catch (error) {
      if (error instanceof ApiClientError) {
        // Invalid backup code returns 401, which is expected
        if (error.statusCode === 401) {
          return false;
        }
        throw new MFAServiceError(
          error.message || 'Failed to verify backup code',
          error.statusCode,
          error.code,
          error.errors
        );
      }
      throw new MFAServiceError('Network error during backup code verification');
    }
  }

  /**
   * Disable MFA for the current user
   * Requires password confirmation and optional TOTP code
   */
  async disableMFA(disableData: MFADisableDTO): Promise<void> {
    try {
      await apiClient.post<{ message: string }>(`${this.baseUrl}/disable`, disableData);
    } catch (error) {
      if (error instanceof ApiClientError) {
        throw new MFAServiceError(
          error.message || 'Failed to disable MFA',
          error.statusCode,
          error.code,
          error.errors
        );
      }
      throw new MFAServiceError('Network error during MFA disable');
    }
  }

  /**
   * Generate new backup codes for the current user
   * Previous backup codes will be invalidated
   */
  async regenerateBackupCodes(): Promise<MFABackupCodesDTO> {
    try {
      const result = await apiClient.post<MFABackupCodesDTO>(`${this.baseUrl}/backup-codes/regenerate`);
      return result;
    } catch (error) {
      if (error instanceof ApiClientError) {
        throw new MFAServiceError(
          error.message || 'Failed to regenerate backup codes',
          error.statusCode,
          error.code,
          error.errors
        );
      }
      throw new MFAServiceError('Network error during backup codes regeneration');
    }
  }

  /**
   * Get MFA status for the current user
   * Returns whether MFA is enabled, setup date, and backup codes remaining
   */
  async getMFAStatus(): Promise<MFAStatusDTO> {
    try {
      const result = await apiClient.get<MFAStatusDTO>(`${this.baseUrl}/status`);
      return result;
    } catch (error) {
      if (error instanceof ApiClientError) {
        throw new MFAServiceError(
          error.message || 'Failed to get MFA status',
          error.statusCode,
          error.code,
          error.errors
        );
      }
      throw new MFAServiceError('Network error during MFA status check');
    }
  }



  /**
   * Download backup codes as a text file
   * For user convenience and security
   */
  downloadBackupCodes(backupCodes: string[], filename: string = 'mfa-backup-codes.txt'): void {
    try {
      const content = [
        'FAMILY TASKTRACKER - MFA BACKUP CODES',
        '=====================================',
        '',
        'These are your Multi-Factor Authentication backup codes.',
        'Each code can only be used once. Store them in a safe place.',
        '',
        'Generated on: ' + new Date().toLocaleDateString(),
        '',
        'Backup Codes:',
        '-------------',
        ...backupCodes.map((code, index) => `${index + 1}. ${code}`),
        '',
        'IMPORTANT:',
        '- Keep these codes secure and private',
        '- Each code can only be used once',
        '- Generate new codes if you lose these',
        '- Do not share these codes with anyone'
      ].join('\n');

      const blob = new Blob([content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      URL.revokeObjectURL(url);
    } catch {
      throw new MFAServiceError('Failed to download backup codes');
    }
  }

  /**
   * Copy backup codes to clipboard
   * Alternative to downloading for user convenience
   */
  async copyBackupCodesToClipboard(backupCodes: string[]): Promise<void> {
    try {
      const content = backupCodes.join('\n');
      await navigator.clipboard.writeText(content);
    } catch {
      throw new MFAServiceError('Failed to copy backup codes to clipboard');
    }
  }

  /**
   * Validate TOTP code format (client-side validation)
   */
  validateTOTPCode(code: string): boolean {
    return /^\d{6}$/.test(code);
  }

  /**
   * Validate backup code format (client-side validation)
   */
  validateBackupCode(code: string): boolean {
    return /^[A-Z0-9]{8}$/.test(code.toUpperCase());
  }

  /**
   * Format backup code for display (add spaces for readability)
   */
  formatBackupCodeForDisplay(code: string): string {
    return code.replace(/(.{4})/g, '$1 ').trim();
  }

  /**
   * Clean backup code input (remove spaces and convert to uppercase)
   */
  cleanBackupCodeInput(code: string): string {
    return code.replace(/\s/g, '').toUpperCase();
  }
}

// Export singleton instance
export const mfaService = new MFAService(); 