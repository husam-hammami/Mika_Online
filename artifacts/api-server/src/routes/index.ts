import { Router, type IRouter } from "express";
import healthRouter from "./health";
import accessRequestsRouter from "./access-requests";

const router: IRouter = Router();

router.use(healthRouter);
router.use(accessRequestsRouter);

export default router;
