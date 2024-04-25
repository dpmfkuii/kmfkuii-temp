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
    make_uid(length?: number): string
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
    make_uid(length = 10) {
        // why the change?
        // somehow this `auth.seeded_uid(new Date(1714041210563))` returns 0.25 (to short)
        // the new `make_uid` make sure the length is always 10

        const characters = 'abcdefghijklmnopqrstuvwxyz0123456789'
        let result = ''
        let counter = 0

        while (counter < length) {
            result += characters.charAt(Math.floor(Math.random() * characters.length))
            counter += 1
        }

        const uid = result.split('')
        if (length >= 10) {
            uid.splice(7, 0, '-')
            uid.splice(4, 0, '-')
        }

        return uid.join('')
    },
    async register(user) {
        let status: AuthRegisterStatus = AuthRegisterStatus.SUCCESS
        const db_new_user = main_db.ref(`users/${user.uid}`)
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
        await main_db.ref(`users/${uid}`).once<User>('value').then(snap => {
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
