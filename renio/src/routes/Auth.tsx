import {useToast} from "../components/ui/use-toast.ts";
import {useLocation} from "react-router-dom";
import {ToastAction} from "../components/ui/toast.tsx";
import {login} from "../conf.ts";
import {useEffect} from "react";
import Loader from "../components/Loader.tsx";
import '../assets/auth.less';
import axios from "axios";
import {validateToken} from "../store/auth.ts";
import {useDispatch} from "react-redux";
import router from "../router.ts";

function Auth() {
  const { toast } = useToast();
  const dispatch = useDispatch();
  const search = new URLSearchParams(useLocation().search);
  const token = (search.get("token") || "").trim();

  if (!token.length) {
    toast({
      title: "Invalid token",
      description: "Please try again.",
      action: (
        <ToastAction altText={"Try again"} onClick={login}>Try again</ToastAction>
      )
    });

    setTimeout(login, 2500);
  }

  useEffect(() => {
    axios.post('/login', { token })
      .then((res) => {
        const data = res.data;
        if (!data.status) {
          toast({
            title: "Invalid token",
            description: "Login failed! Please check your token expiration and try again.",
            action: (
              <ToastAction altText={"Try again"} onClick={login}>Try again</ToastAction>
            )
          });
        }
        else validateToken(dispatch, data.token, () => {
          toast({
            title: "Login successful",
            description: "You have been logged in successfully.",
          });

          router.navigate('/');
        });
      })
      .catch((err) => {
        console.debug(err);
        toast({
          title: "Server error",
          description: "There was an error logging you in. Please try again.",
          action: (
            <ToastAction altText={"Try again"} onClick={login}>Try again</ToastAction>
          )
        });
      });
  }, []);

  return (
        <div className={`auth`}>
          <Loader prompt={`Login`} />
        </div>
    );
}

export default Auth;
