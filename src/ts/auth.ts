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
    seeded_uid(seed?: number): string
    /**
     * make sure firebase is loaded
     */
    register(user: User): Promise<AuthRegisterStatus>
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

enum AuthRegisterStatus {
    SUCCESS,
    ALREADY_EXISTS,
    ERROR,
}

const auth: AuthController = {
    seeded_uid(seed = Date.now()) {
        // https://en.wikipedia.org/wiki/Linear_congruential_generator
        seed = ((seed * 9301 + 49297) % 233280) / 233280 * 10000000000
        const n = seed.toString().split('.')[0].split('')
        n.splice(7, 0, '-')
        n.splice(4, 0, '-')

        const uid = common.scramble_numbers(n.join(''))
        return uid
    },
    async register(user) {
        let status: AuthRegisterStatus = AuthRegisterStatus.SUCCESS
        const db_new_user = db.ref(`users/${user.uid}`)
        await db_new_user.once<User>('value').then(snap => {
            if (snap.exists()) {
                status = AuthRegisterStatus.ALREADY_EXISTS
            }
        })
        if (status === AuthRegisterStatus.SUCCESS) {
            await db_new_user.set(user).catch(() => {
                status = AuthRegisterStatus.ERROR
            })
        }
        return status
    },
    async login(uid, auto_redirect = true) {
        let user = null
        await db.ref(`users/${uid}`).once<User>('value').then(snap => {
            if (snap.exists()) {
                user = snap.val()
                store.set_local_item(defines.store_key.user, JSON.stringify(user))
                if (auto_redirect) {
                    this.redirect_home(user.role)
                }
            }
        })
        return user
    },
    logout(redirect_path = '/') {
        store.remove_local_item(defines.store_key.user)
        location.href = redirect_path
    },
    get_logged_in_user() {
        const value = store.get_local_item(defines.store_key.user)
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
