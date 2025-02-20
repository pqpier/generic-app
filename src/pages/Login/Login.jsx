import React, { useEffect, useState } from "react";
import { Button } from "@/shadcn/components/ui/button";
import { Input } from "@/shadcn/components/ui/input";
import { Link } from "react-router-dom";
import { useLogin } from "@/hooks/useLogin";
import { EyeClosedIcon, EyeOpenIcon, ReloadIcon } from "@radix-ui/react-icons";
import Logo from "@/components/Logo";
import { useNavigate } from "react-router-dom";
import GoogleLogo from "@/components/GoogleLogo";
import { signInWithCustomToken } from "firebase/auth";
import { auth } from "@/firebase/config";

export default function Login() {
  const { login, isPending, error } = useLogin();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const [errorMsg, setErrorMsg] = useState("");
  const [isEmailLogin, setIsEmailLogin] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!email.includes("@") || !email.includes(".")) {
      setErrorMsg("Por favor, insira um e-mail válido.");
      return;
    }

    setIsEmailLogin(true);

    if (email === "token@gmail.com") {
      const customToken = password;
      try {
        await signInWithCustomToken(auth, customToken);
        navigate("/oportunidades");
      } catch (error) {
        setErrorMsg("O token fornecido é inválido.");
      }
      return;
    }

    login(email, password);
  };

  const toggleShowPassword = () => {
    setShowPassword((prevShowPassword) => !prevShowPassword);
  };

  useEffect(() => {
    if (!error) return;

    if (error.includes("auth/invalid-login-credentials")) {
      setErrorMsg(
        "As credenciais fornecidas estão incorretas. Verifique sua senha ou clique em 'Esqueci minha senha' para redefinir."
      );
    }
  }, [error]);

  return (
    <div className="flex flex-col-reverse xl:flex-row 2xl:gap-20 xl:h-screen w-full xl:px-20 2xl:px-40 xl:py-20 2xl:py-0">
      <div className="xl:w-1/2 2xl:h-[50%] my-auto bg-muted rounded-xl px-5 sm:p-12 py-8 flex justify-center items-center">
        <div>
          <Logo size={240} />
          <h2 className="mt-12 sm:mt-10 2xl:mt-16 text-4xl leading-[44px] sm:leading-[50px] font-medium">
            Headline
          </h2>
          <h3 className="mt-12 sm:mt-2 2xl:mt-4 text-lg leading-[44px] sm:leading-[24px] font-normal">
            Subheadline
          </h3>
          <p className="mt-4 sm:mt-6 2xl:mt-10 text-muted-foreground">
            Lorem ipsum dolor sit amet, consectetur adipisicing elit. Recusandae
            quisquam dolorum atque perspiciatis blanditiis ea, perferendis
            nesciunt magni sit sapiente quod magnam quasi fugiat hic facilis
            voluptate quae molestiae soluta.
          </p>
          {/* <div className="bg-foreground text-background p-5 sm:p-8 rounded-xl mt-[8%] leading-6 2xl:leading-8">
            Lorem ipsum dolor sit amet, consectetur adipisicing elit. Eveniet
            quasi molestias molestiae, pariatur, doloribus neque saepe sit hic
            quis sequi nulla non quidem accusantium harum ipsa minima adipisci
            iure obcaecati!
          </div> */}
        </div>
      </div>
      <div className="flex flex-col justify-center xl:w-1/2 px-5 md:px-20 py-[15%] sm:h-auto">
        <div>
          <div className="sm:hidden mx-auto w-fit">
            <Logo />
          </div>
          <h1 className="mt-12 sm:mt-0 text-3xl font-semibold text-center sm:text-left">
            Entre na sua conta
          </h1>
          <p className="mt-2 text-muted-foreground font-normal text-lg text-center sm:text-left">
            Informe os seus dados de acesso
          </p>
          {/* <Button
            size="xl"
            variant="outline"
            className="mt-6 text-lg w-full py-3"
            disabled={isPending}
            onClick={() => authenticateWithGoogle("login")}
          >
            {isPending && !isEmailLogin && (
              <ReloadIcon className="w-5 h-5 mr-2 animate-spin" />
            )}
            <GoogleLogo />
            {isPending && !isEmailLogin
              ? "Entrando..."
              : "Entrar com a conta Google"}
          </Button> */}
          <form className="mt-6" onSubmit={handleLogin}>
            <p className="mt-5 text-muted-foreground mb-2.5">E-mail</p>
            <Input
              autoComplete="off"
              className="h-12"
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value.trim().toLowerCase())}
            />
            <p className="mt-2.5 sm:mt-5 text-muted-foreground mb-2.5">Senha</p>
            <div className="relative items-center h-12 p-0 w-full rounded-md border border-input bg-background text-sm">
              <input
                className="h-12 bg-transparent rounded-md w-full px-3 py-2 ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                autoComplete="off"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              {showPassword === false && (
                <EyeOpenIcon
                  onClick={toggleShowPassword}
                  className="h-5 w-5 cursor-pointer absolute right-4 bottom-3"
                />
              )}
              {showPassword === true && (
                <EyeClosedIcon
                  onClick={toggleShowPassword}
                  className="h-5 w-5 cursor-pointer absolute right-4 bottom-3"
                />
              )}
            </div>
            <p
              className="w-fit ml-auto mt-2.5 text-right text-muted-foreground underline"
              role="button"
              onClick={() => navigate("/password/recovery")}
            >
              Esqueci minha senha
            </p>
            <Button
              size="xl"
              className="mt-6 text-lg w-full py-3"
              disabled={isPending}
            >
              {isPending && isEmailLogin && (
                <ReloadIcon className="w-5 h-5 mr-2 animate-spin" />
              )}
              {isPending && isEmailLogin
                ? "Entrando..."
                : "Entrar na minha conta"}
            </Button>
            {errorMsg && <p className="text-red-500 mt-2.5">{errorMsg}</p>}
          </form>
          {/* <div className="mt-12 sm:mt-6 flex justify-center gap-2 text-lg">
            <p>Não tem uma conta?</p>
            <Link to="/signup" className="text-primary underline">
              Cadastre-se agora.
            </Link>
          </div> */}
        </div>
      </div>
    </div>
  );
}
