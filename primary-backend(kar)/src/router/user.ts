import { Router } from "express";
import { Request, Response } from "express";
import { authMiddleware } from "./middleware";
import { SiginSchema, SignupSchema } from "../types";
import { prismaClient } from "../db";
import jwt from "jsonwebtoken";
import { JWT_PASSWORD } from "../config";
const router = Router();
//@ts-ignore
router.post("/signup", async (req: Request,res: Response)=>{
    const body = req.body;
    console.log(body);
    const parsedData = SignupSchema.safeParse(body);
    //console.log(parsedData.error)
    if(!parsedData.success){
        return res.status(400).json({
            message: "Incorrect inputs "
        })
    }

    const userExists = await prismaClient.user.findFirst({
        where:{
            email: parsedData.data.username
        }
    });
    if(userExists){
        res.status(403).json({
            message: "User already exists"
        })
    }

    await prismaClient.user.create({
        data:{
            email:parsedData.data.username,
            password: parsedData.data.password,
            name: parsedData.data.name
        }
    })
    res.json({
        message: " Please verify your email"
    });


})
//@ts-ignore
router.post("/signin", async (req: Request,res: Response)=>{
    const body = req.body;
    const parsedData = SiginSchema.safeParse(body);

    if(!parsedData.success){
        return res.status(411).json({
            message: "Incorrect inputs  "
        })
    }

    const user = await prismaClient.user.findFirst({
        where:{
            email: parsedData.data.username,
            password: parsedData.data.password
        }
    })

    if(!user){
        return res.status(401).json({
            msg:"Sorry incorrect credentials"
        })
    }

    const token = jwt.sign({
        id: user.id
    },JWT_PASSWORD);

    res.json({
        token: token
    });
    
})

router.get("/",authMiddleware,async (req: Request,res: Response)=>{

    //TODO fix type

    const id = (req.id);
    const user = await prismaClient.user.findFirst({
        where:{
            //@ts-ignore
            id: id
        },
        select:{
            email:true,
            name:true
        }
    })

    res.json({
        user
    });

})


export const userRouter = router;