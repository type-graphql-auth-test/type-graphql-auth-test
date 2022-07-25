import { Field, ObjectType } from "type-graphql";

@ObjectType()
export class RefreshTokenResponse {
  @Field()
  accessToken: string;
}