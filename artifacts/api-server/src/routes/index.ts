import { Router, type IRouter } from "express";
import healthRouter      from "./health";
import discussRouter     from "./discuss";
import inviteCodeRouter  from "./inviteCode";
import usersRouter       from "./users";
import analyticsRouter   from "./analytics";
import feedbackRouter    from "./feedback";
import adminRouter       from "./admin";
import waitlistRouter    from "./waitlist";
import earlyAccessRouter from "./earlyAccess";
import couponsRouter     from "./coupons";

const router: IRouter = Router();

router.use(healthRouter);
router.use(discussRouter);
router.use(inviteCodeRouter);
router.use(usersRouter);
router.use(analyticsRouter);
router.use(feedbackRouter);
router.use(adminRouter);
router.use(waitlistRouter);
router.use(earlyAccessRouter);
router.use(couponsRouter);

export default router;
