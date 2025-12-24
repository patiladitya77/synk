import { Request, Response } from "express";
import validateSignUpData from "../utils/validation";
import bcrypt from "bcrypt";
import User from "../models/User";
export const signupController = async (req: Request, res: Response) => {
  try {
    const { name, emailId, password } = req.body;

    //validaton of data
    validateSignUpData(req);

    //encryption of password
    const passwordHash = await bcrypt.hash(password, 10);

    //creating a new instance of user
    const user = new User({
      name,
      emailId,
      password: passwordHash,
    });
    const savedUser = await user.save();
    const token = await savedUser.getJWT();

    res.cookie("token", token, {
      httpOnly: true,
      //   process.env.NODE_ENV === "production",
      expires: new Date(Date.now() + 8 * 3600000),
    });

    res.json({ message: "data added successfully", savedUser });
  } catch (err) {
    res.status(400).json({ message: "ERROR " + err });
  }
};

export const loginController = async (req: Request, res: Response) => {
  try {
    const { emailId, password } = req.body;
    const user = await User.findOne({ emailId: emailId }).select("+password");
    if (!user) {
      return res.status(401).send("invalid credentials");
    }
    const isPasswordValid = await user.validatePassword(password);
    if (isPasswordValid) {
      //create a token
      const token = await user.getJWT();

      //sending cookie back to user
      res.cookie("token", token, {
        httpOnly: true,
        secure: true,
        expires: new Date(Date.now() + 8 * 3600000),
      });

      res.send(user);
    } else {
      return res.status(401).send("invalid credentials");
    }
  } catch (err) {
    res.status(400).json({ message: "ERROR " + err });
  }
};

export const logoutController = async (req: Request, res: Response) => {
  res.cookie("token", null, { expires: new Date(Date.now()) });
  res.send("logout successfull");
};
