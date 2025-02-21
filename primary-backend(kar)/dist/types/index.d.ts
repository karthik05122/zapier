import { z } from "zod";
export declare const SignupSchema: z.ZodObject<{
    username: z.ZodString;
    password: z.ZodString;
    name: z.ZodString;
}, "strip", z.ZodTypeAny, {
    username: string;
    password: string;
    name: string;
}, {
    username: string;
    password: string;
    name: string;
}>;
export declare const SiginSchema: z.ZodObject<{
    username: z.ZodString;
    password: z.ZodString;
}, "strip", z.ZodTypeAny, {
    username: string;
    password: string;
}, {
    username: string;
    password: string;
}>;
export declare const ZapCreateSchema: z.ZodObject<{
    availableTriggerId: z.ZodString;
    triggerMetaData: z.ZodOptional<z.ZodAny>;
    actions: z.ZodArray<z.ZodObject<{
        availableActionId: z.ZodString;
        actionMetaData: z.ZodOptional<z.ZodAny>;
    }, "strip", z.ZodTypeAny, {
        availableActionId: string;
        actionMetaData?: any;
    }, {
        availableActionId: string;
        actionMetaData?: any;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    availableTriggerId: string;
    actions: {
        availableActionId: string;
        actionMetaData?: any;
    }[];
    triggerMetaData?: any;
}, {
    availableTriggerId: string;
    actions: {
        availableActionId: string;
        actionMetaData?: any;
    }[];
    triggerMetaData?: any;
}>;
