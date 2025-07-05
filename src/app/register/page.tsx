'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Shield } from 'lucide-react';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { collection, addDoc } from 'firebase/firestore';
import { useTranslation } from 'react-i18next';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { auth, db } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';
import { ROLES } from '@/lib/permissions';

const registerSchema = z.object({
  name: z.string().min(1, 'الاسم مطلوب.'),
  email: z.string().email('البريد الإلكتروني غير صحيح.'),
  password: z.string().min(6, 'كلمة المرور يجب أن تكون 6 أحرف على الأقل.'),
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: '', email: '', password: '' },
  });

  const handleRegister = async (values: RegisterFormValues) => {
    setIsLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, values.email, values.password);
      const user = userCredential.user;
      
      await updateProfile(user, { displayName: values.name });

      await addDoc(collection(db, 'users'), {
        name: values.name,
        email: values.email,
        role: ROLES.QUALITY_OFFICER, // Default role for self-registered users
        status: 'active',
      });

      toast({
        title: t('auth.toasts.registerSuccess'),
        description: t('auth.toasts.registerSuccessDesc'),
      });

      router.push('/');
    } catch (error: any) {
      console.error("Registration failed:", error);
      let description = t('auth.toasts.registerFailed');
      if (error.code === 'auth/email-already-in-use') {
        description = t('auth.toasts.emailInUse');
      }
      toast({
        variant: 'destructive',
        title: t('common.error'),
        description: description,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-sm">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleRegister)}>
          <CardHeader className="text-center">
            <div className="flex justify-center items-center mb-4">
                <Shield className="h-10 w-10 text-primary" />
            </div>
            <CardTitle className="text-2xl">{t('auth.registerTitle')}</CardTitle>
            <CardDescription>{t('auth.registerDescription')}</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('auth.nameLabel')}</FormLabel>
                  <FormControl>
                    <Input placeholder={t('auth.namePlaceholder')} {...field} disabled={isLoading} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('auth.emailLabel')}</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder={t('auth.emailPlaceholder')} {...field} disabled={isLoading} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('auth.passwordLabel')}</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="••••••••" {...field} disabled={isLoading} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter className="flex-col gap-2">
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? t('auth.submittingRegister') : t('auth.submitRegister')}
            </Button>
            <div className="mt-2 text-center text-sm">
                {t('auth.hasAccount')}{' '}
                <Link href="/login" className="underline">
                    {t('auth.loginHere')}
                </Link>
            </div>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
