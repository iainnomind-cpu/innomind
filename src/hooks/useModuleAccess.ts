import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';

export function useModuleAccess() {
    const { user } = useAuth();
    const [enabledModules, setEnabledModules] = useState<string[]>([]);
    const [isLoadingAccess, setIsLoadingAccess] = useState(true);

    useEffect(() => {
        if (!user) {
            setEnabledModules([]);
            setIsLoadingAccess(false);
            return;
        }

        const fetchModules = async () => {
            setIsLoadingAccess(true);
            try {
                // Fetch user's workspace profile to see their enabled modules.
                // Depending on the exact schema structure, we find the company profile
                // associated with this user's current session.

                // First, get the workspace ID from the users table
                const { data: userData, error: userError } = await supabase
                    .from('users')
                    .select('workspace')
                    .eq('id', user.id)
                    .single();

                if (userError || !userData?.workspace) {
                    throw new Error("Could not fetch user workspace");
                }

                // Now fetch the company profile using the workspace ID
                const { data: companyData, error: companyError } = await supabase
                    .from('company_profiles')
                    .select('enabled_modules')
                    .eq('id', userData.workspace)
                    .single();

                if (companyError) {
                    throw new Error("Could not fetch company profile modules");
                }

                if (companyData && Array.isArray(companyData.enabled_modules)) {
                    setEnabledModules(companyData.enabled_modules as string[]);
                } else {
                    // Fallback to empty if it hasn't been set
                    setEnabledModules([]);
                }
            } catch (error) {
                console.error("Error fetching module access:", error);
                // In case of error, assume no access to be safe
                setEnabledModules([]);
            } finally {
                setIsLoadingAccess(false);
            }
        };

        fetchModules();
    }, [user]);

    const hasAccess = (moduleName: string): boolean => {
        // If still loading, we might want to temporarily return true 
        // or handle loading state in the component itself to avoid flashing the lock screen.
        // It's safer to have the component check `isLoadingAccess` first.

        // Modules usually passed as an array of IDs from FreeTrialModal:
        // ['embudo', 'prospectos', 'quotes', 'calendar', 'finance', 'procurement', 'inventory', 'workspace']
        return enabledModules.includes(moduleName);
    };

    return { hasAccess, isLoadingAccess, enabledModules };
}
