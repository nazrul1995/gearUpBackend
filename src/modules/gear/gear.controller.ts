import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { GearService } from "./gear.service";

const createGear = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    console.log(req.user)
    const userId = req.user?.id as string;
    const payload = req.body;

    const result = await GearService.createGear(
      payload,
      userId
    );

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.CREATED,
      message: "Gear Item Created Successfully",
      data: result,
    });
  }
);

const getAllGears = catchAsync(async (req : Request, res : Response, next : NextFunction) => {
    const query = req.query;
    const result = await GearService.getAllGears(query)
      sendResponse(res, {
        success : true,
        statusCode : httpStatus.OK,
        message : "Posts Retrieved Successfully",
        data : result
    })
})

const getGearById = catchAsync(async (req : Request, res : Response, next : NextFunction) => {
    const GearId = req.params.gearId;

    if(!GearId){
        throw new Error("Gear Id Required In Params")
    }

    const result = await GearService.getGearById(GearId as string);

    sendResponse(res, {
        success : true,
        statusCode : httpStatus.OK,
        message : "Gear retrieved successfuly",
        data : result
    })
})

const updateGear = catchAsync(async (req : Request, res : Response, next : NextFunction) => {
    const providerId = req.user?.id
    const isAdmin = req.user?.role === "ADMIN";
    console.log(req.user)
    const GearId = req.params.gearId;

    if (!GearId) {
        throw new Error("Gear Id Required In Params")
    }

    const payload = req.body;

    const result = await GearService.updateGear(GearId as string, payload, providerId as string, isAdmin)

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Gear updated successfully",
        data: result
    })
})

const deleteGear = catchAsync(async (req : Request, res : Response, next : NextFunction) => {
    const providerId = req.user?.id
    const isAdmin = req.user?.role === "ADMIN";
    console.log(req)
    const gearId = req.params.gearId;
    if (!gearId) {
        throw new Error("Gear Id Required In Params")
    }

    await GearService.deleteGear(gearId as string, providerId as string, isAdmin)

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Gear deleted successfully",
        data: null
    })
})

const getGearsStats = catchAsync(async (req : Request, res : Response, next : NextFunction) => {
    const result = await GearService.getGearsStats();

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Gear stats retrieved successfully",
        data: result
    })
})

const getMyGears = catchAsync(async (req : Request, res : Response, next : NextFunction) => {
    const providerId = req.user?.id;

    const result = await GearService.getMyGears(providerId as string);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "My Gears retrieved successfuly",
        data: result
    })
})

export const GearController = {
    createGear,
    getAllGears,
    getGearById,
    updateGear,
    deleteGear,
    getGearsStats,
    getMyGears
}