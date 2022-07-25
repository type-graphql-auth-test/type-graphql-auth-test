import { Query, Resolver } from "type-graphql";

@Resolver()
export class HelloResolver {
  @Query(() => String)
  public hello(): string {
    return "Hello from type graphql!";
  }
}