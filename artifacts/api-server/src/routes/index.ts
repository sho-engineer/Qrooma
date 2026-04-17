import { Router, type IRouter } from "express";
import healthRouter from "./health";
import discussRouter from "./discuss";

const router: IRouter = Router();

router.use(healthRouter);
router.use(discussRouter);

export default router;
