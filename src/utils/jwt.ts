import jwt from "jsonwebtoken";


export const signJWT = (payload: any) => {
  return jwt.sign(payload, process.env.TOKEN_SECRET! ?? "", {
    expiresIn: "1d", // Token expires in 1 day
  });
};

export const verifyJWT = (token: string) => {
  return jwt.verify(token, process.env.TOKEN_SECRET! ?? "");
};
