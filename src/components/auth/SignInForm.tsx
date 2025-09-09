import { useState } from "react";
import { useNavigate } from "react-router-dom"; 
import { EyeCloseIcon, EyeIcon } from "../../icons";
import Label from "../form/Label";
import Input from "../form/input/InputField";
import Button from "../ui/button/Button";
// import { toast } from "react-toastify";

export default function SignInForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate(); 


  function convertFullRawResponse(raw: string) {
  const obj: Record<string, any> = {};

  // Remove outer braces and trim
  const content = raw.replace(/^{|}$/g, "").trim();

  // Split by commas that precede a key (basic property split)
  const parts = content.split(/,(?=\s*"?\w+"?:)/);

  parts.forEach((part) => {
    const [keyPart, ...rest] = part.split(":");
    if (!keyPart || rest.length === 0) return;

    const key = keyPart.replace(/"/g, "").trim();
    let value = rest.join(":").trim();

    // Remove surrounding quotes if present
    value = value.replace(/^"(.*)"$/, "$1");

    // Convert multi-value fields into arrays
    if (key === "ApplicationAccessCode" || key === "AppName") {
      obj[key] = value.split(/,\s*/).map((s) => s.trim());
    } else {
      obj[key] = value;
    }
  });

  return obj;
}


  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const payload = {
        UserName: email,
        Password: password,
      };

      const response = await fetch(
        "https://hook.us2.make.com/xmqkh031o2wu4o7n181k2c2xt7doqf0c",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-make-apikey": "d7f9f8bc-b1a3-45e4-b8a4-c5e0fae9da7d",
          },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        throw new Error("Login failed");
      }

      const raw = await response.text();
      console.log("Raw response:", raw);

    let obj = convertFullRawResponse(raw);

   localStorage.setItem("data", JSON.stringify(obj)); 

      let data;
      try {
        data = JSON.parse(raw);
      } catch {
        data = { ID: raw };
      }

      if(email =="" && password == "")
      {
       setError("Invalid Credentials")
        return;
      }

      if (data.ID && data.ID !== "Not Found") {
    let raw = data.ID; 

const match = raw.match(/AppName":\s*([^}]+)/);

let accessibleApps: string[] = [];

if (match) {
  const appNameValue = match[1].trim(); 

  accessibleApps = appNameValue
    .split(",")
    .map((app: string) => app.trim());
}

console.log("accessible apps", accessibleApps);
localStorage.setItem("accessibleApps", JSON.stringify(accessibleApps));

        localStorage.setItem("userId", data.ID);
        localStorage.setItem("username", data.UserName || email);
          localStorage.setItem("users", JSON.stringify(raw));
        

        navigate("/home");
      } else {
        throw new Error("Invalid credentials");
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col flex-1">
      <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
        <div>
          <div className="mb-5 sm:mb-8">
            <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
              Sign In
            </h1>
            <p className="text-md text-gray-500 dark:text-gray-400">
              Enter your email and password to sign in!
            </p>
          </div>
          <div>
            <form onSubmit={handleLogin}>
              <div className="space-y-6">
                <div>
                  <Label>
                    Email <span className="text-error-500 text-md">*</span>
                  </Label>
                  <Input
                    placeholder="info@gmail.com"
                    value={email}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setEmail(e.target.value)
                    }
                    className="text-md"
                  />
                </div>
                <div>
                  <Label>
                    Password <span className="text-error-500 text-md">*</span>
                  </Label>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setPassword(e.target.value)
                      }
                    />
                    <span
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2"
                    >
                      {showPassword ? (
                        <EyeIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
                      ) : (
                        <EyeCloseIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
                      )}
                    </span>
                  </div>
                </div>
                {error && (
                  <p className="text-sm text-red-500 text-center">{error}</p>
                )}
                <div>
                  <Button className="w-full text-md" size="sm" disabled={loading}>
                    {loading ? "Signing in..." : "Sign in"}
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
