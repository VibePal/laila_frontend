import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Eye, EyeOff } from "lucide-react";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccess("");

    try {
      const apiUrl = import.meta.env.VITE_API_URL;
      if (!apiUrl) {
        throw new Error("API URL not configured. Please check your environment variables.");
      }

      // Try the standard format first
      const requestBody = {
        username,
        password,
      };
      
      console.log("Sending request body:", requestBody);
      
      const response = await fetch(`${apiUrl}/api/v1/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();
      
      // Debug logging
      console.log("Login request:", { username, password });
      console.log("Login response status:", response.status);
      console.log("Login response data:", data);
      console.log("Login response detail:", data.detail);
      if (Array.isArray(data.detail)) {
        console.log("Detail array items:", data.detail.map((item, index) => ({ index, item })));
      }

      if (response.ok) {
        console.log("Login successful, storing token and redirecting...");
        
        // Store access token from the correct response format
        if (data.access_token) {
          localStorage.setItem("authToken", data.access_token);
          localStorage.setItem("tokenType", data.token_type || "Bearer");
          localStorage.setItem("tokenExpiresIn", data.expires_in?.toString() || "");
          console.log("Token stored successfully");
        }

        // Store username for display purposes
        localStorage.setItem("username", username);
        localStorage.setItem("userEmail", username);

        // Get user details to determine role
        try {
          const userResponse = await fetch(`${apiUrl}/api/v1/auth/me`, {
            method: "GET",
            headers: {
              "Authorization": `Bearer ${data.access_token}`,
              "Content-Type": "application/json",
            },
          });

          if (userResponse.ok) {
            const userData = await userResponse.json();
            console.log("User data:", userData);
            
            // Store user role from API response
            const userRole = userData.role || "staff"; // Default to staff if role not found
            localStorage.setItem("userRole", userRole);
            
            // Show success message
            setSuccess("Login successful! Redirecting...");

            // Redirect based on user role
            console.log("User role:", userRole);
            setTimeout(() => {
              try {
                if (userRole === "admin") {
                  navigate("/admin-dashboard");
                } else {
                  navigate("/staff-dashboard");
                }
              } catch (navError) {
                console.error("Navigation error:", navError);
                // Fallback to window.location if navigate fails
                if (userRole === "admin") {
                  window.location.href = "/admin-dashboard";
                } else {
                  window.location.href = "/staff-dashboard";
                }
              }
            }, 100);
          } else {
            // If /me endpoint fails, default to staff role
            console.warn("Failed to get user details, defaulting to staff role");
            localStorage.setItem("userRole", "staff");
            setSuccess("Login successful! Redirecting...");
            
            setTimeout(() => {
              try {
                navigate("/staff-dashboard");
              } catch (navError) {
                console.error("Navigation error:", navError);
                window.location.href = "/staff-dashboard";
              }
            }, 100);
          }
        } catch (userError) {
          console.error("Error fetching user details:", userError);
          // Default to staff role if user details fetch fails
          localStorage.setItem("userRole", "staff");
          setSuccess("Login successful! Redirecting...");
          
          setTimeout(() => {
            try {
              navigate("/staff-dashboard");
            } catch (navError) {
              console.error("Navigation error:", navError);
              window.location.href = "/staff-dashboard";
            }
          }, 100);
        }
      } else {
        // Handle authentication errors
        if (response.status === 401) {
          setError("Invalid username or password. Please try again.");
        } else if (response.status === 422) {
          // Handle validation errors
          console.log("Validation error details:", data);
          if (data.detail) {
            if (Array.isArray(data.detail)) {
              const errorMessages = data.detail.map((error: any) => 
                error.msg || error.message || error
              );
              setError(errorMessages.join(", "));
            } else {
              setError(data.detail.msg || data.detail.message || data.detail);
            }
          } else if (data.errors) {
            // Handle errors object format
            const errorMessages = Object.values(data.errors).flat();
            setError(errorMessages.join(", "));
          } else {
            setError("Validation failed. Please check your input.");
          }
        } else {
          setError(data.message || "Login failed. Please try again.");
        }
      }
    } catch (error) {
      console.error("Login error:", error);
      setError("Network error. Please check your connection and try again.");
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-playfair">Welcome Back</CardTitle>
            <CardDescription>Sign in to your Laila's Cakes account</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              
              {success && (
                <Alert className="border-green-200 bg-green-50 text-green-800">
                  <AlertDescription>{success}</AlertDescription>
                </Alert>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="Enter your username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full"
                variant="hero"
                disabled={isLoading}
              >
                {isLoading ? "Signing in..." : "Sign In"}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                Don't have an account?{" "}
                <Link 
                  to="/signup" 
                  className="text-primary hover:underline font-medium"
                >
                  Sign up
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Login;