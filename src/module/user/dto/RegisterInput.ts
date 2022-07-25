import { IsEmail, IsNotEmpty, IsOptional, Length } from "class-validator";
import { Field, InputType } from "type-graphql";
import { IsEmailAlreadyExist } from "../decorator/IsEmailAlreadyExist";

@InputType()
export class RegisterInput {
  @Field()
  @IsNotEmpty()
  firstName: string;

  @Field({ nullable: true })
  @IsOptional()
  lastName?: string;

  @Field()
  @IsEmail()
  @IsEmailAlreadyExist({ message: "Email already exists" })
  email: string;

  @Field()
  @IsNotEmpty()
  @Length(6)
  password: string;
}