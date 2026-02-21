import React, { createContext, useContext, useState, useEffect } from 'react';
import { CompanyProfile } from '@/types';
import { supabase } from '@/lib/supabase';
import { useAuth } from './AuthContext';

interface User {
    id: string;
    name: string;
    avatar?: string;
}

interface UserContextType {
    users: User[];
    currentUser: User | null;
    companyProfile: CompanyProfile;
    updateCompanyProfile: (profile: Partial<CompanyProfile>) => Promise<void>;
    isLoadingProfile: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

const DEFAULT_COMPANY_PROFILE: CompanyProfile = {
    nombreEmpresa: 'Tu Empresa S.A. de C.V.',
    rfc: 'X0X000000XX0',
    direccion: 'Av. Principal #123, Ciudad',
    telefono: '+52 000 000 0000',
    email: 'contacto@tuempresa.com',
    colorPrimario: '#2563eb' // Tailwind blue-600
};

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user: authUser } = useAuth();

    // Mock users list (could also be fetched from Supabase later)
    const [users] = useState<User[]>([
        { id: '1', name: 'Ana Silva', avatar: 'AS' },
        { id: '2', name: 'Carlos Ruiz', avatar: 'CR' },
        { id: '3', name: 'Maria Lopez', avatar: 'ML' },
    ]);

    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [companyProfile, setCompanyProfile] = useState<CompanyProfile>(DEFAULT_COMPANY_PROFILE);
    const [isLoadingProfile, setIsLoadingProfile] = useState(true);

    // Sync Auth User & Fetch Profile
    useEffect(() => {
        if (!authUser) {
            setCurrentUser(null);
            setIsLoadingProfile(false);
            return;
        }

        // We assume the user's name or email from auth metadata
        setCurrentUser({
            id: authUser.id,
            name: authUser.user_metadata?.full_name || authUser.email || 'Usuario',
            avatar: (authUser.user_metadata?.full_name || authUser.email || 'U').charAt(0).toUpperCase()
        });

        const fetchProfile = async () => {
            try {
                const { data, error } = await supabase
                    .from('company_profiles')
                    .select('*')
                    .limit(1)
                    .single();

                if (error && error.code !== 'PGRST116') { // Ignore "No rows found"
                    console.error("Error fetching company profile:", error);
                }

                if (data) {
                    setCompanyProfile({
                        nombreEmpresa: data.nombre_empresa || DEFAULT_COMPANY_PROFILE.nombreEmpresa,
                        rfc: data.rfc,
                        direccion: data.direccion,
                        telefono: data.telefono,
                        email: data.email,
                        logoUrl: data.logo_url,
                        sitioWeb: data.sitio_web,
                        colorPrimario: data.color_primario || DEFAULT_COMPANY_PROFILE.colorPrimario
                    });
                }
            } catch (err) {
                console.error("Error on company sync:", err);
            } finally {
                setIsLoadingProfile(false);
            }
        };

        fetchProfile();
    }, [authUser]);

    const updateCompanyProfile = async (updatedProfile: Partial<CompanyProfile>) => {
        // Optimistic update locally
        setCompanyProfile(prev => ({ ...prev, ...updatedProfile }));

        // Push to Supabase
        const payload = {
            nombre_empresa: updatedProfile.nombreEmpresa || companyProfile.nombreEmpresa,
            rfc: updatedProfile.rfc !== undefined ? updatedProfile.rfc : companyProfile.rfc,
            direccion: updatedProfile.direccion !== undefined ? updatedProfile.direccion : companyProfile.direccion,
            telefono: updatedProfile.telefono !== undefined ? updatedProfile.telefono : companyProfile.telefono,
            email: updatedProfile.email !== undefined ? updatedProfile.email : companyProfile.email,
            logo_url: updatedProfile.logoUrl !== undefined ? updatedProfile.logoUrl : companyProfile.logoUrl,
            sitio_web: updatedProfile.sitioWeb !== undefined ? updatedProfile.sitioWeb : companyProfile.sitioWeb,
            color_primario: updatedProfile.colorPrimario !== undefined ? updatedProfile.colorPrimario : companyProfile.colorPrimario
        };

        try {
            // Since there's a trigger enforcing workspace = get_current_workspace, and a unique constraint,
            // we can just insert and let Supabase handle the workspace assignment. 
            // Better yet, update based on workspace (which RLS handles implicitly)

            // First check if one exists via RLS
            const { data: existing } = await supabase.from('company_profiles').select('id').single();

            if (existing) {
                await supabase.from('company_profiles').update(payload).eq('id', existing.id);
            } else {
                await supabase.from('company_profiles').insert(payload);
            }
        } catch (err) {
            console.error("Error saving profile to database:", err);
        }
    };

    return (
        <UserContext.Provider value={{ users, currentUser, companyProfile, updateCompanyProfile, isLoadingProfile }}>
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
