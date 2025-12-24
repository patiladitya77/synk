import validator from "validator";
interface IReq {
  body: {
    name: string;
    emailId: string;
    password: string;
  };
}
const validateSignUpData = (req: IReq) => {
  const { name, emailId, password } = req.body;

  if (!name) {
    throw new Error("Name not valid");
  } else if (!validator.isEmail(emailId)) {
    throw new Error("Email is not valid");
  } else if (!validator.isStrongPassword(password)) {
    throw new Error("Password is not strong");
  }
};
export default validateSignUpData;
