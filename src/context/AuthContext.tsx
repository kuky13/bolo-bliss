
import React, { createContext, useContext, useState, useEffect } from "react";
import { User, Session } from '@supabase/supabase-js';
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface AuthContextType {
  currentUser: User | null;
  session: Session | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isRoleLoading, setIsRoleLoading] = useState(false);

  // Inicializar sessão (sem deadlock) e ouvir mudanças de auth
  useEffect(() => {
    let mounted = true;

    // 1) Listener: NUNCA async e NUNCA chama Supabase dentro do callback
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, nextSession) => {
      if (!mounted) return;

      console.log("Auth state changed:", event, nextSession?.user?.email);

      setSession(nextSession);
      setCurrentUser(nextSession?.user ?? null);
      setIsAdmin(false);
      setIsRoleLoading(!!nextSession?.user);
      setIsLoading(false);
    });

    // 2) Carregar sessão existente
    (async () => {
      try {
        const {
          data: { session: existingSession },
        } = await supabase.auth.getSession();

        if (!mounted) return;

        console.log("Existing session found:", existingSession?.user?.email);
        setSession(existingSession);
        setCurrentUser(existingSession?.user ?? null);
        setIsRoleLoading(!!existingSession?.user);
      } catch (e) {
        console.error("Erro ao recuperar sessão:", e);
      } finally {
        if (mounted) setIsLoading(false);
      }
    })();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // Checar role fora do onAuthStateChange (evita loop/deadlock)
  useEffect(() => {
    if (!currentUser) {
      setIsAdmin(false);
      setIsRoleLoading(false);
      return;
    }

    let cancelled = false;
    setIsRoleLoading(true);

    const t = window.setTimeout(() => {
      (async () => {
        try {
          const { data, error } = await supabase.rpc("has_role", { _role: "admin" });

          if (cancelled) return;

          if (error) {
            console.error("Erro ao verificar role:", error);
            setIsAdmin(false);
            return;
          }

          setIsAdmin(!!data);
        } catch (e) {
          if (!cancelled) {
            console.error("Erro ao verificar role:", e);
            setIsAdmin(false);
          }
        } finally {
          if (!cancelled) setIsRoleLoading(false);
        }
      })();
    }, 0);

    return () => {
      cancelled = true;
      window.clearTimeout(t);
    };
  }, [currentUser?.id]);

  // Login com Supabase
  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      console.log("Tentando fazer login com:", email);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) {
        throw error;
      }
      
      console.log("Login bem-sucedido:", data.user?.email);
      
      // O onAuthStateChange já vai verificar se o usuário é admin
      // e definir os estados adequadamente
      
      toast.success("Login realizado com sucesso!");
      return true;
    } catch (error: any) {
      console.error("Erro no login:", error.message);
      
      // Mensagens de erro mais amigáveis
      let errorMessage = "Erro ao fazer login";
      if (error.message.includes("Invalid login credentials")) {
        errorMessage = "Email ou senha incorretos";
      } else if (error.message.includes("Email not confirmed")) {
        errorMessage = "Confirme seu email antes de fazer login";
      } else if (error.message.includes("Too many requests")) {
        errorMessage = "Muitas tentativas. Tente novamente mais tarde";
      }
      
      toast.error(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Logout com Supabase
  const logout = async () => {
    try {
      console.log("Fazendo logout...");
      await supabase.auth.signOut();
      toast.info("Logout realizado com sucesso");
    } catch (error: any) {
      console.error("Erro no logout:", error.message);
      toast.error("Erro ao fazer logout");
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        session,
        login,
        logout,
        isAuthenticated: !!currentUser,
        isAdmin,
        isLoading: isLoading || isRoleLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
