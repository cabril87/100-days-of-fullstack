import { apiClient } from '../config/api-client';
import { 
  AdminUserCreateRequest,
  AdminUserCreateResponse,
  AdminFamilySelection,
  FamilyRole
} from '../types/system';

class AdminService {

  /**
   * Creates a new user with optional family assignment (Admin only)
   */
  async createUser(userData: AdminUserCreateRequest): Promise<AdminUserCreateResponse> {
    try {
      console.log('🔨 Creating user via admin:', userData.username);
      
      const result = await apiClient.post<AdminUserCreateResponse>('/v1/admin/users/create', userData);

      console.log('✅ User created successfully:', result);
      return result;
    } catch (error) {
      console.error('❌ Failed to create user:', error);
      throw error;
    }
  }

  /**
   * Gets all families accessible to the admin for user assignment
   */
  async getAccessibleFamilies(): Promise<AdminFamilySelection[]> {
    try {
      console.log('📋 Getting accessible families for admin');
      
      const families = await apiClient.get<AdminFamilySelection[]>('/v1/admin/families/accessible');

      console.log('✅ Retrieved families:', families.length);
      return families;
    } catch (error) {
      console.error('❌ Failed to get accessible families:', error);
      throw error;
    }
  }

  /**
   * Gets all available family roles for user assignment
   */
  async getFamilyRoles(): Promise<FamilyRole[]> {
    try {
      console.log('🎭 Getting family roles');
      
      const roles = await apiClient.get<FamilyRole[]>('/v1/admin/families/roles');

      console.log('✅ Retrieved family roles:', roles.length);
      return roles;
    } catch (error) {
      console.error('❌ Failed to get family roles:', error);
      throw error;
    }
  }
}

export const adminService = new AdminService(); 
