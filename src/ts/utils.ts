const dom = {
    q<K extends keyof HTMLElementTagNameMap>(selectors: K | string): HTMLElementTagNameMap[K] | null {
        return document.querySelector(selectors)
    },
    qe<K extends keyof HTMLElementTagNameMap>(el: HTMLElement, selectors: K | string): HTMLElementTagNameMap[K] | null {
        return el.querySelector(selectors)
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
    c<K extends keyof HTMLElementTagNameMap>(tag_name: K, options?: ElementCreationOptions): HTMLElementTagNameMap[K] {
        return document.createElement(tag_name, options)
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
}
