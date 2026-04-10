'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { signIn } from 'next-auth/react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

const loginSchema = z.object({
  email: z.string().email('请输入有效的邮箱地址'),
  password: z.string().min(6, '密码至少6个字符'),
})

const registerSchema = z.object({
  name: z.string().min(2, '姓名至少2个字符'),
  email: z.string().email('请输入有效的邮箱地址'),
  password: z.string().min(6, '密码至少6个字符'),
})

type LoginFormData = z.infer<typeof loginSchema>
type RegisterFormData = z.infer<typeof registerSchema>

export default function LoginPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  })

  const registerForm = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  })

  const handleLogin = async (data: LoginFormData) => {
    setLoading(true)
    setError('')

    try {
      const result = await signIn('credentials', {
        email: data.email,
        password: data.password,
        redirect: false,
      })

      if (result?.error) {
        setError('邮箱或密码错误')
      } else {
        router.push('/')
        router.refresh()
      }
    } catch (err) {
      setError('登录失败，请稍后重试')
    } finally {
      setLoading(false)
    }
  }

  const handleRegister = async (data: RegisterFormData) => {
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (res.ok) {
        const result = await signIn('credentials', {
          email: data.email,
          password: data.password,
          redirect: false,
        })

        if (result?.error) {
          setError('注册成功，请手动登录')
        } else {
          router.push('/')
          router.refresh()
        }
      } else {
        const err = await res.json()
        setError(err.error || '注册失败')
      }
    } catch (err) {
      setError('注册失败，请稍后重试')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4 relative overflow-hidden">
      <div
        className="absolute inset-0 opacity-[0.015]"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
          backgroundSize: '40px 40px',
        }}
      />

      <Card className="w-full max-w-md bg-white/[0.03] backdrop-blur-[30px] border-white/[0.08] shadow-[0_8px_40px_rgba(0,0,0,0.4)] relative overflow-hidden before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-white/[0.12] before:to-transparent">
        <CardHeader className="text-center pb-2">
          <div className="w-14 h-14 rounded-[14px] flex items-center justify-center mx-auto mb-4 bg-gradient-to-br from-white/[0.08] to-white/[0.03] border border-white/[0.12] relative overflow-hidden">
            <span className="text-xl font-bold bg-gradient-to-br from-white to-white/60 bg-clip-text text-transparent">V</span>
          </div>
          <CardTitle className="text-2xl text-white/90 tracking-tight">Vibe Kanban</CardTitle>
          <CardDescription className="text-white/35 text-sm">项目管理看板工具</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-white/[0.03] border border-white/[0.06] p-1 h-10">
              <TabsTrigger 
                value="login" 
                className="data-[state=active]:bg-white/[0.08] data-[state=active]:text-white/90 data-[state=active]:border data-[state=active]:border-white/[0.08] text-white/45 transition-all duration-200 rounded-lg"
              >
                登录
              </TabsTrigger>
              <TabsTrigger 
                value="register" 
                className="data-[state=active]:bg-white/[0.08] data-[state=active]:text-white/90 data-[state=active]:border data-[state=active]:border-white/[0.08] text-white/45 transition-all duration-200 rounded-lg"
              >
                注册
              </TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <form onSubmit={loginForm.handleSubmit(handleLogin)} className="space-y-4 mt-5">
                <div className="space-y-2">
                  <Label htmlFor="login-email" className="text-white/65 text-sm font-medium">邮箱</Label>
                  <Input id="login-email" type="email" placeholder="your@email.com" {...loginForm.register('email')} />
                  {loginForm.formState.errors.email && (
                    <p className="text-sm text-red-400">{loginForm.formState.errors.email.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="login-password" className="text-white/65 text-sm font-medium">密码</Label>
                  <Input id="login-password" type="password" placeholder="••••••" {...loginForm.register('password')} />
                  {loginForm.formState.errors.password && (
                    <p className="text-sm text-red-400">{loginForm.formState.errors.password.message}</p>
                  )}
                </div>
                {error && <p className="text-sm text-red-400 text-center">{error}</p>}
                <Button type="submit" className="w-full h-10" disabled={loading}>
                  {loading ? '登录中...' : '登录'}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="register">
              <form onSubmit={registerForm.handleSubmit(handleRegister)} className="space-y-4 mt-5">
                <div className="space-y-2">
                  <Label htmlFor="register-name" className="text-white/65 text-sm font-medium">姓名</Label>
                  <Input id="register-name" placeholder="您的姓名" {...registerForm.register('name')} />
                  {registerForm.formState.errors.name && (
                    <p className="text-sm text-red-400">{registerForm.formState.errors.name.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="register-email" className="text-white/65 text-sm font-medium">邮箱</Label>
                  <Input id="register-email" type="email" placeholder="your@email.com" {...registerForm.register('email')} />
                  {registerForm.formState.errors.email && (
                    <p className="text-sm text-red-400">{registerForm.formState.errors.email.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="register-password" className="text-white/65 text-sm font-medium">密码</Label>
                  <Input id="register-password" type="password" placeholder="••••••" {...registerForm.register('password')} />
                  {registerForm.formState.errors.password && (
                    <p className="text-sm text-red-400">{registerForm.formState.errors.password.message}</p>
                  )}
                </div>
                {error && <p className="text-sm text-red-400 text-center">{error}</p>}
                <Button type="submit" className="w-full h-10" disabled={loading}>
                  {loading ? '注册中...' : '注册'}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
