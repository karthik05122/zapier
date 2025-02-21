"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userRouter = void 0;
const express_1 = require("express");
const middleware_1 = require("./middleware");
const types_1 = require("../types");
const db_1 = require("../db");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_1 = require("../config");
const router = (0, express_1.Router)();
//@ts-ignore
router.post("/signup", async (req, res) => {
    const body = req.body;
    console.log(body);
    const parsedData = types_1.SignupSchema.safeParse(body);
    //console.log(parsedData.error)
    if (!parsedData.success) {
        return res.status(400).json({
            message: "Incorrect inputs "
        });
    }
    const userExists = await db_1.prismaClient.user.findFirst({
        where: {
            email: parsedData.data.username
        }
    });
    if (userExists) {
        res.status(403).json({
            message: "User already exists"
        });
    }
    await db_1.prismaClient.user.create({
        data: {
            email: parsedData.data.username,
            password: parsedData.data.password,
            name: parsedData.data.name
        }
    });
    res.json({
        message: " Please verify your email"
    });
});
//@ts-ignore
router.post("/signin", async (req, res) => {
    const body = req.body;
    const parsedData = types_1.SiginSchema.safeParse(body);
    if (!parsedData.success) {
        return res.status(411).json({
            message: "Incorrect inputs  "
        });
    }
    const user = await db_1.prismaClient.user.findFirst({
        where: {
            email: parsedData.data.username,
            password: parsedData.data.password
        }
    });
    if (!user) {
        return res.status(401).json({
            msg: "Sorry incorrect credentials"
        });
    }
    const token = jsonwebtoken_1.default.sign({
        id: user.id
    }, config_1.JWT_PASSWORD);
    res.json({
        token: token
    });
});
router.get("/", middleware_1.authMiddleware, async (req, res) => {
    //TODO fix type
    const id = (req.id);
    const user = await db_1.prismaClient.user.findFirst({
        where: {
            //@ts-ignore
            id: id
        },
        select: {
            email: true,
            name: true
        }
    });
    res.json({
        user
    });
});
exports.userRouter = router;
//# sourceMappingURL=user.js.map