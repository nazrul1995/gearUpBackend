import { prisma } from "../../lib/prisma"
import { ICreateGearPayload, IGearQuery } from "./gear.interface"

const createGear = async (  payload: ICreateGearPayload, userId: string) => {
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
        categoryId: selectedCategoryId,      },
      include: {
        category: true,
      },
    });

    return gear;
  });

  return result;
};



const getAllGears = async () => {
    const gearItems = await prisma.gearItem.findMany({
        include:{
            provider: {
                omit:{
                    password:true
                }
            }
        }
    })
    return gearItems;
}

const updateGear = async (GearId : string, payload : IUpdateGearPayload, authorId : string, isAdmin : boolean) => {
   
}

const deleteGear = async (GearId: string, authorId: string, isAdmin: boolean) => {
}

const getGearsStats = async () => {
   
}

const getMyGears = async (authorId : string) => {


}

const getGearById = async (gearId : string) => {
    const gearItem = await prisma.gearItem.findUniqueOrThrow({
        where : {
            id: gearId
        },
        include: {
            provider: {
                omit: {
                    password: true
                }
            },

            reviews: true,
            _count : {
                select : {
                    reviews : true
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
