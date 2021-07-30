import { useState } from "react";
import Avatar from "@material-ui/core/Avatar";
import Button from "@material-ui/core/Button";
import CssBaseline from "@material-ui/core/CssBaseline";
import TextField from "@material-ui/core/TextField";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Checkbox from "@material-ui/core/Checkbox";
import Link from "@material-ui/core/Link";
import Grid from "@material-ui/core/Grid";
import LockOutlinedIcon from "@material-ui/icons/LockOutlined";
import Typography from "@material-ui/core/Typography";
import Container from "@material-ui/core/Container";
import { useForm, Controller } from "react-hook-form";
import { useHistory } from "react-router-dom";
import axios from "axios";
import { useStyles } from "../Layout/useStyles";
import { useUserContext } from "../context/user-context";
import { hashPassword } from "../crypto";

const backendURL = process.env.REACT_APP_BACKEND_URL

export default function LogIn() {
  let history = useHistory();
  const classes = useStyles();

  const { user, setUser } = useUserContext();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const [wrongCredentials, setWrongCredentials] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  async function onSubmit(data) {
    data.password = hashPassword(data.password);
    try {
      const response = await axios({
        method: "POST",
        url: `${backendURL}/users/login`,
        data: data,
      });
      setWrongCredentials(false);
      setErrorMessage(response.data.error);
      console.log(response.data.error);
      const accessToken = response.data.accessToken;
      axios.defaults.headers.common["authorization"] = `basic ${accessToken}`;

      setUser({ email: data.email });

      if (data["remember-me"]) {
        localStorage.setItem("token", accessToken);
      } else sessionStorage.setItem("token", accessToken);
      console.log(accessToken);
      if (accessToken) {
        history.push("/myAccount");
      }
    } catch (error) {
      console.log(error);
    }
  }

  return (
    <Container component="main" maxWidth="xs">
      <CssBaseline />
      <div className={classes.paper}>
        <Avatar className={classes.avatar}>
          <LockOutlinedIcon />
        </Avatar>
        <Typography component="h1" variant="h5">
          Log In
        </Typography>
        {errorMessage && <p>Error: {errorMessage}</p>}
        <form className={classes.form} onSubmit={handleSubmit(onSubmit)}>
          <Controller
            name="email"
            control={control}
            defaultValue=""
            rules={{ required: true }}
            render={({ field }) => (
              <TextField
                {...field}
                variant="outlined"
                margin="normal"
                fullWidth
                label="Email Address"
                autoComplete="email"
                autoFocus
              />
            )}
          />
          {errors.email && <span>Please enter a valid email address</span>}

          <Controller
            name="password"
            control={control}
            defaultValue=""
            rules={{ required: true }}
            render={({ field }) => (
              <TextField
                {...field}
                variant="outlined"
                margin="normal"
                fullWidth
                label="Password"
                autoComplete="current-password"
                autoFocus
                type="password"
              />
            )}
          />
          {errors.password && <span>Please enter a valid password </span>}

          {wrongCredentials && (
            <div style={{ color: "#ff0000" }}>Wrong username or password </div>
          )}
          <Controller
            name="remember-me"
            control={control}
            render={({ field }) => (
              <FormControlLabel
                control={
                  <Checkbox {...field} value="remember" color="primary" />
                }
                label="Remember me"
              />
            )}
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            size="large"
            className={classes.submit}
          >
            Log In
          </Button>
          <Grid container>
            <Grid item xm>
              <Link href="#" variant="body2"></Link>
            </Grid>
            <Grid item xs>
              <Link href="/forgot-password" variant="body2">
                Forgot password ?
              </Link>
            </Grid>
            <Grid item>
              <Link href="/register" variant="body2">
                Sign Up here
              </Link>
            </Grid>
          </Grid>
        </form>
      </div>
    </Container>
  );
}
