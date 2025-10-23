import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
  beforeLoad: () => {
    // Check if user is authenticated by looking at localStorage
    const accessToken = localStorage.getItem('accessToken')
    if (!accessToken) {
      throw redirect({ to: '/login' })
    }
    console.log('accessToken accessToken')
  },
  component: () => {
    // Redirect to dashboard if authenticated
    throw redirect({ to: '/dashboard' })
  },
})
