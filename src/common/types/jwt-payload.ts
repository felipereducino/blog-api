export type JwtPayload = {
  sub: string; // user id
  email: string;
  role: 'USER' | 'ADMIN';
};
