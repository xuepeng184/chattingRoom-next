import { NextRouter, useRouter } from "next/router"

export function routerBeforeEach(router: NextRouter) {
    if (!sessionStorage.getItem('token')) {
        router.push('/')
    }
} 