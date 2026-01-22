import { useNotifications } from '../contexts/NotificationContext';

/**
 * Custom hook for common notification patterns
 */
export const useNotificationHelpers = () => {
  const { addNotification } = useNotifications();

  return {
    // Success notifications
    notifySuccess: (title: string, message: string) => {
      addNotification({ type: 'success', title, message });
    },

    // Error notifications
    notifyError: (title: string, message: string) => {
      addNotification({ type: 'error', title, message });
    },

    // Transaction-specific notifications
    notifyTransactionCreated: (amount: number, type: 'income' | 'expense' | 'transfer') => {
      const emoji = type === 'income' ? '💰' : type === 'transfer' ? '🔄' : '💸';
      addNotification({
        type: 'success',
        title: `${emoji} Transaction Added`,
        message: `${type.charAt(0).toUpperCase() + type.slice(1)} of $${amount.toFixed(2)} recorded successfully`
      });
    },

    notifyTransactionUpdated: () => {
      addNotification({
        type: 'success',
        title: '✅ Transaction Updated',
        message: 'Your transaction has been updated successfully'
      });
    },

    notifyTransactionDeleted: () => {
      addNotification({
        type: 'info',
        title: '🗑️ Transaction Deleted',
        message: 'Transaction removed from your records'
      });
    },

    // Budget notifications
    notifyBudgetCreated: (name: string) => {
      addNotification({
        type: 'success',
        title: '📊 Budget Created',
        message: `Budget "${name}" has been set up successfully`
      });
    },

    notifyBudgetWarning: (categoryName: string, percentage: number) => {
      addNotification({
        type: 'warning',
        title: '⚠️ Budget Alert',
        message: `You've used ${percentage.toFixed(0)}% of your ${categoryName} budget`
      });
    },

    notifyBudgetExceeded: (categoryName: string) => {
      addNotification({
        type: 'error',
        title: '🚨 Budget Exceeded',
        message: `You've exceeded your ${categoryName} budget limit`
      });
    },

    // Goal notifications
    notifyGoalCreated: (name: string) => {
      addNotification({
        type: 'success',
        title: '🎯 Goal Created',
        message: `New goal "${name}" has been added`
      });
    },

    // General CRUD
    notifyCreated: (itemType: string) => {
      addNotification({
        type: 'success',
        title: '✅ Created',
        message: `${itemType} has been created successfully`
      });
    },

    notifyUpdated: (itemType: string) => {
      addNotification({
        type: 'success',
        title: '✅ Updated',
        message: `${itemType} has been updated successfully`
      });
    },

    notifyDeleted: (itemType: string) => {
      addNotification({
        type: 'info',
        title: '🗑️ Deleted',
        message: `${itemType} has been removed`
      });
    },

    // Error handling
    notifyApiError: (operation: string) => {
      addNotification({
        type: 'error',
        title: '❌ Error',
        message: `Failed to ${operation}. Please try again.`
      });
    }
  };
};
