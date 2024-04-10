// auth system
interface User {
    uid: string
    role: UserRole
}

enum UserRole {
    ADMIN = 'Admin',
    PENGURUS = 'Pengurus',
    /**
     * Guest is a fallback/default value, not stored in database
     */
    GUEST = 'Guest',
}

interface AuthController {
    /**
     * make sure firebase is loaded
     */
    login(uid: string, auto_redirect?: boolean): Promise<User | null>
    logout(redirect_path?: string): void
    get_logged_in_user(): User | null
    redirect_home(role?: UserRole): void
    /**
     * Validate allowed roles of the page and auto redirect
     * home if given role is not allowed to see the page
     */
    as(...allowed_roles: UserRole[]): void
}

const auth: AuthController = {
    async login(uid, auto_redirect = true) {
        let user = null
        await db.ref(`users/${uid}`).once<User>('value').then(snap => {
            if (snap.exists()) {
                user = snap.val()
                localStorage.setItem(defines.store_key.user, JSON.stringify(user))
                if (auto_redirect) {
                    this.redirect_home(user.role)
                }
            }
        })
        return user
    },
    logout(redirect_path = '/') {
        localStorage.removeItem(defines.store_key.user)
        location.href = redirect_path
    },
    get_logged_in_user() {
        const value = localStorage.getItem(defines.store_key.user)
        if (value !== null) {
            const stored_user = JSON.parse(value) as User
            if (stored_user.uid && stored_user.role) {
                return stored_user
            }
        }
        return null
    },
    redirect_home(role) {
        switch (role) {
            case UserRole.ADMIN:
                location.replace('/admin/')
                break
            case UserRole.PENGURUS:
                location.replace('/urus/')
                break
            case UserRole.GUEST:
                location.replace('/')
                break
            default:
                location.replace('/')
                break
        }
    },
    as(...allowed_roles) {
        let role = UserRole.GUEST

        const logged_in_user = this.get_logged_in_user()
        if (logged_in_user !== null) {
            role = logged_in_user.role
        }

        if (!allowed_roles.includes(role)) {
            this.redirect_home(role)
        }
    },
}
