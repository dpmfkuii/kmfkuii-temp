interface EventsMap {
    on_resize: UIEvent
}

// add events by doing this
// interface EventsMap {
//     load_rapat_done: {
//         amount: number,
//     }
// }

interface Events {
    /**
     * CAREFUL: `_list[name]` might be empty
     * 
     * use `events.get_callbacks(name)` instead
     */
    _list: { [T in keyof EventsMap]: ((event: EventsMap[T]) => any)[] }
    get_callbacks<T extends keyof EventsMap>(event_name: T): Events['_list'][T]
    on<T extends keyof EventsMap>(event_name: T, callback: (event: EventsMap[T]) => any): (event: EventsMap[T]) => any
    off<T extends keyof EventsMap>(event_name: T, callback: (event: EventsMap[T]) => any): void
    trigger<T extends keyof EventsMap>(event_name: T, event: EventsMap[T]): void
}

const events: Events = {
    _list: {} as any,
    get_callbacks(name) {
        return this._list[name] || []
    },
    on(name, callback) {
        this._list[name] = this._list[name] || []
        this._list[name].push(callback)
        return callback
    },
    off(name, callback) {
        if (this._list[name]) {
            for (let i = this._list[name].length - 1; i >= 0; i--) {
                if (this._list[name][i] === callback) {
                    this._list[name].splice(i, 1)
                    return
                }
            }
        }
    },
    trigger(name, event) {
        if (this._list[name]) {
            for (const callback of this._list[name]) {
                callback.apply(this, [event])
            }
        }
    },
}

window.addEventListener('resize', ev => {
    events.trigger('on_resize', ev)
})

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
        text?: string,
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
            else if (options.text) el.textContent = options.text
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
    hide(...elements: HTMLElement[]) {
        for (const el of elements) {
            el.classList.add('visually-hidden')
        }
    },
    show(...elements: HTMLElement[]) {
        for (const el of elements) {
            el.classList.remove('visually-hidden')
        }
    },
}

enum Day {
    Sunday = 0,
    Monday,
    Tuesday,
    Wednesday,
    Thursday,
    Friday,
    Saturday,
}

const common = {
    url_params: new URLSearchParams(window.location.search),
    timestamp() {
        return Date.now()
    },
    today_is(day: Day) {
        return new Date().getDay() === day
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
    /**
     * @returns Mm yyyy
     */
    date_to_month_year_text(date: Date) {
        const m = date.getMonth() + 1
        const mm = m < 10 ? `0${m}` : m
        return `${defines.month_names[mm]} ${date.getFullYear()}`
    },
    /**
     * @returns dd
     */
    date_to_dd_text(date: Date) {
        const d = date.getDate()
        return `${d < 10 ? `0${d}` : d}`
    },
    date_string_to_date_text(date_string: string) {
        const split = date_string.split('-')
        const yyyy = split[0]
        const mm = split[1]
        const dd = split[2]
        const d = new Date(date_string).getDay()
        return `${defines.day_names[d]}, ${dd} ${defines.month_names[mm]} ${yyyy}`
    },
    date_string_to_date_text_date(date_string: string) {
        return this.date_string_to_date_text(date_string).split(', ')[1]
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
    to_date_text(date: Date) {
        return this.date_string_to_date_text(this.to_date_string(date))
    },
    to_date_text_date(date: Date) {
        return this.date_string_to_date_text_date(this.to_date_string(date))
    },
    /**
     * 
     * @param date 
     * @returns hh.mm
     */
    get_pukul_text(date: Date) {
        const d = date.toTimeString().split(':')
        return `${d[0]}.${d[1]}`
    },
    to_date_pukul_text(date: Date) {
        return `${this.date_string_to_date_text(this.to_date_string(date))} pukul ${this.get_pukul_text(date)} WIB`
    },
    /**
     * Returns true if `date1` < `date2`
     * @param date1 
     * @param date2 
     */
    is_date_before(date1: Date, date2: Date) {
        const sum1 = date1.getFullYear() * 10000 + ((date1.getMonth() + 1) * 100) + date1.getDate()
        const sum2 = date2.getFullYear() * 10000 + ((date2.getMonth() + 1) * 100) + date2.getDate()
        return sum1 < sum2
    },
    to_12h_format(date: Date) {
        let hh = date.getHours()
        const mm = date.getMinutes()
        const f = hh >= 12 ? 'PM' : 'AM'
        hh = hh % 12
        hh = hh ? hh : 12
        return `${hh}:${mm < 10 ? '0' : ''}${mm} ${f}`
    },
    get_current_monday(from_date: Date = new Date()) {
        const d = new Date(from_date)
        const day = d.getDay()
        d.setDate(d.getDate() - (day === 0 ? 6 : day - 1))
        return d
    },
    get_next_monday(from_date: Date = new Date(), multiply: number = 1) {
        const d = new Date(from_date)
        d.setDate(d.getDate() + (((1 + 7 - d.getDay()) % 7) || 7) + (7 * (multiply - 1)))
        return d
    },
    add_date_new(date: Date, value: number) {
        const d = new Date(date)
        d.setDate(d.getDate() + value)
        return d
    },
    get_difference_in_days(date1: Date, date2: Date) {
        return Math.round((date2.getTime() - date1.getTime()) / (1000 * 3600 * 24))
    },
    copy(data: string) {
        return navigator.clipboard.writeText(data)
    },
    text_break_to_html(text: string) {
        return text.replaceAll('\n', '<br />')
    },
    remove_extra_spaces(text: string) {
        return text.replace(/\s+/g, ' ').trim()
    },
    remove_whitespaces(text: string) {
        return text.replace(/\s+/g, '').trim()
    },
    replace_all_char(s: string, replace_value: string, except?: string[]) {
        let t = ''
        for (let i = 0; i < s.length; i++) {
            if (except && except.includes(s[i])) {
                t += s[i]
            }
            else {
                t += replace_value
            }
        }
        return t
    },
    /**
     * data must be in order; non-recursive
     */
    is_ordered_array_equal(arr1: any[], arr2: any[]) {
        if (arr1.length !== arr2.length) return false

        for (let i = 0; i < arr1.length; i++) {
            if (arr1[i] !== arr2[i]) {
                return false
            }
        }

        return true
    },
    format_rupiah_num(num: number, add_plus_sign?: boolean) {
        const o = Math.abs(num).toFixed()
        const p = 3
        const q = '.'
        let r = o.split('')
        for (let i = o.length - p; i > 0; i -= p) {
            r.splice(i, 0, q)
        }
        return `${add_plus_sign && num > 0 ? '+' : num < 0 ? '-' : ''}${r.join('')}`
    },
    format_rupiah(num: number) {
        const o = Math.abs(num).toFixed()
        const p = 3
        const q = '.'
        let r = o.split('')
        for (let i = o.length - p; i > 0; i -= p) {
            r.splice(i, 0, q)
        }
        return num < 0 ? `-Rp${r.join('')},00` : `Rp${r.join('')},00`
    },
    flat_object(obj: Object) {
        const traverse_and_flatten = (current_node: any, target: any, flattened_key?: any) => {
            for (const key in current_node) {
                if (current_node.hasOwnProperty(key)) {
                    let new_key = key
                    if (flattened_key !== undefined) {
                        new_key = flattened_key + '.' + key
                    }
                    const value = current_node[key]
                    if (typeof value === 'object' && value instanceof HTMLElement === false) {
                        traverse_and_flatten(value, target, new_key)
                    }
                    else {
                        target[new_key] = value
                    }
                }
            }
        }

        const flattened_object = {}
        traverse_and_flatten(obj, flattened_object)
        return flattened_object
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
