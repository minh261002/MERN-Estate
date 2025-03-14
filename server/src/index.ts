import "dotenv/config";
import express from "express";
import cors from "cors";
import session from "express-session";

import { config } from "./configs/app.config";
import connectDatabase from "./configs/database.config";
import passport from "./configs/passport.config";
import { setupSwagger } from "./configs/idoc.config";

import { errorHandler } from "./middlewares/errorHandler.middleware";
import isAuthenticated from "./middlewares/isAuthenticated.middleware";

import workspaceRouter from "./routes/workspace.routes";
import authRouter from "./routes/auth.routes";
import userRouter from "./routes/user.routes";
import memberRouter from "./routes/member.routes";
import projectRouter from "./routes/project.routes";
import taskRouter from "./routes/task.routes";

const app = express();
const BASE_PATH = config.BASE_PATH;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  session({
    name: "session",
    secret: config.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: config.NODE_ENV === "production",
      httpOnly: true,
      sameSite: "lax",
      maxAge: 24 * 60 * 60 * 1000
    }
  })
);

app.use(passport.initialize());
app.use(passport.session());

app.use(
  cors({
    origin: config.FRONTEND_URL,
    credentials: true
  })
);

app.use(`${BASE_PATH}/auth`, authRouter);
app.use(`${BASE_PATH}/user`, isAuthenticated, userRouter);
app.use(`${BASE_PATH}/workspace`, isAuthenticated, workspaceRouter);
app.use(`${BASE_PATH}/member`, isAuthenticated, memberRouter);
app.use(`${BASE_PATH}/project`, isAuthenticated, projectRouter);
app.use(`${BASE_PATH}/task`, isAuthenticated, taskRouter);

setupSwagger(app);
app.use(errorHandler);

app.listen(config.PORT, async () => {
  console.log(`Server is running on http://localhost:${config.PORT}`);
  await connectDatabase();
});
