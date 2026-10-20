import { Router } from "express";
import { Role } from "../../../generated/prisma/enums";
import { auth } from "../../middlewares/auth";
import { GearController } from "./gear.controller";

const router = Router();

router.post("/", auth(Role.PROVIDER, Role.ADMIN), GearController.createGear);

router.get("/", GearController.getAllGears);
router.get("/:gearId", GearController.getGearById);

router.get(
    "/stats", 
    auth(Role.ADMIN),
    GearController.getGearsStats
);

router.get(
    "/my-gear",
    auth(Role.PROVIDER, Role.ADMIN, Role.AUTHOR),
    GearController.getMyGears
);

router.get("/:postId", GearController.getGearById);

router.patch(
    "/:gearId", 
    auth(Role.PROVIDER, Role.ADMIN), 
    GearController.updateGear
);

router.delete(
    "/:gearId", 
    auth(Role.PROVIDER, Role.ADMIN), 
    GearController.deleteGear
);




export const gearRoutes = router;