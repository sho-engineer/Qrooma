import { Router, type IRouter } from "express";
import healthRouter      from "./health";
import discussRouter     from "./discuss";
import inviteCodeRouter  from "./inviteCode";

const router: IRouter = Router();

router.use(healthRouter);
router.use(discussRouter);
router.use(inviteCodeRouter);

export default router;
