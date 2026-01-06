import { useQuery } from '@tanstack/react-query';

interface UserProfile {
    id: string;
    name: string;
    email: string;
    joinedAt: string;
    avatarUrl: string;
}

const MOCK_USER: UserProfile = {
    id: 'u1',
    name: 'Khoa Dinh', // Using user's name context or generic
    email: 'khoa@example.com',
    joinedAt: '2023-01-01T10:00:00Z',
    avatarUrl: 'https://ui-avatars.com/api/?name=Khoa+Dinh&background=0D8ABC&color=fff',
};

export function useUser() {
    return useQuery({
        queryKey: ['userProfile'],
        queryFn: async () => {
            await new Promise((resolve) => setTimeout(resolve, 300));
            return MOCK_USER;
        },
        staleTime: Infinity,
    });
}
