import passport from "passport";
import { Strategy as JwtStrategy } from "passport-jwt";
import { Strategy as LocalStrategy } from "passport-local";
import bcrypt from "bcrypt";
import environment from "../env.config.js";
import { User } from "../../models/user.model.js";

function cookieExtractor(req) {
  if (req && req.cookies && req.cookies.access_token) {
    return req.cookies.access_token;
  }
  return null;
}

export function initPassport() {

  passport.use(
    "local",
    new LocalStrategy(
      {
        usernameField: "email",
        passwordField: "password",
      },
      async (email, password, done) => {
        try {
          const user = await User.findOne({ email });
          if (!user) return done(null, false, { message: "Usuario no encontrado" });

          const isValid = await bcrypt.compare(password, user.password);
          if (!isValid) return done(null, false, { message: "Contraseña incorrecta" });

          return done(null, user); 
        } catch (err) {
          return done(err);
        }
      }
    )
  );

  
  passport.use(
    "jwt-cookie",
    new JwtStrategy(
      {
        jwtFromRequest: cookieExtractor,
        secretOrKey: environment.JWT_SECRET,
      },
      async (payload, done) => {
        try {
          const user = await User.findById(payload.sub).lean();
          if (!user) return done(null, false);
          return done(null, { _id: user._id, email: user.email, role: user.role });
        } catch (error) {
          return done(error, false);
        }
      }
    )
  );
}
