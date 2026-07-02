import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function proxy(request: NextRequest) {
    let supabaseResponse = NextResponse.next({ request });

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll();
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value }) =>
                        request.cookies.set(name, value)
                    );
                    supabaseResponse = NextResponse.next({ request });
                    cookiesToSet.forEach(({ name, value, options }) =>
                        supabaseResponse.cookies.set(name, value, options)
                    );
                },
            },
        }
    );

    // Refresh the auth session (keeps cookies valid)
    await supabase.auth.getUser();

    // ── AUTH GUARDS DISABLED FOR UI DEVELOPMENT ──
    // Uncomment the blocks below when ready for production.

    // // Protected routes — redirect to login if not authenticated
    // const protectedPaths = ['/dashboard', '/chat', '/settings', '/analytics', '/history', '/consult', '/dravya-id', '/profile', '/treatment', '/feedback'];
    // const isProtectedRoute = protectedPaths.some(path =>
    //     request.nextUrl.pathname.startsWith(path)
    // );
    // if (isProtectedRoute && !user) {
    //     const url = request.nextUrl.clone();
    //     url.pathname = '/auth/login';
    //     return NextResponse.redirect(url);
    // }

    // // Redirect authenticated users away from auth pages
    // const authPaths = ['/auth/login', '/auth/signup', '/signup'];
    // const isAuthRoute = authPaths.some(path =>
    //     request.nextUrl.pathname.startsWith(path)
    // );
    // if (isAuthRoute && user) {
    //     const url = request.nextUrl.clone();
    //     url.pathname = '/dashboard';
    //     return NextResponse.redirect(url);
    // }

    return supabaseResponse;
}

export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
};

