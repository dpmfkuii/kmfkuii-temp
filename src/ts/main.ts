// firebase
interface Firebase {
    database(): {
        ref(path?: string): FirebaseDatabase
    }
}

interface FirebaseDatabase {
    child(path: string): FirebaseDatabase
    set(value: any): Promise<any>
    get<T = any>(): Promise<FirebaseSnapshot<T>>
    push(value: any): Promise<{ key: string }>
    on<T = any>(type: 'value', callback: (snapshot: FirebaseSnapshot<T>) => void): Promise<any>
    off(callback: () => void): void
    once<T = any>(type: 'value'): Promise<FirebaseSnapshot<T>>
}

interface FirebaseSnapshot<T = any> {
    exists(): boolean
    val(): T
}

declare const firebase: Firebase
const db = firebase.database()

// animate system
setTimeout(() => {
    for (const animation_name of [
        'fade-on-enter',
        'rise-on-enter',
    ]) {
        document
            .querySelectorAll(`.animate.animate-${animation_name}`)
            .forEach((el) => {
                el.classList.remove(`animate-${animation_name}`)
            })
    }
}, 100)
