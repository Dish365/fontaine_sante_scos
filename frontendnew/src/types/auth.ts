export interface User {
  id: number;
  email: string;
  username: string;
  first_name: string;
  last_name: string;
  phone_number: string;
  position: string;
  is_staff: boolean;
  is_active: boolean;
  date_joined: string;
}

export interface LoginRequest {
  staff_id: string;
  password: string;
}

export interface LoginResponse {
  message: string;
  email: string;
  requires_otp: boolean;
}

export interface OTPVerifyRequest {
  email?: string;
  username?: string;
  otp: string;
  method: 'email' | 'phone';
}

export interface OTPVerifyResponse {
  message: string;
  refresh: string;
  access: string;
  user: User;
}

export interface OTPRequestRequest {
  email: string;
  method: 'email' | 'phone';
}

export interface OTPRequestResponse {
  message: string;
  email: string;
}

export interface AdminUserRegistrationRequest {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  phone: string;
  role: string;
  department: string;
  security_question_1: string;
  security_answer_1: string;
  security_question_2: string;
  security_answer_2: string;
}

export interface AdminUserRegistrationResponse {
  message: string;
  user: User;
}

export interface SecurityQuestion {
  number: number;
  question: string;
}

export interface SecurityQuestionsResponse {
  security_questions: SecurityQuestion[];
}

export interface SecurityQuestionRequest {
  email: string;
  question_number: number;
  answer: string;
}

export interface PasswordResetRequestRequest {
  email: string;
  method: 'email' | 'phone';
}

export interface PasswordResetConfirmRequest {
  email: string;
  otp: string;
  password: string;
}

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (staffId: string, password: string) => Promise<LoginResponse>;
  verifyOTP: (email: string, otp: string, method: 'email' | 'phone') => Promise<void>;
  logout: () => void;
  refreshToken: () => Promise<void>;
} 