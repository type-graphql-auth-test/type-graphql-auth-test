import { Field, ObjectType } from "type-graphql";
import { User } from "./User";

@ObjectType()
export class LoginResponse {
  @Field()
  accessToken: string;

  @Field()
  refreshToken: string;

  @Field(() => User)
  user: User;
}