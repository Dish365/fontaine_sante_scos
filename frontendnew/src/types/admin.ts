export interface AdminLoginRequest {
  username: string;
  password: string;
  staff_id?: string;
}

export interface AdminLoginResponse {
  requiresOtp?: boolean;
  email?: string;
  message?: string;
  access?: string;
  refresh?: string;
  user?: {
    id: number;
    username: string;
    email: string;
    is_superuser: boolean;
  };
}

export interface AdminUser {
  id: number;
  email: string;
  username: string;
  first_name: string;
  last_name: string;
  phone_number?: string;
  position: string;
  is_active: boolean;
  is_staff: boolean;
  is_superuser?: boolean;
  date_joined: string;
  groups?: number[];
  user_permissions?: number[];
  password?: string;
  password1?: string;
  password2?: string;
  staff_id?: string;
  security_question_1: string;
  security_answer_1?: string;
  security_question_2: string;
  security_answer_2?: string;
}

export interface AdminUserListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: AdminUser[];
}

export interface AdminGroup {
  id: number;
  name: string;
  permissions: number[];
}

export interface AdminContextType {
  isAdminAuthenticated: boolean;
  isLoading: boolean;
  adminLogin: (username: string, password: string) => Promise<void>;
  adminLogout: () => void;
  checkAdminAuth: () => Promise<boolean>;
} 