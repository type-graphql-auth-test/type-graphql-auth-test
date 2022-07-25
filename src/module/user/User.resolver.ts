import { Arg, Ctx, FieldResolver, Mutation, Query, Resolver, Root, UseMiddleware } from "type-graphql";
import { AuthGuard } from "../shared/Guard/AuthGuard";
import { Context } from "../shared/type/Context.interface";
import { LoginInput } from "./dto/LoginInput";
import { LoginResponse } from "./dto/LoginResponse";
import { RefreshTokenResponse } from "./dto/RefreshTokenResponse";
import { RegisterInput } from "./dto/RegisterInput";
import { User } from "./dto/User";
import { UserService } from "./User.service";

@Resolver(User)
export class UserResolver {
  private userService: UserService;
  constructor() {
    this.userService = new UserService();
  }

  @Mutation(() => User)
  public register(
    @Arg("input") { email, firstName, lastName, password }: RegisterInput
  ): Promise<User> {
    return this.userService.register({ firstName, lastName, email, password });
  }

  @Mutation(() => LoginResponse)
  public login(@Arg("input") { email, password }: LoginInput): Promise<LoginResponse> {
    return this.userService.login(email, password);
  }

  @Query(() => [User])
  @UseMiddleware(AuthGuard)
  public async getUsers(@Ctx() ctx: Context): Promise<User[]> {
    return this.userService.getUsers();
  }

  @Query(() => User)
  @UseMiddleware(AuthGuard)
  public async me(@Ctx() ctx: Context): Promise<User> {
    return this.userService.me(ctx.userId);
  }

  @UseMiddleware(AuthGuard)
  @Mutation(() => RefreshTokenResponse)
  public refreshToken(@Ctx() ctx: Context): Promise<RefreshTokenResponse> {
    const refreshToken = ctx.req.headers.authorization.split(" ")[1];
    return this.userService.refreshToken(refreshToken);
  }


  @UseMiddleware(AuthGuard)
  @Mutation(() => String)
  public logout(@Ctx() ctx: Context, @Arg("refreshTooken") refreshToken: string): Promise<string> {
    return this.userService.logout(refreshToken);
  }

  @UseMiddleware(AuthGuard)
  @Mutation(() => String)
  public logoutAllConnectedUser(@Ctx() ctx: Context): Promise<string> {
    return this.userService.logoutAllConnectedUser(ctx.userId);
  }


  @FieldResolver()
  async name(@Root() parent: User): Promise<string> {
    return `${parent.firstName} ${parent.lastName}`;
  }
}