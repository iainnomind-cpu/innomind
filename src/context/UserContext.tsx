import React, { createContext, useContext, useState } from 'react';

interface User {
    id: string;
    name: string;
    avatar?: string;
}

interface UserContextType {
    users: User[];
    currentUser: User | null;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [users] = useState<User[]>([
        { id: '1', name: 'Ana Silva', avatar: 'AS' },
        { id: '2', name: 'Carlos Ruiz', avatar: 'CR' },
        { id: '3', name: 'Maria Lopez', avatar: 'ML' },
    ]);

    const [currentUser] = useState<User>(users[0]);

    return (
        <UserContext.Provider value={{ users, currentUser }}>
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
