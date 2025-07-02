'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import { Checkbox } from '@/components/ui/checkbox';
import {
  ShieldAlert,
  AlertTriangle,
  Eye,
  EyeOff,
  X,
} from 'lucide-react';
import { MFADisableDialogProps } from '@/lib/types/auth';
import { mfaDisableSchema, MFADisableFormData } from '@/lib/schemas/auth';

export function MFADisableDialog({
  isOpen,
  onClose,
  onConfirm,
  isLoading,
}: MFADisableDialogProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [confirmUnderstanding, setConfirmUnderstanding] = useState(false);

  const form = useForm<MFADisableFormData>({
    resolver: zodResolver(mfaDisableSchema),
    defaultValues: {
      password: '',
      code: '',
    },
  });

  const onSubmit = (data: MFADisableFormData): void => {
    onConfirm(data.password, data.code || undefined);
  };

  const handleClose = (): void => {
    if (!isLoading) {
      form.reset();
      setConfirmUnderstanding(false);
      setShowPassword(false);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md border-2 border-red-200 dark:border-red-800">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-900 dark:text-red-100">
            <ShieldAlert className="h-5 w-5" />
            Disable Two-Factor Authentication
          </DialogTitle>
          <DialogDescription>
            This will remove the extra security layer from your account
          </DialogDescription>
        </DialogHeader>

        {/* Security Warning */}
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Warning:</strong> Disabling MFA will make your account less secure. 
            You will no longer need a second factor to log in.
          </AlertDescription>
        </Alert>

        {/* Security Implications */}
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <h4 className="font-medium text-red-900 dark:text-red-100 mb-2">
            Security Implications:
          </h4>
          <ul className="text-sm text-red-800 dark:text-red-200 space-y-1">
            <li>• Your account will be protected by password only</li>
            <li>• All backup codes will be permanently deleted</li>
            <li>• You&apos;ll lose access to admin features requiring MFA</li>
            <li>• Your account becomes vulnerable to password breaches</li>
          </ul>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Password Confirmation */}
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirm Your Password</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        {...field}
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Enter your current password"
                        className="pr-10"
                        autoComplete="current-password"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4 text-gray-400" />
                        ) : (
                          <Eye className="h-4 w-4 text-gray-400" />
                        )}
                      </Button>
                    </div>
                  </FormControl>
                  <FormDescription>
                    We need to verify your identity before disabling MFA
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Optional MFA Code */}
            <FormField
              control={form.control}
              name="code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Authenticator Code (Optional)</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="000000"
                      maxLength={6}
                      className="text-center text-lg tracking-widest font-mono"
                      autoComplete="one-time-code"
                    />
                  </FormControl>
                  <FormDescription>
                    Enter your current TOTP code if available, or use a backup code
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Understanding Confirmation */}
            <div className="flex items-start space-x-3">
              <Checkbox
                id="understand"
                checked={confirmUnderstanding}
                onCheckedChange={(checked) => setConfirmUnderstanding(!!checked)}
              />
              <div className="grid gap-1.5 leading-none">
                <label
                  htmlFor="understand"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  I understand the security implications
                </label>
                <p className="text-xs text-muted-foreground">
                  I acknowledge that disabling MFA reduces my account security
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-between pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="destructive"
                disabled={!confirmUnderstanding || isLoading}
                className="flex items-center gap-2"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Disabling...
                  </>
                ) : (
                  <>
                    <X className="h-4 w-4" />
                    Disable MFA
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
} 
