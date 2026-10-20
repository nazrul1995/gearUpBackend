import { error } from "node:console";
import { prisma } from "../../lib/prisma"
import { ICreateGearPayload, IGearQuery, IUpdateGearPayload } from "./gear.interface"
import { GearItemWhereInput, PostWhereInput } from "../../../generated/prisma/models";

const createGear = async (payload: ICreateGearPayload, userId: string) => {
  const { categoryId, categoryName, ...gearData } = payload;

  const result = await prisma.$transaction(async (tx) => {
    let selectedCategoryId: string;

    if (categoryId) {
      // Existing category selected from frontend
      const category = await tx.category.findUniqueOrThrow({
        where: {
          id: categoryId,
        },
      });

      selectedCategoryId = category.id;
    } else if (categoryName?.trim()) {
      // Find existing category by name
      let category = await tx.category.findFirst({
        where: {
          categoryName: {
            equals: categoryName.trim(),
            mode: "insensitive",
          },
        },
      });

      // Create category if it doesn't exist
      if (!category) {
        category = await tx.category.create({
          data: {
            categoryName: categoryName.trim(),
          },
        });
      }

      selectedCategoryId = category.id;
    } else {
      throw new Error(
        "Please select a category or provide a new category name"
      );
    }

    // Create gear item
    const gear = await tx.gearItem.create({
      data: {
        ...gearData,
        providerId: userId,
        categoryId: selectedCategoryId,
      },
      include: {
        category: true,
      },
    });

    return gear;
  });

  return result;
};



const getAllGears = async (query: IGearQuery) => {
  const limit = query.limit ? Number(query.limit) : 10;
  const page = query.page ? Number(query.page) : 1;
  const skip = (page - 1) * limit;
  const sortBy = query.sortBy ? query.sortBy : "createdAt";
  const sortOrder = query.sortOrder ? query.sortOrder : "desc"

  const andCondition: GearItemWhereInput[] = []

  if (query.searchTerm) {
    andCondition.push({
      OR: [
        {
          name: {
            contains: query.searchTerm,
            mode: "insensitive"
          }
        },
        {
          description: {
            contains: query.searchTerm,
            mode: "insensitive"
          }
        }
      ]
    })
  }

  if (query.name) {
    andCondition.push({
      name: query.name
    })
  }

  if (query.description) {
    andCondition.push({
      description: query.description
    })
  }

// Category filter
  if (query.categoryId) {
    andCondition.push({
      categoryId: query.categoryId,
    });
  }

  
  // Minimum price filter
  if (query.minPrice !== undefined && query.minPrice !== "") {
    const minPrice = Number(query.minPrice);

    if (Number.isFinite(minPrice) && minPrice >= 0) {
      andCondition.push({
        pricePerDay: {
          gte: minPrice,
        },
      });
    }
  }

 // Maximum price filter
  if (query.maxPrice !== undefined && query.maxPrice !== "") {
    const maxPrice = Number(query.maxPrice);

    if (Number.isFinite(maxPrice) && maxPrice >= 0) {
      andCondition.push({
        pricePerDay: {
          lte: maxPrice,
        },
      });
    }
  }

  // Status filter (ACTIVE, INACTIVE, etc.)
  if (query.status) {
    andCondition.push({
      status: query.status,
    });
  }

  // Only return currently available gear
  if (query.availableOnly === "true") {
    andCondition.push({
      status: "ACTIVE",
      stock: {
        gt: 0,
      },
    });
  }


  const gearItems = await prisma.gearItem.findMany({

    where: {
      AND: andCondition
    },

    take: limit,
    skip: skip,
    orderBy: {
      [sortBy]: sortOrder
    },


    include: {
      provider: {
        omit: {
          password: true
        }
      },
      reviews: true
    }
  })

  const totalGearItemCount = await prisma.gearItem.count ({
    where: {
      AND: andCondition
    }
  })
  return {
    data: gearItems,
    meta: {
      page: page,
      limit: limit,
      totalGearItem: totalGearItemCount,
      totalPages: Math.ceil(totalGearItemCount/limit)
    }
  };
}

const updateGear = async (gearId: string, payload: IUpdateGearPayload, providerid: string, isAdmin: boolean) => {
  const gearItem = await prisma.gearItem.findFirstOrThrow({
    where: {
      id: gearId
    }
  })
  if (!isAdmin && gearItem.providerId !== providerid) {
    throw new Error("Your are not the owner of this post")
  }

  const result = await prisma.gearItem.update({
    where: {
      id: gearId
    },
    data: payload,
    include: {
      provider: {
        omit: {
          password: true
        }
      },
      reviews: true
    }
  })

  return result;
}

const deleteGear = async (gearId: string, providerId: string, isAdmin: boolean) => {
  const gearItem = await prisma.gearItem.findFirstOrThrow({
    where: {
      id: gearId
    }
  });

  if (!isAdmin && gearItem.providerId !== providerId) {
    throw new Error("You are not the owner of this post!")
  }

  await prisma.gearItem.delete({
    where: {
      id: gearId
    }
  })
}

const getGearsStats = async () => {

}

const getMyGears = async (providerId: string) => {
  const gearItem = await prisma.gearItem.findUniqueOrThrow({
    where: {
      id: providerId
    },
    include: {
      provider: {
        omit: {
          password: true
        }
      },

      reviews: true,
      _count: {
        select: {
          reviews: true
        }
      }
    },


  })

  return gearItem;

}

const getGearById = async (gearId: string) => {
  const gearItem = await prisma.gearItem.findUniqueOrThrow({
    where: {
      id: gearId
    },
    include: {
      provider: {
        omit: {
          password: true
        }
      },

      reviews: true,
      _count: {
        select: {
          reviews: true
        }
      }
    },


  })

  return gearItem;
}

export const GearService = {
  createGear,
  getAllGears,
  getGearById,
  updateGear,
  deleteGear,
  getGearsStats,
  getMyGears
}
