import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { CompanyProfile } from '@/types';
import { supabase } from '@/lib/supabase';
import { useAuth } from './AuthContext';

interface User {
    id: string;
    name: string;
    email?: string;
    role?: string;
    avatar?: string;
}

export type SubscriptionStatus =
    | 'trialing'
    | 'active'
    | 'past_due'
    | 'canceled'
    | 'paused'
    | 'unpaid'
    | null;

interface UserContextType {
    users: User[];
    currentUser: User | null;
    companyProfile: CompanyProfile;
    updateCompanyProfile: (profile: Partial<CompanyProfile>) => Promise<void>;
    enabledModules: string[];
    updateEnabledModules: (modules: string[]) => Promise<void>;
    isLoadingProfile: boolean;
    // Trial
    trialDaysRemaining: number | null;
    isTrialExpired: boolean;
    // Subscription
    subscriptionStatus: SubscriptionStatus;
    subscriptionPlan: string | null;
    stripeCustomerId: string | null;
    stripeSubscriptionId: string | null;
    currentPeriodEnd: Date | null;
    cancelAtPeriodEnd: boolean;
    // Whether the user has a paid active subscription (not just trial)
    isSubscriptionActive: boolean;
    refreshSubscription: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

const DEFAULT_COMPANY_PROFILE: CompanyProfile = {
    nombreEmpresa: 'Tu Empresa S.A. de C.V.',
    rfc: 'X0X000000XX0',
    direccion: 'Av. Principal #123, Ciudad',
    telefono: '+52 000 000 0000',
    email: 'contacto@tuempresa.com',
    colorPrimario: '#2563eb'
};

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user: authUser } = useAuth();

    const [users, setUsers] = useState<User[]>([]);
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [companyProfile, setCompanyProfile] = useState<CompanyProfile>(DEFAULT_COMPANY_PROFILE);
    const [enabledModules, setEnabledModules] = useState<string[]>([]);
    const [isLoadingProfile, setIsLoadingProfile] = useState(true);
    const [trialDaysRemaining, setTrialDaysRemaining] = useState<number | null>(null);
    const [isTrialExpired, setIsTrialExpired] = useState<boolean>(false);

    // Subscription state
    const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionStatus>(null);
    const [subscriptionPlan, setSubscriptionPlan] = useState<string | null>(null);
    const [stripeCustomerId, setStripeCustomerId] = useState<string | null>(null);
    const [stripeSubscriptionId, setStripeSubscriptionId] = useState<string | null>(null);
    const [currentPeriodEnd, setCurrentPeriodEnd] = useState<Date | null>(null);
    const [cancelAtPeriodEnd, setCancelAtPeriodEnd] = useState<boolean>(false);

    const isSubscriptionActive =
        subscriptionStatus === 'active' || subscriptionStatus === 'trialing';

    const fetchProfile = useCallback(async () => {
        if (!authUser) {
            setCurrentUser(null);
            setIsLoadingProfile(false);
            return;
        }

        setCurrentUser({
            id: authUser.id,
            name: authUser.user_metadata?.full_name || authUser.email || 'Usuario',
            avatar: (authUser.user_metadata?.full_name || authUser.email || 'U').charAt(0).toUpperCase()
        });

        try {
            const { data, error } = await supabase
                .from('company_profiles')
                .select('*')
                .limit(1)
                .single();

            if (error && error.code !== 'PGRST116') {
                console.error("Error fetching company profile:", error);
            }

            if (data) {
                setCompanyProfile({
                    id: data.id,
                    nombreEmpresa: data.nombre_empresa || DEFAULT_COMPANY_PROFILE.nombreEmpresa,
                    rfc: data.rfc,
                    direccion: data.direccion,
                    telefono: data.telefono,
                    email: data.email,
                    logoUrl: data.logo_url,
                    sitioWeb: data.sitio_web,
                    colorPrimario: data.color_primario || DEFAULT_COMPANY_PROFILE.colorPrimario,
                    enabledModules: data.enabled_modules || [],
                    trialExpiresAt: data.trial_expires_at ? new Date(data.trial_expires_at) : null
                });
                setEnabledModules(data.enabled_modules || []);

                // ─── Subscription fields from DB (synced by webhook) ───
                setSubscriptionStatus(data.subscription_status || 'trialing');
                setSubscriptionPlan(data.subscription_plan || null);
                setStripeCustomerId(data.stripe_customer_id || null);
                setStripeSubscriptionId(data.stripe_subscription_id || null);
                setCurrentPeriodEnd(data.current_period_end ? new Date(data.current_period_end) : null);
                setCancelAtPeriodEnd(data.cancel_at_period_end || false);

                // ─── Trial days calculation ───
                // If subscription is active (paying), don't show trial logic
                if (data.subscription_status === 'active') {
                    setTrialDaysRemaining(null);
                    setIsTrialExpired(false);
                } else {
                    if (data.trial_expires_at || data.created_at) {
                        let expireDate: Date;
                        if (data.trial_expires_at) {
                            expireDate = new Date(data.trial_expires_at);
                        } else {
                            expireDate = new Date(data.created_at);
                            expireDate.setDate(expireDate.getDate() + 15);
                        }
                        const now = new Date();
                        const diffTime = expireDate.getTime() - now.getTime();
                        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                        setTrialDaysRemaining(diffDays > 0 ? diffDays : 0);
                        setIsTrialExpired(diffDays <= 0);
                    } else {
                        setTrialDaysRemaining(15);
                        setIsTrialExpired(false);
                    }
                }
            }
        } catch (err) {
            console.error("Error on company sync:", err);
        } finally {
            setIsLoadingProfile(false);
        }

        // Fetch Team Members
        try {
            const { data: teamData, error: teamError } = await supabase
                .from('users')
                .select('id, full_name, email, role');

            if (!teamError && teamData) {
                setUsers(teamData.map(u => ({
                    id: u.id,
                    name: u.full_name || u.email || 'Miembro',
                    email: u.email,
                    role: u.role,
                    avatar: (u.full_name || u.email || 'M').charAt(0).toUpperCase()
                })));

                const currentTeamUser = teamData.find(u => u.id === authUser.id);
                if (currentTeamUser) {
                    setCurrentUser(prev => prev ? { ...prev, role: currentTeamUser.role } : null);
                }
            }
        } catch (err) {
            console.error("Error fetching team users:", err);
        }
    }, [authUser]);

    useEffect(() => {
        fetchProfile();
    }, [fetchProfile]);

    // Handle ?pago=exitoso after returning from Stripe
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        if (params.get('pago') === 'exitoso') {
            // Remove param from URL cleanly
            const url = new URL(window.location.href);
            url.searchParams.delete('pago');
            url.searchParams.delete('plan');
            window.history.replaceState({}, '', url.toString());
            // Refresh subscription data after a short delay (webhook may take a moment)
            setTimeout(() => fetchProfile(), 3000);
        }
    }, [fetchProfile]);

    const refreshSubscription = useCallback(async () => {
        setIsLoadingProfile(true);
        await fetchProfile();
    }, [fetchProfile]);

    const updateCompanyProfile = async (updatedProfile: Partial<CompanyProfile>) => {
        setCompanyProfile(prev => ({ ...prev, ...updatedProfile }));

        const payload = {
            nombre_empresa: updatedProfile.nombreEmpresa || companyProfile.nombreEmpresa,
            rfc: updatedProfile.rfc !== undefined ? updatedProfile.rfc : companyProfile.rfc,
            direccion: updatedProfile.direccion !== undefined ? updatedProfile.direccion : companyProfile.direccion,
            telefono: updatedProfile.telefono !== undefined ? updatedProfile.telefono : companyProfile.telefono,
            email: updatedProfile.email !== undefined ? updatedProfile.email : companyProfile.email,
            logo_url: updatedProfile.logoUrl !== undefined ? updatedProfile.logoUrl : companyProfile.logoUrl,
            sitio_web: updatedProfile.sitioWeb !== undefined ? updatedProfile.sitioWeb : companyProfile.sitioWeb,
            color_primario: updatedProfile.colorPrimario !== undefined ? updatedProfile.colorPrimario : companyProfile.colorPrimario,
            enabled_modules: updatedProfile.enabledModules !== undefined ? updatedProfile.enabledModules : companyProfile.enabledModules || []
        };

        try {
            const { data: existing } = await supabase.from('company_profiles').select('id').single();
            if (existing) {
                const { error: updateError } = await supabase.from('company_profiles').update(payload).eq('id', existing.id);
                if (updateError) console.error("Error updating company profile:", updateError);
            } else {
                const { error: insertError } = await supabase.from('company_profiles').insert(payload);
                if (insertError) console.error("Error inserting company profile:", insertError);
            }
        } catch (err) {
            console.error("Error saving profile to database:", err);
        }
    };

    const updateEnabledModules = async (modules: string[]) => {
        setEnabledModules(modules);
        setCompanyProfile(prev => ({ ...prev, enabledModules: modules }));
        try {
            const { data: existing } = await supabase.from('company_profiles').select('id').single();
            if (existing) {
                const { error } = await supabase.from('company_profiles')
                    .update({ enabled_modules: modules })
                    .eq('id', existing.id);
                if (error) console.error('Error updating enabled modules:', error);
            }
        } catch (err) {
            console.error('Error updating enabled modules:', err);
        }
    };

    return (
        <UserContext.Provider value={{
            users, currentUser, companyProfile, updateCompanyProfile,
            enabledModules, updateEnabledModules, isLoadingProfile,
            trialDaysRemaining, isTrialExpired,
            subscriptionStatus, subscriptionPlan,
            stripeCustomerId, stripeSubscriptionId,
            currentPeriodEnd, cancelAtPeriodEnd,
            isSubscriptionActive,
            refreshSubscription,
        }}>
            {children}
        </UserContext.Provider>
    );
};

export const useUsers = () => {
    const context = useContext(UserContext);
    if (context === undefined) {
        throw new Error('useUsers must be used within a UserProvider');
    }
    return context;
};
