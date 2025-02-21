"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.zapRouter = void 0;
const express_1 = require("express"); // Import Request and Response types
const middleware_1 = require("./middleware");
const types_1 = require("../types");
const _db_1 = require("@db");
const router = (0, express_1.Router)();
router.post("/", middleware_1.authMiddleware, async (req, res) => {
    const body = req.body;
    const id = req.id;
    const parsedData = types_1.ZapCreateSchema.safeParse(body);
    if (!parsedData.success) {
        res.status(400).json({
            msg: " incorrect inputs"
        });
        return;
    }
    const userId = id ? parseInt(id, 10) : NaN;
    if (isNaN(userId)) {
        res.status(400).json({ msg: "Invalid user ID" });
        return; // Return error if id is not convertible to number
    }
    const zapId = await _db_1.prismaClient.$transaction(async (tx) => {
        const zap = await _db_1.prismaClient.zap.create({
            data: {
                userId: userId,
                triggerId: "",
                actions: {
                    create: parsedData.data.actions.map((x, index) => ({
                        actionId: x.availableActionId,
                        sortingOrder: index
                    }))
                }
            }
        });
        const trigger = await tx.trigger.create({
            data: {
                zapId: zap.id,
                triggerTd: parsedData.data.availableTriggerId,
            }
        });
        await tx.zap.update({
            where: {
                id: zap.id
            },
            data: {
                triggerId: trigger.id
            }
        });
        return zap.id;
    });
    res.json({
        zapId
    });
    return;
});
router.get("/", middleware_1.authMiddleware, async (req, res) => {
    const id = req.id;
    const userId = id ? parseInt(id, 10) : NaN;
    if (isNaN(userId)) {
        res.status(400).json({ msg: "Invalid user ID" });
        return; // Return error if id is not convertible to number
    }
    const zaps = await _db_1.prismaClient.zap.findMany({
        where: {
            userId: userId
        },
        include: {
            actions: {
                include: {
                    type: true
                }
            },
            trigger: {
                include: {
                    type: true
                }
            }
        }
    });
    console.log("Zaps handler");
    res.json({
        zaps
    });
    return;
});
router.get("/:zapId", middleware_1.authMiddleware, async (req, res) => {
    const id = req.id;
    const zapId = req.params.zapId;
    const userId = id ? parseInt(id, 10) : NaN;
    if (isNaN(userId)) {
        res.status(400).json({ msg: "Invalid user ID" });
        return; // Return error if id is not convertible to number
    }
    const zap = await _db_1.prismaClient.zap.findFirst({
        where: {
            id: zapId,
            userId: userId
        },
        include: {
            actions: {
                include: {
                    type: true
                }
            },
            trigger: {
                include: {
                    type: true
                }
            }
        }
    });
    res.json({
        zap
    });
    return;
});
exports.zapRouter = router;
//# sourceMappingURL=zap.js.map