import { Router, Request, Response } from "express"; // Import Request and Response types
import { authMiddleware } from "./middleware";
import { ZapCreateSchema } from "../types";
import  {prismaClient}  from "@db";

const router = Router();

router.post("/", authMiddleware,async (req: Request, res: Response) => {
    const body = req.body;
    const id =req.id;
   
    const parsedData = ZapCreateSchema.safeParse(body);
    if(!parsedData.success){
        res.status(400).json({
            msg: " incorrect inputs"
        })
        return;
    }
    
    const userId = id ? parseInt(id, 10) : NaN;
    if (isNaN(userId)) {
        res.status(400).json({ msg: "Invalid user ID" });
        return // Return error if id is not convertible to number
    }
    
    const zapId = await prismaClient.$transaction(async (tx)=>{
        const zap = await prismaClient.zap.create({
            data:{
                userId:userId,
                triggerId: "",
                actions: {
                    create: parsedData.data.actions.map((x,index)=>({
                        actionId: x.availableActionId,
                        sortingOrder:index
                    }))
                }
            }
        })
        const trigger = await tx.trigger.create({
            data:{
                zapId : zap.id,
                triggerTd: parsedData.data.availableTriggerId,
            }
        });

        await tx.zap.update({
            where :{
                id:zap.id
            },
            data :{
                triggerId: trigger.id
            }
        })
        return zap.id;
    })
    res.json({
        zapId
    })
return;
});

router.get("/", authMiddleware, async (req: Request, res: Response) => {
   const id = req.id;
   const userId = id ? parseInt(id, 10) : NaN;
    if (isNaN(userId)) {
        res.status(400).json({ msg: "Invalid user ID" });
        return // Return error if id is not convertible to number
    }
    const zaps = await prismaClient.zap.findMany({
        where:{
            userId: userId
        },
        include:{
            actions:{
                include:{
                    type: true
                }
            },
            trigger:{
                include:{
                    type: true
                }
            }
        }
    });
    console.log("Zaps handler");
    res.json({
        zaps
    })
    return;
});

router.get("/:zapId", authMiddleware, async (req: Request, res: Response) => {
    const id = req.id;
    const zapId= req.params.zapId;
   const userId = id ? parseInt(id, 10) : NaN;
    if (isNaN(userId)) {
        res.status(400).json({ msg: "Invalid user ID" });
        return // Return error if id is not convertible to number
    }
    const zap = await prismaClient.zap.findFirst({
        where:{
            id:zapId,
            userId: userId
        },
        include:{
            actions:{
                include:{
                    type: true
                }
            },
            trigger:{
                include:{
                    type: true
                }
            }
        }
    });
   
    res.json({
        zap
    })
    return;
});

export const zapRouter = router;