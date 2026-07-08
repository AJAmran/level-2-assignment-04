import { User } from "../../../generated/prisma/browser";

export type TLoginResponse = {
  accessToken: string;
  refreshToken: string;
  user: Omit<User, "password">;
};

export type TRefreshTokenResponse = {
  accessToken: string;
};

export type TUserResponse = Omit<User, "password"> & {
  technicianProfile?: Record<string, unknown> | null;
};
