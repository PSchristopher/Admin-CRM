import { createRootRoute, Outlet } from '@tanstack/react-router'
// import { TanStackRouterDevtools } from '@tanstack/router-devtools'
import AuthProvider from '../providers/AuthProvider.jsx'

export const Route = createRootRoute({
  component: () => (
    <AuthProvider>
      <Outlet />
      {/* <TanStackRouterDevtools /> */}
    </AuthProvider>
  ),
})
