import { createFileRoute, redirect } from '@tanstack/react-router'
import Login from '../pages/login/Login.jsx'

export const Route = createFileRoute('/login')({
  beforeLoad: () => {
    // If already authenticated, redirect to dashboard
    const accessToken = localStorage.getItem('accessToken')
    if (accessToken) {
      throw redirect({ to: '/dashboard' })
    }
  },
  component: Login,
})
