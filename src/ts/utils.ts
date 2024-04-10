const dom = {
    q<K extends keyof HTMLElementTagNameMap>(selectors: K | string): HTMLElementTagNameMap[K] | null {
        return document.querySelector(selectors)
    },
    qe<K extends keyof HTMLElementTagNameMap>(el: HTMLElement, selectors: K | string): HTMLElementTagNameMap[K] | null {
        return el.querySelector(selectors)
    },
    disable(el: HTMLElement) {
        el.classList.add('disabled')
    },
    enable(el: HTMLElement) {
        el.classList.remove('disabled')
    },
}

const common = {
    sleep(ms: number) {
        return new Promise(r => setTimeout(r, ms))
    },
}
