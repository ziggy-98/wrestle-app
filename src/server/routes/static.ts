import { Router, Request, Response } from "express";

const router = Router();

router.get("/health", (_req: Request, res: Response) => {
    res.status(200).send({
        message: "OK"
    });
})

export default router;