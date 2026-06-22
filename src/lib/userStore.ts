export interface User {
  id: string;
  name: string;
  username: string;
  email: string;
  password: string;
}

// In-memory user store — replace with a real DB (e.g. Supabase, Prisma) later
// Pre-populated with test user for development
export const users: User[] = [
  {
    id: "1",
    name: "Stephen",
    username: "stephensdf89",
    email: "stephensdf89@gmail.com",
    password: "$2b$10$SJwHcSKtx12gTuZi7AZ8D.Kiidr2JzJFYs3WcXiXcaqfKb22bPmtu",
  },
];
