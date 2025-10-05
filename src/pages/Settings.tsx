import { motion } from 'framer-motion';
import { Trash2, AlertTriangle, UserX } from 'lucide-react';
import { GlassCard } from '@/components/ui/glass-card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { financialAPI, userAPI } from '@/services/api';
import { useState } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

export default function Settings() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isClearing, setIsClearing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleClearData = async () => {
    setIsClearing(true);
    try {
      await financialAPI.clearAll();
      toast({
        title: 'Success',
        description: 'All financial data has been cleared successfully',
      });
      navigate('/');
    } catch (error) {
      toast({
        title: 'Error',
        description:
          error instanceof Error ? error.message : 'Failed to clear data',
        variant: 'destructive',
      });
    } finally {
      setIsClearing(false);
    }
  };

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    try {
      await userAPI.deleteAccount();
      await supabase.auth.signOut();
      toast({
        title: 'Account Deleted',
        description: 'Your account has been deleted successfully',
      });
      navigate('/auth');
    } catch (error) {
      toast({
        title: 'Error',
        description:
          error instanceof Error ? error.message : 'Failed to delete account',
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-8 p-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-4xl font-bold mb-2 bg-gradient-primary bg-clip-text text-transparent">
          Settings
        </h1>
        <p className="text-muted-foreground text-lg">
          Manage your account and data
        </p>
      </motion.div>

      {/* Danger Zone */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <GlassCard className="p-6 border-destructive/50">
          <div className="flex items-center gap-3 mb-6">
            <AlertTriangle className="h-6 w-6 text-destructive" />
            <h2 className="text-xl font-semibold text-destructive">
              Danger Zone
            </h2>
          </div>

          <div className="space-y-4">
            {/* Clear All Data */}
            <div className="flex items-center justify-between p-4 rounded-lg border border-border/50 bg-background/50">
              <div>
                <h3 className="font-semibold mb-1">Clear All Financial Data</h3>
                <p className="text-sm text-muted-foreground">
                  Permanently delete all your financial particulars. Your login
                  credentials will be preserved.
                </p>
              </div>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" size="sm" className="ml-4">
                    <Trash2 className="w-4 h-4 mr-2" />
                    Clear Data
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>
                      Are you absolutely sure?
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete
                      all your financial data from our servers. Your account and
                      login credentials will remain intact.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleClearData}
                      disabled={isClearing}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      {isClearing ? 'Clearing...' : 'Yes, clear all data'}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>

            {/* Delete Account */}
            <div className="flex items-center justify-between p-4 rounded-lg border border-destructive bg-destructive/5">
              <div>
                <h3 className="font-semibold mb-1 text-destructive">
                  Delete Account
                </h3>
                <p className="text-sm text-muted-foreground">
                  Permanently delete your account and all associated data. This
                  action cannot be undone.
                </p>
              </div>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" size="sm" className="ml-4">
                    <UserX className="w-4 h-4 mr-2" />
                    Delete Account
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Account</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete
                      your account, profile, and all financial data from our
                      servers.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDeleteAccount}
                      disabled={isDeleting}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      {isDeleting ? 'Deleting...' : 'Yes, delete my account'}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </GlassCard>
      </motion.div>
    </div>
  );
}
