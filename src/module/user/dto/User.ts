import { Field, ID, ObjectType } from "type-graphql";

@ObjectType()
export class User {
  @Field(() => ID)
  public id: number;

  @Field()
  firstName: string;

  @Field()
  lastName?: string;

  @Field()
  email: string;

  @Field()
  name?: string;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}