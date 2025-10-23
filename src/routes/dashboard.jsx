import { createFileRoute, redirect } from '@tanstack/react-router'
import Layout from '../components/layout/Layout.jsx'

export const Route = createFileRoute('/dashboard')({
  beforeLoad: () => {
    // Check authentication
    const accessToken = localStorage.getItem('accessToken')
    if (!accessToken) {
      throw redirect({ to: '/login' })
    }
  },
  component: Layout,
})
