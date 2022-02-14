import { GraphQLDateTime } from "graphql-scalars";
import { asNexusMethod } from "nexus";

export const GqlDateTime = asNexusMethod(GraphQLDateTime, 'dateTime');