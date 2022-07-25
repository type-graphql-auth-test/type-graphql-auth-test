import { Prisma, PrismaClient, User } from "@prisma/client";
import bcrypt from "bcrypt";
import { LoginResponse } from "./dto/LoginResponse";
import jwt from "jsonwebtoken";
import { RefreshTokenResponse } from "./dto/RefreshTokenResponse";

export class UserService {
  private prisma: PrismaClient;
  constructor() {
    this.prisma = new PrismaClient();
  }

  public async register(user: Prisma.UserCreateInput): Promise<User> {
    const hashedPassword = await bcrypt.hash(user.password, 10);
    user.password = hashedPassword;
    return this.prisma.user.create({ data: user });
  }

  async login(
    email: string,
    password: string
  ): Promise<LoginResponse> {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });
    if (!user) {
      throw new Error("User not found");
    }
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      throw new Error("Invalid password");
    }
    const accessToken = jwt.sign(
      { sub: user.id },
      process.env.JWT_SECRET,
      { expiresIn: "2m" }
    );
    const { id: refreshTokenId } =
      await this.prisma.refreshToken.create({ data: {} });
    const refreshToken = jwt.sign(
      { sub: user.id, refreshTokenId },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: process.env.REFRESH_TOKEN_LIFETIME }
    );
    const hasedRefreshToken = await bcrypt.hash(refreshToken, 10);
    // store refreshToken in db and link it to user
    await this.prisma.refreshToken.update({
      where: { id: refreshTokenId },
      data: {
        hashedToken: hasedRefreshToken,
        users: { connect: { id: user.id } },
      },
    });
    return {
      accessToken,
      refreshToken,
      user,
    };
  }

  public async me(userId: string): Promise<User> {
    return this.prisma.user.findUnique({
      where: { id: parseInt(userId) },
    });
  }

  public async refreshToken(
    refreshToken: string
  ): Promise<RefreshTokenResponse> {
    const { sub, refreshTokenId } = jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_SECRET
    ) as { sub: string; refreshTokenId: string };
    const userWithHasedRefreshToken =
      await this.prisma.user.findFirst({
        where: {
          id: parseInt(sub),
          refreshTokens: { some: { id: parseInt(refreshTokenId) } },
        },
        select: { id: true, refreshTokens: true },
      });
    if (!userWithHasedRefreshToken) {
      throw new Error("Unauthorized");
    }
    // verify hasedRefreshToken
    const isValid = await bcrypt.compare(
      refreshToken,
      userWithHasedRefreshToken.refreshTokens[0].hashedToken
    );
    if (!isValid) {
      throw new Error("Unauthorized");
    }

    // generate new tokens
    const accessToken = jwt.sign(
      { sub: userWithHasedRefreshToken.id },
      process.env.JWT_SECRET,
      { expiresIn: process.env.ACCESS_TOKEN_LIFETIME }
    );

    return { accessToken }
  }


  public async logout(refreshToken: string): Promise<string> {
    const { refreshTokenId } = jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_SECRET
    ) as { sub: string; refreshTokenId: string };
    try {
      await this.prisma.refreshToken.delete({ where: { id: parseInt(refreshTokenId) } });
    } catch (error) {

    }
    return "Logout success";
  }

  public async logoutAllConnectedUser(userId: string): Promise<string> {
    await this.prisma.refreshToken.deleteMany({
      where: { users: { some: { id: parseInt(userId) } } },
    });
    return "Logout success";
  }

  public async getUsers(): Promise<User[]> {
    return this.prisma.user.findMany();
  }
}
