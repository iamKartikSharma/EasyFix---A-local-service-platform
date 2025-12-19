
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
    let supabaseResponse = NextResponse.next({
        request,
    })

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll()
                },
                setAll(cookiesToSet: any) {
                    cookiesToSet.forEach(({ name, value, options }: any) =>
                        request.cookies.set(name, value)
                    )
                    supabaseResponse = NextResponse.next({
                        request,
                    })
                    cookiesToSet.forEach(({ name, value, options }: any) =>
                        supabaseResponse.cookies.set(name, value, options)
                    )
                },
            },
        }
    )

    // IMPORTANT: Avoid writing any logic between createServerClient and
    // supabase.auth.getUser(). A simple mistake could make it very hard to debug
    // issues with users being randomly logged out.

    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (
        !user &&
        !request.nextUrl.pathname.startsWith('/login') &&
        !request.nextUrl.pathname.startsWith('/auth') &&
        !request.nextUrl.pathname.startsWith('/signup') &&
        request.nextUrl.pathname.startsWith('/dashboard')
    ) {
        // no user, potentially respond by redirecting the user to the login page
        const url = request.nextUrl.clone()
        url.pathname = '/login'
        return NextResponse.redirect(url)
    }

    // Role-Based Route Protection
    if (user) {
        const role = user.user_metadata.role;
        const url = request.nextUrl.clone();

        if (request.nextUrl.pathname.startsWith('/dashboard/provider') && role !== 'provider') {
            // If not a provider, kick them to their actual dashboard
            if (role === 'customer') url.pathname = '/dashboard/customer';
            else if (role === 'admin') url.pathname = '/dashboard/admin';
            return NextResponse.redirect(url);
        }

        if (request.nextUrl.pathname.startsWith('/dashboard/customer') && role !== 'customer') {
            // If not a customer, kick them to their actual dashboard
            if (role === 'provider') url.pathname = '/dashboard/provider';
            else if (role === 'admin') url.pathname = '/dashboard/admin';
            return NextResponse.redirect(url);
        }

        // Add admin protection if needed
        if (request.nextUrl.pathname.startsWith('/dashboard/admin') && role !== 'admin') {
            if (role === 'customer') url.pathname = '/dashboard/customer';
            else if (role === 'provider') url.pathname = '/dashboard/provider';
            return NextResponse.redirect(url);
        }
    }

    return supabaseResponse
}
