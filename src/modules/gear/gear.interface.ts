import { GearStatus, PostStatus } from "../../../generated/prisma/enums";
import { GearItemWhereInput, PostWhereInput } from "../../../generated/prisma/models";

export interface ICreateGearPayload {
  categoryId?: string;
  categoryName?: string;
  name: string;
  description?: string;
  image?: string;
  pricePerDay: number;
  stock?: number;
}

export interface IUpdatePostPayload {
    title?: string;
    content?: string;
    thumbnail?: string;
    isFeatured?: boolean;
    status?: PostStatus
    tags?: string[]
}

export interface IPostQuery extends PostWhereInput {
    //post model er fields
    // title ?: string;
    // content ?: string

    searchTerm?: string
    page?: string
    limit?: string
    sortOrder?: string
    sortBy?: string
} 
export interface IGearQuery extends GearItemWhereInput {
    searchTerm?: string
    page?: string
    limit?: string
    sortOrder?: string
    sortBy?: string
} 