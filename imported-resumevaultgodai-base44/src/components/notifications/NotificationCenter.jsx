import { toast } from 'sonner';

/**
 * Centralized notification system for the app
 */
export const notify = {
  success: (message, description) => {
    toast.success(message, { 
      description,
      duration: 3000,
      position: 'bottom-right'
    });
  },

  error: (message, description) => {
    toast.error(message, { 
      description,
      duration: 4000,
      position: 'bottom-right'
    });
  },

  info: (message, description) => {
    toast.info(message, { 
      description,
      duration: 3000,
      position: 'bottom-right'
    });
  },

  loading: (message) => {
    return toast.loading(message, {
      position: 'bottom-right'
    });
  },

  promise: (promise, messages) => {
    return toast.promise(promise, {
      loading: messages.loading,
      success: messages.success,
      error: messages.error,
      position: 'bottom-right'
    });
  },

  // Application-specific notifications
  resumeGenerated: (atsScore) => {
    toast.success('✅ Resume Generated!', {
      description: `ATS Score: ${atsScore}% • Ready to download`,
      duration: 4000,
      position: 'bottom-right'
    });
  },

  jobSaved: (jobTitle) => {
    toast.success('💼 Job Saved', {
      description: `${jobTitle} added to your tracker`,
      duration: 3000,
      position: 'bottom-right'
    });
  },

  applicationReady: () => {
    toast.success('🎉 Application Package Ready!', {
      description: 'Resume, cover letter, and prep materials generated',
      duration: 4000,
      position: 'bottom-right'
    });
  }
};