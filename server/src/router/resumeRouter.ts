import { Router } from "express";
import multer from "multer";
import analyizResume from "../controller/resumeController.ts";

const resumeRouter = Router()

const upload = multer({
    storage : multer.memoryStorage(),
    limits : {fieldSize : 1025 * 1025 * 5},
    fileFilter :(_req , file ,cb)=>{
        if(file.mimetype === "application/pdf"){
            cb(null,true)
        }else{
            cb(new Error("only pdf files are allows"))
        }
    }
})


resumeRouter.route("/analyze").post(upload.single("resume"),analyizResume)

export default resumeRouter;