'use client';

import React from "react"

import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useAuth } from '@/contexts/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, User, Lock, Loader2 } from 'lucide-react';
import logo from '@/assets/logo2.png';

const loginSchema = yup.object({
  employeeNumber: yup
    .string()
    .required('El número de empleado es obligatorio.')
    .matches(/^\d+$/, 'El número de empleado debe contener solo números.')
    .min(3, 'El número de empleado debe tener al menos 3 dígitos.'),
  password: yup
    .string()
    .required('La contraseña es obligatoria.')
    .min(6, 'La contraseña debe tener al menos 6 caracteres.'),
});

type LoginFormValues = yup.InferType<typeof loginSchema>;

function LoginPage() {
  const { login, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [formError, setFormError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: yupResolver(loginSchema),
    defaultValues: {
      employeeNumber: '',
      password: '',
    },
  });

  const from = location.state?.from?.pathname || '/';

  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, isLoading, navigate, from]);

  const onSubmit = async (values: LoginFormValues) => {
    setFormError('');

    try {
      const success = await login(values.employeeNumber, values.password);

      if (success) {
        navigate(from, { replace: true });
      } else {
        setFormError('Credenciales incorrectas. Verifica tu número de empleado y contraseña.');
      }
    } catch (err) {
      console.error('Error crítico en login:', err);
      setFormError('Ocurrió un error inesperado. Por favor intenta más tarde.');
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md shadow-lg border-gray-200 dark:border-gray-800">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center">
            <img src={logo} alt="Logo" className="
          w-40 h-40 
          md:w-36 md:h-36
          object-contain 
          rounded-full 
          shadow-lg
        "/>
          </div>
          <CardTitle className="text-xl sm:text-2xl font-bold tracking-tight">Bienvenido</CardTitle>
          <CardDescription className="text-sm text-muted-foreground">Sistema de Gestión de Mantenimiento</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="employeeNumber" className="text-sm font-medium">
                Número de Empleado
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground/60" />
                <Input
                  id="employeeNumber"
                  type="text"
                  placeholder="Ej: 1001"
                  {...register('employeeNumber')}
                  className="pl-10 h-11"
                  disabled={isSubmitting}
                  autoComplete="username"
                  autoFocus
                  aria-invalid={!!errors.employeeNumber}
                />
              </div>
              {errors.employeeNumber && (
                <p className="text-xs text-destructive">{errors.employeeNumber.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground/60" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  {...register('password')}
                  className="pl-10 h-11"
                  disabled={isSubmitting}
                  autoComplete="current-password"
                  aria-invalid={!!errors.password}
                />
              </div>
              {errors.password && (
                <p className="text-xs text-destructive">{errors.password.message}</p>
              )}
            </div>

            {formError && (
              <Alert variant="destructive" className="animate-in fade-in slide-in-from-top-2">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{formError}</AlertDescription>
              </Alert>
            )}

            <Button
              type="submit"
              className="w-full h-11 text-base font-medium shadow-sm hover:shadow-md transition-all"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                </>
              ) : (
                'Iniciar Sesión'
              )}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col gap-2 border-t pt-6 text-center text-xs text-muted-foreground">
          <p>¿Olvidaste tu contraseña? Contacta al Administrador.</p>
        </CardFooter>
      </Card>
    </div>
  );
}

export default LoginPage;
