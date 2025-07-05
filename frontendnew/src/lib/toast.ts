interface ToastOptions {
  type?: 'success' | 'error' | 'info';
  duration?: number;
}

export const toast = {
  success: (message: string, options?: ToastOptions) => {
    console.log('✅ Success:', message);
    // For now, we'll use console.log - you can replace with sonner later
    if (typeof window !== 'undefined') {
      alert(`Success: ${message}`);
    }
  },
  
  error: (message: string, options?: ToastOptions) => {
    console.error('❌ Error:', message);
    // For now, we'll use console.error - you can replace with sonner later
    if (typeof window !== 'undefined') {
      alert(`Error: ${message}`);
    }
  },
  
  info: (message: string, options?: ToastOptions) => {
    console.info('ℹ️ Info:', message);
    // For now, we'll use console.info - you can replace with sonner later
    if (typeof window !== 'undefined') {
      alert(`Info: ${message}`);
    }
  }
}; 