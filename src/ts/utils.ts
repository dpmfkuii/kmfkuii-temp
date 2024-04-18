const dom = {
    q<K extends keyof HTMLElementTagNameMap>(selectors: K | string): HTMLElementTagNameMap[K] | null {
        return document.querySelector(selectors)
    },
    qe<K extends keyof HTMLElementTagNameMap>(el: HTMLElement, selectors: K | string): HTMLElementTagNameMap[K] | null {
        return el.querySelector(selectors)
    },
    qa<K extends keyof HTMLElementTagNameMap>(selectors: K | string, to_array?: boolean): NodeListOf<HTMLElementTagNameMap[K]> | HTMLElementTagNameMap[K][] {
        if (to_array) {
            const arr: HTMLElementTagNameMap[K][] = []
            document.querySelectorAll(selectors).forEach(item => {
                arr.push(item as HTMLElementTagNameMap[K])
            })
            return arr
        }
        return document.querySelectorAll(selectors)
    },
    qea<K extends keyof HTMLElementTagNameMap>(el: HTMLElement, selectors: K | string): NodeListOf<HTMLElementTagNameMap[K]> {
        return el.querySelectorAll(selectors)
    },
    disable(...elements: HTMLElement[]) {
        for (const el of elements) {
            el.setAttribute('disabled', '')
            el.classList.add('disabled')
        }
    },
    enable(...elements: HTMLElement[]) {
        for (const el of elements) {
            if (el.hasAttribute('disabled')) {
                el.removeAttribute('disabled')
            }
            el.classList.remove('disabled')
        }
    },
    c<K extends keyof HTMLElementTagNameMap>(tag_name: K, options?: {
        classes?: string[],
        attributes?: { [name: string]: string },
        html?: string,
        children?: Node[],
    }): HTMLElementTagNameMap[K] {
        const el = document.createElement(tag_name)
        if (options) {
            if (options.classes) el.classList.add(...options.classes)
            if (options.attributes) {
                for (const name in options.attributes) {
                    el.setAttribute(name, options.attributes[name])
                }
            }
            if (options.html) el.innerHTML = options.html
            if (options.children) {
                for (const child of options.children) {
                    el.appendChild(child)
                }
            }
        }
        return el
    },
    get_input_radio_value(name: string) {
        let value = ''
        this.qa<'input'>(`input[name="${name}"]`).forEach(n => {
            if (n.checked) value = n.value
        })
        return value
    },
}

const common = {
    url_params: new URLSearchParams(window.location.search),
    timestamp() {
        return Date.now()
    },
    sleep(ms: number) {
        return new Promise(r => setTimeout(r, ms))
    },
    scramble_number(n: string) {
        const scramble_list: { [n: string]: string } = {
            0: 'qwe',
            1: 'rty',
            2: 'uio',
            3: 'pas',
            4: 'dfg',
            5: 'hjk',
            6: 'lz',
            7: 'xc',
            8: 'vb',
            9: 'nm',
        }
        return scramble_list[n]
            ? scramble_list[n][Math.floor(Math.random() * scramble_list[n].length)]
            : n
    },
    scramble_numbers(string_with_numbers: string) {
        const n = string_with_numbers.split('')
        for (let i = 0; i < n.length; i++) {
            if (Math.random() > 0.5) {
                n[i] = this.scramble_number(n[i])
            }
        }
        return n.join('')
    },
    convert_date_string_to_text(date_string: string) {
        const split = date_string.split('-')
        const yyyy = split[0]
        const mm = split[1]
        const dd = split[2]
        const d = new Date(date_string).getDay()
        return `${defines.day_names[d]}, ${dd} ${defines.month_names[mm]} ${yyyy}`
    },
    /**
     * @returns yyyy-mm-dd
     */
    to_date_string(date: Date) {
        const m = date.getMonth() + 1
        const mm = m < 10 ? `0${m}` : m
        const d = date.getDate()
        const dd = d < 10 ? `0${d}` : d
        return `${date.getFullYear()}-${mm}-${dd}`
    },
    /**
     * Returns true if `date1` < `date2`
     * @param date1 
     * @param date2 
     */
    is_date_before(date1: Date, date2: Date) {
        const sum1 = date1.getFullYear() + ((date1.getMonth() + 1) * 100) + date1.getDate()
        const sum2 = date2.getFullYear() + ((date2.getMonth() + 1) * 100) + date2.getDate()
        return sum1 < sum2
    },
    get_shortened_time(date: Date) {
        const s = date.toLocaleTimeString()
        return `${s.substring(0, 5)} ${s.split(' ')[1]}`
    },
}

declare const CryptoJS: any

const store = {
    passphrase: 'store',
    set_item(key: string, value: string, storage: Storage = sessionStorage) {
        storage.setItem(
            CryptoJS.MD5(key).toString(),
            CryptoJS.AES.encrypt(value, this.passphrase)
        )
    },
    get_item(key: string, storage: Storage = sessionStorage): string | null {
        const value = storage.getItem(CryptoJS.MD5(key).toString())
        return value !== null
            ? CryptoJS.AES.decrypt(value, this.passphrase).toString(CryptoJS.enc.Utf8)
            : null
    },
    remove_item(key: string, storage: Storage = sessionStorage) {
        storage.removeItem(CryptoJS.MD5(key).toString())
    },
    set_local_item(key: string, value: string) {
        this.set_item(key, value, localStorage)
    },
    get_local_item(key: string): string | null {
        return this.get_item(key, localStorage)
    },
    remove_local_item(key: string) {
        this.remove_item(key, localStorage)
    },
}
