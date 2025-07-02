'use client';

import React from 'react';
import { AlertTriangle, Trash2, CheckCircle, Info, AlertCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ConfirmationModalProps } from '@/lib/props/ui/main.props';

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger',
  isLoading = false
}) => {
  const getVariantConfig = () => {
    switch (variant) {
      case 'danger':
        return {
          icon: <Trash2 className="h-12 w-12 text-red-500" />,
          iconBg: 'bg-red-100 dark:bg-red-900/20',
          confirmButton: 'bg-red-600 hover:bg-red-700 text-white',
          titleColor: 'text-red-900 dark:text-red-100'
        };
      case 'warning':
        return {
          icon: <AlertTriangle className="h-12 w-12 text-orange-500" />,
          iconBg: 'bg-orange-100 dark:bg-orange-900/20',
          confirmButton: 'bg-orange-600 hover:bg-orange-700 text-white',
          titleColor: 'text-orange-900 dark:text-orange-100'
        };
      case 'info':
        return {
          icon: <Info className="h-12 w-12 text-blue-500" />,
          iconBg: 'bg-blue-100 dark:bg-blue-900/20',
          confirmButton: 'bg-blue-600 hover:bg-blue-700 text-white',
          titleColor: 'text-blue-900 dark:text-blue-100'
        };
      case 'success':
        return {
          icon: <CheckCircle className="h-12 w-12 text-green-500" />,
          iconBg: 'bg-green-100 dark:bg-green-900/20',
          confirmButton: 'bg-green-600 hover:bg-green-700 text-white',
          titleColor: 'text-green-900 dark:text-green-100'
        };
      default:
        return {
          icon: <AlertCircle className="h-12 w-12 text-gray-500" />,
          iconBg: 'bg-gray-100 dark:bg-gray-900/20',
          confirmButton: 'bg-gray-600 hover:bg-gray-700 text-white',
          titleColor: 'text-gray-900 dark:text-gray-100'
        };
    }
  };

  const config = getVariantConfig();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center">
          <div className={`mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full ${config.iconBg}`}>
            {config.icon}
          </div>
          <DialogTitle className={`text-lg font-semibold ${config.titleColor}`}>
            {title}
          </DialogTitle>
          <DialogDescription className="text-gray-600 dark:text-gray-400 mt-2">
            {description}
          </DialogDescription>
        </DialogHeader>
        
        <DialogFooter className="flex flex-col sm:flex-row gap-3 mt-6">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
            className="w-full sm:w-auto order-2 sm:order-1"
          >
            {cancelText}
          </Button>
          <Button
            onClick={onConfirm}
            disabled={isLoading}
            className={`w-full sm:w-auto order-1 sm:order-2 ${config.confirmButton}`}
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Processing...
              </>
            ) : (
              confirmText
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ConfirmationModal; 
