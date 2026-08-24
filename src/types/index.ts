export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
}

export interface Board {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
}
